/**
 * GET /api/longevity/analytics/predictive-readiness
 * Transparent predictive-readiness summaries for future FI layers. Not clinical decision automation.
 * Trichologist auth. Optional query: profile_id= (per-person), since=, limit=.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import {
  getCohortReadinessSummary,
  getPersonReadiness,
} from "@/lib/longevity/predictiveReadiness";

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
    const profile_id = searchParams.get("profile_id")?.trim() || null;
    const since = searchParams.get("since")?.trim() || null;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 1000, 1), 5000) : 1000;

    const supabase = supabaseAdmin();
    const options = { since, limit };

    if (profile_id) {
      const personReadiness = await getPersonReadiness(supabase, profile_id, options);
      return NextResponse.json({
        ok: true,
        profile_id,
        readiness: personReadiness,
      });
    }

    const cohortSummary = await getCohortReadinessSummary(supabase, options);
    return NextResponse.json({
      ok: true,
      cohort: cohortSummary,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
