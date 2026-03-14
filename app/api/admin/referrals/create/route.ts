/**
 * Create a medical referral (AU). Triggered after auditor approval or AI scoring.
 * Admin/auditor only (server-side check; no auth wired yet).
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { intakeId, reportId, reason } = body;
    if (!intakeId) {
      return NextResponse.json({ ok: false, error: "Missing intakeId." }, { status: 400 });
    }

    // TODO: Add admin/auditor auth check when wired
    const supabase = supabaseAdmin();

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_intakes")
      .select("id, country")
      .eq("id", intakeId)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from("hli_medical_referrals")
      .select("id")
      .eq("intake_id", intakeId)
      .in("status", ["pending", "assigned", "in_review", "needs_more_info"])
      .limit(1)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: false, error: "Active referral already exists." }, { status: 409 });
    }

    const { data: ref, error } = await supabase
      .from("hli_medical_referrals")
      .insert({
        intake_id: intakeId,
        report_id: reportId || null,
        country: "AU",
        status: "pending",
        reason: reason || null,
        patient_country: intake.country || null,
      })
      .select("id, status, created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, referral: ref });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
