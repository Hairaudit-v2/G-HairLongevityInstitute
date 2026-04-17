import type { HliPaymentOffering } from "./hliOffers";
import { HLI_OFFERING } from "./hliOffers";
import type { ProfilePaymentRow } from "./profilePayment";
import { computeHliEntitlementsDetailed } from "./entitlements";

export type PurchaseBlockCode =
  | "already_included_membership"
  | "already_unlocked"
  | "already_grandfathered"
  | "active_membership_exists";

export type PurchaseEligibility = {
  canPurchase: boolean;
  code?: PurchaseBlockCode;
  patientMessage: string;
};

function membershipActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

/**
 * Whether checkout should be offered for this offering given current profile state.
 */
export function getPurchaseEligibility(
  offering: HliPaymentOffering,
  row: ProfilePaymentRow
): PurchaseEligibility {
  const d = computeHliEntitlementsDetailed(row);

  if (offering === HLI_OFFERING.MEMBERSHIP) {
    if (membershipActive(row.membership_status)) {
      return {
        canPurchase: false,
        code: "active_membership_exists",
        patientMessage:
          "You already have an active membership. Manage billing from your patient portal account section.",
      };
    }
    return { canPurchase: true, patientMessage: "" };
  }

  if (membershipActive(row.membership_status)) {
    if (offering === HLI_OFFERING.BLOOD_REQUEST_LETTER || offering === HLI_OFFERING.BLOOD_ANALYSIS_REVIEW) {
      return {
        canPurchase: false,
        code: "already_included_membership",
        patientMessage:
          "These are included while your membership is active. You do not need a separate purchase.",
      };
    }
  }

  if (offering === HLI_OFFERING.BLOOD_REQUEST_LETTER) {
    if (d.bloodRequestLetter.reason === "legacy_grandfather") {
      return {
        canPurchase: false,
        code: "already_grandfathered",
        patientMessage:
          "Your account already has blood request letter access from before paid checkout (legacy access).",
      };
    }
    if (d.bloodRequestLetter.access && d.bloodRequestLetter.reason === "one_time_unlock") {
      return {
        canPurchase: false,
        code: "already_unlocked",
        patientMessage:
          "You already unlocked blood request letters on this account (one-time purchase).",
      };
    }
  }

  if (offering === HLI_OFFERING.BLOOD_ANALYSIS_REVIEW) {
    if (d.bloodAnalysisReview.reason === "legacy_grandfather") {
      return {
        canPurchase: false,
        code: "already_grandfathered",
        patientMessage:
          "Your account already has blood analysis review access from before paid checkout (legacy access).",
      };
    }
    if (d.bloodAnalysisReview.access && d.bloodAnalysisReview.reason === "one_time_unlock") {
      return {
        canPurchase: false,
        code: "already_unlocked",
        patientMessage:
          "You already unlocked follow-up blood analysis review on this account (one-time purchase).",
      };
    }
  }

  if (offering === HLI_OFFERING.TRICHOLOGIST_APPOINTMENT) {
    if (row.trichologist_appointment_purchased_at) {
      return {
        canPurchase: false,
        code: "already_unlocked",
        patientMessage:
          "The appointment booking fee was already purchased on this account. Email the team to schedule.",
      };
    }
  }

  return { canPurchase: true, patientMessage: "" };
}
