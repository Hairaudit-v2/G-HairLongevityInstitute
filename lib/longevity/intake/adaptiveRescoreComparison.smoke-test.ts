import {
  compareAdaptiveTriageWithCurrentEngine,
  evaluateAdaptiveIntake,
  HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
  type AdaptiveAnswers,
} from "@/lib/longevity/intake";

type RescoreSmokeTestResult = {
  name: string;
  passed: boolean;
  message?: string;
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function run(
  name: string,
  execute: () => void
): RescoreSmokeTestResult {
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

export function runAdaptiveRescoreComparisonSmokeTests(): RescoreSmokeTestResult[] {
  const baselineAnswers: AdaptiveAnswers = {
    sex_at_birth: "female",
    chief_concern: "thinning",
    onset_timing: "6_to_12_months",
    pattern_distribution: ["center_part"],
    cycle_regularity: "irregular",
  };
  const baseline = evaluateAdaptiveIntake(baselineAnswers).triage;

  return [
    run("no-change scenario", () => {
      const comparison = compareAdaptiveTriageWithCurrentEngine({
        adaptive_answers: baselineAnswers,
        stored_adaptive_schema_version: HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
        stored_adaptive_triage_output: baseline,
      });
      assert(comparison.changed === false, "Expected no changes for same triage snapshot");
      assert(comparison.changed_fields.length === 0, "Expected no changed fields");
    }),
    run("changed primary pathway scenario", () => {
      const comparison = compareAdaptiveTriageWithCurrentEngine({
        adaptive_answers: baselineAnswers,
        stored_adaptive_schema_version: HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
        stored_adaptive_triage_output: {
          ...baseline,
          primary_pathway: "androgenic_pattern",
        },
      });
      assert(comparison.changed === true, "Expected changed comparison");
      assert(
        comparison.changed_fields.includes("primary_pathway"),
        "Expected primary pathway change detection"
      );
    }),
    run("changed flags only scenario", () => {
      const comparison = compareAdaptiveTriageWithCurrentEngine({
        adaptive_answers: baselineAnswers,
        stored_adaptive_schema_version: HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
        stored_adaptive_triage_output: {
          ...baseline,
          red_flags: ["rapid_patchy_loss"],
          clinician_attention_flags: ["possible_scarring_red_flag"],
        },
      });
      assert(comparison.changed === true, "Expected changed comparison");
      assert(
        comparison.changed_fields.includes("red_flags"),
        "Expected red flag change detection"
      );
      assert(
        comparison.changed_fields.includes("clinician_attention_flags"),
        "Expected clinician attention flag change detection"
      );
      assert(
        !comparison.changed_fields.includes("primary_pathway"),
        "Did not expect primary pathway change"
      );
    }),
    run("empty adaptive answers fallback scenario", () => {
      const comparison = compareAdaptiveTriageWithCurrentEngine({
        adaptive_answers: {},
        stored_adaptive_schema_version: null,
        stored_adaptive_triage_output: null,
      });
      assert(
        typeof comparison.current_primary_pathway === "string",
        "Expected a valid current primary pathway fallback"
      );
      assert(
        comparison.changed_fields.includes("schema_version"),
        "Expected schema version difference when stored schema is missing"
      );
    }),
  ];
}

