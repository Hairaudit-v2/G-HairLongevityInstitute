/**
 * GET /api/longevity/exceptions — Operational exceptions (trichologist-only).
 * Returns exception groups (started never submitted, submitted no docs, etc.) with actionable rows.
 * Query: ?olderThan=24h|72h|7d|all (default all).
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { getExceptions } from "@/lib/longevity/exceptions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const olderThan = searchParams.get("olderThan")?.trim() || "all";

  try {
    const supabase = supabaseAdmin();
    const result = await getExceptions(supabase, { olderThan });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
