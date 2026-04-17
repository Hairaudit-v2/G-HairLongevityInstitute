import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/payment/stripeServer";
import { getAppBaseUrl } from "@/lib/payment/appBaseUrl";
import {
  assertStripeConfiguredForOffering,
  HLI_OFFERING,
  isHliPaymentOffering,
  type HliPaymentOffering,
} from "@/lib/payment/hliOffers";
import { getProfilePaymentRowByAuthUserId } from "@/lib/payment/profilePayment";
import { getPurchaseEligibility } from "@/lib/payment/purchaseEligibility";
import {
  getMembershipIncludedZoomUsedForPeriod,
  membershipBillingPeriodActive,
} from "@/lib/payment/membershipIncludedZoom";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPortalUser } from "@/lib/longevity/portalAuth";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/checkout — Create Stripe Checkout Session (payment or subscription).
 * Requires Supabase Auth + a linked longevity profile. Optionally aligns with longevity session cookie.
 */
export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe is not configured." }, { status: 503 });
  }

  const portalUser = await getPortalUser();
  if (!portalUser) {
    return NextResponse.json(
      { ok: false, error: "Sign in required.", code: "auth_required" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const offeringRaw = (body as { offering?: unknown })?.offering;
  if (!isHliPaymentOffering(offeringRaw)) {
    return NextResponse.json({ ok: false, error: "Unknown or missing offering." }, { status: 400 });
  }
  const offering = offeringRaw as HliPaymentOffering;

  const supabase = supabaseAdmin();
  const profile = await getProfilePaymentRowByAuthUserId(supabase, portalUser.id);
  if (!profile) {
    return NextResponse.json(
      {
        ok: false,
        error: "No patient profile is linked to this account. Open the patient portal once to finish setup.",
        code: "profile_missing",
      },
      { status: 400 }
    );
  }

  const sessionProfile = await getLongevitySessionFromRequest();
  if (sessionProfile && sessionProfile !== profile.id) {
    return NextResponse.json(
      {
        ok: false,
        error: "Your session profile does not match this account. Sign out and back in, or open the portal dashboard.",
        code: "profile_mismatch",
      },
      { status: 403 }
    );
  }

  let eligibility = getPurchaseEligibility(offering, profile);
  if (offering === HLI_OFFERING.TRICHOLOGIST_APPOINTMENT && membershipBillingPeriodActive(profile)) {
    const used = await getMembershipIncludedZoomUsedForPeriod(
      supabase,
      profile.id,
      profile.membership_zoom_usage_period_start
    );
    eligibility = getPurchaseEligibility(offering, profile, {
      membershipIncludedZoomUsed: used,
    });
  }
  if (!eligibility.canPurchase) {
    return NextResponse.json(
      {
        ok: false,
        error: eligibility.patientMessage,
        code: eligibility.code ?? "purchase_not_allowed",
      },
      { status: 409 }
    );
  }

  let priceId: string;
  try {
    priceId = assertStripeConfiguredForOffering(offering);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Stripe price not configured." },
      { status: 503 }
    );
  }

  const base = getAppBaseUrl();
  const stripe = getStripe();

  const successUrl = `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${base}/checkout/cancel`;

  try {
    if (offering === HLI_OFFERING.MEMBERSHIP) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: profile.id,
        customer: profile.stripe_customer_id ?? undefined,
        customer_email: profile.stripe_customer_id ? undefined : profile.email,
        metadata: {
          profile_id: profile.id,
          offering: HLI_OFFERING.MEMBERSHIP,
        },
        subscription_data: {
          metadata: {
            profile_id: profile.id,
            offering: HLI_OFFERING.MEMBERSHIP,
          },
        },
      });
      if (!session.url) {
        return NextResponse.json({ ok: false, error: "Checkout URL missing." }, { status: 500 });
      }
      return NextResponse.json({ ok: true, url: session.url });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: profile.id,
      customer: profile.stripe_customer_id ?? undefined,
      customer_email: profile.stripe_customer_id ? undefined : profile.email,
      metadata: {
        profile_id: profile.id,
        offering,
      },
    });
    if (!session.url) {
      return NextResponse.json({ ok: false, error: "Checkout URL missing." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Stripe error.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
