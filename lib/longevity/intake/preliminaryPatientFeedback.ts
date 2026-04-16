import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

import { buildLongevityAdaptivePayload } from "./buildLongevityAdaptivePayload";

export type PreliminaryPatientFeedbackCardId =
  | "hormonal_review"
  | "thyroid_review"
  | "iron_nutrition_review"
  | "androgen_review"
  | "scalp_review"
  | "trigger_review"
  | "pituitary_followup"
  | "pattern_clarification"
  | "bloodwork_followup"
  | "clinical_correlation";

export type PreliminaryPatientFeedbackCard = {
  id: PreliminaryPatientFeedbackCardId;
  title: string;
  body: string;
  matchedSignals: string[];
};

export type PreliminaryPatientFeedback = {
  headline: string;
  summary: string;
  cards: PreliminaryPatientFeedbackCard[];
  nextSteps: string[];
  disclaimer: string;
  supportedSignals: string[];
};

type EvaluationContext = {
  responses: LongevityQuestionnaireResponses;
  adaptiveAnswers: Record<string, string | string[] | boolean | number | null | undefined>;
  primaryPathway?: string;
  secondaryPathways: string[];
};

type CardDefinition = {
  id: PreliminaryPatientFeedbackCardId;
  title: string;
  summaryLabel: string;
  body: string;
  evaluate: (context: EvaluationContext) => string[];
};

function has(arr: string[] | undefined, ...keys: string[]): boolean {
  if (!arr?.length) return false;
  return keys.some((key) => arr.includes(key));
}

