/**
 * GET /api/longevity/analytics/person/[personId]
 * Person-level analytics: timeline and analytics-ready record count for one profile.
 * Internal only; trichologist auth. Optional query: since=, limit=.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { consumeOutbox } from "@/lib/longevity/analytics";
import { buildTimelineFromOutboxRows } from "@/lib/longevity/analyticsTimeline";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ personId: string }> }
) {
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

    const { personId } = await params;
    const profile_id = personId?.trim() || null;
    if (!profile_id) {
      return NextResponse.json(
        { ok: false, error: "personId is required." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since")?.trim() || null;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 500, 1), 2000) : 500;

    const supabase = supabaseAdmin();
    const rows = await consumeOutbox(supabase, { profile_id, since, limit });
    const timeline = buildTimelineFromOutboxRows(rows);

    return NextResponse.json({
      ok: true,
      profile_id,
      timeline,
      record_count: rows.length,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
