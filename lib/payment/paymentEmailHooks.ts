/**
 * Transactional payment emails — hooks called after successful Stripe webhook processing.
 * Uses the same longevity email adapter as reminders (Resend / console / none).
 * Failures are logged; webhooks must not depend on email delivery.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendLongevityReminderEmail } from "@/lib/longevity/reminderEmail";
import {
  buildMembershipCancelledEmail,
  buildMembershipStartedEmail,
  buildOneTimePurchaseEmail,
  buildTrichBookingFeeEmail,
  SUBJECT_MEMBERSHIP_CANCELLED,
  SUBJECT_MEMBERSHIP_STARTED,
  SUBJECT_ONE_TIME_PURCHASE,
  SUBJECT_TRICH_BOOKING_FEE,
} from "@/lib/email/templates/paymentTransactional";
import { HLI_OFFERING } from "./hliOffers";

async function getProfileEmailAndName(
  supabase: SupabaseClient,
  profileId: string
): Promise<{ email: string | null; firstName: string | null }> {
  const { data } = await supabase
    .from("hli_longevity_profiles")
    .select("email, full_name")
    .eq("id", profileId)
    .maybeSingle();
  if (!data?.email) return { email: null, firstName: null };
  const full = (data.full_name as string | null)?.trim();
  const firstName = full ? full.split(/\s+/)[0] : null;
  return { email: String(data.email).trim(), firstName };
}

export type PaymentEmailKind =
  | "one_time_purchase"
  | "membership_started"
  | "membership_cancelled"
  | "trich_booking_fee";

/**
 * Fire-and-forget: send confirmation email when configured (LONGEVITY_EMAIL_PROVIDER).
 */
export async function sendPaymentTransactionalEmail(
  supabase: SupabaseClient,
  profileId: string,
  kind: PaymentEmailKind,
  options?: {
    offering?: string;
    currentPeriodEnd?: string | null;
  }
): Promise<void> {
  const { email, firstName } = await getProfileEmailAndName(supabase, profileId);
  if (!email) return;

  try {
    if (kind === "one_time_purchase" && options?.offering) {
      const built = buildOneTimePurchaseEmail({
        offering: options.offering,
        patientFirstName: firstName,
      });
      await sendLongevityReminderEmail({
        to: email,
        subject: SUBJECT_ONE_TIME_PURCHASE,
        bodyText: built.text,
        html: built.html,
      });
      return;
    }

    if (kind === "membership_started") {
      const built = buildMembershipStartedEmail({
        patientFirstName: firstName,
        currentPeriodEnd: options?.currentPeriodEnd ?? null,
      });
      await sendLongevityReminderEmail({
        to: email,
        subject: SUBJECT_MEMBERSHIP_STARTED,
        bodyText: built.text,
        html: built.html,
      });
      return;
    }

    if (kind === "membership_cancelled") {
      const built = buildMembershipCancelledEmail({ patientFirstName: firstName });
      await sendLongevityReminderEmail({
        to: email,
        subject: SUBJECT_MEMBERSHIP_CANCELLED,
        bodyText: built.text,
        html: built.html,
      });
      return;
    }

    if (kind === "trich_booking_fee") {
      const built = buildTrichBookingFeeEmail({ patientFirstName: firstName });
      await sendLongevityReminderEmail({
        to: email,
        subject: SUBJECT_TRICH_BOOKING_FEE,
        bodyText: built.text,
        html: built.html,
      });
    }
  } catch (e: unknown) {
    // eslint-disable-next-line no-console
    console.warn("[payment-email]", profileId, kind, e instanceof Error ? e.message : e);
  }
}

/** Map Stripe offering metadata to email builder. */
export function offeringForEmail(offering: string): string {
  if (offering === HLI_OFFERING.BLOOD_REQUEST_LETTER) return "blood_request_letter";
  if (offering === HLI_OFFERING.BLOOD_ANALYSIS_REVIEW) return "blood_analysis_review";
  if (offering === HLI_OFFERING.TRICHOLOGIST_APPOINTMENT) return "trichologist_appointment";
  return offering;
}
