/**
 * List all referrals for admin dashboard.
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const intakeId = searchParams.get("intakeId");

    const supabase = supabaseAdmin();
    let q = supabase
      .from("hli_medical_referrals")
      .select("id, intake_id, report_id, status, reason, assigned_doctor_id, patient_country, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (status) {
      q = q.eq("status", status);
    }
    if (intakeId) {
      q = q.eq("intake_id", intakeId);
    }

    const { data: refs, error } = await q;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const doctorIds = [...new Set((refs ?? []).map((r) => r.assigned_doctor_id).filter(Boolean))];
    const intakeIds = [...new Set((refs ?? []).map((r) => r.intake_id))];

    const [doctorsRes, intakesRes] = await Promise.all([
      doctorIds.length > 0
        ? supabase.from("hli_doctors").select("id, full_name, email").in("id", doctorIds)
        : { data: [] },
      intakeIds.length > 0
        ? supabase.from("hli_intakes").select("id, full_name, primary_concern, country").in("id", intakeIds)
        : { data: [] },
    ]);

    const doctorMap = new Map((doctorsRes.data ?? []).map((d) => [d.id, d]));
    const intakeMap = new Map((intakesRes.data ?? []).map((i) => [i.id, i]));

    const enriched = (refs ?? []).map((r) => ({
      ...r,
      doctor: r.assigned_doctor_id ? doctorMap.get(r.assigned_doctor_id) : null,
      intake: intakeMap.get(r.intake_id) ?? null,
    }));

    return NextResponse.json({ ok: true, referrals: enriched });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
