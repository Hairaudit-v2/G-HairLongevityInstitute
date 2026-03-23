import type { IntakeAnswerMap, IntakeEngineContext, IntakePathwayId, IntakePathwayScore } from "./types";
import { INTAKE_PATHWAYS } from "./pathways";

function toBand(score: number): "high" | "medium" | "low" {
  if (score >= 3) return "high";
  if (score >= 1) return "medium";
  return "low";
}

export function scorePathways(
  answers: IntakeAnswerMap,
  context: IntakeEngineContext
): IntakePathwayScore[] {
  const scored = INTAKE_PATHWAYS.map((pathway) => {
    const entryHitCount = pathway.entryCriteria.filter((rule) => rule(answers, context)).length;
    const exitHitCount = pathway.exitCriteria.filter((rule) => rule(answers, context)).length;
    const score = entryHitCount * 2 + Math.min(exitHitCount, 1);
    return {
      pathway: pathway.id,
      score,
      confidence: toBand(score),
    };
  }).sort((a, b) => b.score - a.score);

  if (!scored.some((s) => s.score > 0)) {
    return scored.map((s) =>
      s.pathway === "mixed_unclear_pattern"
        ? { ...s, score: 2, confidence: "medium" as const }
        : s
    );
  }
  return scored;
}

export function selectPathways(scored: IntakePathwayScore[]): {
  primary: IntakePathwayId;
  secondary: IntakePathwayId[];
} {
  const primary = scored[0]?.pathway ?? "mixed_unclear_pattern";
  const secondary = scored
    .filter((s) => s.pathway !== primary && s.score >= 2)
    .slice(0, 3)
    .map((s) => s.pathway);
  return { primary, secondary };
}

