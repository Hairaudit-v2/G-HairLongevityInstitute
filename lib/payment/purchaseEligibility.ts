import type { HliPaymentOffering } from "./hliOffers";
import { HLI_OFFERING } from "./hliOffers";
import type { ProfilePaymentRow } from "./profilePayment";
import { computeHliEntitlementsDetailed } from "./entitlements";
import { MEMBERSHIP_INCLUDED_ONE_ON_ONE_ZOOM_SESSIONS_PER_PERIOD } from "./membershipIncludedZoom";

export type PurchaseBlockCode =
  | "already_included_membership"
  | "already_unlocked"
  | "already_grandfathered"
  | "active_membership_exists"
  | "use_included_membership_zoom_first"
  | "balance_unknown";

export type PurchaseEligibility = {
  canPurchase: boolean;
  code?: PurchaseBlockCode;
  patientMessage: string;
};

export type PurchaseEligibilityContext = {
  /** Consumed included Zoom sessions in the current membership period (required to gate paid trichologist checkout for members). */
  membershipIncludedZoomUsed?: number;
};

function membershipActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

/**
 * Whether checkout should be offered for this offering given current profile state.
 */
export function getPurchaseEligibility(
  offering: HliPaymentOffering,
  row: ProfilePaymentRow,
  ctx?: PurchaseEligibilityContext
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
          "The one-on-one trichologist appointment fee was already purchased on this account. Email the team to schedule.",
      };
    }
    if (membershipActive(row.membership_status)) {
      const used = ctx?.membershipIncludedZoomUsed;
      if (used === undefined) {
        return {
          canPurchase: false,
          code: "balance_unknown",
          patientMessage:
            "We could not verify your included membership sessions. Please refresh, or open Account & billing in the portal and try again.",
        };
      }
      if (used < MEMBERSHIP_INCLUDED_ONE_ON_ONE_ZOOM_SESSIONS_PER_PERIOD) {
        return {
          canPurchase: false,
          code: "use_included_membership_zoom_first",
          patientMessage:
            "Your membership includes two one-on-one Zoom sessions (30 minutes each) per calendar year. Use those included sessions first — scheduling is arranged with our team without this payment. The paid option on this page is a separate 1-hour appointment.",
        };
      }
    }
  }

  return { canPurchase: true, patientMessage: "" };
}
