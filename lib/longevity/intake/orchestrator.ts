import { INTAKE_QUESTION_BANK } from "./questionBank";
import { INTAKE_PATHWAYS } from "./pathways";
import { scorePathways } from "./rules";
import type {
  IntakeAnswerMap,
  IntakeEngineContext,
  IntakePathwayId,
  IntakeQuestionDefinition,
} from "./types";

const BASE_QUESTION_IDS = ["presentation_pattern"];

function questionById(id: string): IntakeQuestionDefinition | undefined {
  return INTAKE_QUESTION_BANK.find((q) => q.id === id);
}

export function getActivePathwayIds(
  answers: IntakeAnswerMap,
  context: IntakeEngineContext
): IntakePathwayId[] {
  const scored = scorePathways(answers, context);
  return scored.filter((s) => s.score >= 2).slice(0, 4).map((s) => s.pathway);
}

export function getNextAdaptiveQuestions(
  answers: IntakeAnswerMap,
  context: IntakeEngineContext
): IntakeQuestionDefinition[] {
  const activePathways = getActivePathwayIds(answers, context);
  const followupIds = INTAKE_PATHWAYS.filter((p) => activePathways.includes(p.id))
    .flatMap((p) => p.followupQuestionIds);

  const sexSpecificIds =
    context.sexAtBirth === "female"
      ? ["female_hormonal_context"]
      : context.sexAtBirth === "male"
        ? ["male_androgen_exposure_context"]
        : [];

  const allIds = Array.from(new Set([...BASE_QUESTION_IDS, ...followupIds, ...sexSpecificIds]));
  return allIds
    .map((id) => questionById(id))
    .filter((q): q is IntakeQuestionDefinition => !!q)
    .filter((q) => (q.visibleWhen ? q.visibleWhen(answers) : true));
}

export function estimateAdaptiveProgress(
  answers: IntakeAnswerMap,
  context: IntakeEngineContext
): number {
  const questions = getNextAdaptiveQuestions(answers, context);
  if (questions.length === 0) return 0;
  const answered = questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "").length;
  return Math.min(100, Math.round((answered / questions.length) * 100));
}

