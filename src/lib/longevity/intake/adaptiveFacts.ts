import type { AdaptiveAnswers, AdaptiveFacts, SexAtBirth } from "./adaptiveTypes";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function ageBandFromDob(dob?: string | null): string | undefined {
  if (!dob) return undefined;
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return undefined;

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const m = now.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--;

  if (age < 18) return "under_18";
  if (age <= 24) return "18_24";
  if (age <= 34) return "25_34";
  if (age <= 44) return "35_44";
  if (age <= 54) return "45_54";
  return "55_plus";
}

export function deriveAdaptiveFacts(answers: AdaptiveAnswers): AdaptiveFacts {
  const sexAtBirth = (answers.sex_at_birth as SexAtBirth | undefined) ?? "unknown";
  const patternDistribution = asStringArray(answers.pattern_distribution);
  const scalpSymptoms = asStringArray(answers.scalp_symptoms).filter((value) => value !== "none");
  const structuredHirsutismRegions = asStringArray(answers.hirsutism_structured_regions).filter(
    (value) => value !== "none"
  );
  const hirsutismSeverity =
    typeof answers.hirsutism_severity === "string" ? answers.hirsutism_severity : "";
  const postpartumMonths =
    typeof answers.months_since_delivery === "string" ? answers.months_since_delivery : "";
  const adaptivePostpartumYes =
    asBoolean(answers.postpartum_recent) ||
    answers.postpartum_recent_gate === "yes" ||
    ["under_3_months", "3_to_6_months", "6_to_12_months"].includes(postpartumMonths);
  const adaptivePostpartumExplicitNo =
    answers.postpartum_recent === false || answers.postpartum_recent_gate === "no";

  const hasDiffuseLoss =
    patternDistribution.includes("diffuse_top") ||
    patternDistribution.includes("diffuse_all_over");

  const hasTemplePattern =
    patternDistribution.includes("temples") ||
    patternDistribution.includes("frontal_hairline");

  const hasCentralPattern = patternDistribution.includes("center_part");
  const hasCrownPattern = patternDistribution.includes("crown");
  const hasEdgesPattern = patternDistribution.includes("edges");

  const medicationChangeSignal =
    asBoolean(answers.medication_change_recently) ||
    answers.medication_hormone_change_recent === "yes" ||
    answers.med_change_timing_vs_hair === "before_hair_change" ||
    answers.med_change_timing_vs_hair === "around_same_time" ||
    answers.med_change_timing_vs_hair === "after_hair_change";

  const recentTriggerBurden = [
    asBoolean(answers.recent_illness),
    asBoolean(answers.recent_surgery),
    asBoolean(answers.recent_stress_event),
    asBoolean(answers.rapid_weight_loss),
    medicationChangeSignal,
    asBoolean(answers.covid_or_high_fever),
    adaptivePostpartumYes,
    answers.hormonal_contraception_change_gate === "yes",
  ].filter(Boolean).length;

  const suspectedShedding =
    answers.chief_concern === "shedding" || asBoolean(answers.active_shedding_now);

  const possiblePostpartumContext =
    adaptivePostpartumYes ||
    (!adaptivePostpartumExplicitNo && answers.reproductive_stage === "postpartum");

  const possibleHyperandrogenFeatures =
    asBoolean(answers.unwanted_facial_hair) ||
    asBoolean(answers.increased_body_hair) ||
    asBoolean(answers.jawline_acne_or_oily_skin) ||
    asBoolean(answers.known_pcos);

  const possibleCycleIrregularity =
    answers.cycle_regularity === "irregular" ||
    answers.cycle_regularity === "missed_periods";

  const possibleMenopausalTransition =
    answers.reproductive_stage === "perimenopausal" ||
    answers.reproductive_stage === "menopausal";

  const femaleHormonalGateOpen =
    sexAtBirth === "female" &&
    (answers.female_hormonal_context === "yes" ||
      possibleCycleIrregularity ||
      possiblePostpartumContext ||
      possibleMenopausalTransition ||
      possibleHyperandrogenFeatures ||
      answers.hormonal_contraception_change_gate === "yes" ||
      answers.pituitary_red_flag_followup === "yes");

  const mechanicalExposureCluster =
    asBoolean(answers.tight_hairstyles_or_extensions) ||
    asBoolean(answers.frequent_helmet_or_headgear) ||
    asBoolean(answers.contact_sports_or_headgear_sport) ||
    asBoolean(answers.heat_or_chemical_styling);

  return {
    ...answers,
    age_band: ageBandFromDob((answers.dob as string | undefined) ?? undefined),
    is_female: sexAtBirth === "female",
    is_male: sexAtBirth === "male",
    is_neutral_pathway:
      sexAtBirth === "intersex" ||
      sexAtBirth === "prefer_not_to_say" ||
      sexAtBirth === "unknown",

    has_diffuse_loss: hasDiffuseLoss,
    has_temple_pattern: hasTemplePattern,
    has_central_pattern: hasCentralPattern,
    has_crown_pattern: hasCrownPattern,
    has_edges_pattern: hasEdgesPattern,

    has_scalp_symptoms: scalpSymptoms.length > 0,
    has_inflammatory_scalp_symptoms:
      scalpSymptoms.includes("itch") ||
      scalpSymptoms.includes("burning") ||
      scalpSymptoms.includes("pain") ||
      scalpSymptoms.includes("redness") ||
      scalpSymptoms.includes("pustules") ||
      scalpSymptoms.includes("crusting"),

    has_scaling_symptoms:
      scalpSymptoms.includes("white_flakes") ||
      scalpSymptoms.includes("yellow_greasy_scale"),

    recent_trigger_burden: recentTriggerBurden,

    suspected_shedding: suspectedShedding,

    suspected_patterned_loss:
      answers.chief_concern === "receding_hairline" ||
      answers.chief_concern === "crown_loss" ||
      answers.chief_concern === "thinning" ||
      hasTemplePattern ||
      hasCrownPattern ||
      hasCentralPattern,

    possible_breakage_pattern:
      asBoolean(answers.breakage_over_shedding) || hasEdgesPattern,

    possible_hyperandrogen_features:
      possibleHyperandrogenFeatures,

    possible_hirsutism_screen_trigger:
      sexAtBirth === "female" &&
      (possibleHyperandrogenFeatures || possibleCycleIrregularity),

    possible_hirsutism_structured_followup:
      hirsutismSeverity === "moderate" || hirsutismSeverity === "marked",

    hirsutism_supporting_signal:
      hirsutismSeverity === "moderate" ||
      hirsutismSeverity === "marked" ||
      structuredHirsutismRegions.length >= 2,

    possible_androgen_exposure:
      asBoolean(answers.current_or_past_trt) ||
      asBoolean(answers.sarms_or_anabolics) ||
      asBoolean(answers.testosterone_boosters) ||
      asBoolean(answers.peptides_or_growth_agents),

    nutritional_risk_cluster:
      asBoolean(answers.vegetarian_or_vegan) ||
      asBoolean(answers.restrictive_dieting) ||
      asBoolean(answers.eating_disorder_history) ||
      asBoolean(answers.low_protein_intake) ||
      asBoolean(answers.low_iron_history) ||
      asBoolean(answers.low_b12_history) ||
      asBoolean(answers.low_vitamin_d_history),

    sleep_stress_cluster:
      asBoolean(answers.poor_sleep_quality) ||
      asBoolean(answers.shift_work) ||
      asBoolean(answers.high_stress_load) ||
      asBoolean(answers.overtraining),

    mechanical_exposure_cluster: mechanicalExposureCluster,

    possible_postpartum_context: possiblePostpartumContext,

    possible_cycle_irregularity:
      possibleCycleIrregularity,

    possible_heavy_menses:
      asBoolean(answers.heavy_periods),

    possible_menopausal_transition:
      possibleMenopausalTransition,

    possible_neutral_hormonal_context:
      asBoolean(answers.neutral_hormonal_context),

    possible_female_endocrine_context:
      sexAtBirth === "female" &&
      (possibleCycleIrregularity ||
        possiblePostpartumContext ||
        possibleMenopausalTransition ||
        answers.hormonal_contraception_change_gate === "yes" ||
        answers.hormonal_change_vs_hair_timing === "around_same_time"),

    female_hormonal_gate_open: femaleHormonalGateOpen,

    possible_stress_trigger_delay_overlap:
      answers.stress_shedding_delay_pattern === "yes" &&
      recentTriggerBurden > 0,

    possible_pituitary_followup_prompt:
      answers.pituitary_red_flag_followup === "yes",

    family_pattern_similar_to_self: answers.family_hair_pattern_match === "similar_to_mine",

    recent_hair_trend_worsening: answers.recent_hair_trend === "worsened",

    perceived_severity_moderate_or_high:
      answers.perceived_severity === "moderate" ||
      answers.perceived_severity === "severe",

    pattern_confidence_uncertain: answers.pattern_confidence === "mixed_or_unsure",

    /** Family similarity nudges androgenic only when objective patterned distribution exists. */
    family_similarity_with_objective_pattern:
      answers.family_hair_pattern_match === "similar_to_mine" &&
      (patternDistribution.includes("temples") ||
        patternDistribution.includes("frontal_hairline") ||
        patternDistribution.includes("crown") ||
        patternDistribution.includes("center_part")),

    /** Worsening trend + acute/subacute onset → acute TE layer (mutually exclusive with chronic worsening). */
    te_worsening_for_acute:
      answers.recent_hair_trend === "worsened" &&
      answers.onset_timing !== "6_to_12_months" &&
      answers.onset_timing !== "more_than_12_months" &&
      (answers.onset_timing === "less_than_6_weeks" ||
        answers.onset_timing === "6_weeks_to_3_months" ||
        answers.onset_timing === "3_to_6_months" ||
        (answers.onset_timing === undefined &&
          (answers.chief_concern === "shedding" || asBoolean(answers.active_shedding_now)))),

    /** Worsening trend + longer course → chronic TE layer only. */
    te_worsening_for_chronic:
      answers.recent_hair_trend === "worsened" &&
      (answers.onset_timing === "6_to_12_months" || answers.onset_timing === "more_than_12_months"),

    /** Co-occurrence flag for overlap handling in triage (not a patient-facing label). */
    shedding_with_inflammatory_scalp:
      suspectedShedding &&
      (scalpSymptoms.includes("itch") ||
        scalpSymptoms.includes("burning") ||
        scalpSymptoms.includes("pain") ||
        scalpSymptoms.includes("pustules")),

    /** Breakage-weighted presentation without diffuse top (helps traction vs diffuse TE). */
    breakage_predominant_without_diffuse_top:
      asBoolean(answers.breakage_over_shedding) && !hasDiffuseLoss,

    /** Classic postpartum diffuse shedding alignment — boosts postpartum vs generic acute TE. */
    postpartum_diffuse_shedding_cluster: possiblePostpartumContext && suspectedShedding && hasDiffuseLoss,

    /** Male androgen exposure pathway: TRT / boosters / anabolics, or rapid progression without exposure. */
    male_androgen_exposure_pathway_eligible:
      asBoolean(answers.current_or_past_trt) ||
      asBoolean(answers.sarms_or_anabolics) ||
      asBoolean(answers.testosterone_boosters) ||
      asBoolean(answers.peptides_or_growth_agents) ||
      answers.progression_speed === "rapidly_worsening",

    /** Mechanical traction + diffuse shedding — traction and TE often co-score; triage may promote mixed_pattern. */
    traction_diffuse_te_overlap: mechanicalExposureCluster && hasDiffuseLoss && suspectedShedding,
  };
}
