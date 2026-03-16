/**
 * GET /api/longevity/review/metrics — Operational queue metrics (trichologist-only).
 * Lightweight aggregates from hli_longevity_intakes for queue health visibility.
 * No analytics system; simple counts and wait-time indicators.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE, REVIEW_STATUS } from "@/lib/longevity/reviewConstants";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const now = new Date().toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalSubmitted },
    { count: inQueue },
    { count: assigned },
    { count: completed },
    { count: waitingOver24h },
    { count: waitingOver48h },
    { data: completedRows },
  ] = await Promise.all([
    supabase
      .from("hli_longevity_intakes")
      .select("id", { count: "exact", head: true })
      .neq("status", "draft"),
    supabase
      .from("hli_longevity_intakes")
      .select("id", { count: "exact", head: true })
      .in("review_status", REVIEW_STATUS_IN_QUEUE),
    supabase
      .from("hli_longevity_intakes")
      .select("id", { count: "exact", head: true })
      .in("review_status", REVIEW_STATUS_IN_QUEUE)
      .not("assigned_trichologist_id", "is", null),
    supabase
      .from("hli_longevity_intakes")
      .select("id", { count: "exact", head: true })
      .eq("review_status", REVIEW_STATUS.REVIEW_COMPLETE),
    supabase
      .from("hli_longevity_intakes")
      .select("id", { count: "exact", head: true })
      .in("review_status", REVIEW_STATUS_IN_QUEUE)
      .lt("created_at", twentyFourHoursAgo),
    supabase
      .from("hli_longevity_intakes")
      .select("id", { count: "exact", head: true })
      .in("review_status", REVIEW_STATUS_IN_QUEUE)
      .lt("created_at", fortyEightHoursAgo),
    supabase
      .from("hli_longevity_intakes")
      .select("created_at, patient_visible_released_at")
      .eq("review_status", REVIEW_STATUS.REVIEW_COMPLETE)
      .not("patient_visible_released_at", "is", null),
  ]);

  let avg_hours_to_release: number | null = null;
  if (completedRows?.length) {
    const hours = completedRows
      .map((r) => {
        const created = new Date(r.created_at).getTime();
        const released = new Date(r.patient_visible_released_at as string).getTime();
        return (released - created) / (1000 * 60 * 60);
      })
      .filter((h) => Number.isFinite(h));
    if (hours.length) {
      avg_hours_to_release = hours.reduce((a, b) => a + b, 0) / hours.length;
    }
  }

  return NextResponse.json({
    ok: true,
    metrics: {
      total_submitted: totalSubmitted ?? 0,
      in_queue: inQueue ?? 0,
      assigned: assigned ?? 0,
      completed: completed ?? 0,
      waiting_over_24h: waitingOver24h ?? 0,
      waiting_over_48h: waitingOver48h ?? 0,
      avg_hours_to_release: avg_hours_to_release != null ? Math.round(avg_hours_to_release * 10) / 10 : null,
    },
  });
}
