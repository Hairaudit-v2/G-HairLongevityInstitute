/**
 * Lightweight Review Complexity Score for the Trichologist queue.
 * Computed on read from existing signals (derived flags, review priority, optional questionnaire/docs).
 * No ML; additive and isolated to longevity namespace.
 */

import type { LongevityQuestionnaireResponses } from "./schema";
import { REVIEW_PRIORITY, type ReviewPriority } from "./reviewConstants";
import type { TriageFlags } from "./triage";
import { LONGEVITY_DOC_TYPE } from "./documentTypes";

function has(arr: string[] | undefined, ...keys: string[]): boolean {
  if (!arr) return false;
  return keys.some((k) => arr.includes(k));
}

export type ComplexityBand = "low" | "moderate" | "high" | "complex";

export type ReviewComplexityResult = {
  score: number;
  band: ComplexityBand;
  drivers: string[];
};

/** Input for computing complexity. Flags and priority always; questionnaire/documents optional. */
export type ReviewComplexityInput = {
  flags: TriageFlags;
  review_priority: string | null;
  /** When provided, enables finer drivers (patchy loss, burning/tenderness, autoimmune). */
  questionnaireResponses?: LongevityQuestionnaireResponses;
  /** When provided with bloodsLikelyNeeded, "Missing documents" added if no blood doc. */
  documents?: { doc_type: string }[];
};

const DRIVER_LABELS = {
  manualReviewRecommended: "Manual review recommended",
  possibleIronRisk: "Iron risk",
  possibleThyroidRisk: "Thyroid risk",
  possibleHormonalPattern: "Hormonal pattern",
  possibleInflammatoryPattern: "Inflammatory pattern",
  possibleAndrogenPattern: "Androgen pattern",
  possibleStressTrigger: "Stress/trigger",
  patchyHairLoss: "Patchy hair loss",
  burningTenderness: "Burning/tenderness",
  autoimmuneHistory: "Autoimmune history",
  noRecentBloods: "No recent bloods",
  missingDocuments: "Missing documents",
  priorityUrgent: "Priority: urgent",
  priorityHigh: "Priority: high",
} as const;

/** Weights for score (clinician-friendly: higher = more impact on complexity). */
const WEIGHTS = {
  manualReviewRecommended: 4,
  possibleIronRisk: 1,
  possibleThyroidRisk: 1,
  possibleHormonalPattern: 1,
  possibleInflammatoryPattern: 1,
  possibleAndrogenPattern: 1,
  possibleStressTrigger: 1,
  patchyHairLoss: 2,
  burningTenderness: 2,
  autoimmuneHistory: 2,
  noRecentBloods: 1,
  missingDocuments: 2,
  priorityUrgent: 3,
  priorityHigh: 2,
} as const;

/** Score thresholds for bands. */
const BAND_THRESHOLDS = {
  low: 3,
  moderate: 7,
  high: 12,
} as const;

function bandFromScore(score: number): ComplexityBand {
  if (score <= BAND_THRESHOLDS.low) return "low";
  if (score <= BAND_THRESHOLDS.moderate) return "moderate";
  if (score <= BAND_THRESHOLDS.high) return "high";
  return "complex";
}

/**
 * Compute review complexity from existing signals. Use when building queue items or case detail.
 * Drivers are returned in a consistent order for display.
 */
export function computeReviewComplexity(input: ReviewComplexityInput): ReviewComplexityResult {
  const { flags, review_priority, questionnaireResponses, documents } = input;
  let score = 0;
  const driverSet = new Set<string>();

  if (flags.manualReviewRecommended) {
    score += WEIGHTS.manualReviewRecommended;
    driverSet.add(DRIVER_LABELS.manualReviewRecommended);
  }
  if (flags.possibleIronRisk) {
    score += WEIGHTS.possibleIronRisk;
    driverSet.add(DRIVER_LABELS.possibleIronRisk);
  }
  if (flags.possibleThyroidRisk) {
    score += WEIGHTS.possibleThyroidRisk;
    driverSet.add(DRIVER_LABELS.possibleThyroidRisk);
  }
  if (flags.possibleHormonalPattern) {
    score += WEIGHTS.possibleHormonalPattern;
    driverSet.add(DRIVER_LABELS.possibleHormonalPattern);
  }
  if (flags.possibleInflammatoryPattern) {
    score += WEIGHTS.possibleInflammatoryPattern;
    driverSet.add(DRIVER_LABELS.possibleInflammatoryPattern);
  }
  if (flags.possibleAndrogenPattern) {
    score += WEIGHTS.possibleAndrogenPattern;
    driverSet.add(DRIVER_LABELS.possibleAndrogenPattern);
  }
  if (flags.possibleStressTrigger) {
    score += WEIGHTS.possibleStressTrigger;
    driverSet.add(DRIVER_LABELS.possibleStressTrigger);
  }

  if (questionnaireResponses) {
    const mc = questionnaireResponses.mainConcern;
    const m = questionnaireResponses.medicalHistory;
    if (has(mc?.primaryConcerns, "patchy_hair_loss")) {
      score += WEIGHTS.patchyHairLoss;
      driverSet.add(DRIVER_LABELS.patchyHairLoss);
    }
    if (has(mc?.symptoms, "burning", "tenderness")) {
      score += WEIGHTS.burningTenderness;
      driverSet.add(DRIVER_LABELS.burningTenderness);
    }
    if (has(m?.diagnoses, "autoimmune_condition")) {
      score += WEIGHTS.autoimmuneHistory;
      driverSet.add(DRIVER_LABELS.autoimmuneHistory);
    }
  }

  if (flags.bloodsLikelyNeeded) {
    score += WEIGHTS.noRecentBloods;
    driverSet.add(DRIVER_LABELS.noRecentBloods);
  }

  if (flags.bloodsLikelyNeeded && documents) {
    const hasBloodDoc = documents.some(
      (d) => d.doc_type === LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD || d.doc_type === "upload"
    );
    if (!hasBloodDoc) {
      score += WEIGHTS.missingDocuments;
      driverSet.add(DRIVER_LABELS.missingDocuments);
    }
  }

  const priority = (review_priority ?? REVIEW_PRIORITY.NORMAL) as ReviewPriority;
  if (priority === REVIEW_PRIORITY.URGENT) {
    score += WEIGHTS.priorityUrgent;
    driverSet.add(DRIVER_LABELS.priorityUrgent);
  } else if (priority === REVIEW_PRIORITY.HIGH) {
    score += WEIGHTS.priorityHigh;
    driverSet.add(DRIVER_LABELS.priorityHigh);
  }

  const drivers = Array.from(driverSet);
  const band = bandFromScore(score);

  return { score, band, drivers };
}
