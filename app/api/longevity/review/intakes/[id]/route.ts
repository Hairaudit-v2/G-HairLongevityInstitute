/**
 * GET /api/longevity/review/intakes/[id] — Trichologist-only case detail for review panel.
 * Returns intake, questionnaire snapshot, documents list, and internal notes.
 * Intake must be in review queue. Read-only; no editing of questionnaire or documents.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { QUESTIONNAIRE_SCHEMA_VERSION } from "@/lib/longevity/schema";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import { computeTriage } from "@/lib/longevity/triage";
import { computeReviewComplexity } from "@/lib/longevity/reviewComplexity";
import { getInterpretedMarkersWithIdsForIntake, getMarkersForIntake } from "@/lib/longevity/bloodResultMarkers";
import { getBloodRequestByIntake } from "@/lib/longevity/bloodRequests";
import { getCurrentVsPreviousForIntake } from "@/lib/longevity/bloodMarkerTrends";

export const dynamic = "force-dynamic";

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
      .select("id, profile_id, status, review_status, review_priority, created_at, updated_at, assigned_trichologist_id, patient_visible_summary, review_outcome")
      .eq("id", id)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    if (!REVIEW_STATUS_IN_QUEUE.includes(intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number])) {
      return NextResponse.json({ ok: false, error: "Intake is not in the review queue." }, { status: 403 });
    }

    const [{ data: questionnaire }, { data: documents }, { data: notes }] = await Promise.all([
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
    ]);

    const rawResponses = (questionnaire?.responses ?? {}) as Record<string, unknown>;
    const responses: LongevityQuestionnaireResponses & { schemaVersion?: string } = {
      ...rawResponses,
      schemaVersion: (rawResponses.schemaVersion as string) ?? questionnaire?.schema_version ?? QUESTIONNAIRE_SCHEMA_VERSION,
    };

    const triage = computeTriage(responses);
    const complexity = computeReviewComplexity({
      flags: triage.flags,
      review_priority: intake.review_priority ?? null,
      questionnaireResponses: responses,
      documents: (documents ?? []).map((d) => ({ doc_type: d.doc_type })),
    });

    const [blood_results, blood_markers_raw, blood_request, marker_trends] = await Promise.all([
      getInterpretedMarkersWithIdsForIntake(supabase, id),
      getMarkersForIntake(supabase, id),
      getBloodRequestByIntake(supabase, id),
      getCurrentVsPreviousForIntake(supabase, intake.profile_id, id),
    ]);

    return NextResponse.json({
      ok: true,
      complexity,
      blood_results,
      marker_trends,
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
      blood_request: blood_request ? { id: blood_request.id, status: blood_request.status } : null,
      intake: {
        id: intake.id,
        status: intake.status,
        review_status: intake.review_status,
        review_priority: intake.review_priority,
        created_at: intake.created_at,
        updated_at: intake.updated_at,
        assigned_trichologist_id: intake.assigned_trichologist_id,
        patient_visible_summary: intake.patient_visible_summary,
        review_outcome: intake.review_outcome,
      },
      questionnaire: {
        schema_version: questionnaire?.schema_version ?? QUESTIONNAIRE_SCHEMA_VERSION,
        responses,
        updated_at: questionnaire?.updated_at ?? null,
      },
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
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
