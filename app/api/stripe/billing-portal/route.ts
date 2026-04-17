import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/payment/stripeServer";
import { getAppBaseUrl } from "@/lib/payment/appBaseUrl";
import { getProfilePaymentRowByAuthUserId } from "@/lib/payment/profilePayment";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPortalUser } from "@/lib/longevity/portalAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/billing-portal — Stripe Customer Portal session (manage membership payment method / cancel).
 */
export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe is not configured." }, { status: 503 });
  }

  const portalUser = await getPortalUser();
  if (!portalUser) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const profile = await getProfilePaymentRowByAuthUserId(supabase, portalUser.id);
  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      {
        ok: false,
        error: "No saved billing profile yet. Complete a purchase first, or contact support.",
        code: "no_stripe_customer",
      },
      { status: 400 }
    );
  }

  const base = getAppBaseUrl();
  const stripe = getStripe();

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${base}/portal/dashboard`,
    });
    if (!session.url) {
      return NextResponse.json({ ok: false, error: "Portal URL missing." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Stripe error.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
