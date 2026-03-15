/**
 * POST /api/longevity/review/notes — Trichologist adds an internal note to an intake.
 * Internal, longevity-scoped. Requires Trichologist auth.
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
    const bodyText = typeof body.body === "string" ? body.body.trim() : "";
    if (!intake_id) {
      return NextResponse.json({ ok: false, error: "intake_id is required." }, { status: 400 });
    }
    if (!bodyText) {
      return NextResponse.json({ ok: false, error: "body is required." }, { status: 400 });
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

    const { data: note, error: insertErr } = await supabase
      .from("hli_longevity_review_notes")
      .insert({
        intake_id,
        trichologist_id: trichologist.id,
        body: bodyText,
      })
      .select("id, intake_id, created_at")
      .single();
    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      event_type: "review_note_added",
      payload: { trichologist_id: trichologist.id, note_id: note.id },
      actor_type: "trichologist",
    });

    return NextResponse.json({
      ok: true,
      note: {
        id: note.id,
        intake_id: note.intake_id,
        created_at: note.created_at,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
