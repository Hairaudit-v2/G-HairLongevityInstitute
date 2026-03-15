/**
 * GET /api/longevity/analytics/benchmarks
 * Internal benchmark metric summaries for future FI comparison. Not public ranking.
 * Trichologist auth. Optional query: since=, limit=.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { getBenchmarkMetrics } from "@/lib/longevity/benchmarking";

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
    const metrics = await getBenchmarkMetrics(supabase, { since, limit });

    return NextResponse.json({
      ok: true,
      metrics,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
