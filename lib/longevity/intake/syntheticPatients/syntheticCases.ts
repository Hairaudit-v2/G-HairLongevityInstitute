import { syntheticCase } from "./caseFactory";
import type { SyntheticPatientCase } from "./types";

/**
 * Synthetic questionnaire payloads + clinical target expectations for calibration runs.
 * Primary may be a union when multiple outcomes are clinically acceptable under the current engine.
 */
export const SYNTHETIC_PATIENT_CASES: SyntheticPatientCase[] = [
  // —— Classic male androgenic pattern ——
  syntheticCase(
    "m-aga-01",
    "Male temple recession, gradual, strong paternal AGA family history",
    "frontal_temporal_recession",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1988-03-10" },
      mainConcern: {
        primaryConcerns: ["frontal_hairline_recession", "temple_recession"],
        firstNoticed: "one_to_two_years",
        onsetPattern: "gradual",
        affectedAreas: ["frontal_hairline", "temples"],
        patternConfidence: "confident",
        perceivedSeverity: "moderate",
      },
      medicalHistory: {
        familyHistory: ["male_pattern_hair_loss"],
        familyHistorySide: "fathers_side",
        familyHairPatternMatch: "similar_to_mine",
      },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    { primary_pathway: "androgenic_pattern" },
    ["androgenic", "male_pattern"]
  ),
  syntheticCase(
    "m-aga-02",
    "Male crown-predominant thinning, family history both sides",
    "crown_loss",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1979-11-02" },
      mainConcern: {
        primaryConcerns: ["crown_thinning"],
        firstNoticed: "six_to_twelve_months",
        onsetPattern: "gradual",
        affectedAreas: ["crown"],
        patternConfidence: "confident",
      },
      medicalHistory: {
        familyHistory: ["male_pattern_hair_loss", "female_pattern_thinning"],
        familyHistorySide: "both_sides",
      },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    { primary_pathway: "androgenic_pattern" },
    ["androgenic"]
  ),
  syntheticCase(
    "m-aga-03",
    "Young male early recession, minimal family history",
    "frontal_temporal_recession",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "2001-07-20" },
      mainConcern: {
        primaryConcerns: ["temple_recession"],
        firstNoticed: "three_to_six_months",
        onsetPattern: "gradual",
        affectedAreas: ["temples"],
        patternConfidence: "somewhat",
      },
      medicalHistory: { familyHistory: ["none_known"] },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    { primary_pathway: "androgenic_pattern" },
    ["androgenic", "age_band"]
  ),
  syntheticCase(
    "m-aga-04",
    "Male patterned thinning diffuse_top mapping",
    "patterned_thinning",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1992-04-12" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        firstNoticed: "one_to_two_years",
        onsetPattern: "gradual",
        affectedAreas: ["mid_scalp", "crown"],
        patternConfidence: "confident",
      },
      medicalHistory: {
        familyHistory: ["male_pattern_hair_loss"],
        familyHistorySide: "mothers_side",
      },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    { primary_pathway: "androgenic_pattern" },
    ["androgenic"]
  ),
  syntheticCase(
    "m-aga-05",
    "Male recession + chronic shedding concern overlap (pattern still frontal)",
    "frontal_temporal_recession",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1985-09-01" },
      mainConcern: {
        primaryConcerns: ["frontal_hairline_recession", "increased_shedding"],
        firstNoticed: "six_to_twelve_months",
        onsetPattern: "gradual",
        affectedAreas: ["frontal_hairline", "temples", "whole_scalp"],
        patternConfidence: "mixed_or_unsure",
      },
      timelineTriggers: { sheddingTrend: "worsened" },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    {
      primary_pathway: ["androgenic_pattern", "telogen_effluvium_chronic", "mixed_pattern"],
    },
    ["overlap", "mixed_margin"]
  ),
  syntheticCase(
    "m-aga-06",
    "Male AGA + TRT acceleration context",
    "frontal_temporal_recession",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1983-12-15" },
      mainConcern: {
        primaryConcerns: ["temple_recession", "crown_thinning"],
        firstNoticed: "less_than_3_months",
        onsetPattern: "gradual",
        affectedAreas: ["temples", "crown"],
      },
      timelineTriggers: { trtStatus: "yes_prescribed", trtStartedWhen: "less_than_6_months" },
      medicalHistory: { familyHistory: ["male_pattern_hair_loss"], familyHistorySide: "fathers_side" },
      adaptiveIntake: { acuteWindow: "6_to_12_weeks", rapidProgressionWeeks: true },
    },
    {
      primary_pathway: ["male_androgen_exposure_pattern", "androgenic_pattern", "mixed_pattern"],
      clinician_flags_include: ["possible_exogenous_androgen_acceleration"],
    },
    ["trt", "androgen_exposure", "overlap"]
  ),

  // —— Female hormonal / PCOS-like ——
  syntheticCase(
    "f-horm-01",
    "Female central widening + irregular cycles + hirsutism",
    "diffuse_thinning",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1995-02-28" },
      mainConcern: {
        primaryConcerns: ["widening_part", "diffuse_thinning"],
        firstNoticed: "one_to_two_years",
        onsetPattern: "gradual",
        affectedAreas: ["part_line", "mid_scalp"],
        patternConfidence: "confident",
      },
      femaleHistory: {
        cycles: "irregular",
        features: ["increased_facial_or_body_hair", "acne"],
        lifeStage: ["hormonal_contraception"],
      },
      medicalHistory: { diagnoses: ["pcos"] },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    {
      primary_pathway: "female_hormonal_pattern",
      clinician_flags_include: ["possible_pcos_signal"],
      bloodwork_include: ["androgen_hormone_review_if_clinically_appropriate"],
    },
    ["female_hormonal", "pcos"]
  ),
  syntheticCase(
    "f-horm-02",
    "Female central thinning, perimenopause stage",
    "patterned_thinning",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1972-05-08" },
      mainConcern: {
        primaryConcerns: ["widening_part"],
        firstNoticed: "six_to_twelve_months",
        onsetPattern: "gradual",
        affectedAreas: ["part_line", "crown"],
      },
      femaleHistory: { cycles: "regular", lifeStage: ["perimenopausal"] },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    { primary_pathway: "female_hormonal_pattern" },
    ["female_hormonal", "menopause"]
  ),
  syntheticCase(
    "f-horm-03",
    "Female patterned thinning + heavy periods + iron history",
    "diffuse_thinning",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1990-10-01" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        firstNoticed: "one_to_two_years",
        onsetPattern: "gradual",
        affectedAreas: ["part_line", "mid_scalp"],
      },
      femaleHistory: { cycles: "regular", features: ["heavy_periods"] },
      medicalHistory: { diagnoses: ["iron_deficiency"] },
      lifestyleTreatments: { dietPattern: ["vegetarian"] },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    {
      primary_pathway: ["female_hormonal_pattern", "nutritional_deficiency_pattern", "telogen_effluvium_chronic"],
      clinician_flags_include: ["heavy_period_related_iron_risk"],
    },
    ["female_hormonal", "iron", "overlap"]
  ),
  syntheticCase(
    "f-horm-04",
    "Female mild central thinning, regular cycles, no hyperandrogen stigmata",
    "patterned_thinning",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1987-01-22" },
      mainConcern: {
        primaryConcerns: ["widening_part"],
        firstNoticed: "more_than_two_years",
        onsetPattern: "gradual",
        affectedAreas: ["part_line"],
        perceivedSeverity: "mild",
      },
      femaleHistory: { cycles: "regular", lifeStage: [] },
      medicalHistory: { familyHistory: ["female_pattern_thinning"], familyHistorySide: "mothers_side" },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    { primary_pathway: ["female_hormonal_pattern", "androgenic_pattern"] },
    ["female_hormonal", "low_signal"]
  ),
  syntheticCase(
    "f-horm-05",
    "Female engine hormonal context flag",
    "diffuse_thinning",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1993-08-14" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        affectedAreas: ["part_line", "mid_scalp"],
      },
      femaleHistory: { cycles: "irregular" },
      adaptiveEngine: {
        answers: {
          female_hormonal_context: "yes",
        },
      },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    { primary_pathway: "female_hormonal_pattern" },
    ["female_hormonal"]
  ),

  // —— Acute TE ——
  syntheticCase(
    "te-a-01",
    "Acute shedding after viral illness, subacute window, diffuse",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1991-03-03" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "less_than_3_months",
        onsetPattern: "sudden",
        affectedAreas: ["whole_scalp"],
      },
      timelineTriggers: {
        triggers: ["recent_illness_or_infection"],
        pastYearEvents: ["covid_or_major_viral_illness"],
        sheddingTrend: "worsened",
      },
      adaptiveIntake: { acuteWindow: "6_to_12_weeks" },
    },
    {
      primary_pathway: "telogen_effluvium_acute",
      bloodwork_include: ["iron_studies", "thyroid_panel"],
    },
    ["acute_te"]
  ),
  syntheticCase(
    "te-a-02",
    "Acute TE post-surgery",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1984-06-18" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "three_to_six_months",
        affectedAreas: ["whole_scalp"],
      },
      timelineTriggers: { triggers: ["surgery_or_anaesthetic", "major_stress"] },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    { primary_pathway: "telogen_effluvium_acute" },
    ["acute_te"]
  ),
  syntheticCase(
    "te-a-03",
    "Acute TE with fever trigger",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1996-12-01" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "less_than_3_months",
        affectedAreas: ["mid_scalp", "whole_scalp"],
      },
      timelineTriggers: { triggers: ["fever"] },
      adaptiveIntake: { acuteWindow: "less_than_6_weeks" },
    },
    { primary_pathway: "telogen_effluvium_acute" },
    ["acute_te"]
  ),
  syntheticCase(
    "te-a-04",
    "Male acute shedding + family AGA (trigger-heavy should still lean TE acute)",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1990-05-05" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "three_to_six_months",
        affectedAreas: ["whole_scalp"],
      },
      medicalHistory: { familyHistory: ["male_pattern_hair_loss"], familyHistorySide: "fathers_side" },
      timelineTriggers: { triggers: ["recent_illness_or_infection", "major_stress"] },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    {
      primary_pathway: ["telogen_effluvium_acute", "androgenic_pattern", "mixed_pattern"],
    },
    ["acute_te", "family_trigger_overlap"]
  ),

  // —— Chronic TE ——
  syntheticCase(
    "te-c-01",
    "Chronic diffuse shedding, long course, stress/sleep cluster",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1989-07-07" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "more_than_two_years",
        onsetPattern: "gradual",
        affectedAreas: ["whole_scalp"],
      },
      timelineTriggers: { sheddingTrend: "worsened" },
      lifestyleTreatments: { sleepQuality: "poor", stressScore: 9 },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    {
      primary_pathway: "telogen_effluvium_chronic",
      clinician_flags_include: ["possible_chronic_te"],
    },
    ["chronic_te"]
  ),
  syntheticCase(
    "te-c-02",
    "Chronic TE with nutritional risk cluster",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1994-01-30" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "one_to_two_years",
        affectedAreas: ["mid_scalp", "whole_scalp"],
      },
      lifestyleTreatments: {
        dietPattern: ["restrictive_dieting"],
        enoughProtein: "no",
        sleepQuality: "average",
      },
      adaptiveIntake: { chronicWindow: "6_to_12_months", restrictiveEating: "yes" },
    },
    {
      primary_pathway: ["telogen_effluvium_chronic", "nutritional_deficiency_pattern"],
    },
    ["chronic_te", "nutrition"]
  ),
  syntheticCase(
    "te-c-03",
    "Chronic TE worsening on long timeline (not acute worsening fact)",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1981-02-14" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "more_than_two_years",
        affectedAreas: ["whole_scalp"],
      },
      timelineTriggers: { sheddingTrend: "worsened" },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    { primary_pathway: "telogen_effluvium_chronic" },
    ["chronic_te", "te_worsening_chronic"]
  ),
  syntheticCase(
    "te-c-04",
    "Chronic TE vs thyroid low-signal overlap",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1978-09-09" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "six_to_twelve_months",
        affectedAreas: ["whole_scalp"],
      },
      medicalHistory: { diagnoses: ["low_ferritin"] },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    {
      primary_pathway: [
        "telogen_effluvium_chronic",
        "thyroid_metabolic_pattern",
        "nutritional_deficiency_pattern",
      ],
    },
    ["chronic_te", "thyroid_metabolic"]
  ),

  // —— Postpartum ——
  syntheticCase(
    "pp-01",
    "Classic postpartum shedding 4 months, diffuse",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1992-11-11" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "less_than_3_months",
        onsetPattern: "sudden",
        affectedAreas: ["whole_scalp"],
      },
      femaleHistory: { lifeStage: ["postpartum"], cycles: "irregular" },
      timelineTriggers: { triggers: ["childbirth_postpartum"] },
      adaptiveEngine: { answers: { months_since_delivery: "3_to_6_months" } },
      adaptiveIntake: { acuteWindow: "3_to_6_months", femaleContext: { postpartumRecent: "yes" } },
    },
    {
      primary_pathway: "postpartum_pattern",
      clinician_flags_include: ["possible_postpartum_shedding"],
      bloodwork_include: ["iron_studies"],
    },
    ["postpartum"]
  ),
  syntheticCase(
    "pp-02",
    "Postpartum + strong family female pattern (overlap)",
    "diffuse_thinning",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1988-04-04" },
      mainConcern: {
        primaryConcerns: ["increased_shedding", "diffuse_thinning"],
        affectedAreas: ["whole_scalp", "part_line"],
        patternConfidence: "mixed_or_unsure",
      },
      femaleHistory: { lifeStage: ["postpartum"] },
      timelineTriggers: { triggers: ["childbirth_postpartum"] },
      medicalHistory: {
        familyHistory: ["female_pattern_thinning"],
        familyHistorySide: "mothers_side",
        familyHairPatternMatch: "similar_to_mine",
      },
      adaptiveEngine: { answers: { months_since_delivery: "under_3_months" } },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    {
      primary_pathway: ["postpartum_pattern", "female_hormonal_pattern", "mixed_pattern"],
      clinician_flags_include: ["possible_postpartum_shedding"],
      secondary_pathways_include: ["female_hormonal_pattern"],
    },
    ["postpartum", "postpartum_androgenic_overlap"]
  ),
  syntheticCase(
    "pp-03",
    "Postpartum with temple thinning reported (dual pattern stress test)",
    "patterned_thinning",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1990-01-01" },
      mainConcern: {
        primaryConcerns: ["increased_shedding", "temple_recession"],
        affectedAreas: ["temples", "whole_scalp"],
      },
      femaleHistory: { lifeStage: ["postpartum"] },
      timelineTriggers: { triggers: ["childbirth_postpartum"] },
      medicalHistory: { familyHistory: ["male_pattern_hair_loss"], familyHistorySide: "fathers_side" },
      adaptiveEngine: { answers: { months_since_delivery: "6_to_12_months" } },
      adaptiveIntake: { chronicWindow: "3_to_6_months" },
    },
    {
      primary_pathway: ["postpartum_pattern", "androgenic_pattern", "mixed_pattern"],
      secondary_pathways_include: ["androgenic_pattern"],
    },
    ["postpartum", "postpartum_androgenic_overlap"]
  ),
  syntheticCase(
    "pp-04",
    "Late postpartum window still within engine gate",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1986-06-06" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["mid_scalp"],
      },
      femaleHistory: { lifeStage: ["postpartum"] },
      adaptiveEngine: { answers: { postpartum_recent_gate: "yes", months_since_delivery: "6_to_12_months" } },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    { primary_pathway: "postpartum_pattern", clinician_flags_include: ["possible_postpartum_shedding"] },
    ["postpartum"]
  ),

  // —— Inflammatory scalp ——
  syntheticCase(
    "inf-01",
    "Scalp symptoms chief, itch + burning, low shedding emphasis",
    "scalp_symptoms",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1993-04-04" },
      mainConcern: {
        primaryConcerns: ["scalp_irritation_or_inflammation"],
        symptoms: ["itch", "burning"],
        affectedAreas: ["whole_scalp"],
      },
      adaptiveEngine: {
        answers: {
          scalp_symptom_cluster: ["itch", "burning"],
        },
      },
    },
    {
      primary_pathway: "inflammatory_scalp_pattern",
      clinician_flags_include: ["possible_inflammatory_scalp_disease"],
    },
    ["inflammatory"]
  ),
  syntheticCase(
    "inf-02",
    "Inflammatory + shedding overlap",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1991-09-19" },
      mainConcern: {
        primaryConcerns: ["increased_shedding", "scalp_irritation_or_inflammation"],
        symptoms: ["itch", "flaking"],
        affectedAreas: ["whole_scalp"],
      },
      adaptiveEngine: {
        answers: {
          scalp_symptom_cluster: ["itch", "scale"],
        },
      },
      timelineTriggers: { triggers: ["major_stress"] },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    {
      /** After overlap boost: inflammatory can lead when itch/scale + shedding co-dominate; TE remains secondary. */
      primary_pathway: ["inflammatory_scalp_pattern", "telogen_effluvium_acute"],
      secondary_pathways_include: ["telogen_effluvium_acute"],
      clinician_flags_include: ["possible_inflammatory_scalp_disease"],
    },
    ["inflammatory", "inflammatory_shedding"]
  ),
  syntheticCase(
    "inf-03",
    "Painful scalp + pain red flag",
    "scalp_symptoms",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1987-07-07" },
      mainConcern: {
        primaryConcerns: ["scalp_irritation_or_inflammation"],
        symptoms: ["tenderness"],
        affectedAreas: ["whole_scalp"],
      },
      adaptiveEngine: { answers: { scalp_symptom_cluster: ["pain"] } },
    },
    {
      primary_pathway: "inflammatory_scalp_pattern",
      red_flags_include: ["painful_inflamed_scalp"],
      clinician_flags_include: ["possible_scarring_red_flag", "possible_inflammatory_scalp_disease"],
    },
    ["inflammatory", "red_flag"]
  ),
  syntheticCase(
    "inf-04",
    "Pustules cluster → red flag",
    "scalp_symptoms",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1995-05-05" },
      mainConcern: {
        primaryConcerns: ["scalp_irritation_or_inflammation"],
        symptoms: ["itch"],
      },
      adaptiveEngine: { answers: { scalp_symptom_cluster: ["pustules"] } },
    },
    {
      primary_pathway: "inflammatory_scalp_pattern",
      red_flags_include: ["pustules_or_crusting"],
    },
    ["inflammatory", "red_flag"]
  ),

  // —— Traction / mechanical / breakage ——
  syntheticCase(
    "tr-01",
    "Broken hairs presentation + tight styles + edge distribution (engine)",
    "broken_hairs",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "2000-02-02" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        affectedAreas: ["part_line"],
      },
      adaptiveEngine: {
        answers: {
          mechanical_exposures: ["tight_styles"],
          pattern_distribution: ["edges"],
        },
      },
    },
    { primary_pathway: "traction_mechanical_pattern", clinician_flags_include: ["possible_traction_pattern"] },
    ["traction"]
  ),
  syntheticCase(
    "tr-02",
    "Diffuse shedding + mechanical exposure (traction vs TE overlap)",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1998-06-06" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "three_to_six_months",
        affectedAreas: ["whole_scalp"],
      },
      adaptiveEngine: {
        answers: {
          mechanical_exposures: ["tight_styles", "high_heat"],
          pattern_distribution: ["diffuse_top"],
        },
      },
      timelineTriggers: { triggers: ["major_stress"] },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    {
      primary_pathway: [
        "telogen_effluvium_acute",
        "traction_mechanical_pattern",
        "mixed_pattern",
      ],
    },
    ["traction", "te_overlap", "narrow_margin"]
  ),
  syntheticCase(
    "tr-03",
    "Breakage predominant without diffuse top → traction bias vs TE secondary",
    "broken_hairs",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1999-09-09" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["frontal_hairline"],
      },
      adaptiveEngine: {
        answers: {
          mechanical_exposures: ["tight_styles"],
        },
      },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    {
      primary_pathway: ["traction_mechanical_pattern", "telogen_effluvium_acute", "mixed_pattern"],
    },
    ["traction", "breakage_vs_te"]
  ),
  syntheticCase(
    "tr-04",
    "Helmet / friction dominant",
    "patterned_thinning",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1997-01-11" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        affectedAreas: ["frontal_hairline"],
      },
      adaptiveEngine: {
        answers: {
          mechanical_exposures: ["helmet_friction"],
          pattern_distribution: ["edges"],
        },
      },
    },
    { primary_pathway: "traction_mechanical_pattern" },
    ["traction"]
  ),

  // —— Medication-induced ——
  syntheticCase(
    "med-01",
    "Recent medication change + shedding",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1983-03-03" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "less_than_3_months",
        affectedAreas: ["whole_scalp"],
      },
      timelineTriggers: { triggers: ["new_medication"] },
      adaptiveEngine: { answers: { medication_hormone_change_recent: "yes" } },
      adaptiveIntake: { acuteWindow: "6_to_12_weeks" },
    },
    { primary_pathway: ["medication_induced_pattern", "telogen_effluvium_acute"] },
    ["medication"]
  ),
  syntheticCase(
    "med-02",
    "Hormonal change gate + subacute shedding",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1992-12-12" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      adaptiveEngine: {
        answers: {
          hormonal_contraception_change_gate: "yes",
          medication_hormone_change_recent: "yes",
        },
      },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    {
      /** Presentation + diffuse + triggers favour acute TE primary; medication + chronic TE remain secondaries. */
      primary_pathway: "telogen_effluvium_acute",
      secondary_pathways_include: ["medication_induced_pattern", "telogen_effluvium_chronic"],
    },
    ["medication"]
  ),

  // —— Nutritional / thyroid metabolic ——
  syntheticCase(
    "nut-01",
    "Vegetarian + low protein + diffuse shedding",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1994-04-04" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      lifestyleTreatments: {
        dietPattern: ["vegetarian"],
        enoughProtein: "no",
      },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    {
      primary_pathway: ["nutritional_deficiency_pattern", "telogen_effluvium_chronic"],
      bloodwork_include: ["iron_studies"],
    },
    ["nutritional"]
  ),
  syntheticCase(
    "nut-02",
    "Restrictive dieting + low iron history",
    "diffuse_thinning",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1991-01-01" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        affectedAreas: ["mid_scalp", "whole_scalp"],
      },
      medicalHistory: { diagnoses: ["anaemia"] },
      lifestyleTreatments: { dietPattern: ["restrictive_dieting"] },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    {
      primary_pathway: ["nutritional_deficiency_pattern", "telogen_effluvium_chronic", "thyroid_metabolic_pattern"],
    },
    ["nutritional"]
  ),
  syntheticCase(
    "thy-01",
    "Diffuse shedding subacute + low vit D (metabolic overlap)",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1985-05-15" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      medicalHistory: { diagnoses: ["vitamin_d_deficiency"] },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    {
      primary_pathway: ["telogen_effluvium_acute", "thyroid_metabolic_pattern"],
      bloodwork_include: ["vitamin_d"],
    },
    ["thyroid_metabolic"]
  ),

  // —— Male exogenous androgen (non-TRT) ——
  syntheticCase(
    "andr-01",
    "SARMs detail + male pattern distribution",
    "frontal_temporal_recession",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1993-03-03" },
      mainConcern: {
        primaryConcerns: ["temple_recession"],
        affectedAreas: ["temples", "frontal_hairline"],
      },
      adaptiveEngine: {
        answers: { male_androgen_exposure_detail: ["sarms_or_anabolics"] },
      },
      maleHistory: { therapies: ["anabolic_steroids_or_sarms"] },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    {
      primary_pathway: ["male_androgen_exposure_pattern", "androgenic_pattern"],
      clinician_flags_include: ["possible_exogenous_androgen_acceleration"],
    },
    ["androgen_exposure"]
  ),

  // —— Uncertain / mixed / low-signal ——
  syntheticCase(
    "unc-01",
    "Mixed or unsure presentation + uncertain pattern confidence",
    "mixed_or_unsure",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1990-06-06" },
      mainConcern: {
        primaryConcerns: ["other"],
        patternConfidence: "mixed_or_unsure",
        perceivedSeverity: "moderate",
        affectedAreas: ["whole_scalp"],
      },
      timelineTriggers: { triggers: ["major_stress"] },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    {
      primary_pathway: ["mixed_pattern", "unclear_pattern", "telogen_effluvium_acute"],
    },
    ["uncertainty"]
  ),
  syntheticCase(
    "unc-02",
    "High perceived severity, mild objective areas",
    "diffuse_thinning",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1996-01-01" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        perceivedSeverity: "severe",
        patternConfidence: "mixed_or_unsure",
        affectedAreas: ["mid_scalp"],
      },
      adaptiveIntake: { chronicWindow: "3_to_6_months" },
    },
    {
      primary_pathway: ["female_hormonal_pattern", "telogen_effluvium_chronic", "mixed_pattern", "unclear_pattern"],
    },
    ["uncertainty", "severity_mismatch"]
  ),
  syntheticCase(
    "low-01",
    "Near-normal: mild concern, confident but minimal distribution",
    "diffuse_thinning",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "2002-02-02" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        perceivedSeverity: "mild",
        patternConfidence: "confident",
        affectedAreas: ["mid_scalp"],
      },
      medicalHistory: { familyHistory: ["none_known"] },
      adaptiveIntake: { acuteWindow: "6_to_12_weeks" },
    },
    {
      primary_pathway: ["androgenic_pattern", "unclear_pattern", "telogen_effluvium_acute"],
    },
    ["low_signal"]
  ),
  syntheticCase(
    "low-02",
    "Sparse triggers, vague timeline",
    "mixed_or_unsure",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1975-07-07" },
      mainConcern: {
        primaryConcerns: ["other"],
        firstNoticed: "unsure",
        patternConfidence: "mixed_or_unsure",
        affectedAreas: ["whole_scalp"],
      },
    },
    { primary_pathway: ["unclear_pattern", "mixed_pattern"] },
    ["low_signal", "uncertainty"]
  ),

  // —— Intersex / neutral hormonal ——
  syntheticCase(
    "neu-01",
    "Intersex + self-reported endocrine context",
    "diffuse_thinning",
    {
      aboutYou: { sexAtBirth: "intersex", dateOfBirth: "1989-09-09" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        affectedAreas: ["whole_scalp"],
      },
      adaptiveIntake: {
        chronicWindow: "6_to_12_months",
        neutralContext: { endocrineHistoryKnown: "yes" },
      },
    },
    {
      /** Neutral sex still allows androgenic-style pathway when thinning + diffuse distribution scores. */
      primary_pathway: [
        "androgenic_pattern",
        "thyroid_metabolic_pattern",
        "telogen_effluvium_chronic",
        "unclear_pattern",
      ],
    },
    ["neutral_sex"]
  ),

  // —— Additional age / sex diversity ——
  syntheticCase(
    "div-01",
    "Older male crown + long course",
    "crown_loss",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1960-01-01" },
      mainConcern: {
        primaryConcerns: ["crown_thinning"],
        firstNoticed: "more_than_two_years",
        affectedAreas: ["crown"],
      },
      medicalHistory: { familyHistory: ["male_pattern_hair_loss"], familyHistorySide: "both_sides" },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    { primary_pathway: "androgenic_pattern" },
    ["androgenic", "age_band"]
  ),
  syntheticCase(
    "div-02",
    "Teen male — temple recession family",
    "frontal_temporal_recession",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "2008-04-04" },
      mainConcern: {
        primaryConcerns: ["temple_recession"],
        affectedAreas: ["temples"],
      },
      medicalHistory: { familyHistory: ["male_pattern_hair_loss"], familyHistorySide: "fathers_side" },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    { primary_pathway: "androgenic_pattern" },
    ["androgenic", "age_band"]
  ),
  syntheticCase(
    "div-03",
    "Female 45–54 diffuse shedding + sleep stress",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1976-06-06" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      lifestyleTreatments: { sleepQuality: "poor", stressScore: 7 },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    { primary_pathway: "telogen_effluvium_chronic" },
    ["chronic_te", "age_band"]
  ),

  // —— Strong family history + strong triggers (overlap stress test) ——
  syntheticCase(
    "fam-01",
    "Paternal AGA + acute illness shedding",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1982-08-08" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp", "temples"],
      },
      medicalHistory: {
        familyHistory: ["male_pattern_hair_loss"],
        familyHistorySide: "fathers_side",
        familyHairPatternMatch: "similar_to_mine",
      },
      timelineTriggers: { triggers: ["recent_illness_or_infection"], sheddingTrend: "worsened" },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    {
      primary_pathway: ["telogen_effluvium_acute", "androgenic_pattern", "mixed_pattern"],
    },
    ["family_trigger_overlap"]
  ),

  // —— Patchy / rapid (red flag pathway) ——
  syntheticCase(
    "rf-01",
    "Rapidly worsening patchy loss",
    "mixed_or_unsure",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1995-01-01" },
      mainConcern: {
        primaryConcerns: ["patchy_hair_loss"],
        onsetPattern: "sudden",
        affectedAreas: ["whole_scalp"],
      },
      adaptiveIntake: { acuteWindow: "less_than_6_weeks", rapidProgressionWeeks: true },
    },
    {
      /**
       * Weak-spot probe: `male_androgen_exposure_pattern` can score on rapid progression alone (no exposure signal),
       * ahead of zero-score shells — documents tie-break / entry behaviour for patchy presentations.
       */
      primary_pathway: [
        "male_androgen_exposure_pattern",
        "unclear_pattern",
        "mixed_pattern",
        "inflammatory_scalp_pattern",
        "telogen_effluvium_acute",
      ],
      red_flags_include: ["rapid_patchy_loss"],
    },
    ["red_flag", "patchy", "weak_spot"]
  ),

  // —— COVID trigger explicit ——
  syntheticCase(
    "te-a-05",
    "COVID past-year event + diffuse shedding",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1988-01-01" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      timelineTriggers: {
        pastYearEvents: ["covid_or_major_viral_illness"],
        sheddingTrend: "worsened",
      },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    { primary_pathway: "telogen_effluvium_acute" },
    ["acute_te"]
  ),

  // —— Weight loss trigger ——
  syntheticCase(
    "te-a-06",
    "Rapid weight loss trigger",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1997-07-07" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      timelineTriggers: { triggers: ["rapid_weight_loss"] },
      adaptiveIntake: { acuteWindow: "3_to_6_months", recentRapidWeightLoss: true },
    },
    { primary_pathway: "telogen_effluvium_acute" },
    ["acute_te"]
  ),

  // —— Female hormonal mild PCOS without diagnosis ——
  syntheticCase(
    "f-horm-06",
    "Irregular cycles + jawline acne, central thinning",
    "patterned_thinning",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1998-03-03" },
      mainConcern: {
        primaryConcerns: ["widening_part"],
        affectedAreas: ["part_line", "mid_scalp"],
      },
      femaleHistory: { cycles: "irregular", features: ["acne"] },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    {
      primary_pathway: "female_hormonal_pattern",
      clinician_flags_include: ["possible_pcos_signal"],
    },
    ["female_hormonal", "pcos"]
  ),

  // —— Chronic TE fluctuating trend ——
  syntheticCase(
    "te-c-05",
    "Comes-and-goes shedding trend",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1984-04-04" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      timelineTriggers: { sheddingTrend: "comes_and_goes" },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    { primary_pathway: "telogen_effluvium_chronic" },
    ["chronic_te"]
  ),

  // —— Inflammatory + chronic TE timeframe ——
  syntheticCase(
    "inf-05",
    "Itch-dominant + shedding + chronic window",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1980-11-11" },
      mainConcern: {
        primaryConcerns: ["increased_shedding", "scalp_irritation_or_inflammation"],
        symptoms: ["itch"],
        affectedAreas: ["whole_scalp"],
      },
      adaptiveEngine: { answers: { scalp_symptom_cluster: ["itch", "burning"] } },
      adaptiveIntake: { chronicWindow: "more_than_12_months" },
    },
    {
      primary_pathway: "inflammatory_scalp_pattern",
      secondary_pathways_include: ["telogen_effluvium_chronic"],
    },
    ["inflammatory", "inflammatory_shedding"]
  ),

  // —— Medication + male pattern (overlap) ——
  syntheticCase(
    "med-03",
    "New medication + male recession",
    "frontal_temporal_recession",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1977-07-07" },
      mainConcern: {
        primaryConcerns: ["frontal_hairline_recession"],
        affectedAreas: ["frontal_hairline", "temples"],
      },
      timelineTriggers: { triggers: ["new_medication"] },
      medicalHistory: { familyHistory: ["male_pattern_hair_loss"], familyHistorySide: "fathers_side" },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    {
      primary_pathway: ["medication_induced_pattern", "androgenic_pattern", "mixed_pattern"],
    },
    ["medication", "overlap"]
  ),

  // —— Postpartum edge: breastfeeding + iron ——
  syntheticCase(
    "pp-05",
    "Postpartum + heavy periods + iron deficiency",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1993-12-12" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      femaleHistory: { lifeStage: ["postpartum"], features: ["heavy_periods"] },
      timelineTriggers: { triggers: ["childbirth_postpartum"] },
      medicalHistory: { diagnoses: ["iron_deficiency"] },
      adaptiveEngine: { answers: { months_since_delivery: "3_to_6_months" } },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    {
      primary_pathway: "postpartum_pattern",
      clinician_flags_include: ["possible_postpartum_shedding", "heavy_period_related_iron_risk"],
      bloodwork_include: ["iron_studies"],
    },
    ["postpartum", "iron"]
  ),

  // —— Engine lifestyle_load rapid weight loss passthrough ——
  syntheticCase(
    "te-a-07",
    "Lifestyle load array maps rapid weight loss",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1990-10-10" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      adaptiveEngine: { answers: { lifestyle_load: ["rapid_weight_loss", "major_stress"] } },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    { primary_pathway: "telogen_effluvium_acute" },
    ["acute_te"]
  ),

  // —— Shift work + poor sleep chronic TE ——
  syntheticCase(
    "te-c-06",
    "Shift work cluster",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1986-02-02" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      lifestyleTreatments: { sleepQuality: "poor" },
      adaptiveIntake: { chronicWindow: "more_than_12_months", sleepShiftWork: "yes" },
    },
    { primary_pathway: "telogen_effluvium_chronic" },
    ["chronic_te"]
  ),

  // —— Male TRT + background AGA (explicit overlap) ——
  syntheticCase(
    "trt-02",
    "TRT yes + crown + temple + family",
    "crown_loss",
    {
      aboutYou: { sexAtBirth: "male", dateOfBirth: "1980-03-03" },
      mainConcern: {
        primaryConcerns: ["crown_thinning", "temple_recession"],
        affectedAreas: ["crown", "temples"],
      },
      timelineTriggers: { trtStatus: "yes_prescribed", trtStartedWhen: "six_to_twelve_months" },
      medicalHistory: { familyHistory: ["male_pattern_hair_loss"], familyHistorySide: "fathers_side" },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    {
      primary_pathway: ["male_androgen_exposure_pattern", "androgenic_pattern", "mixed_pattern"],
      clinician_flags_include: ["possible_exogenous_androgen_acceleration"],
    },
    ["trt", "overlap"]
  ),

  // —— Female oral contraception change only in engine ——
  syntheticCase(
    "med-04",
    "Engine-only hormone change recent",
    "diffuse_thinning",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1991-11-11" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        affectedAreas: ["whole_scalp"],
      },
      adaptiveEngine: {
        answers: {
          medication_hormone_change_recent: "yes",
          hormonal_contraception_change_gate: "yes",
        },
      },
      adaptiveIntake: { chronicWindow: "3_to_6_months" },
    },
    { primary_pathway: ["medication_induced_pattern", "telogen_effluvium_chronic"] },
    ["medication"]
  ),

  // —— Traction + diffuse TE secondary calibration ——
  syntheticCase(
    "tr-05",
    "Traction primary with diffuse shedding (high TE score)",
    "acute_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1994-05-05" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        affectedAreas: ["whole_scalp"],
      },
      adaptiveEngine: {
        answers: {
          mechanical_exposures: ["tight_styles"],
          pattern_distribution: ["diffuse_top", "edges"],
        },
      },
      timelineTriggers: { triggers: ["recent_illness_or_infection"] },
      adaptiveIntake: { acuteWindow: "3_to_6_months" },
    },
    {
      primary_pathway: [
        "telogen_effluvium_acute",
        "traction_mechanical_pattern",
        "mixed_pattern",
      ],
    },
    ["traction", "te_overlap"]
  ),

  // —— Acute vs chronic: borderline 6–12 month onset ——
  syntheticCase(
    "te-b-01",
    "Six–twelve months onset shedding diffuse",
    "chronic_shedding",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "1987-12-12" },
      mainConcern: {
        primaryConcerns: ["increased_shedding"],
        firstNoticed: "six_to_twelve_months",
        affectedAreas: ["whole_scalp"],
      },
      adaptiveIntake: { chronicWindow: "6_to_12_months" },
    },
    {
      primary_pathway: ["telogen_effluvium_chronic", "telogen_effluvium_acute"],
    },
    ["acute_vs_chronic", "narrow_margin"]
  ),

  // —— Scalp symptoms without inflammatory cluster (scale only) ——
  syntheticCase(
    "inf-06",
    "Flaking only (mapped to white flakes)",
    "scalp_symptoms",
    {
      aboutYou: { sexAtBirth: "female", dateOfBirth: "2001-01-01" },
      mainConcern: {
        primaryConcerns: ["scalp_irritation_or_inflammation"],
        symptoms: ["flaking"],
      },
      adaptiveEngine: { answers: { scalp_symptom_cluster: ["scale"] } },
    },
    { primary_pathway: "inflammatory_scalp_pattern" },
    ["inflammatory"]
  ),

  // —— Male prefer not to say + neutral context ——
  syntheticCase(
    "neu-02",
    "Prefer not to say sex + endocrine history",
    "diffuse_thinning",
    {
      aboutYou: { sexAtBirth: "prefer_not_to_say", dateOfBirth: "1992-02-02" },
      mainConcern: {
        primaryConcerns: ["diffuse_thinning"],
        affectedAreas: ["whole_scalp"],
      },
      adaptiveIntake: {
        chronicWindow: "6_to_12_months",
        neutralContext: { endocrineHistoryKnown: "yes" },
      },
    },
    {
      primary_pathway: [
        "androgenic_pattern",
        "thyroid_metabolic_pattern",
        "telogen_effluvium_chronic",
        "unclear_pattern",
      ],
    },
    ["neutral_sex"]
  ),
];
