import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import { INTAKE_QUESTION_BANK } from "./questionBank";
import { INTAKE_PATHWAYS } from "./pathways";
import { scorePathways, selectPathways } from "./rules";
import { normalizeAdaptiveAnswers } from "./triageEngine";
import type {
  IntakeAnswerMap,
  IntakeEngineContext,
  IntakePathwayId,
  IntakePathwayScore,
  IntakeQuestionDefinition,
} from "./types";

const BASE_QUESTION_IDS = ["presentation_pattern"];

function questionById(id: string): IntakeQuestionDefinition | undefined {
  return INTAKE_QUESTION_BANK.find((q) => q.id === id);
}

function intakeContextFromAbout(
  responses: LongevityQuestionnaireResponses
): IntakeEngineContext {
  const sex = responses.aboutYou?.sexAtBirth;
  const sexAtBirth =
    sex === "female" || sex === "male" || sex === "intersex" || sex === "prefer_not_to_say"
      ? sex
      : undefined;
  const dob = responses.aboutYou?.dateOfBirth;
  const ageYears =
    dob && !Number.isNaN(new Date(dob).getTime())
      ? Math.max(0, new Date().getFullYear() - new Date(dob).getFullYear())
      : null;
  return { sexAtBirth, ageYears };
}

/**
 * Pathway chips, adaptive follow-ups, and buildIntakeTriageOutput all use this scoring model.
 */
export function getPathwayStateFromQuestionnaire(responses: LongevityQuestionnaireResponses): {
  primary_pathway: IntakePathwayId;
  secondary_pathways: IntakePathwayId[];
  pathway_confidence: IntakePathwayScore[];
} {
  const raw = (responses.adaptiveEngine?.answers ??
    responses.adaptiveEngine?.adaptive_answers ??
    {}) as IntakeAnswerMap;
  const answers = normalizeAdaptiveAnswers(raw);
  const context = intakeContextFromAbout(responses);
  const scored = scorePathways(answers, context);
  const selected = selectPathways(scored);
  return {
    primary_pathway: selected.primary,
    secondary_pathways: selected.secondary,
    pathway_confidence: scored,
  };
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

