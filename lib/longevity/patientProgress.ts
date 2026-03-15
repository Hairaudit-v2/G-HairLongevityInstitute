/**
 * Phase T: Patient-facing progress states for dashboard.
 * Longevity-only. Safe, high-level states derived from workflow snapshot and documents.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { LONGEVITY_DOC_TYPE } from "./documentTypes";
import { getBloodRequestByIntake } from "./bloodRequests";
import { getInterpretedMarkersForIntake } from "./bloodResultMarkers";
import { generateFollowUpCadence } from "./followUpCadence";
import { getCaseComparisonForIntake } from "./caseComparison";

export type PatientProgressState = {
  blood_results_uploaded: boolean;
  follow_up_completed: boolean;
  scalp_images_reviewed: boolean;
  clinician_summary_released: boolean;
  next_review_timing: string | null;
};

export type PatientProgressResult = {
  /** Latest submitted intake id (for reference; optional to expose) */
  latest_intake_id: string | null;
  /** High-level progress states */
  progress: PatientProgressState;
};

/**
 * Get patient-facing progress for a profile. Uses latest submitted intake by created_at.
 * Deterministic, safe for patient dashboard.
 */
export async function getPatientProgressForProfile(
  supabase: SupabaseClient,
  profileId: string
): Promise<PatientProgressResult> {
  const { data: latestIntake } = await supabase
    .from("hli_longevity_intakes")
    .select("id, status, created_at, patient_visible_released_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestIntake) {
    return {
      latest_intake_id: null,
      progress: {
        blood_results_uploaded: false,
        follow_up_completed: false,
        scalp_images_reviewed: false,
        clinician_summary_released: false,
        next_review_timing: null,
      },
    };
  }

  const intakeId = latestIntake.id;
  const followUpCompleted = latestIntake.status === "submitted";
  const clinicianSummaryReleased = !!latestIntake.patient_visible_released_at;

  const [{ data: docs }, bloodRequest, caseComparison] = await Promise.all([
    supabase
      .from("hli_longevity_documents")
      .select("doc_type")
      .eq("intake_id", intakeId),
    getBloodRequestByIntake(supabase, intakeId),
    getCaseComparisonForIntake(supabase, profileId, intakeId),
  ]);

  const docList = docs ?? [];
  const hasBloodUpload = docList.some((d) => d.doc_type === LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD);
  const interpretedMarkers = await getInterpretedMarkersForIntake(supabase, intakeId);
  const hasStructuredMarkers = interpretedMarkers.length > 0;
  const bloodResultsUploaded = hasBloodUpload || hasStructuredMarkers;

  const hasScalpPhotos = docList.some((d) => d.doc_type === LONGEVITY_DOC_TYPE.SCALP_PHOTO);
  const scalpComparisonDone =
    caseComparison?.scalpImageComparison?.comparisonStatus != null &&
    caseComparison.scalpImageComparison.comparisonStatus !== "pending_review";
  const scalpImagesReviewed = clinicianSummaryReleased && (hasScalpPhotos || scalpComparisonDone);

  const cadence = generateFollowUpCadence({
    carePlan: null,
    reviewOutcome: null,
    bloodRequest: bloodRequest
      ? {
          status: bloodRequest.status,
          created_at: bloodRequest.created_at,
          updated_at: bloodRequest.updated_at,
          approved_at: bloodRequest.approved_at,
        }
      : null,
    hasBloodResultUploadDocument: hasBloodUpload,
    hasStructuredMarkers: !!bloodRequest && hasStructuredMarkers,
    hasNewerSubmittedIntake: false,
    scalpPhotoFollowUpRecommended: false,
    intakeCreatedAt: latestIntake.created_at,
    lastReviewedAt: null,
    patientVisibleReleasedAt: latestIntake.patient_visible_released_at ?? null,
  });

  const nextReviewTiming =
    cadence.suggestedDueWindow ||
    (cadence.patientReminderText && cadence.patientReminderText[0]) ||
    null;

  return {
    latest_intake_id: intakeId,
    progress: {
      blood_results_uploaded: bloodResultsUploaded,
      follow_up_completed: followUpCompleted,
      scalp_images_reviewed: scalpImagesReviewed,
      clinician_summary_released: clinicianSummaryReleased,
      next_review_timing: nextReviewTiming,
    },
  };
}
