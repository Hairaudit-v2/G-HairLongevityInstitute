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
        assert(
          result.pathwayScores.some((s) => s.pathwayId === "androgenic_pattern" && s.score > 0),
          "Expected androgenic_pattern to register overlap in scores (may sit below secondary threshold when primary is very high)"
        );
        assert(
          result.triage.clinician_attention_flags.includes("possible_pcos_signal"),
          "Expected possible_pcos_signal attention flag"
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
        assert(
          result.triage.clinician_attention_flags.includes("possible_exogenous_androgen_acceleration"),
          "Expected androgen exposure clinician flag"
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
        assert(
          result.triage.secondary_pathways.includes("inflammatory_scalp_pattern") === false,
          "Did not expect inflammatory scalp as secondary for classic acute TE"
        );
        assert(
          result.triage.possible_drivers.includes("recent_trigger_burden"),
          "Expected recent trigger burden as driver"
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
        assert(
          result.triage.clinician_attention_flags.includes("possible_traction_pattern"),
          "Expected traction clinician attention flag"
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
        assert(
          result.triage.red_flags.includes("pustules_or_crusting"),
          "Expected pustules_or_crusting red flag"
        );
        assert(
          result.triage.clinician_attention_flags.includes("possible_inflammatory_scalp_disease"),
          "Expected inflammatory clinician attention flag"
        );
      }
    ),
    runCase(
      "pattern confidence uncertain promotes mixed_pattern when scores cluster",
      {
        chief_concern: "shedding",
        active_shedding_now: true,
        pattern_distribution: ["diffuse_top"],
        onset_timing: "6_to_12_months",
        scalp_symptoms: ["itch", "burning", "white_flakes"],
        poor_sleep_quality: true,
        high_stress_load: true,
        pattern_confidence: "mixed_or_unsure",
      },
      (result) => {
        assert(
          result.triage.primary_pathway === "mixed_pattern",
          "Expected mixed_pattern primary when uncertain and TE vs inflammatory cluster"
        );
        assert(result.triage.secondary_pathways.length >= 2, "Expected multiple concrete secondaries");
      }
    ),
    runCase(
      "postpartum shedding keeps androgenic as secondary when patterned loss scores",
      {
        sex_at_birth: "female",
        chief_concern: "shedding",
        active_shedding_now: true,
        postpartum_recent: true,
        pattern_distribution: ["diffuse_top", "temples"],
        family_history: "mothers_side",
        onset_timing: "3_to_6_months",
      },
      (result) => {
        assert(result.triage.primary_pathway === "postpartum_pattern", "Expected postpartum primary");
        assert(
          result.triage.secondary_pathways.includes("androgenic_pattern"),
          "Expected androgenic secondary overlap when temple pattern scores"
        );
      }
    ),
    runCase(
      "worsening trend applies to acute TE in acute window only",
      {
        chief_concern: "shedding",
        active_shedding_now: true,
        pattern_distribution: ["diffuse_top"],
        onset_timing: "6_weeks_to_3_months",
        recent_hair_trend: "worsened",
      },
      (result) => {
        const acute = result.pathwayScores.find((s) => s.pathwayId === "telogen_effluvium_acute");
        const chronic = result.pathwayScores.find((s) => s.pathwayId === "telogen_effluvium_chronic");
        assert(
          acute?.reasons.some((r) => r.includes("worsening")) === true,
          "Acute TE should include worsening reason"
        );
        assert(
          chronic?.reasons.some((r) => r.includes("worsening")) !== true,
          "Chronic TE should not get chronic worsening bonus in acute window"
        );
      }
    ),
    runCase(
      "inflammatory primary with shedding includes TE secondary",
      {
        chief_concern: "scalp_symptoms",
        scalp_symptoms: ["itch", "pustules"],
        pattern_distribution: ["diffuse_top"],
        active_shedding_now: true,
      },
      (result) => {
        assert(result.triage.primary_pathway === "inflammatory_scalp_pattern", "Inflammatory primary");
        assert(
          result.triage.secondary_pathways.some(
            (p) => p === "telogen_effluvium_acute" || p === "telogen_effluvium_chronic"
          ),
          "TE secondary when shedding co-reported"
        );
      }
    ),
  ];
}

