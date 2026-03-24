import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

/** Attach canonical presentation_pattern under adaptiveEngine.answers (intake shape). */
export function withPresentation(
  presentation_pattern: string,
  base: LongevityQuestionnaireResponses = {}
): LongevityQuestionnaireResponses {
  const prev = (base.adaptiveEngine?.answers ?? {}) as Record<string, unknown>;
  return {
    ...base,
    adaptiveEngine: {
      ...base.adaptiveEngine,
      answers: {
        ...prev,
        presentation_pattern,
      },
    },
  };
}
