/**
 * Product semantics for HLI paid features (documentation + shared types).
 * One-time Stripe prices map to ongoing unlocks for account-level features unless noted otherwise.
 */

/** Blood letter: one payment unlocks ongoing ability to generate GP/pathology request letters on this account. */
export const BLOOD_REQUEST_LETTER_SEMANTICS =
  "one_time_account_unlock" as const;

/**
 * Follow-up blood analysis review: one payment unlocks ongoing eligibility for that review pathway
 * (clinician interpretation in context of your case — not a single consumable “credit” in software).
 */
export const BLOOD_ANALYSIS_REVIEW_SEMANTICS = "one_time_account_unlock" as const;

/** Trichologist appointment: one payment covers the booking fee; scheduling is separate. */
export const TRICHOLOGIST_APPOINTMENT_SEMANTICS = "one_time_booking_fee_unlock" as const;

/** Membership: time-bounded via Stripe subscription current period. */
export const MEMBERSHIP_SEMANTICS = "recurring_subscription" as const;

export type OneTimeEntitlementSemantics =
  | typeof BLOOD_REQUEST_LETTER_SEMANTICS
  | typeof BLOOD_ANALYSIS_REVIEW_SEMANTICS
  | typeof TRICHOLOGIST_APPOINTMENT_SEMANTICS;
