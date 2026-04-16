/**
 * Maps legacy questionnaire + adaptiveEngine.answers into the v2 AdaptiveAnswers shape
 * expected by deriveAdaptiveFacts / evaluateAdaptiveIntake.
 */

import type {
  AboutYou,
  AdaptiveIntake,
  FemaleHistory,
  LongevityQuestionnaireResponses,
  MainConcern,
  MaleHistory,
  MedicalHistory,
  LifestyleTreatments,
  TimelineTriggers,
} from "@/lib/longevity/schema";
import type { AdaptiveAnswers, SexAtBirth as V2SexAtBirth } from "@/src/lib/longevity/intake";

import { getCanonicalPresentationPattern } from "./canonicalPresentation";

type ChiefConcernV2 =
  | "shedding"
  | "thinning"
  | "receding_hairline"
  | "crown_loss"
  | "patchy_loss"
  | "scalp_symptoms"
  | "mixed_unsure";

type OnsetTimingV2 =
  | "less_than_6_weeks"
  | "6_weeks_to_3_months"
  | "3_to_6_months"
  | "6_to_12_months"
  | "more_than_12_months";

type ProgressionSpeedV2 = "sudden" | "gradual" | "fluctuating" | "rapidly_worsening";

type FamilyHistoryV2 =
  | "none_known"
  | "mothers_side"
  | "fathers_side"
  | "both_sides"
  | "unsure";

type EngineAnswers = Record<string, string | string[] | boolean | null>;

