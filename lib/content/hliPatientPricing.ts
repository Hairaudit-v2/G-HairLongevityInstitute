/**
 * Single source of truth for patient-facing HLI pricing (public marketing surfaces).
 * Keep commercial labels aligned across /pricing, homepage summary, and related pages.
 */

export type HliPatientPricingTier = {
  id: string;
  /** Display name including tier label (exact commercial wording where specified). */
  title: string;
  /** Shown beside or under title, e.g. "Free", "$10", "$120". */
  price: string;
  body: string;
  bestFor: string;
};

export const HLI_PATIENT_PRICING_TIERS: readonly HliPatientPricingTier[] = [
  {
    id: "free-initial",
    title: "Free Initial Hair Analysis",
    price: "Free",
    body: "Start your case, answer intake questions, and begin your personalised review pathway.",
    bestFor: "Anyone taking a clear first step — clarity before optional add-ons.",
  },
  {
    id: "blood-letter",
    title: "Blood Request Letter",
    price: "$10",
    body: "One payment unlocks ongoing access on this account to generate pathology/GP request letters when you need them (not a single-use token).",
    bestFor: "When you want structured wording to support appropriate blood tests.",
  },
  {
    id: "blood-followup",
    title: "Follow-up Blood Analysis Review",
    price: "$10",
    body: "One payment unlocks ongoing eligibility on this account for follow-up blood result review in the context of your hair concerns (not time-limited in the app).",
    bestFor: "After results are back and you want them placed in context for hair health.",
  },
  {
    id: "trich-appointment",
    title: "One-on-One Trichologist Appointment",
    price: "$120",
    body: "One payment covers the 1-hour appointment on this account (USD); scheduling and session logistics are arranged separately after payment.",
    bestFor: "When you want dedicated time for depth, questions, and a tailored discussion.",
  },
  {
    id: "membership",
    title: "Membership",
    price: "$10/month",
    body: "Monthly membership includes blood request letters, follow-up blood analysis reviews, ongoing support while your subscription is active, and two one-on-one Zoom consultations per billing period (30 minutes each; recurring billing until you cancel).",
    bestFor: "When you want continuity, included letters and reviews, live Zoom time with our team, and support over time.",
  },
] as const;

/** Homepage / compact blocks: one line per row + membership footnote. */
export const HLI_PRICING_MEMBERSHIP_INCLUDES_LINE =
  "Membership includes blood request letters, blood analysis reviews, ongoing support, and two 30-minute one-on-one Zoom consultations per billing period";

export const HLI_PRICING_SUMMARY_LINES: readonly string[] = [
  "Free Initial Hair Analysis",
  "Blood Request Letter — $10",
  "Follow-up Blood Analysis Review — $10",
  "One-on-One Trichologist Appointment (1 hour) — $120 USD",
  "Membership — $10/month",
  HLI_PRICING_MEMBERSHIP_INCLUDES_LINE,
];

/** Secure start & minimal summaries: five rows with “Initial Hair Analysis — Free” style. */
export const HLI_PRICING_SECURE_START_LINES: readonly string[] = [
  "Initial Hair Analysis — Free",
  "Blood Request Letter — $10",
  "Follow-up Blood Analysis Review — $10",
  "Trichologist Appointment (1 hour) — $120 USD",
  "Membership — $10/month including blood requests, blood analysis reviews, ongoing support, and two 30-minute Zoom consultations per billing period",
];

export const HLI_PRICING_PATIENT_NOTES: readonly string[] = [
  "Blood request letter and blood analysis review are one-time account unlocks ($10 each) — not subscriptions.",
  "Membership is $10/month and includes letters, reviews, ongoing support, and two 30-minute one-on-one Zoom sessions per billing period while active; cancel any time.",
  "Included membership Zoom sessions refresh each billing period (Stripe subscription period); they are not a lifetime bank of sessions.",
  "You do not need blood tests to begin.",
  "You do not need to book a consultation to start.",
  "HLI does not replace your GP or prescribing doctor.",
];

/** Short line for membership surfaces (calm, premium). */
export const HLI_MEMBERSHIP_INCLUDES_AND_CANCEL =
  "Includes blood request letters, follow-up blood analysis reviews, ongoing support, and two 30-minute one-on-one Zoom consultations per billing period while your subscription is active. Cancel any time from billing.";

export function getHliPatientPricingTier(id: HliPatientPricingTier["id"]): HliPatientPricingTier {
  const t = HLI_PATIENT_PRICING_TIERS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown HLI pricing tier: ${id}`);
  return t;
}
