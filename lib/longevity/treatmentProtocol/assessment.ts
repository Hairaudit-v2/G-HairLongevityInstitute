/**
 * Hair Longevity Treatment Protocol — main assessment and adherence modifier.
 * Deterministic, clinician-support only. No AI or diagnosis.
 */

import type {
  TreatmentProtocolAssessment,
  ProtocolAssessmentInput,
  AdherenceModifier,
  ResponseLikelihood,
  ProtocolScoreBreakdown,
} from "./types";
import {
  computeRawDomainScores,
  computeCoverageDomains,
  computeProtocolScore,
  scoreToBand,
  type RawDomainScores,
} from "./scoring";
import { computeGaps, computeStrengths } from "./gaps";

const CORE_KEYS = new Set([
  "finasteride",
  "dutasteride",
  "spironolactone",
  "topical_minoxidil",
  "oral_minoxidil",
]);

function normKey(k: string): string {
  return k.toLowerCase().trim().replace(/-/g, "_");
}

/**
 * Compute adherence modifier from treatment continuity states.
 * Conservative: inconsistent or stopped core -> negative; continued core -> positive; else neutral.
 * Negative takes precedence when any core treatment is inconsistent or stopped.
 */
function computeAdherenceModifier(
  adherenceItems: { key: string; status: string }[],
  hasPreviousIntake: boolean
): AdherenceModifier {
  if (!hasPreviousIntake) return "neutral";
  let hasNegative = false;
  let hasPositive = false;
  for (const item of adherenceItems) {
    const key = normKey(item.key);
    const status = (item.status ?? "").toLowerCase();
    if (!CORE_KEYS.has(key)) continue;
    if (status === "inconsistent" || status === "stopped") hasNegative = true;
    if (status === "continued") hasPositive = true;
  }
  if (hasNegative && !hasPositive) return "negative";
  if (hasPositive && !hasNegative) return "positive";
  return "neutral";
}

/** Adherence bonus/penalty: ±15. Total max = 100. */
const ADHERENCE_DELTA = 15;

/** Returns the numeric adherence adjustment applied (±15 or 0). Deterministic. */
function getAdherenceAdjustment(modifier: AdherenceModifier): number {
  if (modifier === "negative") return -ADHERENCE_DELTA;
  if (modifier === "positive") return ADHERENCE_DELTA;
  return 0;
}

/**
 * Apply adherence modifier to base score (±15), then clamp 0–100.
 */
function applyAdherenceModifier(score: number, modifier: AdherenceModifier): number {
  if (modifier === "negative") return Math.max(0, score - ADHERENCE_DELTA);
  if (modifier === "positive") return Math.min(100, score + ADHERENCE_DELTA);
  return score;
}

/**
 * Cautious response_likelihood from protocol strength, coverage, adherence, and gaps.
 * Not outcome prediction — clinician-support signal only.
 */
function computeResponseLikelihood(
  score: number,
  band: TreatmentProtocolAssessment["protocol_band"],
  modifier: AdherenceModifier,
  gaps: string[]
): ResponseLikelihood {
  const hasCriticalGap =
    gaps.includes("no_core_dht_modulation_listed") ||
    gaps.includes("no_growth_stimulation_listed") ||
    gaps.includes("supportive_only_protocol") ||
    gaps.includes("core_treatment_inconsistent") ||
    gaps.includes("stopped_core_treatment_without_replacement");
  if (hasCriticalGap || modifier === "negative") {
    if (score < 20) return "low";
    return "uncertain";
  }
  if (band === "minimal" || (band === "basic" && modifier === "neutral")) return "uncertain";
  if (band === "basic" || band === "moderate") return "moderate";
  if (band === "strong" && (modifier === "positive" || modifier === "neutral")) return "favourable";
  return "moderate";
}

/**
 * Build recommendation_signals (internal prompts for clinician review).
 */
function buildRecommendationSignals(
  assessment: TreatmentProtocolAssessment,
  derivedFlags?: Record<string, boolean> | null
): string[] {
  const signals: string[] = [];
  if (assessment.protocol_band === "minimal") {
    signals.push("Protocol strength is minimal; consider discussing evidence-based options if appropriate.");
  }
  if (assessment.gaps.includes("no_core_dht_modulation_listed") || assessment.gaps.includes("no_growth_stimulation_listed")) {
    signals.push("Core treatment domains are absent; review suitability and preferences.");
  }
  if (assessment.gaps.includes("regenerative_without_core_foundation")) {
    signals.push("Regenerative treatments without core foundation; align with guidelines.");
  }
  if (assessment.adherence_modifier === "negative") {
    signals.push("Adherence signals suggest inconsistency or recent stopping of core treatment; clarify with patient.");
  }
  if (assessment.strengths.includes("combined_core_protocol_present") && assessment.adherence_modifier === "positive") {
    signals.push("Combined core protocol with good continuity; reinforce adherence.");
  }
  return signals;
}

/**
 * Main assessment: compute full TreatmentProtocolAssessment from used keys and adherence.
 */
export function assessTreatmentProtocol(input: ProtocolAssessmentInput): TreatmentProtocolAssessment {
  const {
    usedKeys,
    adherenceItems,
    hasPreviousIntake = false,
    adherenceContext,
    derivedFlags,
  } = input;

  const normalizedKeys = usedKeys.map(normKey).filter(Boolean);
  const rawScores = computeRawDomainScores(normalizedKeys);
  const coverage = computeCoverageDomains(rawScores);
  const gaps = computeGaps({
    usedKeys: normalizedKeys,
    adherenceItems,
    rawScores,
    coverage,
    hasPreviousIntake,
  });
  const strengths = computeStrengths({
    usedKeys: normalizedKeys,
    adherenceItems,
    rawScores,
    coverage,
    hasPreviousIntake,
  });

  const adherenceModifier = computeAdherenceModifier(adherenceItems, hasPreviousIntake);
  const baseScore = computeProtocolScore(rawScores);
  const adherenceAdjustment = getAdherenceAdjustment(adherenceModifier);
  let protocolScore = applyAdherenceModifier(baseScore, adherenceModifier);
  protocolScore = Math.max(0, Math.min(100, protocolScore));

  const protocolBand = scoreToBand(protocolScore);

  const scoreBreakdown: ProtocolScoreBreakdown = {
    dht_control: rawScores.dht_control,
    growth_stimulation: rawScores.growth_stimulation,
    regenerative_support: rawScores.regenerative_support,
    inflammation_scalp_support: rawScores.inflammation_scalp_support,
    nutritional_support: rawScores.nutritional_support,
    adherence_adjustment: adherenceAdjustment,
  };

  const assessment: TreatmentProtocolAssessment = {
    protocol_score: protocolScore,
    protocol_band: protocolBand,
    response_likelihood: "uncertain",
    coverage_domains: coverage,
    adherence_modifier: adherenceModifier,
    gaps,
    strengths,
    recommendation_signals: [],
    protocol_assessment_version: "v1",
    score_breakdown: scoreBreakdown,
  };
  assessment.response_likelihood = computeResponseLikelihood(
    protocolScore,
    protocolBand,
    adherenceModifier,
    gaps
  );
  assessment.recommendation_signals = buildRecommendationSignals(assessment, derivedFlags);
  return assessment;
}
