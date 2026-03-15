/**
 * POST /api/longevity/review/blood-markers — Trichologist creates a structured blood marker for an intake.
 * Phase H: manual ingestion. Requires Trichologist auth; intake must be in review queue.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import { createBloodResultMarker } from "@/lib/longevity/bloodResultMarkers";

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

export async function POST(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const trichologist = await getTrichologistFromRequest();
    if (!trichologist) {
      return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const intake_id = typeof body.intake_id === "string" ? body.intake_id.trim() : null;
    const marker_name = typeof body.marker_name === "string" ? body.marker_name.trim() : "";
    const value = numOrNull(body.value);
    if (!intake_id) {
      return NextResponse.json({ ok: false, error: "intake_id is required." }, { status: 400 });
    }
    if (!marker_name) {
      return NextResponse.json({ ok: false, error: "marker_name is required." }, { status: 400 });
    }
    if (value === null) {
      return NextResponse.json({ ok: false, error: "value is required and must be a number." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data: intake, error: fetchErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, review_status")
      .eq("id", intake_id)
      .single();
    if (fetchErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    if (!REVIEW_STATUS_IN_QUEUE.includes(intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number])) {
      return NextResponse.json(
        { ok: false, error: "Intake is not in the review queue." },
        { status: 403 }
      );
    }

    const blood_request_id = typeof body.blood_request_id === "string" ? body.blood_request_id.trim() || null : null;

    const result = await createBloodResultMarker(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      blood_request_id: blood_request_id ?? undefined,
      marker_name,
      value,
      unit: strOrNull(body.unit),
      reference_low: numOrNull(body.reference_low),
      reference_high: numOrNull(body.reference_high),
      collected_at: strOrNull(body.collected_at),
      lab_name: strOrNull(body.lab_name),
    });

    if ("error" in result) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      event_type: "blood_marker_created",
      payload: { trichologist_id: trichologist.id, marker_id: result.id, marker_name },
      actor_type: "trichologist",
    });

    return NextResponse.json({
      ok: true,
      marker_id: result.id,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
