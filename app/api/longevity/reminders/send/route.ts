/**
 * POST /api/longevity/reminders/send — Send staged reminders by email.
 * Secret-protected (same as reminder run). Processes status=staged only; updates to sent/failed.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendStagedLongevityReminders } from "@/lib/longevity/reminders";

export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const expected = process.env.HLI_LONGEVITY_REMINDER_RUN_SECRET;
  if (!expected) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${expected}`;
}

export async function POST(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Longevity API is disabled." },
      { status: 404 }
    );
  }
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: "Reminder send authorization failed." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const limit =
      typeof body.limit === "number" && Number.isFinite(body.limit)
        ? Math.min(100, Math.max(1, body.limit))
        : 50;

    const supabase = supabaseAdmin();
    const result = await sendStagedLongevityReminders(supabase, { limit });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
