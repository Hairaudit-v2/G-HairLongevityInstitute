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
    price: "$120 USD",
    body: "A separate, extended session: one payment covers a private 1-hour video appointment on this account. Scheduling is arranged after payment. Distinct from the two shorter Zoom sessions included with membership each calendar year.",
    bestFor: "When you want a full hour for depth, questions, and a tailored discussion beyond the included membership sessions.",
  },
  {
    id: "membership",
    title: "Membership",
    price: "$10/month",
    body: "While your subscription is active: blood request letters, follow-up blood analysis reviews, ongoing support, and two 30-minute one-on-one Zoom consultations per calendar year (not per month; resets each calendar year, not a lifetime bank). Recurring billing until you cancel.",
    bestFor: "When you want continuity — clinical letters and reviews, included live time with our team each year, and a steady line of support.",
  },
] as const;

/** Homepage / compact blocks: one line per row + membership footnote. */
export const HLI_PRICING_MEMBERSHIP_INCLUDES_LINE =
  "Membership ($10/month) includes blood request letters, blood analysis reviews, ongoing support, and two 30-minute one-on-one Zoom sessions per calendar year";

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
  "Trichologist appointment (1 hour, separate from membership Zoom) — $120 USD",
  "Membership — $10/month: letters, reviews, ongoing support, two 30-minute Zoom sessions per calendar year",
];

export const HLI_PRICING_PATIENT_NOTES: readonly string[] = [
  "Blood request letter and blood analysis review are one-time account unlocks ($10 each) — not subscriptions.",
  "Membership is $10/month. Included Zoom sessions are two per calendar year (30 minutes each), while your membership is active — not monthly, not lifetime.",
  "The paid trichologist appointment is a separate 1-hour session ($120 USD), for when you want extended time beyond your included membership Zoom sessions.",
  "You do not need blood tests to begin.",
  "You do not need to book a consultation to start.",
  "HLI does not replace your GP or prescribing doctor.",
];

/** Short line for membership surfaces (calm, premium). */
export const HLI_MEMBERSHIP_INCLUDES_AND_CANCEL =
  "Includes blood request letters, follow-up blood analysis reviews, ongoing support, and two 30-minute one-on-one Zoom consultations per calendar year while your subscription is active. Cancel any time from billing.";

export function getHliPatientPricingTier(id: HliPatientPricingTier["id"]): HliPatientPricingTier {
  const t = HLI_PATIENT_PRICING_TIERS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown HLI pricing tier: ${id}`);
  return t;
}
