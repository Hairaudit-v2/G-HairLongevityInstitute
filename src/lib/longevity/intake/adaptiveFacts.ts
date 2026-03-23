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
  const scalpSymptoms = asStringArray(answers.scalp_symptoms);

  const hasDiffuseLoss =
    patternDistribution.includes("diffuse_top") ||
    patternDistribution.includes("diffuse_all_over");

  const hasTemplePattern =
    patternDistribution.includes("temples") ||
    patternDistribution.includes("frontal_hairline");

  const hasCentralPattern = patternDistribution.includes("center_part");
  const hasCrownPattern = patternDistribution.includes("crown");
  const hasEdgesPattern = patternDistribution.includes("edges");

  const recentTriggerBurden = [
    asBoolean(answers.recent_illness),
    asBoolean(answers.recent_surgery),
    asBoolean(answers.recent_stress_event),
    asBoolean(answers.rapid_weight_loss),
    asBoolean(answers.medication_change_recently),
    asBoolean(answers.covid_or_high_fever),
    asBoolean(answers.postpartum_recent),
  ].filter(Boolean).length;

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

    suspected_shedding:
      answers.chief_concern === "shedding" || asBoolean(answers.active_shedding_now),

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
      asBoolean(answers.unwanted_facial_hair) ||
      asBoolean(answers.increased_body_hair) ||
      asBoolean(answers.jawline_acne_or_oily_skin) ||
      asBoolean(answers.known_pcos),

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

    mechanical_exposure_cluster:
      asBoolean(answers.tight_hairstyles_or_extensions) ||
      asBoolean(answers.frequent_helmet_or_headgear) ||
      asBoolean(answers.contact_sports_or_headgear_sport) ||
      asBoolean(answers.heat_or_chemical_styling),

    possible_postpartum_context:
      asBoolean(answers.postpartum_recent) ||
      answers.reproductive_stage === "postpartum",

    possible_cycle_irregularity:
      answers.cycle_regularity === "irregular" ||
      answers.cycle_regularity === "missed_periods",

    possible_heavy_menses:
      asBoolean(answers.heavy_periods),

    possible_menopausal_transition:
      answers.reproductive_stage === "perimenopausal" ||
      answers.reproductive_stage === "menopausal",

    possible_neutral_hormonal_context:
      asBoolean(answers.neutral_hormonal_context),
  };
}
