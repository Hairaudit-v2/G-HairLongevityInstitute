/**
 * GET /api/longevity/blood-requests — List blood requests for the current patient (profile).
 * Returns recommended_tests and metadata; no letter generation. Patient session only.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { listBloodRequestsForProfile } from "@/lib/longevity/bloodRequests";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const profileId = await getLongevitySessionFromRequest();
    if (!profileId) {
      return NextResponse.json({ ok: true, blood_requests: [] });
    }
    const supabase = supabaseAdmin();
    const blood_requests = await listBloodRequestsForProfile(supabase, profileId);
    return NextResponse.json({ ok: true, blood_requests });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
