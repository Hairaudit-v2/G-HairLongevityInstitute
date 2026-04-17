import type { ProfilePaymentRow } from "./profilePayment";
import {
  BLOOD_ANALYSIS_REVIEW_SEMANTICS,
  BLOOD_REQUEST_LETTER_SEMANTICS,
  MEMBERSHIP_SEMANTICS,
  TRICHOLOGIST_APPOINTMENT_SEMANTICS,
} from "./entitlementSemantics";
import {
  formatLongDate,
  plainEnglishBloodLetterAccess,
  plainEnglishBloodReviewAccess,
  plainEnglishTrichAccess,
  staffShortLabelBloodLetter,
  staffShortLabelBloodReview,
} from "./entitlementNarratives";

export type EntitlementAccessReason =
  | "membership"
  | "one_time_unlock"
  | "legacy_grandfather"
  | "none";

export type FeatureEntitlementDetail = {
  access: boolean;
  reason: EntitlementAccessReason;
  /** Technical / audit line (legacy) */
  supportLabel: string;
  /** Terse line for support (matches portal “staff reference”) */
  staffSummaryLine: string;
  /** Full plain-English explanation for patients and staff */
  plainEnglishAccess: string;
};

/** Effective access flags for HLI paid features (membership OR one-time purchase where applicable). */
export type HliEffectiveEntitlements = {
  bloodRequestLetter: boolean;
  bloodAnalysisReview: boolean;
  trichologistAppointment: boolean;
  membershipActive: boolean;
  ongoingSupport: boolean;
  membershipCurrentPeriodEnd: string | null;
};

export type HliEntitlementsDetailed = {
  bloodRequestLetter: FeatureEntitlementDetail;
  bloodAnalysisReview: FeatureEntitlementDetail;
  trichologistAppointment: FeatureEntitlementDetail & { paidAt: string | null };
  membershipActive: boolean;
  ongoingSupport: boolean;
  membershipCurrentPeriodEnd: string | null;
  membershipStatus: string | null;
  /** How Stripe / product semantics interpret one-time rows */
  semantics: {
    bloodRequestLetter: typeof BLOOD_REQUEST_LETTER_SEMANTICS;
    bloodAnalysisReview: typeof BLOOD_ANALYSIS_REVIEW_SEMANTICS;
    trichologistAppointment: typeof TRICHOLOGIST_APPOINTMENT_SEMANTICS;
    membership: typeof MEMBERSHIP_SEMANTICS;
  };
};

function membershipStatusActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

function detailForLetter(row: ProfilePaymentRow): FeatureEntitlementDetail {
  if (membershipStatusActive(row.membership_status)) {
    const reason = "membership" as const;
    return {
      access: true,
      reason,
      supportLabel: "Active membership includes blood request letters.",
      staffSummaryLine: staffShortLabelBloodLetter({ reason, purchasedAt: null, grandfatheredAt: null }),
      plainEnglishAccess: plainEnglishBloodLetterAccess({
        reason,
        purchasedAt: null,
        grandfatheredAt: null,
      }),
    };
  }
  if (row.blood_request_letter_grandfathered_at) {
    const reason = "legacy_grandfather" as const;
    return {
      access: true,
      reason,
      supportLabel: `Legacy grandfather (from ${row.blood_request_letter_grandfathered_at}).`,
      staffSummaryLine: staffShortLabelBloodLetter({
        reason,
        purchasedAt: null,
        grandfatheredAt: row.blood_request_letter_grandfathered_at,
      }),
      plainEnglishAccess: plainEnglishBloodLetterAccess({
        reason,
        purchasedAt: null,
        grandfatheredAt: row.blood_request_letter_grandfathered_at,
      }),
    };
  }
  if (row.blood_request_letter_purchased_at) {
    const reason = "one_time_unlock" as const;
    return {
      access: true,
      reason,
      supportLabel: `One-time unlock (Stripe at ${row.blood_request_letter_purchased_at}).`,
      staffSummaryLine: staffShortLabelBloodLetter({
        reason,
        purchasedAt: row.blood_request_letter_purchased_at,
        grandfatheredAt: null,
      }),
      plainEnglishAccess: plainEnglishBloodLetterAccess({
        reason,
        purchasedAt: row.blood_request_letter_purchased_at,
        grandfatheredAt: null,
      }),
    };
  }
  const reason = "none" as const;
  return {
    access: false,
    reason,
    supportLabel: "No blood request letter entitlement.",
    staffSummaryLine: staffShortLabelBloodLetter({ reason, purchasedAt: null, grandfatheredAt: null }),
    plainEnglishAccess: plainEnglishBloodLetterAccess({ reason, purchasedAt: null, grandfatheredAt: null }),
  };
}

