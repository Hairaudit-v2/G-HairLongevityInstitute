import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentVsPreviousForIntake } from "./bloodMarkerTrends";
import { getInterpretedMarkersForIntake } from "./bloodResultMarkers";
import { getBloodRequestByIntake } from "./bloodRequests";
import { getCaseComparisonForIntake } from "./caseComparison";
import {
  generateClinicalInsights,
  type ClinicalInsights,
} from "./clinicalInsights";
import { generateCarePlan, type CarePlanOutput } from "./carePlan";
import { LONGEVITY_DOC_TYPE } from "./documentTypes";
import type { LongevityQuestionnaireResponses } from "./schema";
import { computeTriage, type TriageFlags } from "./triage";
import type { InterpretedMarker } from "./bloodInterpretation";
import type { MarkerTrendRow } from "./bloodMarkerTrends";
import type { BloodRequestRow } from "./bloodRequests";
import type { CaseComparisonResult } from "./caseComparison";

export type LongevityWorkflowSnapshot = {
  profileId: string;
  intakeId: string;
  derivedFlags: TriageFlags;
  questionnaireResponses: LongevityQuestionnaireResponses;
  bloodResults: InterpretedMarker[];
  markerTrends: MarkerTrendRow[];
  bloodRequest: BloodRequestRow | null;
  caseComparison: CaseComparisonResult | null;
  clinicalInsights: ClinicalInsights;
  carePlan: CarePlanOutput;
  hasBloodResultUploadDocument: boolean;
  hasStructuredMarkers: boolean;
};

function asQuestionnaireResponses(
  value: unknown
): LongevityQuestionnaireResponses {
  return value && typeof value === "object"
    ? (value as LongevityQuestionnaireResponses)
    : {};
}

export async function getLongevityWorkflowSnapshotForIntake(
  supabase: SupabaseClient,
  params: {
    profileId: string;
    intakeId: string;
    reviewOutcome?: string | null;
  }
): Promise<LongevityWorkflowSnapshot> {
  const [{ data: questionnaire }, { data: documents }, { data: intakeRow }, bloodResults, bloodRequest] =
    await Promise.all([
      supabase
        .from("hli_longevity_questionnaires")
        .select("responses")
        .eq("intake_id", params.intakeId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("hli_longevity_documents")
        .select("doc_type")
        .eq("intake_id", params.intakeId),
      supabase
        .from("hli_longevity_intakes")
        .select("created_at")
        .eq("id", params.intakeId)
        .single(),
      getInterpretedMarkersForIntake(supabase, params.intakeId),
      getBloodRequestByIntake(supabase, params.intakeId),
    ]);

  const [markerTrends, caseComparison, hasNewerSubmittedIntake] = await Promise.all([
    getCurrentVsPreviousForIntake(supabase, params.profileId, params.intakeId),
    getCaseComparisonForIntake(supabase, params.profileId, params.intakeId),
    supabase
      .from("hli_longevity_intakes")
      .select("id")
      .eq("profile_id", params.profileId)
      .neq("status", "draft")
      .gt("created_at", intakeRow?.created_at ?? new Date().toISOString())
      .limit(1),
  ]);

  const questionnaireResponses = asQuestionnaireResponses(questionnaire?.responses);
  const derivedFlags = computeTriage(questionnaireResponses).flags;
  const hasBloodResultUploadDocument = (documents ?? []).some(
    (doc) => doc.doc_type === LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD
  );
  const hasStructuredMarkers = bloodResults.length > 0;

  const clinicalInsights = generateClinicalInsights({
    derivedFlags,
    interpretedMarkers: bloodResults,
    markerTrends,
    review_outcome: params.reviewOutcome ?? null,
    bloodRequest: bloodRequest ? { status: bloodRequest.status } : null,
    questionnaireResponses,
    workflow: {
      hasBloodResultUploadDocument,
      hasStructuredMarkers,
    },
  });

  const newerSubmittedIntakes =
    (hasNewerSubmittedIntake.data ?? []).filter((row) => row.id !== params.intakeId)
      .length > 0;

  const carePlan = generateCarePlan({
    caseComparison: caseComparison ?? null,
    clinicalInsights,
    interpretedMarkers: bloodResults,
    markerTrends,
    bloodRequest: bloodRequest ? { status: bloodRequest.status } : null,
    reviewOutcome: params.reviewOutcome ?? null,
    hasBloodResultUploadDocument,
    hasStructuredMarkers,
    hasNewerSubmittedIntake: newerSubmittedIntakes,
    treatmentResponseSummary: caseComparison?.treatmentResponse?.clinicianSummary ?? [],
    scalpImageComparison: caseComparison?.scalpImageComparison?.clinicianSummary ?? [],
  });

  return {
    profileId: params.profileId,
    intakeId: params.intakeId,
    derivedFlags,
    questionnaireResponses,
    bloodResults,
    markerTrends,
    bloodRequest,
    caseComparison,
    clinicalInsights,
    carePlan,
    hasBloodResultUploadDocument,
    hasStructuredMarkers,
  };
}
