import type { PathwayDefinition } from "./adaptiveTypes";

export const ADAPTIVE_PATHWAY_DEFINITIONS: PathwayDefinition[] = [
  {
    id: "androgenic_pattern",
    label: "Androgenic pattern",
    entryCriteria: [{ fact: "suspected_patterned_loss", operator: "eq", value: true }],
    scoringRules: [
      {
        when: [{ fact: "has_temple_pattern", operator: "eq", value: true }],
        score: 2,
        reason: "temporal or frontal recession pattern",
      },
      {
        when: [{ fact: "has_crown_pattern", operator: "eq", value: true }],
        score: 2,
        reason: "crown distribution",
      },
      {
        when: [{ fact: "family_history", operator: "in", value: ["mothers_side", "fathers_side", "both_sides"] }],
        score: 2,
        reason: "positive family history",
      },
      {
        when: [{ fact: "family_similarity_with_objective_pattern", operator: "eq", value: true }],
        score: 1,
        reason: "family pattern similar with visible patterned distribution",
      },
      {
        when: [{ fact: "onset_timing", operator: "in", value: ["6_to_12_months", "more_than_12_months"] }],
        score: 1,
        reason: "gradual timeline",
      },
    ],
    followupQuestionIds: ["family_history", "treatment_history"],
    derivedSignals: ["androgenic_pattern_signal"],
    uploadGuidance: ["frontal_hairline", "temples", "crown", "top_down"],
  },
  {
    id: "telogen_effluvium_acute",
    label: "Acute telogen effluvium pattern",
    entryCriteria: [{ fact: "suspected_shedding", operator: "eq", value: true }],
    scoringRules: [
      {
        when: [{ fact: "onset_timing", operator: "in", value: ["less_than_6_weeks", "6_weeks_to_3_months", "3_to_6_months"] }],
        score: 2,
        reason: "recent onset",
      },
      {
        when: [{ fact: "has_diffuse_loss", operator: "eq", value: true }],
        score: 3,
        reason: "diffuse distribution",
      },
      {
        when: [{ fact: "recent_trigger_burden", operator: "gte", value: 1 }],
        score: 2,
        reason: "recent trigger burden",
      },
      {
        when: [{ fact: "te_worsening_for_acute", operator: "eq", value: true }],
        score: 1,
        reason: "recent course worsening within an acute/subacute window",
      },
    ],
    followupQuestionIds: [
      "recent_illness",
      "covid_or_high_fever",
      "recent_surgery",
      "recent_stress_event",
      "rapid_weight_loss",
    ],
    derivedSignals: ["acute_te_signal"],
    bloodworkConsiderations: ["iron_studies", "thyroid_panel", "vitamin_d"],
    uploadGuidance: ["center_part", "top_down", "frontal_hairline"],
  },
  {
    id: "telogen_effluvium_chronic",
    label: "Chronic telogen effluvium pattern",
    entryCriteria: [{ fact: "suspected_shedding", operator: "eq", value: true }],
    scoringRules: [
      {
        when: [{ fact: "onset_timing", operator: "in", value: ["6_to_12_months", "more_than_12_months"] }],
        score: 2,
        reason: "persistent course",
      },
      {
        when: [{ fact: "has_diffuse_loss", operator: "eq", value: true }],
        score: 2,
        reason: "diffuse pattern",
      },
      {
        when: [{ fact: "sleep_stress_cluster", operator: "eq", value: true }],
        score: 2,
        reason: "sleep/stress burden",
      },
      {
        when: [{ fact: "nutritional_risk_cluster", operator: "eq", value: true }],
        score: 2,
        reason: "nutritional risk burden",
      },
      {
        when: [{ fact: "te_worsening_for_chronic", operator: "eq", value: true }],
        score: 1,
        reason: "worsening trend with a longer course timeframe",
      },
    ],
    followupQuestionIds: [],
    derivedSignals: ["chronic_te_signal"],
    bloodworkConsiderations: ["iron_studies", "thyroid_panel", "vitamin_d", "b12_folate"],
    uploadGuidance: ["center_part", "top_down", "diffuse_top"],
  },
  {
    id: "female_hormonal_pattern",
    label: "Female hormonal pattern",
    entryCriteria: [
      { fact: "is_female", operator: "eq", value: true },
      { fact: "suspected_patterned_loss", operator: "eq", value: true },
    ],
    scoringRules: [
      {
        when: [{ fact: "has_central_pattern", operator: "eq", value: true }],
        score: 3,
        reason: "central widening pattern",
      },
      {
        when: [{ fact: "possible_cycle_irregularity", operator: "eq", value: true }],
        score: 2,
        reason: "cycle irregularity",
      },
      {
        when: [{ fact: "possible_hyperandrogen_features", operator: "eq", value: true }],
        score: 3,
        reason: "hyperandrogen feature cluster",
      },
      {
        when: [{ fact: "known_pcos", operator: "eq", value: true }],
        score: 3,
        reason: "known PCOS history",
      },
      {
        when: [{ fact: "possible_menopausal_transition", operator: "eq", value: true }],
        score: 1,
        reason: "menopausal transition",
      },
    ],
    followupQuestionIds: [
      "female_hormonal_context",
      "postpartum_recent_gate",
      "months_since_delivery",
      "breastfeeding_status",
      "hormonal_contraception_change_gate",
      "hormonal_change_vs_hair_timing",
      "stress_shedding_delay_pattern",
      "pituitary_red_flag_followup",
      "hirsutism_severity",
      "hirsutism_structured_check_opt_in",
      "hirsutism_structured_regions",
    ],
    derivedSignals: ["female_hormonal_signal"],
    bloodworkConsiderations: [
      "iron_studies",
      "thyroid_panel",
      "vitamin_d",
      "androgen_hormone_review_if_clinically_appropriate",
    ],
    uploadGuidance: ["center_part", "top_down", "frontal_hairline", "temples"],
  },
  {
    id: "male_androgen_exposure_pattern",
    label: "Male androgen exposure pattern",
    entryCriteria: [
      { fact: "is_male", operator: "eq", value: true },
      { fact: "male_androgen_exposure_pathway_eligible", operator: "eq", value: true },
    ],
    scoringRules: [
      {
        when: [{ fact: "possible_androgen_exposure", operator: "eq", value: true }],
        score: 4,
        reason: "exogenous androgen exposure",
      },
      {
        when: [{ fact: "progression_speed", operator: "eq", value: "rapidly_worsening" }],
        score: 2,
        reason: "rapid progression",
      },
      {
        when: [{ fact: "has_temple_pattern", operator: "eq", value: true }],
        score: 1,
        reason: "male-pattern distribution",
      },
      {
        when: [{ fact: "has_crown_pattern", operator: "eq", value: true }],
        score: 1,
        reason: "male-pattern crown distribution",
      },
    ],
    followupQuestionIds: ["treatment_history"],
    derivedSignals: ["male_androgen_exposure_signal"],
    uploadGuidance: ["frontal_hairline", "temples", "crown", "top_down"],
  },
  {
    id: "nutritional_deficiency_pattern",
    label: "Nutritional deficiency pattern",
    entryCriteria: [{ fact: "nutritional_risk_cluster", operator: "eq", value: true }],
    scoringRules: [
      {
        when: [{ fact: "has_diffuse_loss", operator: "eq", value: true }],
        score: 2,
        reason: "diffuse loss distribution",
      },
      {
        when: [{ fact: "vegetarian_or_vegan", operator: "eq", value: true }],
        score: 1,
        reason: "dietary restriction",
      },
      {
        when: [{ fact: "restrictive_dieting", operator: "eq", value: true }],
        score: 2,
        reason: "restrictive dieting",
      },
      {
        when: [{ fact: "eating_disorder_history", operator: "eq", value: true }],
        score: 2,
        reason: "disordered eating context",
      },
      {
        when: [{ fact: "low_iron_history", operator: "eq", value: true }],
        score: 2,
        reason: "known iron issue",
      },
      {
        when: [{ fact: "possible_heavy_menses", operator: "eq", value: true }],
        score: 1,
        reason: "possible ongoing iron loss",
      },
    ],
    followupQuestionIds: [],
    derivedSignals: ["nutritional_deficiency_signal"],
    bloodworkConsiderations: ["iron_studies", "vitamin_d", "b12_folate"],
    uploadGuidance: ["center_part", "top_down", "diffuse_top"],
  },
  {
    id: "inflammatory_scalp_pattern",
    label: "Inflammatory scalp pattern",
    entryCriteria: [{ fact: "has_scalp_symptoms", operator: "eq", value: true }],
    scoringRules: [
      {
        when: [{ fact: "has_inflammatory_scalp_symptoms", operator: "eq", value: true }],
        score: 3,
        reason: "inflammatory symptom cluster",
      },
      {
        when: [{ fact: "has_scaling_symptoms", operator: "eq", value: true }],
        score: 2,
        reason: "scaling symptom cluster",
      },
      {
        when: [{ fact: "chief_concern", operator: "eq", value: "scalp_symptoms" }],
        score: 1,
        reason: "scalp symptoms are chief concern",
      },
      {
        when: [
          { fact: "suspected_shedding", operator: "eq", value: true },
          { fact: "has_inflammatory_scalp_symptoms", operator: "eq", value: true },
        ],
        score: 2,
        reason: "shedding with inflammatory scalp features",
      },
    ],
    followupQuestionIds: [
      "scalp_symptoms",
      "scalp_symptom_duration",
      "scalp_symptom_flare_pattern",
      "scalp_symptom_treatments_tried",
    ],
    derivedSignals: ["inflammatory_scalp_signal"],
    uploadGuidance: ["scalp_closeup", "top_down", "patch_closeup"],
  },
  {
    id: "traction_mechanical_pattern",
    label: "Traction or mechanical pattern",
    entryCriteria: [
      { fact: "possible_breakage_pattern", operator: "eq", value: true },
    ],
    scoringRules: [
      {
        when: [{ fact: "has_edges_pattern", operator: "eq", value: true }],
        score: 3,
        reason: "edge distribution",
      },
      {
        when: [{ fact: "mechanical_exposure_cluster", operator: "eq", value: true }],
        score: 3,
        reason: "mechanical exposure cluster",
      },
      {
        when: [{ fact: "breakage_over_shedding", operator: "eq", value: true }],
        score: 2,
        reason: "breakage dominant pattern",
      },
      {
        when: [{ fact: "breakage_predominant_without_diffuse_top", operator: "eq", value: true }],
        score: 1,
        reason: "breakage-weighted pattern without diffuse top loss",
      },
    ],
    followupQuestionIds: [
      "tight_hairstyles_or_extensions",
      "frequent_helmet_or_headgear",
      "contact_sports_or_headgear_sport",
      "heat_or_chemical_styling",
    ],
    derivedSignals: ["traction_signal"],
    uploadGuidance: ["edges_closeup", "frontal_hairline", "patch_closeup"],
  },
  {
    id: "medication_induced_pattern",
    label: "Medication-induced pattern",
    entryCriteria: [{ fact: "medication_change_recently", operator: "eq", value: true }],
    scoringRules: [
      {
        when: [{ fact: "medication_change_recently", operator: "eq", value: true }],
        score: 3,
        reason: "recent medication or hormone change",
      },
      {
        when: [{ fact: "suspected_shedding", operator: "eq", value: true }],
        score: 1,
        reason: "shedding linked to medication context",
      },
    ],
    followupQuestionIds: [],
    derivedSignals: ["medication_induced_signal"],
    uploadGuidance: ["top_down", "center_part", "frontal_hairline"],
  },
  {
    id: "postpartum_pattern",
    label: "Postpartum pattern",
    entryCriteria: [{ fact: "possible_postpartum_context", operator: "eq", value: true }],
    scoringRules: [
      {
        when: [{ fact: "possible_postpartum_context", operator: "eq", value: true }],
        score: 3,
        reason: "postpartum context",
      },
      {
        when: [{ fact: "suspected_shedding", operator: "eq", value: true }],
        score: 2,
        reason: "shedding presentation",
      },
      {
        when: [{ fact: "has_diffuse_loss", operator: "eq", value: true }],
        score: 2,
        reason: "diffuse distribution",
      },
      {
        when: [{ fact: "postpartum_diffuse_shedding_cluster", operator: "eq", value: true }],
        score: 2,
        reason: "postpartum diffuse shedding cluster vs generic acute TE overlap",
      },
    ],
    followupQuestionIds: [
      "postpartum_recent_gate",
      "months_since_delivery",
      "breastfeeding_status",
      "stress_shedding_delay_pattern",
    ],
    derivedSignals: ["postpartum_signal"],
    bloodworkConsiderations: ["iron_studies", "thyroid_panel", "vitamin_d"],
    uploadGuidance: ["center_part", "top_down", "frontal_hairline"],
  },
  {
    id: "thyroid_metabolic_pattern",
    label: "Thyroid or metabolic pattern",
    entryCriteria: [
      { fact: "suspected_shedding", operator: "eq", value: true },
    ],
    scoringRules: [
      {
        when: [{ fact: "has_diffuse_loss", operator: "eq", value: true }],
        score: 1,
        reason: "diffuse pattern",
      },
      {
        when: [{ fact: "onset_timing", operator: "in", value: ["3_to_6_months", "6_to_12_months", "more_than_12_months"] }],
        score: 1,
        reason: "non-acute timeframe",
      },
      {
        when: [{ fact: "low_iron_history", operator: "eq", value: true }],
        score: 1,
        reason: "systemic overlap clue",
      },
    ],
    followupQuestionIds: [],
    derivedSignals: ["thyroid_metabolic_signal"],
    bloodworkConsiderations: ["thyroid_panel", "iron_studies", "vitamin_d", "b12_folate"],
    uploadGuidance: ["center_part", "top_down", "diffuse_top"],
  },
  {
    id: "mixed_pattern",
    label: "Mixed pattern",
    entryCriteria: [{ fact: "chief_concern", operator: "exists" }],
    followupQuestionIds: [],
    derivedSignals: ["mixed_pattern_signal"],
    uploadGuidance: ["frontal_hairline", "temples", "crown", "top_down", "center_part"],
  },
  {
    id: "unclear_pattern",
    label: "Unclear pattern",
    entryCriteria: [{ fact: "chief_concern", operator: "exists" }],
    followupQuestionIds: [],
    derivedSignals: ["unclear_pattern_signal"],
    uploadGuidance: ["frontal_hairline", "top_down", "center_part"],
  },
];
