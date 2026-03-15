/**
 * PATCH /api/longevity/review/blood-markers/[id] — Trichologist updates a blood result marker.
 * Phase H: manual ingestion. Requires Trichologist auth; marker's intake must be in review queue.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import {
  getBloodResultMarkerById,
  updateBloodResultMarker,
  type UpdateBloodResultMarkerPayload,
} from "@/lib/longevity/bloodResultMarkers";
import { stageLongevityRemindersForIntake } from "@/lib/longevity/reminders";

export const dynamic = "force-dynamic";

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function strOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = typeof v === "string" ? v.trim() : String(v).trim();
  return s === "" ? null : s;
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

    const { id: marker_id } = await params;
    if (!marker_id) {
      return NextResponse.json({ ok: false, error: "Marker id is required." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const marker = await getBloodResultMarkerById(supabase, marker_id);
    if (!marker) {
      return NextResponse.json({ ok: false, error: "Marker not found." }, { status: 404 });
    }

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, review_status")
      .eq("id", marker.intake_id)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    if (!REVIEW_STATUS_IN_QUEUE.includes(intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number])) {
      return NextResponse.json(
        { ok: false, error: "Intake is not in the review queue." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const payload: UpdateBloodResultMarkerPayload = {};
    if (body.marker_name !== undefined) payload.marker_name = typeof body.marker_name === "string" ? body.marker_name : marker.marker_name;
    if (body.value !== undefined) payload.value = numOrNull(body.value) ?? marker.value;
    if (body.unit !== undefined) payload.unit = strOrNull(body.unit);
    if (body.reference_low !== undefined) payload.reference_low = numOrNull(body.reference_low);
    if (body.reference_high !== undefined) payload.reference_high = numOrNull(body.reference_high);
    if (body.collected_at !== undefined) payload.collected_at = strOrNull(body.collected_at);
    if (body.lab_name !== undefined) payload.lab_name = strOrNull(body.lab_name);
    if (body.blood_request_id !== undefined) {
      payload.blood_request_id = typeof body.blood_request_id === "string" ? body.blood_request_id.trim() || null : null;
    }

    const result = await updateBloodResultMarker(supabase, marker_id, payload);
    if ("error" in result) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id: marker.intake_id,
      event_type: "blood_marker_updated",
      payload: { trichologist_id: trichologist.id, marker_id, updates: Object.keys(payload) },
      actor_type: "trichologist",
    });

    try {
      await stageLongevityRemindersForIntake(supabase, {
        profileId: intake.profile_id,
        intakeId: marker.intake_id,
      });
    } catch {
      // Reminder staging is additive; do not fail marker update if it fails.
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
