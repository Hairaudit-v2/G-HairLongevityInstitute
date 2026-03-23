import type { IntakeQuestionDefinition } from "./types";

export const INTAKE_QUESTION_BANK_VERSION = "adaptive_intake_v1";

export const INTAKE_QUESTION_BANK: IntakeQuestionDefinition[] = [
  {
    id: "presentation_pattern",
    label: "Which pattern best matches what you notice most?",
    type: "single_select",
    section: "base",
    safeHelperText: "This helps us understand possible contributors to your presentation.",
    options: [
      { value: "acute_shedding", label: "Acute shedding" },
      { value: "chronic_shedding", label: "Chronic shedding" },
      { value: "patterned_thinning", label: "Patterned thinning" },
      { value: "frontal_temporal_recession", label: "Frontal/temporal recession" },
      { value: "crown_loss", label: "Crown loss" },
      { value: "diffuse_thinning", label: "Diffuse thinning" },
      { value: "broken_hairs", label: "Broken hairs / fragility" },
      { value: "scalp_symptoms", label: "Scalp symptoms dominant" },
      { value: "mixed_or_unsure", label: "Mixed or unsure" },
    ],
    pathwayHints: [
      "androgenic_pattern",
      "telogen_effluvium_diffuse_shedding",
      "inflammatory_scalp_disease",
      "traction_mechanical_damage",
      "mixed_unclear_pattern",
    ],
  },
  {
    id: "acute_trigger_window",
    label: "Did this change start after a specific event over weeks to months?",
    type: "single_select",
    section: "trigger",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Unsure" },
    ],
    allowSkip: true,
    visibleWhen: (answers) =>
      answers.presentation_pattern === "acute_shedding" ||
      answers.presentation_pattern === "diffuse_thinning",
    pathwayHints: ["telogen_effluvium_diffuse_shedding"],
  },
  {
    id: "female_hormonal_context",
    label: "Any cycle, postpartum, perimenopause, or hormonal context relevant here?",
    type: "single_select",
    section: "sex_specific",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (_answers) => true,
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "male_androgen_exposure_context",
    label: "Any testosterone, anabolic, or androgen-related medication context?",
    type: "single_select",
    section: "sex_specific",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (_answers) => true,
    pathwayHints: ["medication_androgen_exposure", "androgenic_pattern"],
  },
  {
    id: "scalp_symptom_cluster",
    label: "Which scalp symptoms are present?",
    type: "multi_select",
    section: "trigger",
    options: [
      { value: "itch", label: "Itch" },
      { value: "scale", label: "Scale/flaking" },
      { value: "pain", label: "Pain/tenderness" },
      { value: "burning", label: "Burning" },
      { value: "pustules", label: "Pustules" },
      { value: "none", label: "None/unsure" },
    ],
    allowSkip: true,
    visibleWhen: (answers) =>
      answers.presentation_pattern === "scalp_symptoms" ||
      answers.presentation_pattern === "mixed_or_unsure",
    pathwayHints: ["inflammatory_scalp_disease"],
  },
  {
    id: "mechanical_exposures",
    label: "Any mechanical or cosmetic stressors likely to affect hair integrity?",
    type: "multi_select",
    section: "mechanical",
    options: [
      { value: "tight_styles", label: "Tight hairstyles/extensions/braids" },
      { value: "helmet_friction", label: "Helmet/headgear friction" },
      { value: "high_heat", label: "Frequent high heat" },
      { value: "chemical_processing", label: "Frequent bleach/chemical processing" },
      { value: "none", label: "None/unsure" },
    ],
    allowSkip: true,
    visibleWhen: (answers) =>
      answers.presentation_pattern === "broken_hairs" ||
      answers.presentation_pattern === "frontal_temporal_recession" ||
      answers.presentation_pattern === "mixed_or_unsure",
    pathwayHints: ["traction_mechanical_damage"],
  },
  {
    id: "lifestyle_load",
    label: "Any recent lifestyle shifts that may contribute?",
    type: "multi_select",
    section: "lifestyle",
    options: [
      { value: "major_stress", label: "Major stress period" },
      { value: "shift_work", label: "Shift work/poor sleep timing" },
      { value: "rapid_weight_loss", label: "Rapid weight loss" },
      { value: "restrictive_eating", label: "Restrictive eating" },
      { value: "high_intensity_sport", label: "High-intensity sport/bodybuilding" },
      { value: "none", label: "None/unsure" },
    ],
    allowSkip: true,
    visibleWhen: () => true,
    pathwayHints: [
      "telogen_effluvium_diffuse_shedding",
      "nutritional_deficiency",
      "medication_androgen_exposure",
    ],
  },
];

