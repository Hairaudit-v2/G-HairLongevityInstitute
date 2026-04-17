/**
 * Central catalogue: HLI commercial offerings and Stripe Price IDs (env).
 * Amounts are defined in Stripe (e.g. trichologist appointment USD 120 for 1 hour); marketing copy in lib/content/hliPatientPricing.ts.
 */

export const HLI_OFFERING = {
  BLOOD_REQUEST_LETTER: "blood_request_letter",
  BLOOD_ANALYSIS_REVIEW: "blood_analysis_review",
  TRICHOLOGIST_APPOINTMENT: "trichologist_appointment",
  MEMBERSHIP: "membership",
} as const;

export type HliPaymentOffering = (typeof HLI_OFFERING)[keyof typeof HLI_OFFERING];

const OFFERING_VALUES = new Set<string>(Object.values(HLI_OFFERING));

export function isHliPaymentOffering(value: unknown): value is HliPaymentOffering {
  return typeof value === "string" && OFFERING_VALUES.has(value);
}

export function getStripePriceIdForOffering(offering: HliPaymentOffering): string | null {
  switch (offering) {
    case HLI_OFFERING.BLOOD_REQUEST_LETTER:
      return process.env.STRIPE_PRICE_BLOOD_REQUEST_LETTER?.trim() || null;
    case HLI_OFFERING.BLOOD_ANALYSIS_REVIEW:
      return process.env.STRIPE_PRICE_BLOOD_ANALYSIS_REVIEW?.trim() || null;
    case HLI_OFFERING.TRICHOLOGIST_APPOINTMENT:
      return process.env.STRIPE_PRICE_TRICHOLOGIST_APPOINTMENT?.trim() || null;
    case HLI_OFFERING.MEMBERSHIP:
      return process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY?.trim() || null;
    default:
      return null;
  }
}

export function assertStripeConfiguredForOffering(offering: HliPaymentOffering): string {
  const priceId = getStripePriceIdForOffering(offering);
  if (!priceId) {
    throw new Error(`Missing Stripe price ID env for offering: ${offering}`);
  }
  return priceId;
}
