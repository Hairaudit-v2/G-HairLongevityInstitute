/**
 * GET /api/longevity/analytics/cohorts/adherence
 * Cohort-level adherence analytics: high follow-up adherence, delayed pattern,
 * repeat reminder required counts and percentages. Internal only; trichologist auth.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { getCohortAdherenceSummary } from "@/lib/longevity/analytics";

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

    const supabase = supabaseAdmin();
    const summary = await getCohortAdherenceSummary(supabase);

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
