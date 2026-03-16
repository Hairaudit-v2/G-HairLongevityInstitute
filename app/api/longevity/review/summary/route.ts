/**
 * POST /api/longevity/review/summary — Trichologist saves patient_visible_summary as draft (no release).
 * Internal, longevity-scoped. Requires Trichologist auth.
 * Does not set patient_visible_released_at. Use /api/longevity/review/release to release.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { auditLongevityEvent } from "@/lib/longevity/documents";

export const dynamic = "force-dynamic";

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
    const patient_visible_summary = typeof body.patient_visible_summary === "string" ? body.patient_visible_summary : "";
    if (!intake_id) {
      return NextResponse.json({ ok: false, error: "intake_id is required." }, { status: 400 });
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
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { data: updated, error: updateErr } = await supabase
      .from("hli_longevity_intakes")
      .update({
        patient_visible_summary,
        last_reviewed_at: now,
        updated_at: now,
      })
      .eq("id", intake_id)
      .select("id, patient_visible_summary, last_reviewed_at")
      .single();
    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      event_type: "patient_summary_saved",
      payload: { trichologist_id: trichologist.id },
      actor_type: "trichologist",
    });

    return NextResponse.json({
      ok: true,
      intake: {
        id: updated.id,
        patient_visible_summary: updated.patient_visible_summary ?? null,
        last_reviewed_at: updated.last_reviewed_at ?? null,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
