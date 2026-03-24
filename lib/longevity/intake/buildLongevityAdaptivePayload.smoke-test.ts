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
    run("adaptive engine female postpartum chronology maps to v2 answers", () => {
      const payload = buildLongevityAdaptivePayload({
        aboutYou: { sexAtBirth: "female" },
        adaptiveEngine: {
          answers: {
            presentation_pattern: "patterned_thinning",
            female_hormonal_context: "yes",
            postpartum_recent_gate: "yes",
            months_since_delivery: "3_to_6_months",
            breastfeeding_status: "currently_breastfeeding",
            hormonal_contraception_change_gate: "yes",
            hormonal_change_vs_hair_timing: "around_same_time",
          },
        },
      });
      assert(payload.adaptive_answers.postpartum_recent === true, "postpartum_recent from adaptive chronology");
      assert(payload.adaptive_answers.months_since_delivery === "3_to_6_months", "months_since_delivery preserved");
      assert(
        payload.adaptive_answers.breastfeeding_status === "currently_breastfeeding",
        "breastfeeding_status preserved"
      );
      assert(
        payload.adaptive_answers.hormonal_change_vs_hair_timing === "around_same_time",
        "hormonal vs hair timing preserved"
      );
    }),
    run("adaptive engine male androgen detail maps to exposure flags", () => {
      const payload = buildLongevityAdaptivePayload({
        aboutYou: { sexAtBirth: "male" },
        adaptiveEngine: {
          answers: {
            presentation_pattern: "crown_loss",
            male_androgen_exposure_context: "yes",
            male_androgen_exposure_detail: ["trt", "sarms_or_anabolics"],
            exogenous_androgen_timing_vs_hair: "before_hair_change",
          },
        },
      });
      assert(payload.adaptive_answers.current_or_past_trt === true, "TRT detail sets current_or_past_trt");
      assert(payload.adaptive_answers.sarms_or_anabolics === true, "SARMs detail preserved as flag");
      assert(
        payload.adaptive_answers.exogenous_androgen_timing_vs_hair === "before_hair_change",
        "androgen timing vs hair preserved"
      );
    }),
    run("adaptive medication chronology sets medication_change_recently", () => {
      const payload = buildLongevityAdaptivePayload({
        aboutYou: { sexAtBirth: "female" },
        adaptiveEngine: {
          answers: {
            presentation_pattern: "acute_shedding",
            medication_hormone_change_recent: "yes",
            med_change_timing_vs_hair: "around_same_time",
          },
        },
      });
      assert(payload.adaptive_answers.medication_change_recently === true, "med change maps to boolean");
      assert(
        payload.adaptive_answers.med_change_timing_vs_hair === "around_same_time",
        "med vs hair timing preserved"
      );
    }),
    run("protein and diet_pattern_intake adjust nutritional flags", () => {
      const payload = buildLongevityAdaptivePayload({
        adaptiveEngine: {
          answers: {
            presentation_pattern: "acute_shedding",
            lifestyle_load: ["major_stress"],
            protein_intake_level: "low",
            diet_pattern_intake: ["vegan"],
          },
        },
      });
      assert(payload.adaptive_answers.low_protein_intake === true, "low protein level maps");
      assert(payload.adaptive_answers.vegetarian_or_vegan === true, "vegan diet pattern maps");
    }),
    run("scalp symptom detail fields pass through to adaptive_answers", () => {
      const payload = buildLongevityAdaptivePayload({
        adaptiveEngine: {
          answers: {
            presentation_pattern: "scalp_symptoms",
            scalp_symptom_cluster: ["itch", "scale"],
            scalp_symptom_duration: "6_weeks_to_6_months",
            scalp_symptom_flare_pattern: "flares_then_calm",
            scalp_symptom_treatments_tried: ["medicated_shampoo"],
          },
        },
      });
      assert(payload.adaptive_answers.scalp_symptom_duration === "6_weeks_to_6_months", "duration preserved");
      assert(
        payload.adaptive_answers.scalp_symptom_flare_pattern === "flares_then_calm",
        "flare pattern preserved"
      );
      assert(
        Array.isArray(payload.adaptive_answers.scalp_symptom_treatments_tried) &&
          (payload.adaptive_answers.scalp_symptom_treatments_tried as string[]).includes("medicated_shampoo"),
        "treatments preserved"
      );
    }),
    run("structured family history maps side and similarity", () => {
      const payload = buildLongevityAdaptivePayload({
        medicalHistory: {
          familyHistory: ["female_pattern_thinning"],
          familyHistorySide: "mothers_side",
          familyHairPatternMatch: "similar_to_mine",
          familyHairOnsetAgeBand: "40s",
        },
      });
      assert(payload.adaptive_answers.family_history === "mothers_side", "explicit side wins");
      assert(payload.adaptive_answers.family_hair_pattern_match === "similar_to_mine", "pattern match");
      assert(payload.adaptive_answers.family_hair_onset_age_band === "40s", "onset band");
      assert(typeof payload.adaptive_triage_output.primary_pathway === "string", "triage primary pathway set");
    }),
    run("perceived severity and pattern confidence map", () => {
      const payload = buildLongevityAdaptivePayload({
        mainConcern: { perceivedSeverity: "moderate", patternConfidence: "mixed_or_unsure" },
      });
      assert(payload.adaptive_answers.perceived_severity === "moderate", "severity");
      assert(payload.adaptive_answers.pattern_confidence === "mixed_or_unsure", "pattern confidence");
    }),
    run("shedding trend maps to recent_hair_trend and can influence progression", () => {
      const payload = buildLongevityAdaptivePayload({
        timelineTriggers: { sheddingTrend: "comes_and_goes" },
        mainConcern: {},
      });
      assert(payload.adaptive_answers.recent_hair_trend === "fluctuating", "comes_and_goes normalised");
      assert(payload.adaptive_answers.progression_speed === "fluctuating", "progression filled from trend when onset unset");
    }),
  ];
}

