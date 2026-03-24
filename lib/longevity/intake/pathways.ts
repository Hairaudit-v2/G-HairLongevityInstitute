import type { IntakePathwayDefinition } from "./types";

function isYes(value: unknown): boolean {
  return value === "yes" || value === true;
}

function hasAny(values: unknown, keys: string[]): boolean {
  if (!Array.isArray(values)) return false;
  return keys.some((key) => values.includes(key));
}

export const INTAKE_PATHWAYS: IntakePathwayDefinition[] = [
  {
    id: "androgenic_pattern",
    label: "Androgenic pattern",
    entryCriteria: [
      (a) =>
        a.presentation_pattern === "patterned_thinning" ||
        a.presentation_pattern === "frontal_temporal_recession" ||
        a.presentation_pattern === "crown_loss",
    ],
    exitCriteria: [(a) => a.presentation_pattern != null],
    followupQuestionIds: [
      "male_androgen_exposure_context",
      "male_androgen_exposure_detail",
      "exogenous_androgen_timing_vs_hair",
    ],
  },
  {
    id: "telogen_effluvium_diffuse_shedding",
    label: "Telogen effluvium / diffuse shedding",
    entryCriteria: [
      (a) =>
        a.presentation_pattern === "acute_shedding" ||
        a.presentation_pattern === "chronic_shedding" ||
        a.presentation_pattern === "diffuse_thinning" ||
        isYes(a.acute_trigger_window),
    ],
    exitCriteria: [(a) => a.acute_trigger_window != null || a.presentation_pattern != null],
    followupQuestionIds: [
      "acute_trigger_window",
      "lifestyle_load",
      "medication_hormone_change_recent",
      "med_change_timing_vs_hair",
      "protein_intake_level",
      "diet_pattern_intake",
      "male_androgen_exposure_detail",
      "exogenous_androgen_timing_vs_hair",
    ],
  },
  {
    id: "hormonal_endocrine_female_pattern",
    label: "Hormonal / endocrine female-pattern suspicion",
    entryCriteria: [(a, c) => c.sexAtBirth === "female" && isYes(a.female_hormonal_context)],
    exitCriteria: [(a, c) => c.sexAtBirth !== "female" || a.female_hormonal_context != null],
    followupQuestionIds: [
      "female_hormonal_context",
      "postpartum_recent_gate",
      "months_since_delivery",
      "breastfeeding_status",
      "hormonal_contraception_change_gate",
      "hormonal_change_vs_hair_timing",
    ],
  },
  {
    id: "inflammatory_scalp_disease",
    label: "Inflammatory / scalp disease suspicion",
    entryCriteria: [
      (a) => a.presentation_pattern === "scalp_symptoms",
      (a) => hasAny(a.scalp_symptom_cluster, ["itch", "scale", "pain", "burning", "pustules"]),
    ],
    exitCriteria: [(a) => a.scalp_symptom_cluster != null || a.presentation_pattern != null],
    followupQuestionIds: [
      "scalp_symptom_cluster",
      "scalp_symptom_duration",
      "scalp_symptom_flare_pattern",
      "scalp_symptom_treatments_tried",
    ],
  },
  {
    id: "traction_mechanical_damage",
    label: "Traction / mechanical damage suspicion",
    entryCriteria: [(a) => hasAny(a.mechanical_exposures, ["tight_styles", "helmet_friction", "high_heat", "chemical_processing"])],
    exitCriteria: [(a) => a.mechanical_exposures != null],
    followupQuestionIds: ["mechanical_exposures"],
  },
  {
    id: "nutritional_deficiency",
    label: "Nutritional deficiency suspicion",
    entryCriteria: [(a) => hasAny(a.lifestyle_load, ["rapid_weight_loss", "restrictive_eating"])],
    exitCriteria: [(a) => a.lifestyle_load != null],
    followupQuestionIds: ["lifestyle_load", "protein_intake_level", "diet_pattern_intake"],
  },
  {
    id: "medication_androgen_exposure",
    label: "Medication / androgen exposure suspicion",
    entryCriteria: [
      (a) => isYes(a.male_androgen_exposure_context) || isYes(a.female_hormonal_context),
    ],
    exitCriteria: [(a) => a.male_androgen_exposure_context != null || a.female_hormonal_context != null],
    followupQuestionIds: [
      "male_androgen_exposure_context",
      "female_hormonal_context",
      "male_androgen_exposure_detail",
      "exogenous_androgen_timing_vs_hair",
    ],
  },
  {
    id: "mixed_unclear_pattern",
    label: "Mixed / unclear pattern",
    entryCriteria: [(a) => a.presentation_pattern === "mixed_or_unsure"],
    exitCriteria: [(a) => a.presentation_pattern != null],
    followupQuestionIds: [
      "lifestyle_load",
      "scalp_symptom_cluster",
      "mechanical_exposures",
      "medication_hormone_change_recent",
      "med_change_timing_vs_hair",
      "protein_intake_level",
      "diet_pattern_intake",
      "scalp_symptom_duration",
      "scalp_symptom_flare_pattern",
      "scalp_symptom_treatments_tried",
      "male_androgen_exposure_detail",
      "exogenous_androgen_timing_vs_hair",
    ],
  },
];

