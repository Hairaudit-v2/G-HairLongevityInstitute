/**
 * Intake triage logic (Trichologist Phase B). Derives review_status and review_priority
 * from questionnaire-derived flags. review_decision_source is set to 'rules'.
 * See docs/LONGEVITY_TRIAGE.md for how Phase C (Trichologist dashboard) should rely on this.
 */

/** Version identifier for triage rules (persisted to hli_longevity_intakes.triage_version). */
export const TRIAGE_VERSION = "rules_v1";

import type { LongevityQuestionnaireResponses } from "./schema";
import {
  manualReviewRecommended,
  bloodsLikelyNeeded,
  possibleIronRisk,
  possibleThyroidRisk,
  possibleHormonalPattern,
  possibleInflammatoryPattern,
  possibleAndrogenPattern,
  possibleStressTrigger,
  postpartumFlag,
} from "./derivedFlags";
import {
  REVIEW_STATUS,
  REVIEW_PRIORITY,
  REVIEW_DECISION_SOURCE,
  type ReviewStatus,
  type ReviewPriority,
  type ReviewDecisionSource,
} from "./reviewConstants";

export type TriageFlags = {
  manualReviewRecommended: boolean;
  bloodsLikelyNeeded: boolean;
  possibleIronRisk: boolean;
  possibleThyroidRisk: boolean;
  possibleHormonalPattern: boolean;
  possibleInflammatoryPattern: boolean;
  possibleAndrogenPattern: boolean;
  possibleStressTrigger: boolean;
  postpartumFlag: boolean;
};

export type TriageResult = {
  review_status: ReviewStatus;
  review_priority: ReviewPriority;
  review_decision_source: ReviewDecisionSource;
  triaged_at: string;
  triage_version: string;
  flags: TriageFlags;
};

/**
 * Compute triage from questionnaire responses. Used at intake submit to set
 * review_status, review_priority, and review_decision_source = 'rules'.
 * Does not mutate DB; caller persists the result to hli_longevity_intakes.
 */
export function computeTriage(
  responses: LongevityQuestionnaireResponses
): TriageResult {
  const flags: TriageFlags = {
    manualReviewRecommended: manualReviewRecommended(responses),
    bloodsLikelyNeeded: bloodsLikelyNeeded(responses),
    possibleIronRisk: possibleIronRisk(responses),
    possibleThyroidRisk: possibleThyroidRisk(responses),
    possibleHormonalPattern: possibleHormonalPattern(responses),
    possibleInflammatoryPattern: possibleInflammatoryPattern(responses),
    possibleAndrogenPattern: possibleAndrogenPattern(responses),
    possibleStressTrigger: possibleStressTrigger(responses),
    postpartumFlag: postpartumFlag(responses),
  };

  const needsHumanReview = flags.manualReviewRecommended;
  const review_status: ReviewStatus = needsHumanReview
    ? REVIEW_STATUS.HUMAN_REVIEW_REQUIRED
    : REVIEW_STATUS.SUBMITTED;
  const review_priority: ReviewPriority = needsHumanReview
    ? REVIEW_PRIORITY.HIGH
    : REVIEW_PRIORITY.NORMAL;

  const now = new Date().toISOString();
  return {
    review_status,
    review_priority,
    review_decision_source: REVIEW_DECISION_SOURCE.RULES,
    triaged_at: now,
    triage_version: TRIAGE_VERSION,
    flags,
  };
}
