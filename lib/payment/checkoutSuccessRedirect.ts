import { HLI_OFFERING } from "./hliOffers";

/**
 * Next-step path after successful Stripe Checkout (relative, App Router).
 */
export function getPostCheckoutRedirectPath(offering: string | null | undefined): string {
  switch (offering) {
    case HLI_OFFERING.BLOOD_REQUEST_LETTER:
      return "/portal/dashboard?welcome=blood-letter";
    case HLI_OFFERING.BLOOD_ANALYSIS_REVIEW:
      return "/portal/dashboard?welcome=blood-review";
    case HLI_OFFERING.TRICHOLOGIST_APPOINTMENT:
      return "/book?welcome=appointment";
    case HLI_OFFERING.MEMBERSHIP:
      return "/portal/dashboard?welcome=membership";
    default:
      return "/portal/dashboard?welcome=paid";
  }
}
