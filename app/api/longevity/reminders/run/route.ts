import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runLongevityReminderSweep } from "@/lib/longevity/reminders";

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
      { ok: false, error: "Reminder runner authorization failed." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const intakeId =
      typeof body.intake_id === "string" ? body.intake_id.trim() || null : null;
    const profileId =
      typeof body.profile_id === "string"
        ? body.profile_id.trim() || null
        : null;
    const limit =
      typeof body.limit === "number" && Number.isFinite(body.limit)
        ? body.limit
        : undefined;

    const supabase = supabaseAdmin();
    const result = await runLongevityReminderSweep(supabase, {
      intakeId,
      profileId,
      limit,
    });

    return NextResponse.json({
      ok: true,
      mode: "staged_only",
      ...result,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
