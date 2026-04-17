import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "./stripeServer";
import { HLI_OFFERING } from "./hliOffers";
import { insertEntitlementLedger } from "./entitlementLedger";
import { offeringForEmail, sendPaymentTransactionalEmail } from "./paymentEmailHooks";

function subscriptionIsEntitled(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing";
}

async function updateProfileStripeCustomer(
  supabase: SupabaseClient,
  profileId: string,
  customerId: string | null
): Promise<void> {
  if (!customerId) return;
  await supabase
    .from("hli_longevity_profiles")
    .update({
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);
}

export async function applyCheckoutSessionCompleted(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  stripeEventId: string
): Promise<void> {
  const profileId = session.metadata?.profile_id ?? session.client_reference_id ?? null;
  if (!profileId || typeof profileId !== "string") {
    return;
  }

  const customerId = typeof session.customer === "string" ? session.customer : null;
  await updateProfileStripeCustomer(supabase, profileId, customerId);

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  if (session.mode === "subscription") {
    const subId = typeof session.subscription === "string" ? session.subscription : null;
    if (!subId) return;
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(subId);
    await syncSubscriptionToProfile(supabase, profileId, sub, { stripeEventId });
    await insertEntitlementLedger(supabase, {
      profile_id: profileId,
      source_kind: "stripe_checkout",
      offering: HLI_OFFERING.MEMBERSHIP,
      stripe_checkout_session_id: session.id,
      stripe_event_id: stripeEventId,
      stripe_payment_intent_id: paymentIntentId,
      stripe_subscription_id: sub.id,
      summary: `Membership subscription recorded from Checkout (status ${sub.status}).`,
      metadata: {
        checkout_session_id: session.id,
        subscription_id: sub.id,
      },
    });
    await sendPaymentTransactionalEmail(supabase, profileId, "membership_started", {
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
    });
    return;
  }

  if (session.mode === "payment") {
    const offering = session.metadata?.offering;
    if (!offering || typeof offering !== "string") return;
    await applyOneTimeOffering(supabase, profileId, offering, session, stripeEventId);
  }
}

async function applyOneTimeOffering(
  supabase: SupabaseClient,
  profileId: string,
  offering: string,
  session: Stripe.Checkout.Session,
  stripeEventId: string
): Promise<void> {
  const now = new Date().toISOString();
  const patch: Record<string, string> = { updated_at: now };

  if (offering === HLI_OFFERING.BLOOD_REQUEST_LETTER) {
    patch.blood_request_letter_purchased_at = now;
  } else if (offering === HLI_OFFERING.BLOOD_ANALYSIS_REVIEW) {
    patch.blood_analysis_review_purchased_at = now;
  } else if (offering === HLI_OFFERING.TRICHOLOGIST_APPOINTMENT) {
    patch.trichologist_appointment_purchased_at = now;
  } else {
    return;
  }

  await supabase.from("hli_longevity_profiles").update(patch).eq("id", profileId);

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  await insertEntitlementLedger(supabase, {
    profile_id: profileId,
    source_kind: "stripe_checkout",
    offering,
    stripe_checkout_session_id: session.id,
    stripe_event_id: stripeEventId,
    stripe_payment_intent_id: paymentIntentId,
    summary: `One-time purchase completed: ${offering.replace(/_/g, " ")}.`,
    metadata: {
      checkout_session_id: session.id,
      offering,
    },
  });

  if (offering === HLI_OFFERING.TRICHOLOGIST_APPOINTMENT) {
    await sendPaymentTransactionalEmail(supabase, profileId, "trich_booking_fee");
  } else {
    await sendPaymentTransactionalEmail(supabase, profileId, "one_time_purchase", {
      offering: offeringForEmail(offering),
    });
  }
}

export async function syncSubscriptionToProfile(
  supabase: SupabaseClient,
  profileId: string,
  sub: Stripe.Subscription,
  options?: { stripeEventId?: string | null }
): Promise<void> {
  const entitled = subscriptionIsEntitled(sub.status);
  const periodStartIso = new Date(sub.current_period_start * 1000).toISOString();

  const { data: prevRow } = await supabase
    .from("hli_longevity_profiles")
    .select("membership_zoom_usage_period_start")
    .eq("id", profileId)
    .maybeSingle();
  const prevPeriodStart =
    prevRow && typeof prevRow === "object" && "membership_zoom_usage_period_start" in prevRow
      ? (prevRow as { membership_zoom_usage_period_start: string | null }).membership_zoom_usage_period_start
      : null;

  await supabase
    .from("hli_longevity_profiles")
    .update({
      membership_stripe_subscription_id: sub.id,
      membership_status: sub.status,
      membership_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      membership_zoom_usage_period_start: periodStartIso,
      ongoing_support_access: entitled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (entitled && prevPeriodStart && prevPeriodStart !== periodStartIso) {
    await insertEntitlementLedger(supabase, {
      profile_id: profileId,
      source_kind: "stripe_subscription",
      offering: HLI_OFFERING.MEMBERSHIP,
      stripe_event_id: options?.stripeEventId ?? null,
      stripe_subscription_id: sub.id,
      summary:
        "Membership subscription period updated; included Zoom session tracking refreshed in the portal (commercial terms: two 30-minute sessions per calendar year while active).",
      metadata: {
        previous_period_start: prevPeriodStart,
        new_period_start: periodStartIso,
        kind: "membership_zoom_allowance_reset",
      },
    });
  }
}

export async function handleSubscriptionEvent(
  supabase: SupabaseClient,
  sub: Stripe.Subscription,
  stripeEventId?: string | null
): Promise<void> {
  const profileId = sub.metadata?.profile_id;
  if (profileId && typeof profileId === "string") {
    await syncSubscriptionToProfile(supabase, profileId, sub, { stripeEventId });
    return;
  }

  const { data: row } = await supabase
    .from("hli_longevity_profiles")
    .select("id")
    .eq("membership_stripe_subscription_id", sub.id)
    .maybeSingle();
  if (row?.id) {
    await syncSubscriptionToProfile(supabase, row.id as string, sub, { stripeEventId });
  }
}

export async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  sub: Stripe.Subscription,
  stripeEventId: string
): Promise<void> {
  await handleSubscriptionEvent(supabase, sub, stripeEventId);

  let profileId: string | null =
    typeof sub.metadata?.profile_id === "string" ? sub.metadata.profile_id : null;
  if (!profileId) {
    const { data } = await supabase
      .from("hli_longevity_profiles")
      .select("id")
      .eq("membership_stripe_subscription_id", sub.id)
      .maybeSingle();
    profileId = data?.id ? String(data.id) : null;
  }

  if (profileId) {
    await insertEntitlementLedger(supabase, {
      profile_id: profileId,
      source_kind: "stripe_subscription",
      offering: HLI_OFFERING.MEMBERSHIP,
      stripe_event_id: stripeEventId,
      stripe_subscription_id: sub.id,
      summary: `Membership subscription ended or deleted (status ${sub.status}).`,
      metadata: { subscription_id: sub.id },
    });
    await sendPaymentTransactionalEmail(supabase, profileId, "membership_cancelled");
  }
}

export async function insertWebhookEventIfNew(
  supabase: SupabaseClient,
  stripeEventId: string,
  eventType: string
): Promise<boolean> {
  const { error } = await supabase.from("hli_stripe_webhook_events").insert({
    stripe_event_id: stripeEventId,
    event_type: eventType,
  });
  if (error) {
    if (error.code === "23505" || error.message?.includes("duplicate")) {
      return false;
    }
    throw error;
  }
  return true;
}
