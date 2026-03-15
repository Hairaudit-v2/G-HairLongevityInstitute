/**
 * GET /api/longevity/analytics/cohorts/treatments
 * Cohort-level treatment analytics: treatment continuity distribution,
 * outcome correlation state counts. High-level, from normalized outbox signals only.
 * Internal only; trichologist auth. Optional query: since=, limit=.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { getCohortTreatmentSummary } from "@/lib/longevity/analytics";

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
    const summary = await getCohortTreatmentSummary(supabase, { since, limit });

    return NextResponse.json({
      ok: true,
      summary,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
