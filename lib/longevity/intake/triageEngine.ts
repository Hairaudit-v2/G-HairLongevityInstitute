import { INTAKE_QUESTION_BANK_VERSION } from "./questionBank";
import { scorePathways, selectPathways } from "./rules";
import type {
  AdaptiveIntakeEnginePayload,
  IntakeAnswerMap,
  IntakeEngineContext,
  IntakeTriageOutput,
} from "./types";

function valuesOfStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((v): v is string => typeof v === "string");
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function normalizeAdaptiveAnswers(raw: IntakeAnswerMap): IntakeAnswerMap {
  const normalized: IntakeAnswerMap = { ...raw };
  for (const [key, value] of Object.entries(normalized)) {
    if (typeof value === "string") normalized[key] = value.trim().toLowerCase();
    if (Array.isArray(value)) {
      normalized[key] = uniq(value.filter((v): v is string => typeof v === "string").map((v) => v.trim().toLowerCase()));
    }
  }
  return normalized;
}

export function buildIntakeTriageOutput(
  answersRaw: IntakeAnswerMap,
  context: IntakeEngineContext
): IntakeTriageOutput {
  const answers = normalizeAdaptiveAnswers(answersRaw);
  const scored = scorePathways(answers, context);
  const selected = selectPathways(scored);

  const lifestyle = valuesOfStringArray(answers.lifestyle_load);
  const scalp = valuesOfStringArray(answers.scalp_symptom_cluster);
  const mechanical = valuesOfStringArray(answers.mechanical_exposures);

  const redFlags = uniq([
    ...(scalp.includes("pain") || scalp.includes("burning") ? ["symptomatic_scalp_pain_or_burning"] : []),
    ...(answers.presentation_pattern === "mixed_or_unsure" ? ["mixed_or_unclear_presentation"] : []),
  ]);

  const drivers = uniq([
    ...lifestyle,
    ...scalp,
    ...mechanical,
    ...(answers.acute_trigger_window === "yes" ? ["possible_trigger_related_shedding"] : []),
    ...(answers.male_androgen_exposure_context === "yes" ? ["androgen_exposure_context"] : []),
    ...(answers.female_hormonal_context === "yes" ? ["female_hormonal_context"] : []),
  ]);

  return {
    likely_pattern: selected.primary,
    possible_drivers: drivers,
    red_flags: redFlags,
    bloodwork_considerations: uniq([
      "ferritin_iron_if_not_recent",
      ...(selected.primary === "hormonal_endocrine_female_pattern" ? ["hormonal_contextual_panel_if_indicated"] : []),
      ...(selected.primary === "nutritional_deficiency" ? ["nutritional_contextual_markers_if_indicated"] : []),
    ]),
    document_requests: uniq([
      "recent_bloods_if_available",
      "clear_scalp_and_pattern_photos",
      ...(selected.primary === "medication_androgen_exposure" ? ["medication_or_androgen_history_documents_if_available"] : []),
    ]),
    upload_guidance: [
      "front_temporal_crown_images_consistent_lighting",
      "lab_reports_with_dates",
      "prior_specialist_letters_if_available",
    ],
    clinician_attention_flags: uniq([
      ...redFlags,
      ...(selected.secondary.length > 0 ? ["multi_pathway_overlap"] : []),
      ...(context.sexAtBirth === "intersex" || context.sexAtBirth === "prefer_not_to_say"
        ? ["use_neutral_follow_up_language"]
        : []),
    ]),
    confidence_summary: scored
      .slice(0, 3)
      .map((s) => `${s.pathway}:${s.confidence}`)
      .join(" | "),
    primary_pathway: selected.primary,
    secondary_pathways: selected.secondary,
    pathway_confidence: scored,
  };
}

export function buildAdaptivePayload(
  answersRaw: IntakeAnswerMap,
  context: IntakeEngineContext
): AdaptiveIntakeEnginePayload {
  const answers = normalizeAdaptiveAnswers(answersRaw);
  return {
    schemaVersion: INTAKE_QUESTION_BANK_VERSION,
    answers,
    triage: buildIntakeTriageOutput(answers, context),
  };
}