function has(arr: string[] | undefined, ...keys: string[]): boolean {
  if (!arr?.length) return false;
  return keys.some((k) => arr.includes(k));
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function hasMeaningfulArrayValues(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function mapSexAtBirth(about?: AboutYou): V2SexAtBirth {
  const s = about?.sexAtBirth;
  if (s === "female" || s === "male" || s === "intersex" || s === "prefer_not_to_say") {
    return s;
  }
  return "unknown";
}

function mapChiefConcernFromPrimaryConcerns(concerns: string[] | undefined): ChiefConcernV2 | undefined {
  if (!concerns?.length) return undefined;
  const order: { keys: string[]; value: ChiefConcernV2 }[] = [
    { keys: ["increased_shedding"], value: "shedding" },
    { keys: ["scalp_irritation_or_inflammation"], value: "scalp_symptoms" },
    { keys: ["patchy_hair_loss"], value: "patchy_loss" },
    { keys: ["frontal_hairline_recession", "temple_recession"], value: "receding_hairline" },
    { keys: ["crown_thinning"], value: "crown_loss" },
    { keys: ["diffuse_thinning", "widening_part"], value: "thinning" },
    { keys: ["eyebrow_thinning", "eyelash_thinning"], value: "thinning" },
  ];
  for (const { keys, value } of order) {
    if (has(concerns, ...keys)) return value;
  }
  if (concerns.includes("other")) return "mixed_unsure";
  return undefined;
}

function mapChiefFromPresentationPattern(
  p: string | undefined
): ChiefConcernV2 | undefined {
  if (!p || typeof p !== "string") return undefined;
  const map: Record<string, ChiefConcernV2> = {
    acute_shedding: "shedding",
    chronic_shedding: "shedding",
    patterned_thinning: "thinning",
    diffuse_thinning: "thinning",
    frontal_temporal_recession: "receding_hairline",
    crown_loss: "crown_loss",
    broken_hairs: "thinning",
    scalp_symptoms: "scalp_symptoms",
    mixed_or_unsure: "mixed_unsure",
  };
  return map[p] ?? undefined;
}

function mapChiefFromEnginePresentation(
  p: string | undefined
): ChiefConcernV2 | undefined {
  if (!p || typeof p !== "string") return undefined;
  const map: Record<string, ChiefConcernV2> = {
    acute_shedding: "shedding",
    chronic_shedding: "shedding",
    patterned_thinning: "thinning",
    diffuse_thinning: "thinning",
    frontal_temporal_recession: "receding_hairline",
    crown_loss: "crown_loss",
    broken_hairs: "thinning",
    scalp_symptoms: "scalp_symptoms",
    mixed_or_unsure: "mixed_unsure",
  };
  return map[p.trim().toLowerCase()] ?? undefined;
}

function mapPatternDistribution(mc: MainConcern | undefined, presentationCanon: string | undefined): string[] {
  const out: string[] = [];
  const areas = mc?.affectedAreas ?? [];
  const add = (v: string) => {
    if (v) out.push(v);
  };
  for (const a of areas) {
    switch (a) {
      case "frontal_hairline":
        add("frontal_hairline");
        break;
      case "temples":
        add("temples");
        break;
      case "crown":
        add("crown");
        break;
      case "mid_scalp":
        add("diffuse_top");
        break;
      case "whole_scalp":
        add("diffuse_all_over");
        break;
      case "part_line":
        add("center_part");
        break;
      case "eyebrows":
        add("eyebrows");
        break;
      default:
        break;
    }
  }
  const pp = presentationCanon;
  if (pp === "crown_loss" && !out.includes("crown")) add("crown");
  if (pp === "frontal_temporal_recession") {
    if (!out.includes("frontal_hairline")) add("frontal_hairline");
    if (!out.includes("temples")) add("temples");
  }
  if (pp === "diffuse_thinning" || pp === "patterned_thinning") {
    if (!out.includes("diffuse_top")) add("diffuse_top");
  }
  return dedupeStrings(out);
}

function mapOnsetTiming(
  mc: MainConcern | undefined,
  ai: AdaptiveIntake | undefined
): OnsetTimingV2 | undefined {
  const aw = ai?.acuteWindow;
  if (aw === "less_than_6_weeks") return "less_than_6_weeks";
  if (aw === "6_to_12_weeks") return "6_weeks_to_3_months";
  if (aw === "3_to_6_months") return "3_to_6_months";
  if (aw === "more_than_6_months") return "6_to_12_months";

  const cw = ai?.chronicWindow;
  if (cw === "3_to_6_months") return "3_to_6_months";
  if (cw === "6_to_12_months") return "6_to_12_months";
  if (cw === "more_than_12_months") return "more_than_12_months";

  const fn = mc?.firstNoticed;
  if (fn === "less_than_3_months") return "3_to_6_months";
  if (fn === "three_to_six_months") return "3_to_6_months";
  if (fn === "six_to_twelve_months") return "6_to_12_months";
  if (fn === "one_to_two_years" || fn === "more_than_two_years") return "more_than_12_months";
  return undefined;
}

function mapProgressionSpeed(
  mc: MainConcern | undefined,
  ai: AdaptiveIntake | undefined,
  tt: TimelineTriggers | undefined
): ProgressionSpeedV2 | undefined {
  if (ai?.rapidProgressionWeeks === true) return "rapidly_worsening";
  const o = mc?.onsetPattern;
  if (o === "sudden" || o === "gradual" || o === "fluctuating") return o;
  const trend = mapRecentHairTrend(tt);
  if (trend === "fluctuating") return "fluctuating";
  if (trend === "worsened") return "gradual";
  return undefined;
}

function mapScalpSymptomsFromMain(symptoms: string[] | undefined): string[] {
  if (!symptoms?.length) return [];
  const out: string[] = [];
  for (const s of symptoms) {
    if (s === "itch") out.push("itch");
    if (s === "burning") out.push("burning");
    if (s === "tenderness") out.push("pain");
    if (s === "flaking") out.push("white_flakes");
  }
  return dedupeStrings(out);
}

function mapScalpClusterFromEngine(cluster: string[] | undefined): string[] {
  if (!cluster?.length) return [];
  const out: string[] = [];
  for (const s of cluster) {
    if (s === "itch") out.push("itch");
    if (s === "scale") out.push("white_flakes");
    if (s === "pain") out.push("pain");
    if (s === "burning") out.push("burning");
    if (s === "pustules") out.push("pustules");
    if (s === "none") continue;
  }
  return dedupeStrings(out);
}

function hasScalpClusterSelection(cluster: string[] | undefined): boolean {
  return cluster?.some((value) => value && value !== "none") ?? false;
}

function hasFamilialPatternHairLoss(fh: string[] | undefined): boolean {
  return has(fh, "male_pattern_hair_loss", "female_pattern_thinning");
}

function mapFamilyHistory(mh: MedicalHistory | undefined): FamilyHistoryV2 | undefined {
  const fh = mh?.familyHistory;
  if (!fh?.length) return undefined;
  if (fh.includes("none_known")) return "none_known";

  const hairLoss = hasFamilialPatternHairLoss(fh);
  const side = mh?.familyHistorySide;
  if (hairLoss && side) {
    if (side === "prefer_not_to_say") return "unsure";
    if (side === "mothers_side" || side === "fathers_side" || side === "both_sides" || side === "unsure") {
      return side;
    }
  }

  const hasMale = fh.includes("male_pattern_hair_loss");
  const hasFemale = fh.includes("female_pattern_thinning");
  if (hasMale && hasFemale) return "both_sides";
  if (hasMale) return "fathers_side";
  if (hasFemale) return "mothers_side";
  return "unsure";
}

function mapRecentHairTrend(tt: TimelineTriggers | undefined): "stable" | "improved" | "worsened" | "fluctuating" | undefined {
  const s = tt?.sheddingTrend;
  if (s === "stable") return "stable";
  if (s === "improved") return "improved";
  if (s === "worsened") return "worsened";
  if (s === "comes_and_goes") return "fluctuating";
  return undefined;
}

function mapTimelineBooleans(tt: TimelineTriggers | undefined, ai: AdaptiveIntake | undefined) {
  const triggers = tt?.triggers ?? [];
  const past = tt?.pastYearEvents ?? [];
  return {
    recent_illness:
      has(triggers, "recent_illness_or_infection") || has(past, "hospital_admission"),
    covid_or_high_fever:
      has(past, "covid_or_major_viral_illness") || has(triggers, "fever"),
    recent_surgery: has(triggers, "surgery_or_anaesthetic"),
    recent_stress_event:
      has(triggers, "major_stress") || has(past, "significant_emotional_stress"),
    rapid_weight_loss:
      has(triggers, "rapid_weight_loss") || ai?.recentRapidWeightLoss === true,
    medication_change_recently:
      has(triggers, "new_medication") || has(triggers, "stopping_medication"),
  };
}

function mapFemaleSex(
  fh: FemaleHistory | undefined,
  ai: AdaptiveIntake | undefined,
  mh: MedicalHistory | undefined,
  tt: TimelineTriggers | undefined,
  rawEngine: EngineAnswers
) {
  const cycles = fh?.cycles;
  let cycle_regularity: "regular" | "irregular" | "missed_periods" | "not_applicable" | "prefer_not_to_say" | undefined;
  if (cycles === "regular") cycle_regularity = "regular";
  else if (cycles === "irregular") cycle_regularity = "irregular";
  else if (cycles === "not_occurring") cycle_regularity = "missed_periods";
  else if (cycles === "prefer_not_to_say") cycle_regularity = "prefer_not_to_say";

  const fc = ai?.femaleContext;
  if (!cycle_regularity) {
    if (fc?.cycleRegularity === "regular") cycle_regularity = "regular";
    if (fc?.cycleRegularity === "irregular") cycle_regularity = "irregular";
    if (fc?.cycleRegularity === "not_occurring") cycle_regularity = "missed_periods";
    if (fc?.cycleRegularity === "prefer_not_to_say") cycle_regularity = "prefer_not_to_say";
  }

  const life = fh?.lifeStage ?? [];
  const postpartumMonths =
    typeof rawEngine.months_since_delivery === "string" ? rawEngine.months_since_delivery : "";
  const adaptivePostpartumRecent =
    rawEngine.postpartum_recent_gate === "yes" ||
    ["under_3_months", "3_to_6_months", "6_to_12_months"].includes(postpartumMonths) ||
    fc?.postpartumRecent === "yes";
  const adaptivePostpartumExplicitNo =
    rawEngine.postpartum_recent_gate === "no" || fc?.postpartumRecent === "no";
  let reproductive_stage:
    | "premenopausal"
    | "perimenopausal"
    | "menopausal"
    | "postpartum"
    | "not_applicable"
    | undefined;
  if (adaptivePostpartumRecent || (!adaptivePostpartumExplicitNo && life.includes("postpartum"))) {
    reproductive_stage = "postpartum";
  } else if (life.includes("perimenopausal")) {
    reproductive_stage = "perimenopausal";
  } else if (life.includes("menopausal")) {
    reproductive_stage = "menopausal";
  } else if (life.includes("pregnant") || life.includes("hormonal_contraception") || life.includes("hrt")) {
    reproductive_stage = "premenopausal";
  } else if (fc?.menopauseContext === "perimenopause") {
    reproductive_stage = "perimenopausal";
  } else if (fc?.menopauseContext === "menopause") {
    reproductive_stage = "menopausal";
  }

  const postpartum_recent =
    adaptivePostpartumRecent ||
    (!adaptivePostpartumExplicitNo && (life.includes("postpartum") || postpartumFromTimeline(tt)));

  return {
    cycle_regularity,
    heavy_periods: has(fh?.features, "heavy_periods"),
    reproductive_stage,
    postpartum_recent,
    unwanted_facial_hair: has(fh?.features, "increased_facial_or_body_hair") || has(fc?.hyperandrogenSigns, "hirsutism"),
    increased_body_hair: has(fh?.features, "increased_facial_or_body_hair") || has(fc?.hyperandrogenSigns, "hirsutism"),
    jawline_acne_or_oily_skin: has(fh?.features, "acne") || has(fc?.hyperandrogenSigns, "acne"),
    known_pcos: has(mh?.diagnoses, "pcos"),
  };
}

/** Postpartum from timeline — needs TimelineTriggers; fixed in caller */
function postpartumFromTimeline(tt: TimelineTriggers | undefined): boolean {
  return has(tt?.triggers, "childbirth_postpartum");
}

function mapLifestyleNutritionSleep(
  lt: LifestyleTreatments | undefined,
  ai: AdaptiveIntake | undefined,
  mh: MedicalHistory | undefined,
  rawEngine: EngineAnswers
) {
  const diet = lt?.dietPattern ?? [];
  const hasStructuredDiet = hasMeaningfulArrayValues(diet);
  const hasStructuredProteinAnswer = lt?.enoughProtein != null;
  const lifeLoad = asStringArray(rawEngine.lifestyle_load);
  const dietIntake = asStringArray(rawEngine.diet_pattern_intake);
  const proteinLevel = typeof rawEngine.protein_intake_level === "string" ? rawEngine.protein_intake_level : "";
  const lowProteinFromEngine = proteinLevel === "low" || proteinLevel === "below_average";
  return {
    vegetarian_or_vegan:
      has(diet, "vegetarian", "vegan") ||
      (!hasStructuredDiet && (dietIntake.includes("vegetarian") || dietIntake.includes("vegan"))),
    restrictive_dieting:
      has(diet, "restrictive_dieting") ||
      ai?.restrictiveEating === "yes" ||
      has(lifeLoad, "restrictive_eating") ||
      (!hasStructuredDiet &&
        (dietIntake.includes("low_calorie_restriction") || dietIntake.includes("omad_or_extended_fasting"))),
    low_protein_intake: lt?.enoughProtein === "no" || (!hasStructuredProteinAnswer && lowProteinFromEngine),
    low_iron_history: has(mh?.diagnoses, "iron_deficiency", "low_ferritin", "anaemia"),
    low_b12_history: false,
    low_vitamin_d_history: has(mh?.diagnoses, "vitamin_d_deficiency"),
    poor_sleep_quality: lt?.sleepQuality === "poor",
    shift_work: ai?.sleepShiftWork === "yes" || has(lifeLoad, "shift_work"),
    high_stress_load:
      (lt?.stressScore != null && lt.stressScore >= 8) ||
      ai?.majorStressEvent === "yes" ||
      has(lifeLoad, "major_stress"),
    overtraining: ai?.highIntensitySportBodybuilding === "yes" || has(lifeLoad, "high_intensity_sport"),
  };
}

function mapMaleAndrogen(
  tt: TimelineTriggers | undefined,
  mhMale: MaleHistory | undefined,
  ai: AdaptiveIntake | undefined,
  rawEngine: EngineAnswers
) {
  const trtActive = tt?.trtStatus != null && tt.trtStatus !== "no";
  const therapies = mhMale?.therapies ?? [];
  const hasStructuredMaleTherapyOwner = trtActive || therapies.length > 0;
  const signals = ai?.androgenExposureSignals ?? [];
  const exposureDetail = asStringArray(rawEngine.male_androgen_exposure_detail);
  const fromAdaptive = {
    trt: exposureDetail.includes("trt"),
    sarms: exposureDetail.includes("sarms_or_anabolics"),
    boosters: exposureDetail.includes("testosterone_booster_products"),
    peptides: exposureDetail.includes("peptides_or_growth"),
  };
  return {
    current_or_past_trt:
      trtActive ||
      has(therapies, "testosterone_replacement_therapy") ||
      (!hasStructuredMaleTherapyOwner && (fromAdaptive.trt || signals.includes("trt"))),
    testosterone_boosters:
      fromAdaptive.boosters ||
      (!hasStructuredMaleTherapyOwner && (signals.includes("trt") || signals.includes("new_hormonal_medication"))),
    sarms_or_anabolics:
      has(therapies, "anabolic_steroids_or_sarms") ||
      fromAdaptive.sarms ||
      (!hasStructuredMaleTherapyOwner && signals.includes("anabolic_agents")),
    peptides_or_growth_agents:
      fromAdaptive.peptides ||
      (!hasStructuredMaleTherapyOwner && signals.includes("peptide_or_growth_related")) ||
      false,
  };
}

function toBoolTriState(v: unknown): boolean | undefined {
  if (v === true) return true;
  if (v === false) return false;
  return undefined;
}

function mergeBool(a: unknown, b: unknown): boolean | undefined {
  const x = toBoolTriState(a);
  const y = toBoolTriState(b);
  if (x === true || y === true) return true;
  if (x === false && y === false) return false;
  if (x !== undefined) return x;
  if (y !== undefined) return y;
  return undefined;
}

function applyLegacyEngineAnswers(base: AdaptiveAnswers, raw: EngineAnswers): AdaptiveAnswers {
  const next = { ...base };
  const presentation = typeof raw.presentation_pattern === "string" ? raw.presentation_pattern : undefined;
  if (!next.chief_concern && presentation) {
    const c = mapChiefFromEnginePresentation(presentation);
    if (c) next.chief_concern = c;
  }

  const scalpMerge = mapScalpClusterFromEngine(asStringArray(raw.scalp_symptom_cluster));
  if (scalpMerge.length) {
    next.scalp_symptoms = dedupeStrings([...(asStringArray(next.scalp_symptoms)), ...scalpMerge]);
  }

  const mech = asStringArray(raw.mechanical_exposures);
  if (has(mech, "tight_styles")) next.tight_hairstyles_or_extensions = true;
  if (has(mech, "helmet_friction")) next.frequent_helmet_or_headgear = true;
  if (has(mech, "high_heat", "chemical_processing")) next.heat_or_chemical_styling = true;

  const life = asStringArray(raw.lifestyle_load);
  if (has(life, "major_stress")) next.high_stress_load = mergeBool(next.high_stress_load, true);
  if (has(life, "shift_work")) next.shift_work = mergeBool(next.shift_work, true);
  if (has(life, "rapid_weight_loss")) next.rapid_weight_loss = mergeBool(next.rapid_weight_loss, true);
  if (has(life, "restrictive_eating")) next.restrictive_dieting = mergeBool(next.restrictive_dieting, true);
  if (has(life, "high_intensity_sport")) next.overtraining = mergeBool(next.overtraining, true);

  const postpartumExplicitNo =
    raw.postpartum_recent_gate === "no" && !hasRecognizedPostpartumMonths(raw.months_since_delivery);
  for (const key of Object.keys(raw)) {
    if (
      [
        "presentation_pattern",
        "scalp_symptom_cluster",
        "mechanical_exposures",
        "lifestyle_load",
        "male_androgen_exposure_context",
        "acute_trigger_window",
      ].includes(key)
    ) {
      continue;
    }
    const v = raw[key];
    if (postpartumExplicitNo && key === "postpartum_recent" && v === true) continue;
    if (postpartumExplicitNo && key === "reproductive_stage" && v === "postpartum") continue;
    if (BACKFILL_ONLY_V2_KEYS.has(key) && hasStoredValue(next[key])) continue;
    if (v !== undefined && v !== null && v !== "") {
      (next as Record<string, unknown>)[key] = v;
    }
  }

  return next;
}

const BACKFILL_ONLY_V2_KEYS = new Set([
  "medication_change_recently",
  "medication_hormone_change_recent",
  "current_or_past_trt",
  "testosterone_boosters",
  "sarms_or_anabolics",
  "peptides_or_growth_agents",
  "cycle_regularity",
  "heavy_periods",
  "reproductive_stage",
  "unwanted_facial_hair",
  "increased_body_hair",
  "jawline_acne_or_oily_skin",
  "known_pcos",
  "vegetarian_or_vegan",
  "restrictive_dieting",
  "low_protein_intake",
  "low_iron_history",
  "low_b12_history",
  "low_vitamin_d_history",
  "poor_sleep_quality",
  "shift_work",
  "high_stress_load",
  "overtraining",
]);

function hasStoredValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function hasRecognizedPostpartumMonths(value: unknown): boolean {
  return (
    typeof value === "string" &&
    ["under_3_months", "3_to_6_months", "6_to_12_months"].includes(value)
  );
}

function mergeV2Overlay(base: AdaptiveAnswers, overlay: AdaptiveAnswers): AdaptiveAnswers {
  const out: AdaptiveAnswers = { ...base };
  const postpartumExplicitNo =
    (base.postpartum_recent_gate === "no" || overlay.postpartum_recent_gate === "no") &&
    !hasRecognizedPostpartumMonths(base.months_since_delivery) &&
    !hasRecognizedPostpartumMonths(overlay.months_since_delivery);
  for (const [k, v] of Object.entries(overlay)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (postpartumExplicitNo && k === "postpartum_recent" && v === true) continue;
    if (postpartumExplicitNo && k === "reproductive_stage" && v === "postpartum") continue;
    if (BACKFILL_ONLY_V2_KEYS.has(k) && hasStoredValue(out[k])) continue;
    (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

/**
 * Maps full questionnaire responses (plus optional raw adaptiveEngine.answers) to v2 AdaptiveAnswers.
 */
export function mapResponsesToAdaptiveAnswers(
  responses: LongevityQuestionnaireResponses | undefined | null
): AdaptiveAnswers {
  const r = responses ?? {};
  const about = r.aboutYou;
  const mc = r.mainConcern;
  const tt = r.timelineTriggers;
  const mh = r.medicalHistory;
  const fh = r.femaleHistory;
  const mhMale = r.maleHistory;
  const lt = r.lifestyleTreatments;
  const ai = r.adaptiveIntake;
  const rawEngine = (r.adaptiveEngine?.answers ?? r.adaptiveEngine?.adaptive_answers ?? {}) as EngineAnswers;

  const presentationCanon = getCanonicalPresentationPattern(r);

  const sex_at_birth = mapSexAtBirth(about);
  const dob = typeof about?.dateOfBirth === "string" && about.dateOfBirth.length > 0 ? about.dateOfBirth : undefined;

  let chief_concern: ChiefConcernV2 | undefined =
    mapChiefConcernFromPrimaryConcerns(mc?.primaryConcerns) ??
    mapChiefFromPresentationPattern(presentationCanon) ??
    mapChiefFromEnginePresentation(typeof rawEngine.presentation_pattern === "string" ? rawEngine.presentation_pattern : undefined);

  const pattern_distribution = mapPatternDistribution(mc, presentationCanon);
  const onset_timing = mapOnsetTiming(mc, ai);
  const progression_speed = mapProgressionSpeed(mc, ai, tt);

  const rawScalpCluster = asStringArray(rawEngine.scalp_symptom_cluster);
  const scalp_symptoms = hasScalpClusterSelection(rawScalpCluster)
    ? mapScalpClusterFromEngine(rawScalpCluster)
    : dedupeStrings([
        ...mapScalpSymptomsFromMain(mc?.symptoms),
        ...mapScalpClusterFromEngine(rawScalpCluster),
      ]);

  const ttm = mapTimelineBooleans(tt, ai);
  const female = mapFemaleSex(fh, ai, mh, tt, rawEngine);
  const lifestyle = mapLifestyleNutritionSleep(lt, ai, mh, rawEngine);
  const maleA = mapMaleAndrogen(tt, mhMale, ai, rawEngine);

  if (!chief_concern && mc?.primaryConcerns?.length) {
    chief_concern = "mixed_unsure";
  }

  const familyHistoryV2 = mapFamilyHistory(mh);
  const recent_hair_trend = mapRecentHairTrend(tt);
  const familialHair = hasFamilialPatternHairLoss(mh?.familyHistory);

  const active_shedding_now =
    chief_concern === "shedding" ||
    has(mc?.primaryConcerns, "increased_shedding") ||
    presentationCanon === "acute_shedding" ||
    presentationCanon === "chronic_shedding";

  const breakage_over_shedding =
    ai?.reportsBrokenHairs === true || presentationCanon === "broken_hairs";

  const base: AdaptiveAnswers = {
    sex_at_birth,
    ...(dob ? { dob } : {}),
    ...(chief_concern ? { chief_concern } : {}),
    ...(pattern_distribution.length ? { pattern_distribution } : {}),
    ...(onset_timing ? { onset_timing } : {}),
    ...(progression_speed ? { progression_speed } : {}),
    ...(recent_hair_trend ? { recent_hair_trend } : {}),
    ...(mc?.perceivedSeverity ? { perceived_severity: mc.perceivedSeverity } : {}),
    ...(mc?.patternConfidence && mc.patternConfidence !== "prefer_not_to_say"
      ? { pattern_confidence: mc.patternConfidence }
      : {}),
    ...(scalp_symptoms.length ? { scalp_symptoms } : {}),
    ...(active_shedding_now ? { active_shedding_now: true } : {}),
    ...(breakage_over_shedding ? { breakage_over_shedding: true } : {}),
    ...(ttm.recent_illness ? { recent_illness: true } : {}),
    ...(ttm.covid_or_high_fever ? { covid_or_high_fever: true } : {}),
    ...(ttm.recent_surgery ? { recent_surgery: true } : {}),
    ...(ttm.recent_stress_event ? { recent_stress_event: true } : {}),
    ...(ttm.rapid_weight_loss || has(asStringArray(rawEngine.lifestyle_load), "rapid_weight_loss")
      ? { rapid_weight_loss: true }
      : {}),
    ...(ttm.medication_change_recently || rawEngine.medication_hormone_change_recent === "yes"
      ? { medication_change_recently: true }
      : {}),
    ...(ttm.medication_change_recently || rawEngine.medication_hormone_change_recent === "yes"
      ? { medication_hormone_change_recent: "yes" }
      : {}),
    ...(familyHistoryV2 ? { family_history: familyHistoryV2 } : {}),
    ...(familialHair && mh?.familyHairPatternMatch && mh.familyHairPatternMatch !== "prefer_not_to_say"
      ? { family_hair_pattern_match: mh.familyHairPatternMatch }
      : {}),
    ...(familialHair && mh?.familyHairOnsetAgeBand && mh.familyHairOnsetAgeBand !== "prefer_not_to_say"
      ? { family_hair_onset_age_band: mh.familyHairOnsetAgeBand }
      : {}),
    ...(maleA.current_or_past_trt ? { current_or_past_trt: true } : {}),
    ...(maleA.testosterone_boosters ? { testosterone_boosters: true } : {}),
    ...(maleA.sarms_or_anabolics ? { sarms_or_anabolics: true } : {}),
    ...(maleA.peptides_or_growth_agents ? { peptides_or_growth_agents: true } : {}),
    ...(sex_at_birth === "female" && female.cycle_regularity
      ? { cycle_regularity: female.cycle_regularity }
      : {}),
    ...(sex_at_birth === "female" && female.heavy_periods ? { heavy_periods: true } : {}),
    ...(sex_at_birth === "female" && female.reproductive_stage
      ? { reproductive_stage: female.reproductive_stage }
      : {}),
    ...(sex_at_birth === "female" && female.postpartum_recent ? { postpartum_recent: true } : {}),
    ...(sex_at_birth === "female" && female.unwanted_facial_hair ? { unwanted_facial_hair: true } : {}),
    ...(sex_at_birth === "female" && female.increased_body_hair ? { increased_body_hair: true } : {}),
    ...(sex_at_birth === "female" && female.jawline_acne_or_oily_skin ? { jawline_acne_or_oily_skin: true } : {}),
    ...(female.known_pcos ? { known_pcos: true } : {}),
    ...((sex_at_birth === "intersex" || sex_at_birth === "prefer_not_to_say") &&
    ai?.neutralContext?.endocrineHistoryKnown === "yes"
      ? { neutral_hormonal_context: true }
      : {}),
    ...(lifestyle.vegetarian_or_vegan ? { vegetarian_or_vegan: true } : {}),
    ...(lifestyle.restrictive_dieting ? { restrictive_dieting: true } : {}),
    ...(lifestyle.low_protein_intake ? { low_protein_intake: true } : {}),
    ...(lifestyle.low_iron_history ? { low_iron_history: true } : {}),
    ...(lifestyle.low_b12_history ? { low_b12_history: true } : {}),
    ...(lifestyle.low_vitamin_d_history ? { low_vitamin_d_history: true } : {}),
    ...(lifestyle.poor_sleep_quality ? { poor_sleep_quality: true } : {}),
    ...(lifestyle.shift_work ? { shift_work: true } : {}),
    ...(lifestyle.high_stress_load ? { high_stress_load: true } : {}),
    ...(lifestyle.overtraining ? { overtraining: true } : {}),
    ...(lt?.currentTreatments?.length ? { treatment_history: lt.currentTreatments } : {}),
  };

  const cleaned = stripUndefined(base);
  const withEngine = applyLegacyEngineAnswers(cleaned, rawEngine);
  const fromDirectV2 = extractDirectV2AdaptiveAnswers(rawEngine);
  return stripUndefined(mergeV2Overlay(withEngine, fromDirectV2));
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v === null) continue;
    if (typeof v === "string" && v === "") continue;
    out[k] = v;
  }
  return out as T;
}

/** Keys already stored in v2 shape on the engine pass-through. */
const V2_ENGINE_KEYS = new Set([
  "sex_at_birth",
  "dob",
  "chief_concern",
  "onset_timing",
  "progression_speed",
  "pattern_distribution",
  "scalp_symptoms",
  "active_shedding_now",
  "breakage_over_shedding",
  "recent_illness",
  "covid_or_high_fever",
  "recent_surgery",
  "recent_stress_event",
  "rapid_weight_loss",
  "medication_change_recently",
  "family_history",
  "family_hair_pattern_match",
  "family_hair_onset_age_band",
  "perceived_severity",
  "pattern_confidence",
  "recent_hair_trend",
  "current_or_past_trt",
  "trt_start_context",
  "testosterone_boosters",
  "sarms_or_anabolics",
  "peptides_or_growth_agents",
  "cycle_regularity",
  "heavy_periods",
  "reproductive_stage",
  "postpartum_recent",
  "unwanted_facial_hair",
  "increased_body_hair",
  "jawline_acne_or_oily_skin",
  "known_pcos",
  "neutral_hormonal_context",
  "vegetarian_or_vegan",
  "restrictive_dieting",
  "eating_disorder_history",
  "low_protein_intake",
  "low_iron_history",
  "low_b12_history",
  "low_vitamin_d_history",
  "poor_sleep_quality",
  "shift_work",
  "high_stress_load",
  "overtraining",
  "tight_hairstyles_or_extensions",
  "frequent_helmet_or_headgear",
  "contact_sports_or_headgear_sport",
  "heat_or_chemical_styling",
  "treatment_history",
  "months_since_delivery",
  "breastfeeding_status",
  "postpartum_recent_gate",
  "hormonal_contraception_change_gate",
  "hormonal_change_vs_hair_timing",
  "male_androgen_exposure_detail",
  "exogenous_androgen_timing_vs_hair",
  "scalp_symptom_duration",
  "scalp_symptom_flare_pattern",
  "scalp_symptom_treatments_tried",
  "medication_hormone_change_recent",
  "med_change_timing_vs_hair",
  "protein_intake_level",
  "diet_pattern_intake",
]);

function extractDirectV2AdaptiveAnswers(raw: EngineAnswers): AdaptiveAnswers {
  const out: AdaptiveAnswers = {};
  for (const key of V2_ENGINE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      const v = raw[key];
      if (v !== undefined && v !== null && v !== "") {
        (out as Record<string, unknown>)[key] = v;
      }
    }
  }
  return out;
}

export function looksLikeQuestionnaireResponses(input: unknown): boolean {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const keys = new Set(Object.keys(input as object));
  const markers = [
    "aboutYou",
    "mainConcern",
    "timelineTriggers",
    "medicalHistory",
    "femaleHistory",
    "maleHistory",
    "lifestyleTreatments",
    "uploadsNextSteps",
    "adaptiveIntake",
    "adaptiveEngine",
    "adaptiveDerivedSummary",
  ];
  return markers.some((k) => keys.has(k));
}