function detailForReview(row: ProfilePaymentRow): FeatureEntitlementDetail {
  if (membershipStatusActive(row.membership_status)) {
    const reason = "membership" as const;
    return {
      access: true,
      reason,
      supportLabel: "Active membership includes blood analysis reviews.",
      staffSummaryLine: staffShortLabelBloodReview({ reason, purchasedAt: null, grandfatheredAt: null }),
      plainEnglishAccess: plainEnglishBloodReviewAccess({
        reason,
        purchasedAt: null,
        grandfatheredAt: null,
      }),
    };
  }
  if (row.blood_analysis_review_grandfathered_at) {
    const reason = "legacy_grandfather" as const;
    return {
      access: true,
      reason,
      supportLabel: `Legacy grandfather (from ${row.blood_analysis_review_grandfathered_at}).`,
      staffSummaryLine: staffShortLabelBloodReview({
        reason,
        purchasedAt: null,
        grandfatheredAt: row.blood_analysis_review_grandfathered_at,
      }),
      plainEnglishAccess: plainEnglishBloodReviewAccess({
        reason,
        purchasedAt: null,
        grandfatheredAt: row.blood_analysis_review_grandfathered_at,
      }),
    };
  }
  if (row.blood_analysis_review_purchased_at) {
    const reason = "one_time_unlock" as const;
    return {
      access: true,
      reason,
      supportLabel: `One-time unlock (Stripe at ${row.blood_analysis_review_purchased_at}).`,
      staffSummaryLine: staffShortLabelBloodReview({
        reason,
        purchasedAt: row.blood_analysis_review_purchased_at,
        grandfatheredAt: null,
      }),
      plainEnglishAccess: plainEnglishBloodReviewAccess({
        reason,
        purchasedAt: row.blood_analysis_review_purchased_at,
        grandfatheredAt: null,
      }),
    };
  }
  const reason = "none" as const;
  return {
    access: false,
    reason,
    supportLabel: "No blood analysis review entitlement.",
    staffSummaryLine: staffShortLabelBloodReview({ reason, purchasedAt: null, grandfatheredAt: null }),
    plainEnglishAccess: plainEnglishBloodReviewAccess({ reason, purchasedAt: null, grandfatheredAt: null }),
  };
}

export function computeHliEntitlementsDetailed(row: ProfilePaymentRow): HliEntitlementsDetailed {
  const letter = detailForLetter(row);
  const review = detailForReview(row);
  const membershipActive = membershipStatusActive(row.membership_status);
  const trichPaid = Boolean(row.trichologist_appointment_purchased_at);

  const trichReason = trichPaid ? ("one_time_unlock" as const) : ("none" as const);
  const trichPlain = plainEnglishTrichAccess({ paid: trichPaid, paidAt: row.trichologist_appointment_purchased_at });
  return {
    bloodRequestLetter: letter,
    bloodAnalysisReview: review,
    trichologistAppointment: {
      access: trichPaid,
      reason: trichReason,
      supportLabel: trichPaid
        ? `Trichologist booking fee paid (${row.trichologist_appointment_purchased_at}).`
        : "Trichologist appointment fee not paid.",
      staffSummaryLine: trichPaid
        ? `Booking fee paid on ${formatLongDate(row.trichologist_appointment_purchased_at)}.`
        : "No active entitlement.",
      plainEnglishAccess: trichPlain,
      paidAt: row.trichologist_appointment_purchased_at,
    },
    membershipActive,
    ongoingSupport: membershipActive,
    membershipCurrentPeriodEnd: row.membership_current_period_end,
    membershipStatus: row.membership_status,
    semantics: {
      bloodRequestLetter: BLOOD_REQUEST_LETTER_SEMANTICS,
      bloodAnalysisReview: BLOOD_ANALYSIS_REVIEW_SEMANTICS,
      trichologistAppointment: TRICHOLOGIST_APPOINTMENT_SEMANTICS,
      membership: MEMBERSHIP_SEMANTICS,
    },
  };
}

/** Flat booleans for API consumers that only need gates. */
export function computeHliEntitlements(row: ProfilePaymentRow): HliEffectiveEntitlements {
  const d = computeHliEntitlementsDetailed(row);
  return {
    bloodRequestLetter: d.bloodRequestLetter.access,
    bloodAnalysisReview: d.bloodAnalysisReview.access,
    trichologistAppointment: d.trichologistAppointment.access,
    membershipActive: d.membershipActive,
    ongoingSupport: d.ongoingSupport,
    membershipCurrentPeriodEnd: d.membershipCurrentPeriodEnd,
  };
}
