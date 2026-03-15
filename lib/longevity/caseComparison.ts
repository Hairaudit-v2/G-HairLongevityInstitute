import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentVsPreviousForIntake } from "./bloodMarkerTrends";
import { getInterpretedMarkersForIntake } from "./bloodResultMarkers";
import { generateClinicalInsights } from "./clinicalInsights";
import { getBloodRequestByIntake } from "./bloodRequests";
import { LONGEVITY_DOC_TYPE } from "./documentTypes";
import { REVIEW_OUTCOME } from "./reviewConstants";
import {
  compareTreatmentResponses,
  buildTreatmentResponseSnapshot,
  type TreatmentResponseComparison,
  type TreatmentResponseSnapshot,
} from "./treatmentResponse";
import {
  getScalpImageComparisonSummaryForIntake,
  type ScalpImageComparisonSummary,
  SCALP_IMAGE_COMPARISON_STATUS,
} from "./scalpImageComparisons";
import type { LongevityQuestionnaireResponses } from "./schema";
import { computeTriage } from "./triage";

type ComparisonIntakeRow = {
  id: string;
  profile_id: string;
  status: string;
  created_at: string;
  review_outcome: string | null;
  patient_visible_released_at: string | null;
};

type CaseSnapshot = {
  intake: ComparisonIntakeRow;
  questionnaire: LongevityQuestionnaireResponses;
  flags: ReturnType<typeof computeTriage>["flags"];
  clinicalInsights: ReturnType<typeof generateClinicalInsights>;
  bloodRequestStatus: string | null;
  treatmentResponse: TreatmentResponseSnapshot;
  scalpPhotoCount: number;
  workflow: {
    hasBloodResultUploadDocument: boolean;
    hasStructuredMarkers: boolean;
  };
};

export type PatientCaseProgressSummary = {
  whatHasImproved: string[];
  stillNeedsFollowUp: string[];
  nextStepMayBe: string[];
};

export type CaseComparisonResult = {
  previousIntake: {
    id: string;
    created_at: string;
    review_outcome: string | null;
  } | null;
  improvedAreas: string[];
  worsenedAreas: string[];
  persistentDrivers: string[];
  newConcerns: string[];
  suggestedReviewFocus: string[];
  treatmentResponse: TreatmentResponseComparison | null;
  scalpImageComparison: ScalpImageComparisonSummary | null;
  patientSummary: PatientCaseProgressSummary;
};

const SCALP_SYMPTOMS = ["itch", "burning", "tenderness", "flaking"] as const;
const SLEEP_SCORE: Record<"poor" | "average" | "good", number> = {
  poor: 0,
  average: 1,
  good: 2,
};

function pushUnique(target: string[], value: string) {
  if (!value) return;
  if (!target.includes(value)) target.push(value);
}

function getLatestQuestionnaireResponses(
  value: unknown
): LongevityQuestionnaireResponses {
  return value && typeof value === "object"
    ? (value as LongevityQuestionnaireResponses)
    : {};
}

function asSet(input?: string[] | null): Set<string> {
  return new Set((input ?? []).filter(Boolean));
}

function intersection(a: string[], b: string[]): string[] {
  const bSet = new Set(b);
  return a.filter((value) => bSet.has(value));
}

function difference(a: string[], b: string[]): string[] {
  const bSet = new Set(b);
  return a.filter((value) => !bSet.has(value));
}

function compareOrdinal(
  current: "poor" | "average" | "good" | undefined,
  previous: "poor" | "average" | "good" | undefined
): "improved" | "worsened" | "unchanged" | null {
  if (!current || !previous) return null;
  const currentScore = SLEEP_SCORE[current];
  const previousScore = SLEEP_SCORE[previous];
  if (currentScore > previousScore) return "improved";
  if (currentScore < previousScore) return "worsened";
  return "unchanged";
}

