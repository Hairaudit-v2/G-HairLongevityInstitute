/**
 * Longevity review workflow constants and types (Trichologist Phase A).
 * Isolated to longevity module. Patient-facing intake status is unchanged;
 * these values are for clinician-only review_status and review_priority.
 * See docs/TRICHOLOGIST_PORTAL_SPEC.md.
 */

/** Allowed values for hli_longevity_intakes.review_status (clinician workflow state). */
export const REVIEW_STATUS = {
  SUBMITTED: "submitted",
  AI_REVIEW_PENDING: "ai_review_pending",
  HUMAN_REVIEW_REQUIRED: "human_review_required",
  UNDER_TRICHOLOGIST_REVIEW: "under_trichologist_review",
  AWAITING_PATIENT_DOCUMENTS: "awaiting_patient_documents",
  REVIEW_COMPLETE: "review_complete",
  FOLLOW_UP_RECOMMENDED: "follow_up_recommended",
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

/** Allowed values for hli_longevity_intakes.review_priority. */
export const REVIEW_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type ReviewPriority = (typeof REVIEW_PRIORITY)[keyof typeof REVIEW_PRIORITY];

/** Intended values for hli_longevity_intakes.review_decision_source (who/what drove the review decision). */
export const REVIEW_DECISION_SOURCE = {
  RULES: "rules",
  AI: "ai",
  TRICHOLOGIST: "trichologist",
  MIXED: "mixed",
} as const;

export type ReviewDecisionSource = (typeof REVIEW_DECISION_SOURCE)[keyof typeof REVIEW_DECISION_SOURCE];

/** Review statuses that indicate a case is in the Trichologist queue (needs or is under review). */
export const REVIEW_STATUS_IN_QUEUE: ReviewStatus[] = [
  REVIEW_STATUS.HUMAN_REVIEW_REQUIRED,
  REVIEW_STATUS.UNDER_TRICHOLOGIST_REVIEW,
  REVIEW_STATUS.AWAITING_PATIENT_DOCUMENTS,
];

/** Allowed values for hli_longevity_intakes.review_outcome (Phase C). Conservative, clinician-friendly. */
export const REVIEW_OUTCOME = {
  /** Phase C initial values */
  REVIEW_COMPLETE: "review_complete",
  AWAITING_PATIENT_DOCUMENTS: "awaiting_patient_documents",
  FOLLOW_UP_RECOMMENDED: "follow_up_recommended",
  /** Extended set (backward-compatible) */
  STANDARD_PATHWAY: "standard_pathway",
  BLOODS_RECOMMENDED: "bloods_recommended",
  REFERRAL_RECOMMENDED: "referral_recommended",
  FOLLOW_UP_SCHEDULED: "follow_up_scheduled",
  OTHER: "other",
} as const;

export type ReviewOutcome = (typeof REVIEW_OUTCOME)[keyof typeof REVIEW_OUTCOME];

/** Actor type for Trichologist actions in hli_longevity_audit_events. Use when logging Trichologist actions. */
export const AUDIT_ACTOR_TRICHOLOGIST = "trichologist" as const;
