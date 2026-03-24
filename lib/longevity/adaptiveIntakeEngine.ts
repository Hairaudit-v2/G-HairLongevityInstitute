import { getPathwayStateFromQuestionnaire } from "@/lib/longevity/intake/orchestrator";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

export type PathwayKey =
  | "androgenic_pattern"
  | "telogen_effluvium_diffuse_shedding"
  | "hormonal_endocrine_female_pattern"
  | "inflammatory_scalp_disease"
  | "traction_mechanical_damage"
  | "nutritional_deficiency"
  | "medication_androgen_exposure"
  | "mixed_unclear_pattern";

export type ConfidenceBand = "high" | "medium" | "low";

export type PathwayConfidence = {
  pathway: PathwayKey;
  score: number;
  confidence: ConfidenceBand;
};

export type AdaptiveIntakeQuestion = {
  id: string;
  label: string;
  pathway: PathwayKey | "base";
  requiredWhen: "always" | "pathway_active" | "sex_specific";
  branchEntryCriteria: string[];
  branchExitCriteria: string[];
  normalizer?: "lowercase_trim" | "dedupe_array";
};

export type AdaptiveBranchDefinition = {
  id: string;
  pathway: PathwayKey;
  entryCriteria: string[];
  exitCriteria: string[];
  requiredQuestionIds: string[];
};

export type AdaptiveDerivedOutputs = {
  likely_pattern: string;
  possible_drivers: string[];
  red_flags: string[];
  bloodwork_considerations: string[];
  document_requests: string[];
  upload_guidance: string[];
  clinician_attention_flags: string[];
  confidence_summary: string;
  primary_pathway: PathwayKey;
  secondary_pathways: PathwayKey[];
  pathway_confidence: PathwayConfidence[];
};

const ANDROGENIC_SIGNALS = [
  "frontal_hairline_recession",
  "temple_recession",
  "crown_thinning",
  "widening_part",
];

const INFLAMMATORY_SYMPTOMS = ["itch", "burning", "tenderness", "flaking"];

