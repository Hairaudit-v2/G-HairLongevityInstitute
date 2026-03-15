/**
 * GET /api/longevity/reminders — List staged longevity reminders for internal inspection.
 * Trichologist-only. Query params: profile_id, intake_id, status (staged|sent|cancelled|failed), limit.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { listLongevityReminders } from "@/lib/longevity/reminders";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = ["staged", "sent", "cancelled", "failed"] as const;

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
    const intake_id = searchParams.get("intake_id")?.trim() || null;
    const statusParam = searchParams.get("status")?.trim() || null;
    const status = statusParam && ALLOWED_STATUSES.includes(statusParam as (typeof ALLOWED_STATUSES)[number])
      ? (statusParam as (typeof ALLOWED_STATUSES)[number])
      : null;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(500, Math.max(1, parseInt(limitParam, 10) || 200)) : 200;

    const supabase = supabaseAdmin();
    const reminders = await listLongevityReminders(supabase, {
      profile_id,
      intake_id,
      status,
      limit,
    });

    return NextResponse.json({
      ok: true,
      reminders,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
