import { evaluateAdaptiveIntake, type AdaptiveAnswers } from "./index";

type SmokeTestResult = {
  name: string;
  passed: boolean;
  message?: string;
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function runCase(name: string, answers: AdaptiveAnswers, check: (result: ReturnType<typeof evaluateAdaptiveIntake>) => void): SmokeTestResult {
  try {
    const result = evaluateAdaptiveIntake(answers);
    check(result);
    return { name, passed: true };
  } catch (error) {
    return {
      name,
      passed: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function runAdaptiveTriageSmokeTests(): SmokeTestResult[] {
  return [
    runCase(
      "female hormonal pattern case",
      {
        sex_at_birth: "female",
        chief_concern: "thinning",
        onset_timing: "6_to_12_months",
        pattern_distribution: ["center_part"],
        cycle_regularity: "irregular",
        known_pcos: true,
      },
      (result) => {
        assert(
          result.triage.primary_pathway === "female_hormonal_pattern",
          "Expected female_hormonal_pattern as primary"
        );
      }
    ),
    runCase(
      "male androgen exposure case",
      {
        sex_at_birth: "male",
        chief_concern: "receding_hairline",
        progression_speed: "rapidly_worsening",
        pattern_distribution: ["temples", "crown"],
        current_or_past_trt: true,
      },
      (result) => {
        assert(
          result.triage.primary_pathway === "male_androgen_exposure_pattern",
          "Expected male_androgen_exposure_pattern as primary"
        );
      }
    ),
    runCase(
      "acute telogen effluvium case",
      {
        sex_at_birth: "female",
        chief_concern: "shedding",
        onset_timing: "6_weeks_to_3_months",
        pattern_distribution: ["diffuse_top", "diffuse_all_over"],
        recent_illness: true,
      },
      (result) => {
        assert(
          result.triage.primary_pathway === "telogen_effluvium_acute",
          "Expected telogen_effluvium_acute as primary"
        );
      }
    ),
    runCase(
      "traction/mechanical case",
      {
        sex_at_birth: "female",
        chief_concern: "thinning",
        breakage_over_shedding: true,
        pattern_distribution: ["edges"],
        tight_hairstyles_or_extensions: true,
      },
      (result) => {
        assert(
          result.triage.primary_pathway === "traction_mechanical_pattern",
          "Expected traction_mechanical_pattern as primary"
        );
      }
    ),
    runCase(
      "inflammatory scalp symptom case",
      {
        sex_at_birth: "male",
        chief_concern: "scalp_symptoms",
        scalp_symptoms: ["itch", "burning", "pustules"],
        pattern_distribution: ["diffuse_top"],
      },
      (result) => {
        assert(
          result.triage.primary_pathway === "inflammatory_scalp_pattern",
          "Expected inflammatory_scalp_pattern as primary"
        );
      }
    ),
  ];
}

