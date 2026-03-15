import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import {
  dismissBloodMarkerExtractionDraft,
  getBloodMarkerExtractionDraftById,
  markBloodMarkerExtractionDraftApplied,
} from "@/lib/longevity/bloodMarkerExtractionDrafts";
import {
  createBloodResultMarker,
  getMarkersForIntake,
} from "@/lib/longevity/bloodResultMarkers";
import { resolveMarkerKey } from "@/lib/longevity/bloodMarkerRegistry";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";

export const dynamic = "force-dynamic";

function isMatchingStructuredMarker(
  existing: Awaited<ReturnType<typeof getMarkersForIntake>>[number],
  draft: NonNullable<Awaited<ReturnType<typeof getBloodMarkerExtractionDraftById>>>
): boolean {
  return (
    resolveMarkerKey(existing.marker_name) === resolveMarkerKey(draft.marker_name) &&
    existing.value === draft.value &&
    (existing.unit ?? "") === (draft.unit ?? "") &&
    (existing.reference_low ?? null) === (draft.reference_low ?? null) &&
    (existing.reference_high ?? null) === (draft.reference_high ?? null)
  );
}

export async function PATCH(
  req: Request,
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
      return NextResponse.json({ ok: false, error: "Draft id is required." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action.trim() : "";
    if (action !== "apply" && action !== "dismiss") {
      return NextResponse.json({ ok: false, error: "action must be 'apply' or 'dismiss'." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const draft = await getBloodMarkerExtractionDraftById(supabase, id);
    if (!draft) {
      return NextResponse.json({ ok: false, error: "Draft not found." }, { status: 404 });
    }
    if (draft.status !== "draft") {
      return NextResponse.json({ ok: false, error: "Draft has already been reviewed." }, { status: 400 });
    }

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, review_status")
      .eq("id", draft.intake_id)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    if (!REVIEW_STATUS_IN_QUEUE.includes(intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number])) {
      return NextResponse.json({ ok: false, error: "Intake is not in the review queue." }, { status: 403 });
    }

    if (action === "dismiss") {
      const result = await dismissBloodMarkerExtractionDraft(supabase, draft.id);
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
      }
      await auditLongevityEvent(supabase, {
        profile_id: intake.profile_id,
        intake_id: draft.intake_id,
        event_type: "blood_marker_extraction_draft_dismissed",
        payload: { trichologist_id: trichologist.id, draft_id: draft.id, marker_name: draft.marker_name },
        actor_type: "trichologist",
      });
      return NextResponse.json({ ok: true });
    }

    const existingMarkers = await getMarkersForIntake(supabase, draft.intake_id);
    if (existingMarkers.some((existing) => isMatchingStructuredMarker(existing, draft))) {
      return NextResponse.json(
        { ok: false, error: "A matching structured blood marker already exists for this intake." },
        { status: 400 }
      );
    }

    const createResult = await createBloodResultMarker(supabase, {
      profile_id: intake.profile_id,
      intake_id: draft.intake_id,
      blood_request_id: draft.blood_request_id,
      marker_name: draft.marker_name,
      value: draft.value,
      unit: draft.unit,
      reference_low: draft.reference_low,
      reference_high: draft.reference_high,
    });
    if ("error" in createResult) {
      return NextResponse.json({ ok: false, error: createResult.error }, { status: 400 });
    }

    const applyResult = await markBloodMarkerExtractionDraftApplied(supabase, draft.id, createResult.id);
    if (!applyResult.ok) {
      return NextResponse.json({ ok: false, error: applyResult.error }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id: draft.intake_id,
      event_type: "blood_marker_extraction_draft_applied",
      payload: {
        trichologist_id: trichologist.id,
        draft_id: draft.id,
        marker_id: createResult.id,
        marker_name: draft.marker_name,
      },
      actor_type: "trichologist",
    });

    return NextResponse.json({ ok: true, marker_id: createResult.id });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
