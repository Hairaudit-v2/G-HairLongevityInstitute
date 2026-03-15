/**
 * GET /api/longevity/progress — Patient-facing progress states for dashboard.
 * Longevity-only. Requires longevity session (profile). Returns safe high-level states.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { getPatientProgressForProfile } from "@/lib/longevity/patientProgress";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Longevity API is disabled." },
      { status: 404 }
    );
  }
  try {
    const profileId = await getLongevitySessionFromRequest();
    if (!profileId) {
      return NextResponse.json(
        { ok: false, error: "Session required." },
        { status: 401 }
      );
    }

    const supabase = supabaseAdmin();
    const result = await getPatientProgressForProfile(supabase, profileId);

    return NextResponse.json({
      ok: true,
      progress: result.progress,
      latest_intake_id: result.latest_intake_id,
      treatment_outcome_summary: result.treatment_outcome_summary ?? null,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
