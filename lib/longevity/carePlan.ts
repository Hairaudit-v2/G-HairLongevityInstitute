/**
 * Phase M: Care plan / next-step engine. Deterministic, rule-based only.
 * Consumes current case state and longitudinal comparison to produce
 * structured next-step recommendations for clinicians and patient-safe copy for the portal.
 * No AI; additive within longevity namespace.
 */

import type { ClinicalInsights } from "./clinicalInsights";
import type { CaseComparisonResult } from "./caseComparison";
import type { InterpretedMarker } from "./bloodInterpretation";
import type { MarkerTrendRow } from "./bloodMarkerTrends";
import { REVIEW_OUTCOME } from "./reviewConstants";

const OUTSIDE_STATUSES = ["low", "high", "critical"] as const;

/** Inputs for the care plan engine. All optional to support partial context. */
export type CarePlanInput = {
  /** Current vs previous intake comparison (null if no previous). */
  caseComparison?: CaseComparisonResult | null;
  /** Precomputed clinical insights for this case. */
  clinicalInsights?: ClinicalInsights | null;
  /** Interpreted blood markers for current intake. */
  interpretedMarkers?: InterpretedMarker[] | null;
  /** Current vs previous marker trends. */
  markerTrends?: MarkerTrendRow[] | null;
  /** Blood request state for this intake. */
  bloodRequest?: { status: string | null } | null;
  /** Review outcome set by clinician. */
  reviewOutcome?: string | null;
  /** Whether a blood result document has been uploaded (before structured entry). */
  hasBloodResultUploadDocument?: boolean;
  /** Whether structured blood markers exist for this intake. */
  hasStructuredMarkers?: boolean;
  /** If false, no submitted intake exists after this one (so follow-up reassessment can be suggested). */
  hasNewerSubmittedIntake?: boolean;
  /** For future: treatment-response or scalp-image comparison. */
  treatmentResponseSummary?: string[] | null;
  scalpImageComparison?: string[] | null;
};

/** Output of the care plan engine. Clinician and patient sections. */
export type CarePlanOutput = {
  /** Next-step recommendations for the clinician (may include internal reasoning). */
  nextStepRecommendations: string[];
  /** Considerations around repeating bloods (timing, key markers). */
  repeatBloodsConsideration: string[];
  /** Suggested timing for clinician follow-up (e.g. 6-month reassessment). */
  followUpTimingSuggestion: string | null;
  /** Whether scalp photo follow-up is suggested. */
  scalpPhotoFollowUpNeeded: boolean;
  /** Whether GP follow-up is suggested (e.g. for referral or bloods). */
  gpFollowUpSuggested: boolean;
  /** Patient-safe next steps only; reassuring and practical. */
  patientNextSteps: string[];
  /** Patient-facing timing suggestion (e.g. when to return). */
  patientTimingSuggestion: string | null;
};

function pushUnique(target: string[], value: string) {
  if (!value || target.includes(value)) return;
  target.push(value);
}

/**
 * Build care plan from current case state. Deterministic rules only.
 */
