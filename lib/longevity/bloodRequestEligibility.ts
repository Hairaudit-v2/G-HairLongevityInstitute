/**
 * Phase D: Blood request eligibility engine. Maps derived flags to recommended blood tests.
 * No GP letter generation; eligibility and recommended_tests only.
 */

import type { LongevityQuestionnaireResponses } from "./schema";
import {
  possibleIronRisk,
  possibleThyroidRisk,
  possibleHormonalPattern,
  bloodsLikelyNeeded,
  hasRecentPathology,
} from "./derivedFlags";
import { REVIEW_OUTCOME } from "./reviewConstants";

/** Canonical test codes for recommended_tests jsonb (patient- and clinician-facing labels). */
export const BLOOD_TEST_CODES = {
  FERRITIN: "ferritin",
  IRON_STUDIES: "iron_studies",
  TSH: "tsh",
  T4: "t4",
  FBC: "fbc",
  VITAMIN_D: "vitamin_d",
  B12: "b12",
  FOLATE: "folate",
  ZINC: "zinc",
  HORMONAL_PANEL: "hormonal_panel",
} as const;

export type BloodTestCode = (typeof BLOOD_TEST_CODES)[keyof typeof BLOOD_TEST_CODES];

export type BloodRequestEligibilityResult = {
  eligible: boolean;
  recommended_tests: BloodTestCode[];
  reason: string;
  recommended_by: "rules" | "trichologist";
};

/**
 * Map derived flags to recommended blood tests. Used to populate recommended_tests when
 * creating or updating a blood request. Does not consider review_outcome; callers use
 * this for rule-based recommendations or to suggest tests when Trichologist sets bloods_recommended.
 */
export function recommendedTestsFromFlags(
  responses: LongevityQuestionnaireResponses
): BloodTestCode[] {
  const tests: Set<BloodTestCode> = new Set();
  if (possibleIronRisk(responses)) {
    tests.add(BLOOD_TEST_CODES.FERRITIN);
    tests.add(BLOOD_TEST_CODES.IRON_STUDIES);
  }
  if (possibleThyroidRisk(responses)) {
    tests.add(BLOOD_TEST_CODES.TSH);
    tests.add(BLOOD_TEST_CODES.T4);
  }
  if (possibleHormonalPattern(responses)) {
    tests.add(BLOOD_TEST_CODES.HORMONAL_PANEL);
  }
  if (tests.size === 0) {
    tests.add(BLOOD_TEST_CODES.FBC);
    tests.add(BLOOD_TEST_CODES.FERRITIN);
  }
  return Array.from(tests);
}

/**
 * Build a short reason string from flags (for storage in blood_requests.reason).
 */
export function reasonFromFlags(responses: LongevityQuestionnaireResponses): string {
  const parts: string[] = [];
  if (possibleIronRisk(responses)) parts.push("iron/ferritin relevance");
  if (possibleThyroidRisk(responses)) parts.push("thyroid relevance");
  if (possibleHormonalPattern(responses)) parts.push("hormonal pattern");
  if (parts.length === 0) return "Routine screening for hair loss workup";
  return parts.join("; ");
}

/**
 * Rule-based eligibility: blood work likely needed and no recent pathology.
 * Used to trigger creation of a blood request at triage/submit (recommended_by = 'rules').
 */
export function ruleBasedEligible(responses: LongevityQuestionnaireResponses): boolean {
  if (hasRecentPathology(responses)) return false;
  return bloodsLikelyNeeded(responses);
}

/**
 * Full eligibility result for an intake: either rule-based or from Trichologist outcome.
 * When review_outcome === bloods_recommended, eligible = true and recommended_by = 'trichologist'.
 * Otherwise when ruleBasedEligible, eligible = true and recommended_by = 'rules'.
 */
export function getEligibility(
  responses: LongevityQuestionnaireResponses,
  review_outcome: string | null
): BloodRequestEligibilityResult | null {
  if (review_outcome === REVIEW_OUTCOME.BLOODS_RECOMMENDED) {
    return {
      eligible: true,
      recommended_tests: recommendedTestsFromFlags(responses),
      reason: reasonFromFlags(responses),
      recommended_by: "trichologist",
    };
  }
  if (ruleBasedEligible(responses)) {
    return {
      eligible: true,
      recommended_tests: recommendedTestsFromFlags(responses),
      reason: reasonFromFlags(responses),
      recommended_by: "rules",
    };
  }
  return null;
}
