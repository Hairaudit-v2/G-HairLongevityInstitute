/**
 * GET /api/longevity/insights — Beta insights dashboard data (trichologist-only).
 * Returns event counts, derived metrics, and recent activity from hli_longevity_audit_events.
 * Query: ?since=7d | 30d | all (default 30d).
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import {
  getBetaEventCounts,
  getBetaDerivedMetrics,
  getBetaRecentEvents,
} from "@/lib/longevity/betaInsights";

export const dynamic = "force-dynamic";

function parseSince(param: string | null): string | null {
  const v = param?.toLowerCase().trim();
  if (!v || v === "all") return null;
  const now = Date.now();
  if (v === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  if (v === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  return null;
}

export async function GET(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sinceParam = searchParams.get("since");
  const since = parseSince(sinceParam);

  try {
    const supabase = supabaseAdmin();
    const [counts, derived, recent] = await Promise.all([
      getBetaEventCounts(supabase, { since }),
      getBetaDerivedMetrics(supabase, { since }),
      getBetaRecentEvents(supabase, { since, limit: 50 }),
    ]);

    return NextResponse.json({
      ok: true,
      since: since ?? "all",
      counts,
      derived,
      recent,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
