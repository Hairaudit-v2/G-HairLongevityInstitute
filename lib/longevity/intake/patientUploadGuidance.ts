import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import type { AdaptiveAnswers, BloodworkConsiderationId, PathwayId, UploadGuideId } from "@/src/lib/longevity/intake";
import { ADAPTIVE_UPLOAD_GUIDANCE_PATIENT_HINTS } from "@/src/lib/longevity/intake/adaptiveUploadGuidance";

import { buildLongevityAdaptivePayload } from "./buildLongevityAdaptivePayload";

export type PatientUploadGuidanceView = {
  /** Short photo suggestions from v2 triage upload_guidance (capped). */
  photoHints: string[];
  /** Helper line for the blood upload row (tailored or default). */
  bloodHelperText: string;
  /** Up to two optional document tips (medications, letters, etc.). */
  documentHints: string[];
  /** True when medication/androgen context was used to tailor document hints. */
  highlightMedicationUploads: boolean;
};

const DEFAULT_BLOOD_HELPER =
  "Helpful if available: ferritin, iron studies, thyroid (TSH), vitamin D, and other relevant results. You can upload now or add them later in the portal.";

const BLOOD_PATIENT_PHRASES: Partial<Record<BloodworkConsiderationId, string>> = {
  iron_studies: "iron studies or ferritin",
  thyroid_panel: "thyroid tests (for example TSH)",
  vitamin_d: "vitamin D",
  b12_folate: "B12 or folate",
  androgen_hormone_review_if_clinically_appropriate: "hormone tests your clinician has mentioned",
  metabolic_review_if_clinically_appropriate: "metabolic blood tests your clinician has arranged",
};

const MEDICATION_DOC_HINT =
  "If medicines, hormones, or supplements changed recently, a simple list or a photo of prescription labels can help the team see timing and doses—only if you already have this.";

const INFLAMMATORY_DOC_HINT =
  "Past letters or results about your scalp from a GP or dermatologist are welcome if you have them—not required.";

const TRACTION_DOC_HINT =
  "If you are comfortable, photos that show how you usually wear your hair can sometimes add context.";

const PATCHY_DOC_HINT =
  "If you have older photos that show how a patch changed over time, they can sit alongside current pictures—optional.";

function formatNaturalList(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

function mapPhotoHints(uploadGuides: readonly string[], max: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of uploadGuides) {
    const hint = ADAPTIVE_UPLOAD_GUIDANCE_PATIENT_HINTS[id as UploadGuideId];
    if (!hint || seen.has(hint)) continue;
    seen.add(hint);
    out.push(hint);
    if (out.length >= max) break;
  }
  return out;
}

function buildBloodHelper(bloodIds: readonly string[]): string {
  if (!bloodIds.length) return DEFAULT_BLOOD_HELPER;
  const labels: string[] = [];
  for (const id of bloodIds) {
    const phrase = BLOOD_PATIENT_PHRASES[id as BloodworkConsiderationId];
    if (phrase) labels.push(phrase);
  }
  if (!labels.length) return DEFAULT_BLOOD_HELPER;
  const list = formatNaturalList(labels.slice(0, 4));
  return `Based on what you shared, recent results that include ${list} are especially useful if you already have them. Other recent labs are welcome too. You can upload now or add them later in the portal.`;
}

function buildDocumentHints(
  answers: AdaptiveAnswers,
  primary: PathwayId,
  secondary: readonly PathwayId[]
): { hints: string[]; medicationContext: boolean } {
  const hints: string[] = [];
  const secondarySet = new Set(secondary);

  const medSignal =
    answers.medication_change_recently === true || answers.medication_hormone_change_recent === "yes";
  const androgenSignal =
    answers.current_or_past_trt === true ||
    answers.sarms_or_anabolics === true ||
    answers.testosterone_boosters === true ||
    answers.peptides_or_growth_agents === true;

  const medicationContext = medSignal || androgenSignal;

  if (medicationContext) {
    hints.push(MEDICATION_DOC_HINT);
  }

  if (
    hints.length < 2 &&
    (primary === "inflammatory_scalp_pattern" || secondarySet.has("inflammatory_scalp_pattern"))
  ) {
    hints.push(INFLAMMATORY_DOC_HINT);
  }

  if (
    hints.length < 2 &&
    (primary === "traction_mechanical_pattern" || secondarySet.has("traction_mechanical_pattern"))
  ) {
    hints.push(TRACTION_DOC_HINT);
  }

  if (
    hints.length < 2 &&
    (answers.chief_concern === "patchy_loss" ||
      primary === "mixed_pattern" ||
      primary === "unclear_pattern")
  ) {
    hints.push(PATCHY_DOC_HINT);
  }

  return { hints: hints.slice(0, 2), medicationContext };
}

/**
 * Patient-facing upload suggestions from v2 adaptive triage + answers.
 * Wording stays non-diagnostic; all uploads remain optional.
 */
export function getPatientUploadGuidance(
  responses: LongevityQuestionnaireResponses | undefined
): PatientUploadGuidanceView {
  const payload = buildLongevityAdaptivePayload(responses ?? {});
  const triage = payload.adaptive_triage_output;
  const answers = payload.adaptive_answers;

  const photoHints = mapPhotoHints(triage.upload_guidance ?? [], 5);
  const bloodHelperText = buildBloodHelper(triage.bloodwork_considerations ?? []);
  const { hints: documentHints, medicationContext } = buildDocumentHints(
    answers,
    triage.primary_pathway,
    triage.secondary_pathways ?? []
  );

  return {
    photoHints,
    bloodHelperText,
    documentHints,
    highlightMedicationUploads: medicationContext,
  };
}
