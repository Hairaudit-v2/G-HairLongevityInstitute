import { LONGEVITY_DOC_TYPE } from "@/lib/longevity/documentTypes";
import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";
import type { AdaptiveRescoreComparison } from "@/lib/longevity/intake";

export type ReassessmentSignalId =
  | "new_documents_received"
  | "bloodwork_received"
  | "image_quality_improved"
  | "pattern_needs_rereview"
  | "original_uncertainty_reduced"
  | "follow_up_still_incomplete";

export type ReassessmentSignal = {
  id: ReassessmentSignalId;
  active: boolean;
  label: string;
  detail: string;
};

export type ReassessmentSummary = {
  ready_for_reassessment: boolean;
  comparison_anchor_at: string | null;
  has_new_information: boolean;
  operational_summary: string;
  next_step: string;
  signals: ReassessmentSignal[];
};

export type ReassessmentDocument = {
  doc_type: string;
  created_at: string;
};

type ReassessmentInput = {
  adaptive_triage: AdaptiveDerivedSummary | null | undefined;
  adaptive_rescore_comparison: AdaptiveRescoreComparison | null | undefined;
  documents: ReassessmentDocument[];
  review_outcome: string | null | undefined;
  first_review_note_at: string | null | undefined;
  intake_created_at: string | null | undefined;
  scalp_image_comparison: {
    comparisonLimitedByImageQuality?: boolean;
    canCompare?: boolean;
    currentPhotoCount?: number;
    previousPhotoCount?: number;
  } | null | undefined;
};

function isAfterAnchor(isoDate: string, anchor: string | null): boolean {
  if (!anchor) return true;
  const d = Date.parse(isoDate);
  const a = Date.parse(anchor);
  if (Number.isNaN(d) || Number.isNaN(a)) return false;
  return d > a;
}

function includesAny(values: string[], keys: string[]): boolean {
  return keys.some((key) => values.includes(key));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function buildReassessmentSummary(input: ReassessmentInput): ReassessmentSummary {
  const anchor = input.first_review_note_at ?? input.intake_created_at ?? null;
  const docs = input.documents ?? [];
  const newDocs = docs.filter((doc) => isAfterAnchor(doc.created_at, anchor));
  const newBloodworkDocs = newDocs.filter(
    (doc) => doc.doc_type === LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD
  );
  const newScalpPhotos = newDocs.filter(
    (doc) => doc.doc_type === LONGEVITY_DOC_TYPE.SCALP_PHOTO
  );

  const triage = input.adaptive_triage;
  const flags = asStringArray(triage?.clinician_attention_flags);
  const uploadGuidance = asStringArray(triage?.upload_guidance);
  const redFlags = asStringArray(triage?.red_flags);
  const deltaChanged = input.adaptive_rescore_comparison?.changed === true;
  const uncertaintyReduced: boolean =
    deltaChanged &&
    !!input.adaptive_rescore_comparison?.changed_fields.includes(
      "clinician_attention_flags"
    ) &&
    (input.adaptive_rescore_comparison.stored_clinician_attention_flags.length >
      input.adaptive_rescore_comparison.current_clinician_attention_flags.length ||
      input.adaptive_rescore_comparison.stored_red_flags.length >
        input.adaptive_rescore_comparison.current_red_flags.length);

  const patternNeedsReReview =
    deltaChanged ||
    includesAny(redFlags, ["rapid_patchy_loss", "painful_inflamed_scalp"]) ||
    includesAny(flags, ["possible_traction_pattern", "possible_postpartum_shedding"]);

  const imageQualityImproved: boolean =
    (newScalpPhotos.length > 0 &&
      input.scalp_image_comparison?.comparisonLimitedByImageQuality === false) ||
    ((input.scalp_image_comparison?.currentPhotoCount ?? 0) >
      (input.scalp_image_comparison?.previousPhotoCount ?? 0) &&
      input.scalp_image_comparison?.canCompare === true);

  const followUpIncomplete: boolean =
    input.review_outcome === "awaiting_patient_documents" ||
    (newDocs.length === 0 && includesAny(uploadGuidance, ["center_part", "top_down"]));

  const signals: ReassessmentSignal[] = [
    {
      id: "new_documents_received",
      active: newDocs.length > 0,
      label: "New documents received",
      detail:
        newDocs.length > 0
          ? `${newDocs.length} document(s) added after initial review context.`
          : "No new uploads since initial review context.",
    },
    {
      id: "bloodwork_received",
      active: newBloodworkDocs.length > 0,
      label: "Bloodwork received",
      detail:
        newBloodworkDocs.length > 0
          ? "Bloodwork upload(s) are available for review."
          : "No new bloodwork upload detected.",
    },
    {
      id: "image_quality_improved",
      active: imageQualityImproved,
      label: "Image quality improved",
      detail: imageQualityImproved
        ? "Scalp-photo context appears stronger for pattern reassessment."
        : "No clear evidence yet that photo quality/comparability has improved.",
    },
    {
      id: "pattern_needs_rereview",
      active: patternNeedsReReview,
      label: "Symptoms/pattern need re-review",
      detail: patternNeedsReReview
        ? "Adaptive signals suggest reviewing pattern interpretation again."
        : "No strong adaptive pattern-change signal detected.",
    },
    {
      id: "original_uncertainty_reduced",
      active: uncertaintyReduced,
      label: "Original uncertainty reduced",
      detail: uncertaintyReduced
        ? "Current adaptive interpretation has fewer cautionary flags than stored baseline."
        : "No clear reduction in adaptive uncertainty signal yet.",
    },
    {
      id: "follow_up_still_incomplete",
      active: followUpIncomplete,
      label: "Follow-up still incomplete",
      detail: followUpIncomplete
        ? "Additional context may still be needed before final reassessment closure."
        : "Current context appears sufficient for reassessment completion.",
    },
  ];

  const hasNewInformation: boolean =
    newDocs.length > 0 || deltaChanged || imageQualityImproved || uncertaintyReduced;
  const readyForReassessment: boolean =
    hasNewInformation && (newBloodworkDocs.length > 0 || imageQualityImproved || deltaChanged);

  return {
    ready_for_reassessment: readyForReassessment,
    comparison_anchor_at: anchor,
    has_new_information: hasNewInformation,
    operational_summary: readyForReassessment
      ? "New follow-up context is available and the case appears ready for clinician reassessment."
      : "Follow-up context is limited; continue collecting or validating evidence before closure.",
    next_step: readyForReassessment
      ? "Reassess now, then update the patient-visible summary if appropriate."
      : "Keep reassessment pending and request the highest-value missing inputs.",
    signals,
  };
}

