/**
 * Single source of truth for patient-facing HLI pricing (public marketing surfaces).
 * Keep commercial labels aligned across /pricing, homepage summary, and related pages.
 */

export type HliPatientPricingTier = {
  id: string;
  /** Display name including tier label (exact commercial wording where specified). */
  title: string;
  /** Shown beside or under title, e.g. "Free", "$10", "$199". */
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
    body: "Request a pathology letter to help guide relevant testing.",
    bestFor: "When you want structured wording to support appropriate blood tests.",
  },
  {
    id: "blood-followup",
    title: "Follow-up Blood Analysis Review",
    price: "$10",
    body: "Have your blood results reviewed and interpreted in the context of your hair concerns.",
    bestFor: "After results are back and you want them placed in context for hair health.",
  },
  {
    id: "trich-appointment",
    title: "One-on-One Trichologist Appointment",
    price: "$199",
    body: "Book a dedicated consultation for deeper case review and personalised discussion.",
    bestFor: "When you want dedicated time for depth, questions, and a tailored discussion.",
  },
  {
    id: "membership",
    title: "Membership",
    price: "$10/month",
    body: "Ongoing support including blood request letters, blood analysis reviews, and continuity of care.",
    bestFor: "When you want continuity and included letter and review support over time.",
  },
] as const;

/** Homepage / compact blocks: one line per row + membership footnote. */
export const HLI_PRICING_MEMBERSHIP_INCLUDES_LINE =
  "Membership includes blood request letters, blood analysis reviews, and ongoing support";

export const HLI_PRICING_SUMMARY_LINES: readonly string[] = [
  "Free Initial Hair Analysis",
  "Blood Request Letter — $10",
  "Follow-up Blood Analysis Review — $10",
  "One-on-One Trichologist Appointment — $199",
  "Membership — $10/month",
  HLI_PRICING_MEMBERSHIP_INCLUDES_LINE,
];

/** Secure start & minimal summaries: five rows with “Initial Hair Analysis — Free” style. */
export const HLI_PRICING_SECURE_START_LINES: readonly string[] = [
  "Initial Hair Analysis — Free",
  "Blood Request Letter — $10",
  "Follow-up Blood Analysis Review — $10",
  "Trichologist Appointment — $199",
  "Membership — $10/month including blood requests, blood analysis reviews, and ongoing support",
];

export const HLI_PRICING_PATIENT_NOTES: readonly string[] = [
  "You do not need blood tests to begin.",
  "You do not need to book a consultation to start.",
  "Membership is optional.",
  "HLI does not replace your GP or prescribing doctor.",
];

export function getHliPatientPricingTier(id: HliPatientPricingTier["id"]): HliPatientPricingTier {
  const t = HLI_PATIENT_PRICING_TIERS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown HLI pricing tier: ${id}`);
  return t;
}