function isYes(value: unknown): boolean {
  return value === true || value === "yes";
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function hasPathway(context: EvaluationContext, ...pathways: string[]): boolean {
  return pathways.some(
    (pathway) =>
      context.primaryPathway === pathway || context.secondaryPathways.includes(pathway)
  );
}

function formatNaturalList(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

const CARD_DEFINITIONS: CardDefinition[] = [
  {
    id: "hormonal_review",
    title: "Hormonal context may need review",
    summaryLabel: "hormonal contributors",
    body:
      "Some of what you shared overlaps with female endocrine hair-loss patterns, including cycle disruption, postpartum or menopause-related change, or androgen-sensitive features such as jawline acne or increased facial/body hair. This does not confirm the cause, but it makes endocrine review more relevant.",
    evaluate: ({ responses, adaptiveAnswers, primaryPathway, secondaryPathways }) => {
      const femaleHistory = responses.femaleHistory;
      const medicalHistory = responses.medicalHistory;
      const timeline = responses.timelineTriggers;
      const signals: string[] = [];

      if (
        femaleHistory?.cycles === "irregular" ||
        femaleHistory?.cycles === "not_occurring"
      ) {
        signals.push("cycle_irregularity");
      }
      if (femaleHistory?.cycleChangeAroundHairChange === "yes") {
        signals.push("cycle_change_timing");
      }
      if (
        has(
          femaleHistory?.features,
          "missed_periods",
          "acne",
          "increased_facial_or_body_hair",
          "fertility_issues"
        )
      ) {
        signals.push("female_hormonal_features");
      }
      if (femaleHistory?.newWorseningHyperandrogenFeatures === "yes") {
        signals.push("new_worsening_hyperandrogen_features");
      }
      if (
        has(
          femaleHistory?.lifeStage,
          "postpartum",
          "perimenopausal",
          "menopausal",
          "hormonal_contraception",
          "hrt"
        )
      ) {
        signals.push("female_life_stage");
      }
      if (
        has(
          timeline?.triggers,
          "childbirth_postpartum",
          "starting_contraception",
          "stopping_contraception",
          "menopause_perimenopause"
        )
      ) {
        signals.push("timing_hormonal_trigger");
      }
      if (has(medicalHistory?.diagnoses, "pcos", "endometriosis")) {
        signals.push("known_hormonal_diagnosis");
      }
      if (
        isYes(adaptiveAnswers.female_hormonal_context) ||
        isYes(adaptiveAnswers.postpartum_recent)
      ) {
        signals.push("adaptive_hormonal_context");
      }
      if (
        primaryPathway === "female_hormonal_pattern" ||
        primaryPathway === "postpartum_pattern" ||
        secondaryPathways.includes("female_hormonal_pattern") ||
        secondaryPathways.includes("postpartum_pattern")
      ) {
        signals.push("adaptive_pathway_signal");
      }

      return uniq(signals);
    },
  },
  {
    id: "thyroid_review",
    title: "Thyroid or metabolic factors may need review",
    summaryLabel: "thyroid or metabolic contributors",
    body:
      "Diffuse thinning or shedding alongside fatigue, cold intolerance, weight change, or thyroid history can justify thyroid-focused review. If recent thyroid testing is not available, it may be requested as part of the next step.",
    evaluate: (context) => {
      const medicalHistory = context.responses.medicalHistory;
      const signals: string[] = [];

      if (
        has(
          medicalHistory?.currentSymptoms,
          "fatigue",
          "cold_intolerance",
          "brain_fog",
          "weight_change",
          "palpitations"
        )
      ) {
        signals.push("thyroid_related_symptoms");
      }
      if (has(medicalHistory?.diagnoses, "thyroid_disorder")) {
        signals.push("known_thyroid_history");
      }
      if (has(medicalHistory?.familyHistory, "thyroid_disease")) {
        signals.push("family_thyroid_history");
      }
      if (hasPathway(context, "thyroid_metabolic_pattern")) {
        signals.push("adaptive_pathway_signal");
      }

      return uniq(signals);
    },
  },
  {
    id: "iron_nutrition_review",
    title: "Iron, ferritin, or nutritional contributors may need review",
    summaryLabel: "iron or nutritional contributors",
    body:
      "Iron/ferritin status, protein intake, vitamin levels, or recent dietary change can sometimes influence shedding or diffuse thinning. If your bloods are not recent, targeted tests may be requested to rule this in or out.",
    evaluate: (context) => {
      const medicalHistory = context.responses.medicalHistory;
      const lifestyle = context.responses.lifestyleTreatments;
      const timeline = context.responses.timelineTriggers;
      const signals: string[] = [];

      if (
        has(
          medicalHistory?.diagnoses,
          "iron_deficiency",
          "low_ferritin",
          "anaemia",
          "vitamin_d_deficiency"
        )
      ) {
        signals.push("known_nutritional_history");
      }
      if (
        medicalHistory?.priorBloodTests === "no" ||
        medicalHistory?.priorBloodTests === "older_than_3_months"
      ) {
        signals.push("bloods_not_recent");
      }
      if (lifestyle?.enoughProtein === "no") {
        signals.push("low_protein_intake");
      }
      if (has(timeline?.triggers, "rapid_weight_loss", "dietary_change")) {
        signals.push("dietary_trigger");
      }
      if (has(timeline?.pastYearEvents, "crash_dieting")) {
        signals.push("recent_restrictive_dieting");
      }
      if (hasPathway(context, "nutritional_deficiency_pattern")) {
        signals.push("adaptive_pathway_signal");
      }

      return uniq(signals);
    },
  },
  {
    id: "androgen_review",
    title: "Androgen-related pattern loss may need review",
    summaryLabel: "androgen-sensitive pattern loss",
    body:
      "Frontal recession, crown thinning, widening through the top, or a strong family pattern can fit androgen-sensitive hair loss patterns. That still needs clinical confirmation, but it is important enough to review carefully.",
    evaluate: (context) => {
      const mainConcern = context.responses.mainConcern;
      const medicalHistory = context.responses.medicalHistory;
      const maleHistory = context.responses.maleHistory;
      const signals: string[] = [];

      if (
        has(
          mainConcern?.primaryConcerns,
          "frontal_hairline_recession",
          "temple_recession",
          "crown_thinning",
          "widening_part",
          "diffuse_thinning"
        )
      ) {
        signals.push("pattern_distribution");
      }
      if (
        has(
          mainConcern?.affectedAreas,
          "frontal_hairline",
          "temples",
          "crown",
          "part_line"
        )
      ) {
        signals.push("affected_areas");
      }
      if (
        has(
          medicalHistory?.familyHistory,
          "male_pattern_hair_loss",
          "female_pattern_thinning"
        )
      ) {
        signals.push("family_pattern_history");
      }
      if (
        has(
          maleHistory?.therapies,
          "testosterone_replacement_therapy",
          "anabolic_steroids_or_sarms"
        )
      ) {
        signals.push("androgen_exposure_context");
      }
      if (
        context.adaptiveAnswers.current_or_past_trt === true ||
        context.adaptiveAnswers.sarms_or_anabolics === true ||
        context.adaptiveAnswers.testosterone_boosters === true
      ) {
        signals.push("adaptive_androgen_exposure");
      }
      if (
        hasPathway(
          context,
          "androgenic_pattern",
          "male_androgen_exposure_pattern"
        )
      ) {
        signals.push("adaptive_pathway_signal");
      }

      return uniq(signals);
    },
  },
  {
    id: "scalp_review",
    title: "Scalp health or inflammatory causes may need review",
    summaryLabel: "scalp or inflammatory contributors",
    body:
      "Itch, flaking, soreness, burning, or known scalp conditions can point to scalp-health factors that need direct review. This is one reason photos or clinician examination can materially change the interpretation.",
    evaluate: (context) => {
      const mainConcern = context.responses.mainConcern;
      const medicalHistory = context.responses.medicalHistory;
      const signals: string[] = [];

      if (
        has(
          mainConcern?.primaryConcerns,
          "scalp_irritation_or_inflammation"
        )
      ) {
        signals.push("scalp_primary_concern");
      }
      if (
        has(
          mainConcern?.symptoms,
          "itch",
          "burning",
          "tenderness",
          "flaking",
          "greasiness"
        )
      ) {
        signals.push("scalp_symptoms");
      }
      if (
        has(
          medicalHistory?.diagnoses,
          "scalp_psoriasis",
          "seborrhoeic_dermatitis",
          "eczema"
        )
      ) {
        signals.push("known_scalp_condition");
      }
      if (hasPathway(context, "inflammatory_scalp_pattern")) {
        signals.push("adaptive_pathway_signal");
      }

      return uniq(signals);
    },
  },
  {
    id: "trigger_review",
    title: "Stress-, illness-, or medication-related shedding may need review",
    summaryLabel: "trigger-related shedding",
    body:
      "When shedding follows major stress, illness, surgery, postpartum change, or medication change, a trigger-related shedding pattern becomes more plausible. If the timeline is delayed by a few months after a body-level stressor, that can still fit trigger-related shedding, but it may need review alongside other endocrine or metabolic contributors.",
    evaluate: (context) => {
      const mainConcern = context.responses.mainConcern;
      const timeline = context.responses.timelineTriggers;
      const medicalHistory = context.responses.medicalHistory;
      const lifestyle = context.responses.lifestyleTreatments;
      const signals: string[] = [];

      if (
        mainConcern?.onsetPattern === "sudden" ||
        has(mainConcern?.primaryConcerns, "increased_shedding")
      ) {
        signals.push("sudden_or_shedding_presentation");
      }
      if (
        has(
          timeline?.triggers,
          "major_stress",
          "recent_illness_or_infection",
          "fever",
          "surgery_or_anaesthetic",
          "childbirth_postpartum",
          "new_medication",
          "stopping_medication",
          "rapid_weight_loss"
        )
      ) {
        signals.push("clear_timeline_trigger");
      }
      if (
        has(
          timeline?.pastYearEvents,
          "covid_or_major_viral_illness",
          "hospital_admission",
          "significant_emotional_stress"
        )
      ) {
        signals.push("recent_major_event");
      }
      if (
        has(
          medicalHistory?.currentSymptoms,
          "anxiety_or_stress_overload",
          "poor_sleep"
        )
      ) {
        signals.push("stress_related_symptoms");
      }
      if ((lifestyle?.stressScore ?? 0) >= 7) {
        signals.push("high_stress_score");
      }
      if (context.adaptiveAnswers.stress_shedding_delay_pattern === "yes") {
        signals.push("delayed_trigger_timing");
      }
      if (
        hasPathway(
          context,
          "telogen_effluvium_acute",
          "telogen_effluvium_chronic",
          "medication_induced_pattern",
          "postpartum_pattern"
        )
      ) {
        signals.push("adaptive_pathway_signal");
      }

      return uniq(signals);
    },
  },
  {
    id: "pituitary_followup",
    title: "A few answers deserve more direct clinician follow-up",
    summaryLabel: "additional clinician follow-up",
    body:
      "When period interruption sits alongside symptoms such as milky nipple discharge, new severe headaches, or visual change, we do not treat that as routine shedding alone. This still does not point to one diagnosis, but it does make more direct clinician follow-up important.",
    evaluate: (context) => {
      const femaleHistory = context.responses.femaleHistory;
      const signals: string[] = [];

      if (context.adaptiveAnswers.pituitary_red_flag_followup !== "yes") return [];

      signals.push("pituitary_style_followup_prompt");
      if (
        femaleHistory?.cycles === "not_occurring" ||
        has(femaleHistory?.features, "missed_periods")
      ) {
        signals.push("missing_periods_context");
      }
      if (femaleHistory?.cycleChangeAroundHairChange === "yes") {
        signals.push("cycle_change_timing_context");
      }

      return uniq(signals);
    },
  },
  {
    id: "pattern_clarification",
    title: "Pattern confirmation still matters before any diagnosis",
    summaryLabel: "pattern clarification",
    body:
      "Early questionnaires often suggest overlapping contributors rather than one single cause. Pattern confirmation usually depends on the full history, scalp distribution, any images, and whether the presentation stays consistent after review.",
    evaluate: (context) => {
      const signals: string[] = [];
      if (
        hasPathway(context, "mixed_pattern", "unclear_pattern") ||
        context.responses.mainConcern?.patternConfidence === "mixed_or_unsure" ||
        context.responses.mainConcern?.patternConfidence === "prefer_not_to_say"
      ) {
        signals.push("mixed_or_unclear_pattern");
      }
      return uniq(signals);
    },
  },
  {
    id: "bloodwork_followup",
    title: "Blood tests may still be requested",
    summaryLabel: "targeted bloodwork follow-up",
    body:
      "If recent blood tests are not already available, targeted bloodwork may be requested to help distinguish between overlapping causes such as thyroid involvement, iron/ferritin issues, nutritional gaps, or hormone-related contributors.",
    evaluate: (context) => {
      const medicalHistory = context.responses.medicalHistory;
      const uploads = context.responses.uploadsNextSteps;
      const signals: string[] = [];

      if (
        medicalHistory?.priorBloodTests === "no" ||
        medicalHistory?.priorBloodTests === "older_than_3_months" ||
        uploads?.currentBloodStatus === "not_done" ||
        uploads?.currentBloodStatus === "upload_later" ||
        uploads?.currentBloodStatus === "unsure"
      ) {
        signals.push("bloodwork_not_ready");
      }

      return uniq(signals);
    },
  },
  {
    id: "clinical_correlation",
    title: "More than one contributor may be overlapping",
    summaryLabel: "overlapping contributors",
    body:
      "Hair loss often reflects more than one process at the same time. Part of the next step is separating the main pattern from secondary contributors so the final interpretation is clinically useful rather than overly simplistic.",
    evaluate: (context) => {
      if (
        hasPathway(context, "mixed_pattern", "unclear_pattern") ||
        (context.responses.mainConcern?.primaryConcerns?.length ?? 0) > 1
      ) {
        return ["overlap_or_mixed_context"];
      }
      return [];
    },
  },
];

function sortCards(
  cards: Array<PreliminaryPatientFeedbackCard & { summaryLabel: string }>
): Array<PreliminaryPatientFeedbackCard & { summaryLabel: string }> {
  return [...cards].sort((a, b) => {
    if (b.matchedSignals.length !== a.matchedSignals.length) {
      return b.matchedSignals.length - a.matchedSignals.length;
    }
    return a.title.localeCompare(b.title);
  });
}

function buildSummary(
  cards: Array<PreliminaryPatientFeedbackCard & { summaryLabel: string }>
): string {
  const labels = uniq(cards.map((card) => card.summaryLabel)).slice(0, 3);
  if (labels.length === 0) {
    return "You have provided enough detail for an early structured review, but the pattern still needs full clinical correlation before any conclusion is made.";
  }
  const list = formatNaturalList(labels);
  return `You have already given enough information for an early structured clinical impression. At this stage, the strongest signals point toward ${list} as areas worth clarifying next, rather than a confirmed diagnosis.`;
}

function buildNextSteps(
  responses: LongevityQuestionnaireResponses,
  cards: PreliminaryPatientFeedbackCard[]
): string[] {
  const needsBloodReview =
    cards.some((card) =>
      ["hormonal_review", "thyroid_review", "iron_nutrition_review", "bloodwork_followup"].includes(
        card.id
      )
    ) ||
    responses.medicalHistory?.priorBloodTests !== "last_3_months";

  const uploads = responses.uploadsNextSteps;
  const hasBloodsNow = uploads?.currentBloodStatus === "uploading_now";

  return [
    "Complete and submit this intake so your answers can be reviewed in the context of your full clinical history.",
    hasBloodsNow
      ? "If you are uploading bloods or photos now, they can help the review move from an early impression toward a more confident interpretation."
      : needsBloodReview
        ? "If you do not already have recent blood tests, targeted bloodwork may be requested to clarify the most likely contributors."
        : "If you already have recent blood tests, scalp photos, or prior letters, you can upload them now or later in the portal to strengthen the review.",
    "Your final plan is built after full history review, any relevant testing, and clinical interpretation of the whole picture.",
  ];
}

export function getPreliminaryPatientFeedback(
  responses: LongevityQuestionnaireResponses
): PreliminaryPatientFeedback {
  const payload = buildLongevityAdaptivePayload(responses);
  const context: EvaluationContext = {
    responses,
    adaptiveAnswers: payload.adaptive_answers,
    primaryPathway: payload.adaptive_triage_output.primary_pathway,
    secondaryPathways: payload.adaptive_triage_output.secondary_pathways ?? [],
  };

  const matched = CARD_DEFINITIONS.map((card) => {
    const matchedSignals = card.evaluate(context);
    return matchedSignals.length > 0
      ? {
          id: card.id,
          title: card.title,
          body: card.body,
          matchedSignals,
          summaryLabel: card.summaryLabel,
        }
      : null;
  }).filter(
    (
      card
    ): card is PreliminaryPatientFeedbackCard & { summaryLabel: string } => card != null
  );

  const sorted = sortCards(matched);
  const selected = [...sorted];

  for (const fallbackId of [
    "pattern_clarification",
    "bloodwork_followup",
    "clinical_correlation",
  ] as const) {
    if (selected.length >= 4) break;
    if (selected.some((card) => card.id === fallbackId)) continue;
    const fallback = CARD_DEFINITIONS.find((card) => card.id === fallbackId);
    if (!fallback) continue;
    const fallbackSignals = fallback.evaluate(context);
    selected.push({
      id: fallback.id,
      title: fallback.title,
      body: fallback.body,
      matchedSignals: fallbackSignals.length > 0 ? fallbackSignals : ["review_context"],
      summaryLabel: fallback.summaryLabel,
    });
  }

  const cards = selected.slice(0, 4);

  return {
    headline: "Preliminary review based on the information provided so far",
    summary: buildSummary(cards),
    cards: cards.map(({ summaryLabel: _summaryLabel, ...card }) => card),
    nextSteps: buildNextSteps(responses, cards),
    disclaimer:
      "This is not a confirmed diagnosis. Final interpretation depends on your full history, any relevant testing, uploaded material, and clinical review.",
    supportedSignals: uniq(cards.flatMap((card) => card.matchedSignals)),
  };
}