function buildPatientFollowUpMessage(driver: string): string {
  switch (driver) {
    case "Iron / oxygen delivery":
      return "Iron-related factors may still need follow-up.";
    case "Nutritional / follicular support":
      return "Some nutrition-related factors may still need follow-up.";
    case "Thyroid":
      return "Thyroid-related factors may still need follow-up.";
    case "Inflammation / metabolic stress":
      return "Some inflammation or metabolic factors may still need follow-up.";
    case "Hormonal / androgen-related":
      return "Hormonal factors may still need follow-up.";
    case "Protein / systemic support":
      return "Some broader systemic support factors may still need follow-up.";
    case "Stress / trigger-related":
      return "Stress or trigger-related factors may still need follow-up.";
    case "Postpartum context":
      return "Postpartum-related changes may still need follow-up.";
    default:
      return `${driver} may still need follow-up.`;
  }
}

function buildPreviousDriverResolvedMessage(driver: string): string {
  switch (driver) {
    case "Iron / oxygen delivery":
      return "Iron-related drivers look less prominent than on the previous review.";
    case "Nutritional / follicular support":
      return "Nutrition-related drivers look less prominent than on the previous review.";
    case "Thyroid":
      return "Thyroid-related drivers look less prominent than on the previous review.";
    case "Inflammation / metabolic stress":
      return "Inflammatory or metabolic drivers look less prominent than on the previous review.";
    case "Hormonal / androgen-related":
      return "Hormonal drivers look less prominent than on the previous review.";
    case "Protein / systemic support":
      return "Broader systemic support markers look less prominent than on the previous review.";
    default:
      return `${driver} looks less prominent than on the previous review.`;
  }
}

function buildNewDriverConcern(driver: string): string {
  switch (driver) {
    case "Iron / oxygen delivery":
      return "Iron-related drivers are more prominent in this review.";
    case "Nutritional / follicular support":
      return "Nutrition-related drivers are more prominent in this review.";
    case "Thyroid":
      return "Thyroid-related drivers are more prominent in this review.";
    case "Inflammation / metabolic stress":
      return "Inflammatory or metabolic drivers are more prominent in this review.";
    case "Hormonal / androgen-related":
      return "Hormonal or androgen-related drivers are more prominent in this review.";
    case "Stress / trigger-related":
      return "Stress or trigger-related drivers are more prominent in this review.";
    default:
      return `${driver} is more prominent in this review.`;
  }
}

