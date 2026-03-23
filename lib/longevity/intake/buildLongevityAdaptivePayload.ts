import {
  evaluateAdaptiveIntake,
  HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
  type AdaptiveAnswers,
} from "@/src/lib/longevity/intake";

export type LongevityAdaptiveIntakePayload = {
  adaptive_answers: AdaptiveAnswers;
  adaptive_schema_version: string;
  adaptive_triage_output: ReturnType<typeof evaluateAdaptiveIntake>["triage"];
};

export function buildLongevityAdaptivePayload(
  adaptiveAnswers: AdaptiveAnswers
): LongevityAdaptiveIntakePayload {
  const result = evaluateAdaptiveIntake(adaptiveAnswers);

  return {
    adaptive_answers: adaptiveAnswers,
    adaptive_schema_version: HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
    adaptive_triage_output: result.triage,
  };
}
