import type { AdaptiveFacts, PathwayId, PathwayScore, TriageConfidenceLevel } from "./adaptiveTypes";

const SHELL_PATHWAY_IDS = new Set<PathwayId>(["mixed_pattern", "unclear_pattern"]);

/** Canonical reason strings attached to triage interpretation (clinician-facing / analytics). */
export const TRIAGE_CONFIDENCE_REASON = {
  CLEAR_DOMINANT_PATTERN: "clear dominant pattern",
  OVERLAPPING_CONTRIBUTORS: "overlapping contributors",
  LOW_SIGNAL_STRENGTH: "low signal strength",
  CONFLICTING_PATTERN_INDICATORS: "conflicting pattern indicators",
} as const;

function dedupeReasons(reasons: string[]): string[] {
  return Array.from(new Set(reasons));
}

/**
 * Derives interpretive confidence from pathway scores and selection context.
 * Does not alter scoring or primary/secondary selection — call after calibration.
 */
export function deriveTriageInterpretationConfidence(
  pathwayScores: PathwayScore[],
  facts: AdaptiveFacts,
  primaryPathway: PathwayId,
  secondaryPathways: PathwayId[]
): { confidence_level: TriageConfidenceLevel; confidence_reasons: string[] } {
  const R = TRIAGE_CONFIDENCE_REASON;
  const concrete = pathwayScores
    .filter((s) => !SHELL_PATHWAY_IDS.has(s.pathwayId))
    .sort((a, b) => b.score - a.score);

  const top = concrete[0];
  const second = concrete[1];
  const gap = second ? top.score - second.score : 999;
  const competitiveInBand = concrete.filter(
    (s) => top !== undefined && s.score >= top.score - 2 && s.score > 0
  );

  if (primaryPathway === "unclear_pattern" || !top || top.score <= 0) {
    return { confidence_level: "low", confidence_reasons: [R.LOW_SIGNAL_STRENGTH] };
  }

  if (primaryPathway === "mixed_pattern") {
    const reasons: string[] = [R.OVERLAPPING_CONTRIBUTORS];
    if (facts.pattern_confidence_uncertain === true) {
      reasons.push(R.CONFLICTING_PATTERN_INDICATORS);
    }
    return {
      confidence_level: facts.pattern_confidence_uncertain === true ? "low" : "moderate",
      confidence_reasons: dedupeReasons(reasons),
    };
  }

  const reasons: string[] = [];

  if (top.score <= 2) {
    reasons.push(R.LOW_SIGNAL_STRENGTH);
  }

  if (facts.pattern_confidence_uncertain === true) {
    reasons.push(R.CONFLICTING_PATTERN_INDICATORS);
  }

  const narrowMargin = gap <= 2 && second !== undefined && second.score >= 3;
  const multiSecondary = secondaryPathways.length >= 2;
  const crowdedField = competitiveInBand.length >= 3;

  if (narrowMargin || multiSecondary || crowdedField) {
    reasons.push(R.OVERLAPPING_CONTRIBUTORS);
  }

  const hasOverlap = reasons.includes(R.OVERLAPPING_CONTRIBUTORS);
  const hasConflict = reasons.includes(R.CONFLICTING_PATTERN_INDICATORS);
  const hasLowSignal = reasons.includes(R.LOW_SIGNAL_STRENGTH);

  if (hasLowSignal && top.score <= 2) {
    return { confidence_level: "low", confidence_reasons: dedupeReasons(reasons) };
  }

  if (hasConflict && gap <= 1) {
    return { confidence_level: "low", confidence_reasons: dedupeReasons(reasons) };
  }

  const eligibleHigh =
    gap >= 3 &&
    top.score >= 5 &&
    facts.pattern_confidence_uncertain !== true &&
    secondaryPathways.length <= 1 &&
    competitiveInBand.length <= 2 &&
    !hasOverlap &&
    !hasLowSignal;

  if (eligibleHigh) {
    reasons.push(R.CLEAR_DOMINANT_PATTERN);
    return { confidence_level: "high", confidence_reasons: dedupeReasons(reasons) };
  }

  if (
    gap >= 2 &&
    top.score >= 4 &&
    facts.pattern_confidence_uncertain !== true &&
    secondaryPathways.length === 0 &&
    !hasOverlap &&
    !hasLowSignal
  ) {
    reasons.push(R.CLEAR_DOMINANT_PATTERN);
    return { confidence_level: "high", confidence_reasons: dedupeReasons(reasons) };
  }

  if (reasons.length === 0) {
    reasons.push(R.OVERLAPPING_CONTRIBUTORS);
  }

  return { confidence_level: "moderate", confidence_reasons: dedupeReasons(reasons) };
}