async function getSnapshotForIntake(
  supabase: SupabaseClient,
  intake: ComparisonIntakeRow
): Promise<CaseSnapshot> {
  const [{ data: questionnaire }, { data: documents }, bloodResults, markerTrends, bloodRequest] =
    await Promise.all([
      supabase
        .from("hli_longevity_questionnaires")
        .select("responses")
        .eq("intake_id", intake.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("hli_longevity_documents")
        .select("id, doc_type")
        .eq("intake_id", intake.id),
      getInterpretedMarkersForIntake(supabase, intake.id),
      getCurrentVsPreviousForIntake(supabase, intake.profile_id, intake.id),
      getBloodRequestByIntake(supabase, intake.id),
    ]);

  const responses = getLatestQuestionnaireResponses(questionnaire?.responses);
  const flags = computeTriage(responses).flags;
  const workflow = {
    hasBloodResultUploadDocument: (documents ?? []).some(
      (doc) => doc.doc_type === LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD
    ),
    hasStructuredMarkers: bloodResults.length > 0,
  };

  return {
    intake,
    questionnaire: responses,
    flags,
    bloodRequestStatus: bloodRequest?.status ?? null,
    treatmentResponse: buildTreatmentResponseSnapshot(responses),
    scalpPhotoCount: (documents ?? []).filter(
      (doc) => doc.doc_type === LONGEVITY_DOC_TYPE.SCALP_PHOTO
    ).length,
    workflow,
    clinicalInsights: generateClinicalInsights({
      derivedFlags: flags,
      interpretedMarkers: bloodResults,
      markerTrends,
      review_outcome: intake.review_outcome,
      bloodRequest: bloodRequest ? { status: bloodRequest.status } : null,
      questionnaireResponses: responses,
      workflow,
    }),
  };
}

function buildComparison(current: CaseSnapshot, previous: CaseSnapshot): CaseComparisonResult {
  const improvedAreas: string[] = [];
  const worsenedAreas: string[] = [];
  const suggestedReviewFocus: string[] = [];
  const patientImproved: string[] = [];
  const patientFollowUp: string[] = [];
  const patientNextStep: string[] = [];

  const currentDrivers = current.clinicalInsights.activeDrivers;
  const previousDrivers = previous.clinicalInsights.activeDrivers;
  const persistentDrivers = intersection(currentDrivers, previousDrivers);
  const newDriverLabels = difference(currentDrivers, previousDrivers);
  const treatmentResponse = compareTreatmentResponses(
    current.treatmentResponse,
    previous.treatmentResponse
  );

  const sheddingNow = current.questionnaire.timelineTriggers?.sheddingTrend;
  const sheddingPrev = previous.questionnaire.timelineTriggers?.sheddingTrend;
  if (sheddingNow === "improved" && sheddingPrev !== "improved") {
    pushUnique(improvedAreas, "Self-reported shedding has improved since the previous intake.");
    pushUnique(patientImproved, "Shedding appears to have improved since your previous review.");
  }
  if (sheddingNow === "worsened" && sheddingPrev !== "worsened") {
    pushUnique(worsenedAreas, "Self-reported shedding has worsened since the previous intake.");
  }

  const currentScalpSymptoms = asSet(
    (current.questionnaire.mainConcern?.symptoms ?? []).filter((value) =>
      SCALP_SYMPTOMS.includes(value as (typeof SCALP_SYMPTOMS)[number])
    )
  );
  const previousScalpSymptoms = asSet(
    (previous.questionnaire.mainConcern?.symptoms ?? []).filter((value) =>
      SCALP_SYMPTOMS.includes(value as (typeof SCALP_SYMPTOMS)[number])
    )
  );
  if (previousScalpSymptoms.size > currentScalpSymptoms.size) {
    pushUnique(improvedAreas, "Scalp irritation symptoms are less prominent than on the previous intake.");
    pushUnique(patientImproved, "Scalp symptoms appear less prominent than before.");
  }
  if (currentScalpSymptoms.size > previousScalpSymptoms.size) {
    pushUnique(worsenedAreas, "Scalp irritation symptoms are more prominent than on the previous intake.");
  }

  if (current.scalpPhotoCount > 0 && previous.scalpPhotoCount === 0) {
    pushUnique(
      suggestedReviewFocus,
      "This intake includes scalp photos where the previous one did not; use them as a new visual baseline for follow-up."
    );
  }

  const currentStress = current.questionnaire.lifestyleTreatments?.stressScore;
  const previousStress = previous.questionnaire.lifestyleTreatments?.stressScore;
  if (typeof currentStress === "number" && typeof previousStress === "number") {
    if (currentStress <= previousStress - 2) {
      pushUnique(improvedAreas, "Reported stress level is lower than on the previous intake.");
      pushUnique(patientImproved, "Reported stress levels are lower than at your previous review.");
    }
    if (currentStress >= previousStress + 2) {
      pushUnique(worsenedAreas, "Reported stress level is higher than on the previous intake.");
    }
  }

  const sleepComparison = compareOrdinal(
    current.questionnaire.lifestyleTreatments?.sleepQuality,
    previous.questionnaire.lifestyleTreatments?.sleepQuality
  );
  if (sleepComparison === "improved") {
    pushUnique(improvedAreas, "Sleep quality has improved since the previous intake.");
    pushUnique(patientImproved, "Sleep quality looks better than at your previous review.");
  }
  if (sleepComparison === "worsened") {
    pushUnique(worsenedAreas, "Sleep quality has worsened since the previous intake.");
  }

  if (treatmentResponse) {
    for (const item of treatmentResponse.clinicianSummary) {
      if (!improvedAreas.includes(item) && !worsenedAreas.includes(item)) {
        if (item.toLowerCase().includes("reported improvement")) {
          pushUnique(improvedAreas, item);
        } else if (item.toLowerCase().includes("reported worsening")) {
          pushUnique(worsenedAreas, item);
        }
      }
    }
    for (const item of treatmentResponse.patientImprovedSummary) {
      pushUnique(patientImproved, item);
    }
    for (const item of treatmentResponse.patientFollowUpSummary) {
      pushUnique(patientFollowUp, item);
    }
    if (treatmentResponse.startedTreatments.length > 0) {
      pushUnique(
        suggestedReviewFocus,
        `Review response and adherence after starting: ${treatmentResponse.startedTreatments.join(", ")}.`
      );
    }
    if (treatmentResponse.stoppedTreatments.length > 0) {
      pushUnique(
        suggestedReviewFocus,
        `Clarify why treatment stopped: ${treatmentResponse.stoppedTreatments.join(", ")}.`
      );
    }
    if (
      treatmentResponse.currentReportedResponse === "worsened" ||
      treatmentResponse.currentReportedResponse === "uncertain"
    ) {
      pushUnique(
        suggestedReviewFocus,
        "Review whether the current treatment plan needs adjustment based on the reported response."
      );
    }
  }

  for (const area of current.clinicalInsights.improvedAreas) {
    pushUnique(improvedAreas, area);
    if (/ferritin|TSH|HbA1c|Inflammatory markers/i.test(area)) {
      pushUnique(patientImproved, "Some tracked blood markers have moved in a better direction.");
    }
  }

  for (const driver of difference(previousDrivers, currentDrivers)) {
    pushUnique(improvedAreas, buildPreviousDriverResolvedMessage(driver));
  }

  const newConcerns = newDriverLabels.map(buildNewDriverConcern);

  if (
    previous.bloodRequestStatus &&
    ["pending", "letter_requested", "letter_generated"].includes(previous.bloodRequestStatus) &&
    (current.bloodRequestStatus === "results_uploaded" ||
      current.workflow.hasBloodResultUploadDocument ||
      current.workflow.hasStructuredMarkers)
  ) {
    pushUnique(improvedAreas, "Previously requested blood results are now available for review.");
    pushUnique(patientImproved, "Previously requested blood results are now available for review.");
  }

  if (
    current.intake.review_outcome === REVIEW_OUTCOME.BLOODS_RECOMMENDED &&
    current.bloodRequestStatus !== "results_uploaded" &&
    !current.workflow.hasStructuredMarkers
  ) {
    pushUnique(
      suggestedReviewFocus,
      "Confirm whether the recommended blood tests have been completed and whether updated results are still pending."
    );
    pushUnique(patientNextStep, "The next step may be to complete the recommended blood tests and upload the results.");
  }

  if (current.workflow.hasBloodResultUploadDocument && !current.workflow.hasStructuredMarkers) {
    pushUnique(
      suggestedReviewFocus,
      "Review the uploaded blood results and confirm any key markers into structured entries."
    );
    pushUnique(patientNextStep, "Your clinician may next review your uploaded blood results.");
  }

  if (
    previous.intake.review_outcome === REVIEW_OUTCOME.BLOODS_RECOMMENDED &&
    current.intake.review_outcome &&
    current.intake.review_outcome !== REVIEW_OUTCOME.BLOODS_RECOMMENDED &&
    current.workflow.hasStructuredMarkers
  ) {
    pushUnique(improvedAreas, "The case has moved beyond the previous blood-work-only review stage.");
  }

  if (
    previous.intake.review_outcome !== REVIEW_OUTCOME.REFERRAL_RECOMMENDED &&
    current.intake.review_outcome === REVIEW_OUTCOME.REFERRAL_RECOMMENDED
  ) {
    pushUnique(worsenedAreas, "Specialist referral is now being considered based on the updated case picture.");
    pushUnique(patientNextStep, "The next step may be an additional medical review or referral.");
  }

  if (
    previous.intake.review_outcome !== REVIEW_OUTCOME.FOLLOW_UP_SCHEDULED &&
    current.intake.review_outcome === REVIEW_OUTCOME.FOLLOW_UP_SCHEDULED
  ) {
    pushUnique(patientNextStep, "The next step may be a follow-up review to track continued progress.");
  }

  if (persistentDrivers.length > 0) {
    pushUnique(
      suggestedReviewFocus,
      `Reassess persistent drivers: ${persistentDrivers.join(", ")}.`
    );
  }

  if (newConcerns.length > 0) {
    pushUnique(
      suggestedReviewFocus,
      `Clarify what has changed around the newly prominent issues in this review.`
    );
  }

  if (worsenedAreas.length > 0) {
    pushUnique(
      suggestedReviewFocus,
      "Review the interval changes that may explain the areas that appear more active or more symptomatic."
    );
  }

  for (const driver of [...persistentDrivers, ...newDriverLabels]) {
    pushUnique(patientFollowUp, buildPatientFollowUpMessage(driver));
  }
  for (const insight of current.clinicalInsights.patientSafeInsights) {
    pushUnique(patientFollowUp, insight);
  }

  if (patientNextStep.length === 0) {
    if (current.intake.review_outcome === REVIEW_OUTCOME.STANDARD_PATHWAY) {
      pushUnique(patientNextStep, "The next step may be to continue the current plan and monitor progress over time.");
    } else if (current.workflow.hasStructuredMarkers) {
      pushUnique(patientNextStep, "The next step may be to keep following your plan and review progress again at follow-up.");
    }
  }

  return {
    previousIntake: {
      id: previous.intake.id,
      created_at: previous.intake.created_at,
      review_outcome: previous.intake.review_outcome,
    },
    improvedAreas,
    worsenedAreas,
    persistentDrivers,
    newConcerns,
    suggestedReviewFocus,
    treatmentResponse,
    scalpImageComparison: null,
    patientSummary: {
      whatHasImproved: patientImproved,
      stillNeedsFollowUp: patientFollowUp,
      nextStepMayBe: patientNextStep,
    },
  };
}

export async function getCaseComparisonForIntake(
  supabase: SupabaseClient,
  profile_id: string,
  intake_id: string
): Promise<CaseComparisonResult | null> {
  const { data: current, error: currentError } = await supabase
    .from("hli_longevity_intakes")
    .select("id, profile_id, status, created_at, review_outcome, patient_visible_released_at")
    .eq("id", intake_id)
    .eq("profile_id", profile_id)
    .single();
  if (currentError || !current) return null;

  const { data: previous } = await supabase
    .from("hli_longevity_intakes")
    .select("id, profile_id, status, created_at, review_outcome, patient_visible_released_at")
    .eq("profile_id", profile_id)
    .lt("created_at", current.created_at)
    .neq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!previous) return null;

  const [currentSnapshot, previousSnapshot] = await Promise.all([
    getSnapshotForIntake(supabase, current as ComparisonIntakeRow),
    getSnapshotForIntake(supabase, previous as ComparisonIntakeRow),
  ]);
  const comparison = buildComparison(currentSnapshot, previousSnapshot);
  const scalpImageComparison = await getScalpImageComparisonSummaryForIntake(
    supabase,
    profile_id,
    intake_id
  );

  if (
    scalpImageComparison.comparisonStatus ===
    SCALP_IMAGE_COMPARISON_STATUS.IMPROVED
  ) {
    pushUnique(
      comparison.improvedAreas,
      "Clinician scalp photo comparison suggests visible improvement since the previous intake."
    );
    pushUnique(
      comparison.patientSummary.whatHasImproved,
      "Your clinician noted improvement when comparing your scalp photos over time."
    );
  }

  if (
    scalpImageComparison.comparisonStatus ===
    SCALP_IMAGE_COMPARISON_STATUS.WORSENED
  ) {
    pushUnique(
      comparison.worsenedAreas,
      "Clinician scalp photo comparison suggests visible worsening since the previous intake."
    );
    pushUnique(
      comparison.patientSummary.nextStepMayBe,
      "Your clinician may review the changes seen in your follow-up scalp photos with you."
    );
  }

  if (
    scalpImageComparison.comparisonStatus ===
      SCALP_IMAGE_COMPARISON_STATUS.PENDING_REVIEW &&
    scalpImageComparison.canCompare
  ) {
    pushUnique(
      comparison.suggestedReviewFocus,
      "Review the current and previous scalp photo sets and record a structured visual comparison."
    );
  }

  if (
    scalpImageComparison.comparisonStatus ===
      SCALP_IMAGE_COMPARISON_STATUS.UNCERTAIN ||
    scalpImageComparison.comparisonStatus ===
      SCALP_IMAGE_COMPARISON_STATUS.INSUFFICIENT_IMAGES
  ) {
    pushUnique(
      comparison.patientSummary.stillNeedsFollowUp,
      "Updated scalp photos may still help your clinician track visible progress over time."
    );
  }

  comparison.scalpImageComparison = scalpImageComparison;
  return comparison;
}