export function buildCarePlan(input: CarePlanInput): CarePlanOutput {
  const nextStepRecommendations: string[] = [];
  const repeatBloodsConsideration: string[] = [];
  let followUpTimingSuggestion: string | null = null;
  let scalpPhotoFollowUpNeeded = false;
  let gpFollowUpSuggested = false;
  const patientNextSteps: string[] = [];
  let patientTimingSuggestion: string | null = null;

  const comparison = input.caseComparison ?? null;
  const insights = input.clinicalInsights ?? null;
  const markers = input.interpretedMarkers ?? [];
  const trends = input.markerTrends ?? [];
  const bloodRequest = input.bloodRequest ?? null;
  const reviewOutcome = input.reviewOutcome ?? null;
  const hasBloodUpload = input.hasBloodResultUploadDocument ?? false;
  const hasStructuredMarkers = input.hasStructuredMarkers ?? false;
  const hasNewerIntake = input.hasNewerSubmittedIntake ?? false;
  const treatmentResponseSummary = input.treatmentResponseSummary ?? [];
  const legacyScalpImageComparison = input.scalpImageComparison ?? [];
  const scalpImageComparison = comparison?.scalpImageComparison ?? null;

  const brStatus = bloodRequest?.status ?? null;
  const letterExists = brStatus && ["letter_requested", "letter_generated", "results_uploaded"].includes(brStatus);
  const resultsUploaded = brStatus === "results_uploaded";

  // --- Blood request letter exists but results not yet uploaded ---
  if (letterExists && !resultsUploaded && !hasStructuredMarkers) {
    pushUnique(nextStepRecommendations, "Blood request letter has been generated; suggest patient uploads results when available.");
    pushUnique(patientNextSteps, "When you have your blood test results, upload them in your portal so your clinician can review them.");
  }

  // --- Blood results document uploaded but structured markers incomplete ---
  if ((hasBloodUpload || resultsUploaded) && !hasStructuredMarkers) {
    pushUnique(nextStepRecommendations, "Review uploaded blood results and complete structured marker entry for interpretation.");
    pushUnique(patientNextSteps, "Your clinician will review your uploaded blood results and update your summary.");
  }

  // --- Review outcome was bloods recommended; still no structured markers ---
  if (reviewOutcome === REVIEW_OUTCOME.BLOODS_RECOMMENDED && !hasStructuredMarkers) {
    pushUnique(nextStepRecommendations, "Confirm whether recommended blood tests have been completed and whether updated results are still pending.");
    pushUnique(patientNextSteps, "If your clinician recommended blood tests, the next step is to have them done and share the results when ready.");
    gpFollowUpSuggested = true;
  }

  // --- Key markers improved but remain suboptimal ---
  const activeDrivers = insights?.activeDrivers ?? [];
  const improvedAreas = insights?.improvedAreas ?? [];
  const followUpConsiderations = insights?.followUpConsiderations ?? [];
  if (improvedAreas.length > 0 && activeDrivers.length > 0) {
    pushUnique(nextStepRecommendations, "Some markers have improved but drivers remain active; consider repeat review or repeat bloods at an appropriate interval.");
    const hasSuboptimal = markers.some((m) => OUTSIDE_STATUSES.includes(m.status as (typeof OUTSIDE_STATUSES)[number]));
    if (hasSuboptimal) pushUnique(repeatBloodsConsideration, "Key markers remain outside preferred range; repeat bloods may be useful after an interval to track response.");
  }
  if (followUpConsiderations.length > 0) {
    pushUnique(nextStepRecommendations, "Follow-up considerations from insights: reassess persistent or worsened markers at next review.");
  }

  // --- Inflammatory burden persists ---
  const inflammatoryDrivers = activeDrivers.filter(
    (d) => d.includes("Inflammation") || d.includes("metabolic")
  );
  if (inflammatoryDrivers.length > 0) {
    pushUnique(nextStepRecommendations, "Inflammatory or metabolic drivers persist; suggest clinician follow-up to reassess.");
    pushUnique(patientNextSteps, "Some inflammation or metabolic markers may benefit from follow-up with your clinician.");
  }

  // --- Previous review recommended follow-up; no new intake since ---
  const previousRecommendedFollowUp =
    comparison?.previousIntake?.review_outcome === REVIEW_OUTCOME.FOLLOW_UP_SCHEDULED ||
    comparison?.previousIntake?.review_outcome === REVIEW_OUTCOME.BLOODS_RECOMMENDED;
  if (previousRecommendedFollowUp && !hasNewerIntake && hasStructuredMarkers) {
    pushUnique(nextStepRecommendations, "Previous review recommended follow-up or bloods; no new intake yet. Consider prompting for follow-up reassessment.");
    pushUnique(patientNextSteps, "A follow-up reassessment can help track your progress. Start a new intake when you're ready.");
    followUpTimingSuggestion = "Consider 6‑month or interval reassessment if no new intake since last review.";
    patientTimingSuggestion = "You can start a follow-up assessment anytime to see how things are progressing.";
  }

  // --- Blood results uploaded and no follow-up intake yet ---
  if (hasStructuredMarkers && !hasNewerIntake && (insights?.activeDrivers?.length ?? 0) > 0) {
    pushUnique(nextStepRecommendations, "Blood results are in and no follow-up intake has been submitted; suggest follow-up reassessment when clinically appropriate.");
    pushUnique(patientNextSteps, "When you're ready, a follow-up assessment can help your clinician see how you're progressing.");
    if (!followUpTimingSuggestion) followUpTimingSuggestion = "Consider follow-up reassessment after an appropriate interval (e.g. 6 months).";
    if (!patientTimingSuggestion) patientTimingSuggestion = "You can start a follow-up assessment when it feels right for you.";
  }

  // --- Suggested review focus from comparison ---
  const suggestedFocus = comparison?.suggestedReviewFocus ?? [];
  for (const item of suggestedFocus) {
    pushUnique(nextStepRecommendations, item);
  }

  for (const item of treatmentResponseSummary) {
    pushUnique(nextStepRecommendations, item);
  }

  for (const item of scalpImageComparison?.visualProgressSummary ?? []) {
    pushUnique(nextStepRecommendations, item);
  }
  for (const item of scalpImageComparison?.visualPersistentDrivers ?? []) {
    pushUnique(nextStepRecommendations, item);
  }
  for (const item of scalpImageComparison?.visualFollowUpConsiderations ?? []) {
    pushUnique(nextStepRecommendations, item);
  }
  for (const item of legacyScalpImageComparison) {
    pushUnique(nextStepRecommendations, item);
  }
  if (scalpImageComparison?.comparisonLimitedByImageQuality) {
    pushUnique(
      nextStepRecommendations,
      "Scalp photo comparison is limited by image quality; request a more consistent follow-up photo set if visual tracking remains clinically useful."
    );
  }

  // --- Referral recommended ---
  if (reviewOutcome === REVIEW_OUTCOME.REFERRAL_RECOMMENDED) {
    pushUnique(nextStepRecommendations, "Referral has been recommended; ensure patient has clear next steps and GP follow-up if needed.");
    pushUnique(patientNextSteps, "Your clinician has suggested a referral or additional medical review. Your summary has the details.");
    gpFollowUpSuggested = true;
  }

  // --- Scalp / symptom follow-up ---
  const persistentDrivers = comparison?.persistentDrivers ?? [];
  const hasScalpDriver = persistentDrivers.some(
    (d) => d.toLowerCase().includes("scalp") || d.toLowerCase().includes("irritation")
  );
  const needsScalpComparisonFollowUp =
    comparison?.scalpImageComparison?.comparisonStatus === "pending_review" ||
    comparison?.scalpImageComparison?.comparisonStatus === "uncertain" ||
    comparison?.scalpImageComparison?.comparisonStatus === "insufficient_images";
  if (hasScalpDriver || (insights?.activeDrivers?.length ?? 0) > 0 || needsScalpComparisonFollowUp) {
    scalpPhotoFollowUpNeeded = true;
    pushUnique(nextStepRecommendations, "Consider requesting updated scalp photos at follow-up to track any visible change.");
  }

  if (
    comparison?.treatmentResponse?.currentReportedResponse === "worsened" ||
    comparison?.treatmentResponse?.currentReportedResponse === "uncertain"
  ) {
    pushUnique(
      nextStepRecommendations,
      "Review whether the current treatment plan needs adjustment based on the reported treatment response."
    );
    pushUnique(
      patientNextSteps,
      "Your clinician may review whether your current treatment plan should stay the same or be adjusted."
    );
  }

  // --- Default patient reassurance when nothing else ---
  if (patientNextSteps.length === 0) {
    if (reviewOutcome === REVIEW_OUTCOME.STANDARD_PATHWAY || reviewOutcome === REVIEW_OUTCOME.FOLLOW_UP_SCHEDULED) {
      pushUnique(patientNextSteps, "Continue with your current plan. You can start a follow-up assessment anytime to check in.");
      patientTimingSuggestion = "A follow-up in a few months can help track progress.";
    } else if (hasStructuredMarkers) {
      pushUnique(patientNextSteps, "Your clinician has reviewed your information. Check your summary and reach out if you have questions.");
    } else {
      pushUnique(patientNextSteps, "Complete your intake and upload any documents so your clinician can prepare your summary.");
    }
  }

  return {
    nextStepRecommendations,
    repeatBloodsConsideration,
    followUpTimingSuggestion,
    scalpPhotoFollowUpNeeded,
    gpFollowUpSuggested,
    patientNextSteps,
    patientTimingSuggestion,
  };
}

export const generateCarePlan = buildCarePlan;
