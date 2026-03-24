import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import {
  evaluateAdaptiveIntake,
  HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
  type AdaptiveAnswers,
} from "@/src/lib/longevity/intake";

import {
  looksLikeQuestionnaireResponses,
  mapResponsesToAdaptiveAnswers,
} from "./mapResponsesToAdaptiveAnswers";

export type LongevityAdaptiveIntakePayload = {
  adaptive_answers: AdaptiveAnswers;
  adaptive_schema_version: string;
  adaptive_triage_output: ReturnType<typeof evaluateAdaptiveIntake>["triage"];
};

/**
 * Builds persisted adaptive payload for the v2 triage engine.
 * Accepts full questionnaire responses or raw AdaptiveAnswers (e.g. tests); raw answers are wrapped
 * under adaptiveEngine.answers and merged with the mapper.
 */
export function buildLongevityAdaptivePayload(
  input: LongevityQuestionnaireResponses | AdaptiveAnswers
): LongevityAdaptiveIntakePayload {
  const responses: LongevityQuestionnaireResponses = looksLikeQuestionnaireResponses(input)
    ? (input as LongevityQuestionnaireResponses)
    : {
        adaptiveEngine: {
          answers: input as Record<string, string | string[] | boolean | null>,
        },
      };
  const adaptiveAnswers = mapResponsesToAdaptiveAnswers(responses);
  const result = evaluateAdaptiveIntake(adaptiveAnswers);

  return {
    adaptive_answers: adaptiveAnswers,
    adaptive_schema_version: HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
    adaptive_triage_output: result.triage,
  };
}