function toBand(score: number): ConfidenceBand {
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function includesAny(values: string[] | undefined, keys: string[]): boolean {
  if (!values?.length) return false;
  return keys.some((key) => values.includes(key));
}

function ageFromDob(dob?: string): number | null {
  if (!dob) return null;
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - parsed.getFullYear();
  const m = now.getMonth() - parsed.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < parsed.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

export const ADAPTIVE_QUESTION_DEFINITIONS: AdaptiveIntakeQuestion[] = [
  {
    id: "presentation_pattern",
    label: "Presentation pattern",
    pathway: "base",
    requiredWhen: "always",
    branchEntryCriteria: ["main concern captured"],
    branchExitCriteria: ["one option selected"],
    normalizer: "lowercase_trim",
  },
  {
    id: "acute_shedding_window",
    label: "Acute shedding timeline",
    pathway: "telogen_effluvium_diffuse_shedding",
    requiredWhen: "pathway_active",
    branchEntryCriteria: ["presentation includes acute shedding"],
    branchExitCriteria: ["timeline selected"],
  },
  {
    id: "traction_exposure",
    label: "Traction/mechanical exposure",
    pathway: "traction_mechanical_damage",
    requiredWhen: "pathway_active",
    branchEntryCriteria: ["broken hairs or frontotemporal stress pattern"],
    branchExitCriteria: ["exposure selected or skipped"],
    normalizer: "dedupe_array",
  },
  {
    id: "female_hormonal_context",
    label: "Female hormonal context",
    pathway: "hormonal_endocrine_female_pattern",
    requiredWhen: "sex_specific",
    branchEntryCriteria: ["sex at birth female"],
    branchExitCriteria: ["cycle/life stage captured or skipped"],
  },
  {
    id: "male_androgen_exposure",
    label: "Male androgen exposure",
    pathway: "medication_androgen_exposure",
    requiredWhen: "sex_specific",
    branchEntryCriteria: ["sex at birth male"],
    branchExitCriteria: ["TRT/anabolic context captured or skipped"],
  },
];

export const ADAPTIVE_BRANCH_DEFINITIONS: AdaptiveBranchDefinition[] = [
  {
    id: "branch_androgenic",
    pathway: "androgenic_pattern",
    entryCriteria: ["androgenic concern selected", "or gradual pattern with family history"],
    exitCriteria: ["patterned progression captured"],
    requiredQuestionIds: ["presentation_pattern"],
  },
  {
    id: "branch_te_diffuse",
    pathway: "telogen_effluvium_diffuse_shedding",
    entryCriteria: ["diffuse thinning or shedding selected", "trigger history present"],
    exitCriteria: ["acute/chronic shedding timing captured"],
    requiredQuestionIds: ["acute_shedding_window"],
  },
  {
    id: "branch_hormonal_female",
    pathway: "hormonal_endocrine_female_pattern",
    entryCriteria: ["female sex and hormonal signals"],
    exitCriteria: ["hormonal context captured or skipped"],
    requiredQuestionIds: ["female_hormonal_context"],
  },
  {
    id: "branch_inflammatory",
    pathway: "inflammatory_scalp_disease",
    entryCriteria: ["scalp symptoms/diagnoses present"],
    exitCriteria: ["symptom burden captured"],
    requiredQuestionIds: ["presentation_pattern"],
  },
  {
    id: "branch_traction",
    pathway: "traction_mechanical_damage",
    entryCriteria: ["traction risk or broken hair reported"],
    exitCriteria: ["mechanical exposure captured"],
    requiredQuestionIds: ["traction_exposure"],
  },
  {
    id: "branch_nutritional",
    pathway: "nutritional_deficiency",
    entryCriteria: ["dietary restriction, weight loss, fatigue, iron risk"],
    exitCriteria: ["nutrition contributors captured"],
    requiredQuestionIds: ["presentation_pattern"],
  },
  {
    id: "branch_medication_androgen",
    pathway: "medication_androgen_exposure",
    entryCriteria: ["TRT/anabolic/new med signals"],
    exitCriteria: ["medication timeline captured"],
    requiredQuestionIds: ["male_androgen_exposure"],
  },
];

export function normalizeAdaptiveResponses(
  responses: LongevityQuestionnaireResponses
): LongevityQuestionnaireResponses {
  const normalized = structuredClone(responses);
  const engineAns = normalized.adaptiveEngine?.answers as Record<string, unknown> | undefined;
  const fromEngine =
    typeof engineAns?.presentation_pattern === "string" ? engineAns.presentation_pattern.trim().toLowerCase() : null;

  if (fromEngine && !normalized.adaptiveIntake?.presentationPattern) {
    normalized.adaptiveIntake = {
      ...(normalized.adaptiveIntake ?? {}),
      presentationPattern: fromEngine as NonNullable<
        LongevityQuestionnaireResponses["adaptiveIntake"]
      >["presentationPattern"],
    };
  }

  const adaptive = normalized.adaptiveIntake;
  if (!adaptive) return normalized;

  if (typeof adaptive.presentationPattern === "string") {
    const normalizedPattern = adaptive.presentationPattern.trim().toLowerCase();
    adaptive.presentationPattern = normalizedPattern as NonNullable<
      LongevityQuestionnaireResponses["adaptiveIntake"]
    >["presentationPattern"];
  }

  const dedupe = <T extends string>(arr?: T[]) =>
    arr?.length ? Array.from(new Set(arr.filter(Boolean))) : arr;

  adaptive.pathwayHints = dedupe(adaptive.pathwayHints);
  adaptive.tractionSignals = dedupe(adaptive.tractionSignals);
  adaptive.cosmeticSignals = dedupe(adaptive.cosmeticSignals);
  adaptive.androgenExposureSignals = dedupe(adaptive.androgenExposureSignals);
  adaptive.stressSignals = dedupe(adaptive.stressSignals);

  return normalized;
}

export function detectPathways(
  rawResponses: LongevityQuestionnaireResponses
): {
  primary_pathway: PathwayKey;
  secondary_pathways: PathwayKey[];
  pathway_confidence: PathwayConfidence[];
} {
  const responses = normalizeAdaptiveResponses(rawResponses);
  const about = responses.aboutYou;
  const main = responses.mainConcern;
  const timeline = responses.timelineTriggers;
  const medical = responses.medicalHistory;
  const female = responses.femaleHistory;
  const male = responses.maleHistory;
  const lifestyle = responses.lifestyleTreatments;
  const adaptive = responses.adaptiveIntake;

  const scores: Record<PathwayKey, number> = {
    androgenic_pattern: 0,
    telogen_effluvium_diffuse_shedding: 0,
    hormonal_endocrine_female_pattern: 0,
    inflammatory_scalp_disease: 0,
    traction_mechanical_damage: 0,
    nutritional_deficiency: 0,
    medication_androgen_exposure: 0,
    mixed_unclear_pattern: 0,
  };

  if (includesAny(main?.primaryConcerns, ANDROGENIC_SIGNALS)) scores.androgenic_pattern += 2;
  if (main?.onsetPattern === "gradual") scores.androgenic_pattern += 1;
  if (includesAny(medical?.familyHistory, ["male_pattern_hair_loss", "female_pattern_thinning"])) {
    scores.androgenic_pattern += 1;
  }

  if (includesAny(main?.primaryConcerns, ["increased_shedding", "diffuse_thinning"])) {
    scores.telogen_effluvium_diffuse_shedding += 2;
  }
  if (
    includesAny(timeline?.triggers, [
      "major_stress",
      "recent_illness_or_infection",
      "fever",
      "surgery_or_anaesthetic",
      "rapid_weight_loss",
      "new_medication",
    ])
  ) {
    scores.telogen_effluvium_diffuse_shedding += 2;
  }

  if (about?.sexAtBirth === "female") {
    if (female?.cycles === "irregular") scores.hormonal_endocrine_female_pattern += 2;
    if (includesAny(medical?.diagnoses, ["pcos", "endometriosis"])) {
      scores.hormonal_endocrine_female_pattern += 2;
    }
    if (includesAny(female?.lifeStage, ["postpartum", "perimenopausal", "menopausal", "hormonal_contraception", "hrt"])) {
      scores.hormonal_endocrine_female_pattern += 1;
    }
  }

  if (includesAny(main?.symptoms, INFLAMMATORY_SYMPTOMS)) scores.inflammatory_scalp_disease += 2;
  if (includesAny(medical?.diagnoses, ["scalp_psoriasis", "seborrhoeic_dermatitis", "eczema", "autoimmune_condition"])) {
    scores.inflammatory_scalp_disease += 2;
  }

  if (adaptive?.reportsBrokenHairs === true) scores.traction_mechanical_damage += 2;
  if (adaptive?.tractionSignals?.length) scores.traction_mechanical_damage += 2;
  if (adaptive?.cosmeticSignals?.length) scores.traction_mechanical_damage += 1;

  if (includesAny(medical?.diagnoses, ["iron_deficiency", "low_ferritin", "anaemia", "vitamin_d_deficiency"])) {
    scores.nutritional_deficiency += 2;
  }
  if (includesAny(lifestyle?.dietPattern, ["vegetarian", "vegan", "restrictive_dieting"])) {
    scores.nutritional_deficiency += 1;
  }
  if (adaptive?.recentRapidWeightLoss === true) scores.nutritional_deficiency += 1;

  if (timeline?.trtStatus && timeline.trtStatus !== "no") scores.medication_androgen_exposure += 2;
  if (includesAny(male?.therapies, ["testosterone_replacement_therapy", "anabolic_steroids_or_sarms"])) {
    scores.medication_androgen_exposure += 2;
  }
  if (adaptive?.androgenExposureSignals?.length) scores.medication_androgen_exposure += 1;

  const majorHits = Object.values(scores).filter((score) => score >= 2).length;
  if (majorHits >= 2) scores.mixed_unclear_pattern = 2;
  if (majorHits === 0) scores.mixed_unclear_pattern = 3;

  const ranked = (Object.entries(scores) as Array<[PathwayKey, number]>)
    .sort((a, b) => b[1] - a[1])
    .map(([pathway, score]) => ({ pathway, score, confidence: toBand(score) }));

  const primary_pathway = ranked[0]?.pathway ?? "mixed_unclear_pattern";
  const secondary_pathways = ranked
    .filter((r) => r.pathway !== primary_pathway && r.score >= 2)
    .slice(0, 3)
    .map((r) => r.pathway);

  return {
    primary_pathway,
    secondary_pathways,
    pathway_confidence: ranked,
  };
}

export function getAdaptiveDerivedOutputs(
  responses: LongevityQuestionnaireResponses
): AdaptiveDerivedOutputs {
  const pathway = getPathwayStateFromQuestionnaire(responses);
  const top = pathway.pathway_confidence.slice(0, 3);
  const topPathway = pathway.primary_pathway;

  const red_flags: string[] = [];
  if (responses.adaptiveIntake?.rapidProgressionWeeks === true) red_flags.push("rapid_progression_reported");
  if (includesAny(responses.mainConcern?.symptoms, ["burning", "tenderness"])) red_flags.push("painful_scalp_symptoms");
  if (includesAny(responses.mainConcern?.primaryConcerns, ["patchy_hair_loss"])) red_flags.push("patchy_loss_pattern");

  const possible_drivers = Array.from(
    new Set([
      ...(responses.timelineTriggers?.triggers ?? []),
      ...(responses.medicalHistory?.diagnoses ?? []),
      ...(responses.adaptiveIntake?.stressSignals ?? []),
      ...(responses.adaptiveIntake?.androgenExposureSignals ?? []),
      ...(responses.adaptiveIntake?.tractionSignals ?? []),
      ...(responses.adaptiveIntake?.cosmeticSignals ?? []),
    ])
  );

  const bloodwork_considerations = Array.from(
    new Set([
      "ferritin_and_iron_studies_if_not_recent",
      ...(topPathway === "hormonal_endocrine_female_pattern" ? ["hormonal_panel_contextual"] : []),
      ...(topPathway === "inflammatory_scalp_disease" ? ["inflammation_autoimmune_contextual"] : []),
      ...(topPathway === "nutritional_deficiency" ? ["nutritional_deficiency_screen"] : []),
    ])
  );

  const document_requests = Array.from(
    new Set([
      "recent_blood_test_results_if_available",
      ...(topPathway === "inflammatory_scalp_disease" ? ["scalp_close_up_images"] : []),
      ...(responses.timelineTriggers?.trtStatus && responses.timelineTriggers.trtStatus !== "no"
        ? ["androgen_related_medication_history"]
        : []),
    ])
  );

  const upload_guidance = [
    "front_temporal_crown_photos_under_consistent_lighting",
    "recent_labs_with_collection_dates",
    "letters_or_prescriptions_related_to_hair_or_endocrine_history",
  ];

  const clinician_attention_flags = Array.from(
    new Set([
      ...red_flags,
      ...(pathway.secondary_pathways.length > 0 ? ["multi_pathway_presentation"] : []),
      ...(responses.aboutYou?.sexAtBirth === "prefer_not_to_say" || responses.aboutYou?.sexAtBirth === "intersex"
        ? ["use_neutral_follow_up_language"]
        : []),
    ])
  );

  const confidence_summary = top
    .map((p) => `${p.pathway}:${p.confidence}`)
    .join(" | ");

  return {
    likely_pattern: topPathway,
    possible_drivers,
    red_flags,
    bloodwork_considerations,
    document_requests,
    upload_guidance,
    clinician_attention_flags,
    confidence_summary,
    primary_pathway: pathway.primary_pathway,
    secondary_pathways: pathway.secondary_pathways,
    pathway_confidence: pathway.pathway_confidence,
  };
}

