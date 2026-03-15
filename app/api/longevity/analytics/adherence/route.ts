/**
 * GET /api/longevity/analytics/adherence — Adherence and return metrics for reminders.
 * Trichologist-only. Query: since= (ISO date) to filter metrics to that window.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { getAdherenceMetrics } from "@/lib/longevity/reminderOutcomes";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Longevity API is disabled." },
      { status: 404 }
    );
  }
  try {
    const trichologist = await getTrichologistFromRequest();
    if (!trichologist) {
      return NextResponse.json(
        { ok: false, error: "Trichologist authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since")?.trim() || null;

    const supabase = supabaseAdmin();
    const metrics = await getAdherenceMetrics(supabase, { since });

    const { data: recentOutcomes } = await supabase
      .from("hli_longevity_reminder_outcomes")
      .select(
        "id, reminder_id, profile_id, outcome_type, related_intake_id, related_document_id, occurred_at, delay_days, created_at"
      )
      .order("occurred_at", { ascending: false })
      .limit(50);

    const list = recentOutcomes ?? [];
    const recent_outcomes = since
      ? list.filter((o) => o.occurred_at >= since)
      : list;

    return NextResponse.json({
      ok: true,
      metrics,
      recent_outcomes,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
