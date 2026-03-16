/**
 * POST /api/longevity/review/claim — Trichologist claims an intake (assigns self, sets under review).
 * Internal, longevity-scoped. Requires Trichologist auth.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS, REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { trackLongevityBetaEvent, BETA_EVENT } from "@/lib/longevity/analytics";

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
        assigned_trichologist_id: trichologist.id,
        assigned_at: now,
        review_status: REVIEW_STATUS.UNDER_TRICHOLOGIST_REVIEW,
        status: "in_review",
        updated_at: now,
      })
      .eq("id", intake_id)
      .select("id, review_status, review_priority, assigned_trichologist_id, assigned_at, created_at")
      .single();
    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    await trackLongevityBetaEvent(supabase, {
      event: BETA_EVENT.CASE_ASSIGNED,
      profile_id: intake.profile_id,
      intake_id: intake_id,
      payload: { trichologist_id: trichologist.id },
      actor_type: "trichologist",
    });

    return NextResponse.json({
      ok: true,
      intake: {
        id: updated.id,
        review_status: updated.review_status,
        review_priority: updated.review_priority,
        assigned_trichologist_id: updated.assigned_trichologist_id,
        assigned_at: updated.assigned_at,
        created_at: updated.created_at,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
