import {
  buildLongevityAdaptivePayload,
  HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
} from "@/lib/longevity/intake";

type PayloadSmokeTest = {
  name: string;
  passed: boolean;
  message?: string;
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function run(name: string, execute: () => void): PayloadSmokeTest {
  try {
    execute();
    return { name, passed: true };
  } catch (error) {
    return {
      name,
      passed: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function runBuildLongevityAdaptivePayloadSmokeTests(): PayloadSmokeTest[] {
  return [
    run("empty adaptive answers persists safely", () => {
      const payload = buildLongevityAdaptivePayload({});
      assert(
        payload.adaptive_schema_version === HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
        "Expected schema version to match adaptive version constant"
      );
      assert(
        typeof payload.adaptive_triage_output === "object" &&
          payload.adaptive_triage_output != null,
        "Expected triage output object for empty answers"
      );
    }),
    run("partial adaptive answers persists safely", () => {
      const payload = buildLongevityAdaptivePayload({
        sex_at_birth: "female",
        chief_concern: "thinning",
      });
      assert(
        payload.adaptive_answers.chief_concern === "thinning",
        "Expected raw adaptive answers to be preserved"
      );
      assert(
        typeof payload.adaptive_triage_output.primary_pathway === "string",
        "Expected triage output to include primary pathway"
      );
    }),
  ];
}

