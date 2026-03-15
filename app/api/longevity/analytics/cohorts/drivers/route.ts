/**
 * GET /api/longevity/analytics/cohorts/drivers
 * Cohort-level driver analytics: active driver distribution, persistent driver counts,
 * most common driver combinations. Internal only; trichologist auth.
 * Optional query: since= (ISO date), limit= (cap outbox rows).
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { getCohortDriverSummary } from "@/lib/longevity/analytics";

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
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 1000, 1), 5000) : 1000;

    const supabase = supabaseAdmin();
    const summary = await getCohortDriverSummary(supabase, { since, limit });

    const total = summary.total_signal_rows;
    const percentages: Record<string, number> = {};
    for (const [key, count] of Object.entries(summary.active_driver_distribution)) {
      percentages[key] = total > 0 ? Math.round((1000 * count) / total) / 10 : 0;
    }

    return NextResponse.json({
      ok: true,
      summary: {
        ...summary,
        active_driver_percentages: percentages,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
