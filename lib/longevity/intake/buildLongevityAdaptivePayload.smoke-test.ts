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
    run("new female endocrine branch answers pass through to adaptive_answers", () => {
      const payload = buildLongevityAdaptivePayload({
        aboutYou: { sexAtBirth: "female" },
        adaptiveEngine: {
          answers: {
            presentation_pattern: "diffuse_thinning",
            female_hormonal_context: "yes",
            acute_trigger_window: "yes",
            lifestyle_load: ["major_stress"],
            unwanted_facial_hair: true,
            hirsutism_severity: "moderate",
            hirsutism_structured_check_opt_in: "yes",
            hirsutism_structured_regions: ["upper_lip", "chin_jawline"],
            stress_shedding_delay_pattern: "yes",
            postpartum_recent_gate: "no",
            hormonal_contraception_change_gate: "no",
            pituitary_red_flag_followup: "yes",
          },
        },
      });
      assert(
        payload.adaptive_answers.stress_shedding_delay_pattern === "yes",
        "stress delay pattern preserved"
      );
      assert(
        payload.adaptive_answers.pituitary_red_flag_followup === "yes",
        "pituitary follow-up prompt preserved"
      );
      assert(
        payload.adaptive_answers.hirsutism_severity === "moderate",
        "hirsutism severity preserved"
      );
      assert(
        Array.isArray(payload.adaptive_answers.hirsutism_structured_regions) &&
          (payload.adaptive_answers.hirsutism_structured_regions as string[]).includes("upper_lip"),
        "structured hirsutism regions preserved"
      );
    }),
    run("structured female endocrine owners beat stale direct v2 overlap fields", () => {
      const payload = buildLongevityAdaptivePayload({
        aboutYou: { sexAtBirth: "female" },
        femaleHistory: {
          cycles: "regular",
          features: ["acne"],
          lifeStage: ["perimenopausal"],
        },
        medicalHistory: {
          diagnoses: [],
        },
        adaptiveEngine: {
          answers: {
            cycle_regularity: "irregular",
            unwanted_facial_hair: true,
            reproductive_stage: "postpartum",
          },
        },
      });
      assert(payload.adaptive_answers.cycle_regularity === "regular", "static cycles stay authoritative");
      assert(
        payload.adaptive_answers.reproductive_stage === "perimenopausal",
        "static reproductive stage stays authoritative"
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
    run("static TRT owners do not backfill booster flags", () => {
      const payload = buildLongevityAdaptivePayload({
        aboutYou: { sexAtBirth: "male" },
        timelineTriggers: { trtStatus: "yes_prescribed" },
        maleHistory: {
          therapies: ["testosterone_replacement_therapy"],
        },
      });
      assert(payload.adaptive_answers.current_or_past_trt === true, "TRT owner maps to current_or_past_trt");
      assert(payload.adaptive_answers.testosterone_boosters !== true, "TRT alone does not imply boosters");
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
    run("timeline medication trigger backfills compatibility key", () => {
      const payload = buildLongevityAdaptivePayload({
        timelineTriggers: {
          triggers: ["new_medication"],
        },
      });
      assert(payload.adaptive_answers.medication_change_recently === true, "timeline trigger maps to boolean");
      assert(
        payload.adaptive_answers.medication_hormone_change_recent === "yes",
        "timeline owner backfills compatibility key"
      );
    }),
    run("approved systemic history fields pass through to adaptive_answers", () => {
      const payload = buildLongevityAdaptivePayload({
        medicalHistory: {
          cancerTreatmentHistory: "yes",
          cancerTreatmentTypes: ["chemotherapy", "immunotherapy"],
          cancerTreatmentTimingVsHair: "around_same_time",
          systemicDiseaseBundle: ["bariatric_surgery"],
        },
        timelineTriggers: {
          triggers: ["rapid_weight_loss", "recent_illness_or_infection"],
          weightLossIntent: "unintentional",
          majorIllnessOrHospitalReason: "infection_or_fever",
        },
      });
      assert(payload.adaptive_answers.cancer_treatment_history === "yes", "cancer history preserved");
      assert(
        Array.isArray(payload.adaptive_answers.cancer_treatment_types) &&
          (payload.adaptive_answers.cancer_treatment_types as string[]).includes("chemotherapy"),
        "cancer treatment types preserved"
      );
      assert(
        payload.adaptive_answers.cancer_treatment_timing_vs_hair === "around_same_time",
        "cancer treatment timing preserved"
      );
      assert(
        Array.isArray(payload.adaptive_answers.systemic_disease_bundle) &&
          (payload.adaptive_answers.systemic_disease_bundle as string[]).includes("bariatric_surgery"),
        "systemic bundle preserved"
      );
      assert(payload.adaptive_answers.weight_loss_intent === "unintentional", "weight loss intent preserved");
      assert(
        payload.adaptive_answers.major_illness_or_hospital_reason === "infection_or_fever",
        "major illness reason preserved"
      );
    }),
    run("systemic history special answers preserve none and prefer-not-to-say", () => {
      const payload = buildLongevityAdaptivePayload({
        medicalHistory: {
          cancerTreatmentHistory: "prefer_not_to_say",
          systemicDiseaseBundle: ["none"],
        },
      });
      assert(
        payload.adaptive_answers.cancer_treatment_history === "prefer_not_to_say",
        "prefer not to say cancer history preserved"
      );
      assert(
        Array.isArray(payload.adaptive_answers.systemic_disease_bundle) &&
          (payload.adaptive_answers.systemic_disease_bundle as string[])[0] === "none",
        "none systemic bundle preserved"
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
    run("static lifestyle capture beats stale adaptive diet detail", () => {
      const payload = buildLongevityAdaptivePayload({
        lifestyleTreatments: {
          dietPattern: ["omnivore"],
          enoughProtein: "yes",
        },
        adaptiveEngine: {
          answers: {
            protein_intake_level: "low",
            diet_pattern_intake: ["vegan"],
          },
        },
      });
      assert(payload.adaptive_answers.low_protein_intake !== true, "static protein answer wins");
      assert(payload.adaptive_answers.vegetarian_or_vegan !== true, "static diet owner wins");
    }),
    run("stress score threshold aligns across review and adaptive facts", () => {
      const payload = buildLongevityAdaptivePayload({
        lifestyleTreatments: {
          stressScore: 7,
        },
      });
      assert(payload.adaptive_answers.high_stress_load === true, "stress 7/10 maps to high_stress_load");
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
    run("adaptive postpartum branch can suppress stale legacy postpartum stage", () => {
      const payload = buildLongevityAdaptivePayload({
        aboutYou: { sexAtBirth: "female" },
        femaleHistory: {
          lifeStage: ["postpartum"],
        },
        adaptiveEngine: {
          answers: {
            female_hormonal_context: "yes",
            postpartum_recent_gate: "no",
            postpartum_recent: true,
            reproductive_stage: "postpartum",
          },
        },
      });
      assert(payload.adaptive_answers.postpartum_recent !== true, "adaptive postpartum gate stays authoritative");
      assert(payload.adaptive_answers.reproductive_stage !== "postpartum", "legacy postpartum stage is suppressed");
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

