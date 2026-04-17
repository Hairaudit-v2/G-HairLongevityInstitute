import type { SupabaseClient } from "@supabase/supabase-js";

/** Payment-related columns on hli_longevity_profiles (Stripe + entitlements). */
export type ProfilePaymentRow = {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  blood_request_letter_purchased_at: string | null;
  blood_analysis_review_purchased_at: string | null;
  trichologist_appointment_purchased_at: string | null;
  blood_request_letter_grandfathered_at: string | null;
  blood_analysis_review_grandfathered_at: string | null;
  membership_stripe_subscription_id: string | null;
  membership_status: string | null;
  membership_current_period_end: string | null;
  ongoing_support_access: boolean;
};

const PAYMENT_SELECT =
  "id, email, stripe_customer_id, blood_request_letter_purchased_at, blood_analysis_review_purchased_at, trichologist_appointment_purchased_at, blood_request_letter_grandfathered_at, blood_analysis_review_grandfathered_at, membership_stripe_subscription_id, membership_status, membership_current_period_end, ongoing_support_access";

export async function getProfilePaymentRow(
  supabase: SupabaseClient,
  profileId: string
): Promise<ProfilePaymentRow | null> {
  const { data, error } = await supabase
    .from("hli_longevity_profiles")
    .select(PAYMENT_SELECT)
    .eq("id", profileId)
    .maybeSingle();
  if (error || !data) return null;
  return data as ProfilePaymentRow;
}

/** Profile for the logged-in portal user (auth_user_id), including payment columns. */
export async function getProfilePaymentRowByAuthUserId(
  supabase: SupabaseClient,
  authUserId: string
): Promise<ProfilePaymentRow | null> {
  const { data, error } = await supabase
    .from("hli_longevity_profiles")
    .select(PAYMENT_SELECT)
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error || !data) return null;
  return data as ProfilePaymentRow;
}
