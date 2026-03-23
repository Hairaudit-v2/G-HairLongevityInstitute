/**
 * GET /api/longevity/review/intakes/[id] — Trichologist-only case detail for review panel.
 * Returns intake, questionnaire snapshot, documents list, and internal notes.
 * Intake must be in review queue. Read-only; no editing of questionnaire or documents.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS, REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { QUESTIONNAIRE_SCHEMA_VERSION } from "@/lib/longevity/schema";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import { computeTriage } from "@/lib/longevity/triage";
import { computeReviewComplexity } from "@/lib/longevity/reviewComplexity";
import { getInterpretedMarkersWithIdsForIntake, getMarkersForIntake } from "@/lib/longevity/bloodResultMarkers";
import { getBloodRequestByIntake } from "@/lib/longevity/bloodRequests";
import { getCurrentVsPreviousForIntake } from "@/lib/longevity/bloodMarkerTrends";
import { listPendingBloodMarkerExtractionDraftsForIntake } from "@/lib/longevity/bloodMarkerExtractionDrafts";
import { listPendingScalpImageAnalysisDraftsForIntake } from "@/lib/longevity/scalpImageAnalysisDrafts";
import { getCaseComparisonForIntake } from "@/lib/longevity/caseComparison";
import { LONGEVITY_DOC_TYPE } from "@/lib/longevity/documentTypes";
import { generateClinicalInsights } from "@/lib/longevity/clinicalInsights";
import { generateCarePlan } from "@/lib/longevity/carePlan";
import { generateFollowUpCadence } from "@/lib/longevity/followUpCadence";
import { getAdherenceContextForIntake } from "@/lib/longevity/adherenceContext";
import { computeAdherenceStates } from "@/lib/longevity/adherenceStates";
import { getTreatmentAdherenceForIntake } from "@/lib/longevity/treatmentAdherence";
import { computeTreatmentOutcomeCorrelation } from "@/lib/longevity/treatmentOutcomeCorrelation";
import { assessTreatmentProtocol } from "@/lib/longevity/treatmentProtocol";
import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";
import {
  compareAdaptiveTriageWithCurrentEngine,
  type AdaptiveRescoreComparison,
} from "@/lib/longevity/intake";

export const dynamic = "force-dynamic";

type AdaptiveTriageView = {
  triage: AdaptiveDerivedSummary | null;
  uploadGuidance: string[];
  clinicianAttentionFlags: string[];
  redFlags: string[];
  rescoreComparison: AdaptiveRescoreComparison | null;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function pickAdaptiveTriageView(
  responses: LongevityQuestionnaireResponses,
  intakeAdaptiveTriageOutput: unknown,
  intakeAdaptiveAnswers: unknown,
  intakeAdaptiveSchemaVersion: unknown
): AdaptiveTriageView {
  const fromEngine = responses.adaptiveEngine?.triage;
  const fromEngineLegacy = responses.adaptiveEngine?.adaptive_triage_output;
  const fromDerived = responses.adaptiveDerivedSummary;
  const fromIntake =
    intakeAdaptiveTriageOutput && typeof intakeAdaptiveTriageOutput === "object"
      ? (intakeAdaptiveTriageOutput as AdaptiveDerivedSummary)
      : null;
  const triage = fromEngine ?? fromEngineLegacy ?? fromDerived ?? fromIntake ?? null;
  const answersFromResponses =
    responses.adaptiveEngine?.adaptive_answers ?? responses.adaptiveEngine?.answers ?? null;
  const answersFromIntake =
    intakeAdaptiveAnswers && typeof intakeAdaptiveAnswers === "object"
      ? (intakeAdaptiveAnswers as Record<string, string | string[] | boolean | null>)
      : null;
  const answers = (answersFromResponses ??
    answersFromIntake ??
    {}) as Record<string, string | string[] | boolean | null>;
  const storedSchemaVersion =
    typeof intakeAdaptiveSchemaVersion === "string"
      ? intakeAdaptiveSchemaVersion
      : typeof responses.adaptiveEngine?.adaptive_schema_version === "string"
      ? responses.adaptiveEngine?.adaptive_schema_version
      : null;
  const rescoreComparison = compareAdaptiveTriageWithCurrentEngine({
    adaptive_answers: answers,
    stored_adaptive_schema_version: storedSchemaVersion,
    stored_adaptive_triage_output: triage,
  });

  return {
    triage,
    uploadGuidance: toStringArray(triage?.upload_guidance),
    clinicianAttentionFlags: toStringArray(triage?.clinician_attention_flags),
    redFlags: toStringArray(triage?.red_flags),
    rescoreComparison,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const trichologist = await getTrichologistFromRequest();
    if (!trichologist) {
      return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing intake id." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, status, review_status, review_priority, created_at, updated_at, last_reviewed_at, patient_visible_released_at, assigned_trichologist_id, assigned_at, patient_visible_summary, review_outcome, adaptive_answers, adaptive_schema_version, adaptive_triage_output")
      .eq("id", id)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    const inQueue = REVIEW_STATUS_IN_QUEUE.includes(intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number]);
    const isReleased = intake.review_status === REVIEW_STATUS.REVIEW_COMPLETE;
    if (!inQueue && !isReleased) {
      return NextResponse.json({ ok: false, error: "Intake is not in the review queue or released." }, { status: 403 });
    }

    const [
      { data: questionnaire },
      { data: documents },
      { data: notes },
      { data: releaseRows },
      { data: reminderRows },
    ] = await Promise.all([
      supabase
        .from("hli_longevity_questionnaires")
        .select("schema_version, responses, updated_at")
        .eq("intake_id", id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("hli_longevity_documents")
        .select("id, doc_type, filename, mime_type, created_at")
        .eq("intake_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("hli_longevity_review_notes")
        .select("id, body, created_at")
        .eq("intake_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("hli_longevity_summary_releases")
        .select("id, summary_text_snapshot, released_at, released_by_trichologist_id")
        .eq("intake_id", id)
        .order("released_at", { ascending: false })
        .limit(1),
      supabase
        .from("hli_longevity_reminders")
        .select("sent_at, reminder_type")
        .eq("intake_id", id)
        .eq("status", "sent")
        .not("sent_at", "is", null)
        .order("sent_at", { ascending: true }),
    ]);
    const latestRelease = (releaseRows ?? [])[0] ?? null;
    const reminderSents = (reminderRows ?? []).map((r) => ({
      sent_at: r.sent_at as string,
      reminder_type: (r.reminder_type as string) ?? "email",
    }));

    const rawResponses = (questionnaire?.responses ?? {}) as Record<string, unknown>;
    const responses: LongevityQuestionnaireResponses & { schemaVersion?: string } = {
      ...rawResponses,
      schemaVersion: (rawResponses.schemaVersion as string) ?? questionnaire?.schema_version ?? QUESTIONNAIRE_SCHEMA_VERSION,
    };
    const adaptiveView = pickAdaptiveTriageView(
      responses,
      intake.adaptive_triage_output,
      intake.adaptive_answers,
      intake.adaptive_schema_version
    );

    const triage = computeTriage(responses);
    const complexity = computeReviewComplexity({
      flags: triage.flags,
      review_priority: intake.review_priority ?? null,
      questionnaireResponses: responses,
      documents: (documents ?? []).map((d) => ({ doc_type: d.doc_type })),
    });

    const [blood_results, blood_markers_raw, blood_request, marker_trends, extraction_drafts, scalp_image_analysis_drafts, case_comparison, hasNewerSubmittedIntake] = await Promise.all([
      getInterpretedMarkersWithIdsForIntake(supabase, id),
      getMarkersForIntake(supabase, id),
      getBloodRequestByIntake(supabase, id),
      getCurrentVsPreviousForIntake(supabase, intake.profile_id, id),
      listPendingBloodMarkerExtractionDraftsForIntake(supabase, id),
      listPendingScalpImageAnalysisDraftsForIntake(supabase, id),
      getCaseComparisonForIntake(supabase, intake.profile_id, id),
      supabase
        .from("hli_longevity_intakes")
        .select("id")
        .eq("profile_id", intake.profile_id)
        .neq("status", "draft")
        .gt("created_at", intake.created_at)
        .limit(1)
        .then((r) => (r.data?.length ?? 0) > 0),
    ]);
    const hasBloodResultUploadDocument = (documents ?? []).some(
      (doc) => doc.doc_type === LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD
    );
    const clinical_insights = generateClinicalInsights({
      derivedFlags: triage.flags,
      interpretedMarkers: blood_results,
      markerTrends: marker_trends,
      review_outcome: intake.review_outcome,
      bloodRequest: blood_request ? { status: blood_request.status } : null,
      questionnaireResponses: responses,
      workflow: {
        hasBloodResultUploadDocument,
        hasStructuredMarkers: blood_results.length > 0,
      },
      longitudinalSignals: {
        scalpChanges: [
          ...(case_comparison?.scalpImageComparison?.visualProgressSummary ?? []),
          ...(case_comparison?.scalpImageComparison?.visualPersistentDrivers ?? []),
          ...(case_comparison?.scalpImageComparison?.visualFollowUpConsiderations ??
            []),
        ],
        treatmentResponseChanges:
          case_comparison?.treatmentResponse?.clinicianSummary ?? [],
      },
    });

    const care_plan = generateCarePlan({
      caseComparison: case_comparison ?? null,
      clinicalInsights: clinical_insights,
      interpretedMarkers: blood_results,
      markerTrends: marker_trends,
      bloodRequest: blood_request ? { status: blood_request.status } : null,
      reviewOutcome: intake.review_outcome,
      hasBloodResultUploadDocument,
      hasStructuredMarkers: blood_results.length > 0,
      hasNewerSubmittedIntake: hasNewerSubmittedIntake,
      treatmentResponseSummary: case_comparison?.treatmentResponse?.clinicianSummary ?? [],
      scalpImageComparison: case_comparison?.scalpImageComparison?.clinicianSummary ?? [],
    });
    const follow_up_cadence = generateFollowUpCadence({
      carePlan: care_plan,
      reviewOutcome: intake.review_outcome,
      bloodRequest: blood_request
        ? {
            status: blood_request.status,
            created_at: blood_request.created_at,
            updated_at: blood_request.updated_at,
            approved_at: blood_request.approved_at,
          }
        : null,
      hasBloodResultUploadDocument,
      hasStructuredMarkers: blood_results.length > 0,
      hasNewerSubmittedIntake: hasNewerSubmittedIntake,
      scalpPhotoFollowUpRecommended: care_plan.scalpPhotoFollowUpNeeded,
      intakeCreatedAt: intake.created_at,
      lastReviewedAt: intake.last_reviewed_at ?? null,
      patientVisibleReleasedAt: intake.patient_visible_released_at ?? null,
    });

    const adherence_context = await getAdherenceContextForIntake(supabase, {
      profileId: intake.profile_id,
      intakeId: id,
    });
    const adherence_states = computeAdherenceStates(adherence_context);

    const treatment_adherence = await getTreatmentAdherenceForIntake(
      supabase,
      intake.profile_id,
      id
    );
    const outcome_correlation = computeTreatmentOutcomeCorrelation({
      treatmentAdherence: treatment_adherence.items,
      hasPreviousIntake: treatment_adherence.hasPreviousIntake,
      caseComparison: case_comparison ?? null,
      clinicalInsights: clinical_insights,
      markerTrends: marker_trends,
      adherenceStates: adherence_states,
    });

    const usedKeysForProtocol = treatment_adherence.items
      .filter(
        (i) =>
          i.status === "started" ||
          i.status === "continued" ||
          i.status === "uncertain"
      )
      .map((i) => i.key);
    // Stopped treatments are excluded from usedKeys so they do not inflate protocol score.
    const protocol_assessment = assessTreatmentProtocol({
      usedKeys: usedKeysForProtocol,
      adherenceItems: treatment_adherence.items.map((i) => ({
        key: i.key,
        status: i.status,
      })),
      hasPreviousIntake: treatment_adherence.hasPreviousIntake,
      adherenceContext: adherence_states,
      derivedFlags: triage.flags,
    });

    return NextResponse.json({
      ok: true,
      complexity,
      blood_results,
      marker_trends,
      clinical_insights,
      case_comparison,
      care_plan,
      follow_up_cadence,
      adherence_context,
      adherence_states,
      treatment_continuity: treatment_adherence,
      outcome_correlation,
      protocol_assessment,
      blood_markers: blood_markers_raw.map((m) => ({
        id: m.id,
        marker_name: m.marker_name,
        value: m.value,
        unit: m.unit,
        reference_low: m.reference_low,
        reference_high: m.reference_high,
        collected_at: m.collected_at,
        lab_name: m.lab_name,
        blood_request_id: m.blood_request_id,
      })),
      blood_marker_extraction_drafts: extraction_drafts.map((draft) => ({
        id: draft.id,
        marker_name: draft.marker_name,
        display_name: draft.display_name,
        raw_marker_name: draft.raw_marker_name,
        value: draft.value,
        unit: draft.unit,
        reference_low: draft.reference_low,
        reference_high: draft.reference_high,
        raw_reference_range: draft.raw_reference_range,
        confidence: draft.confidence,
        source_filename: draft.source_filename,
        extracted_at: draft.extracted_at,
      })),
      scalp_image_analysis_drafts: scalp_image_analysis_drafts.map((draft) => ({
        id: draft.id,
        image_quality: draft.image_quality,
        thinning_distribution: draft.thinning_distribution,
        severity_estimate: draft.severity_estimate,
        visible_findings: draft.visible_findings,
        comparison_direction: draft.comparison_direction,
        confidence: draft.confidence,
        manual_review_recommended: draft.manual_review_recommended,
        draft_summary: draft.draft_summary,
        created_at: draft.created_at,
      })),
      blood_request: blood_request
        ? {
            id: blood_request.id,
            status: blood_request.status,
            recommended_tests: Array.isArray(blood_request.recommended_tests)
              ? blood_request.recommended_tests
              : [],
            reason: blood_request.reason ?? null,
            recommended_by: blood_request.recommended_by ?? null,
            clinician_edited: blood_request.clinician_edited === true,
            created_at: blood_request.created_at,
            updated_at: blood_request.updated_at ?? null,
            approved_at: blood_request.approved_at ?? null,
          }
        : null,
      intake: {
        id: intake.id,
        status: intake.status,
        review_status: intake.review_status,
        review_priority: intake.review_priority,
        created_at: intake.created_at,
        updated_at: intake.updated_at,
        last_reviewed_at: intake.last_reviewed_at ?? null,
        patient_visible_released_at: intake.patient_visible_released_at ?? null,
        assigned_trichologist_id: intake.assigned_trichologist_id,
        assigned_at: (intake as { assigned_at?: string | null }).assigned_at ?? null,
        patient_visible_summary: intake.patient_visible_summary,
        review_outcome: intake.review_outcome,
      },
      questionnaire: {
        schema_version: questionnaire?.schema_version ?? QUESTIONNAIRE_SCHEMA_VERSION,
        responses,
        updated_at: questionnaire?.updated_at ?? null,
      },
      adaptive_triage: adaptiveView.triage,
      adaptive_upload_guidance: adaptiveView.uploadGuidance,
      adaptive_clinician_attention_flags: adaptiveView.clinicianAttentionFlags,
      adaptive_red_flags: adaptiveView.redFlags,
      adaptive_rescore_comparison: adaptiveView.rescoreComparison,
      documents: (documents ?? []).map((d) => ({
        id: d.id,
        doc_type: d.doc_type,
        filename: d.filename,
        mime_type: d.mime_type,
        created_at: d.created_at,
      })),
      notes: (notes ?? []).map((n) => ({
        id: n.id,
        body: n.body,
        created_at: n.created_at,
      })),
      released_summary_snapshot: latestRelease
        ? {
            id: latestRelease.id,
            summary_text: latestRelease.summary_text_snapshot,
            released_at: latestRelease.released_at,
            released_by_trichologist_id: latestRelease.released_by_trichologist_id ?? null,
          }
        : null,
      reminder_sents: reminderSents,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
