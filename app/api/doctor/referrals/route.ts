/**
 * List referrals assigned to the current doctor.
 * Uses session cookie for doctor identity. No storage paths exposed.
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getDoctorIdFromRequest } from "@/lib/doctorAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const doctorId = await getDoctorIdFromRequest();
    if (!doctorId) {
      return NextResponse.json({ ok: false, error: "Doctor session required." }, { status: 401 });
    }

    const supabase = supabaseAdmin();
    const { data: refs, error } = await supabase
      .from("hli_medical_referrals")
      .select("id, intake_id, report_id, status, reason, patient_country, created_at")
      .eq("assigned_doctor_id", doctorId)
      .not("status", "in", "('completed','declined')")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const intakeIds = [...new Set((refs ?? []).map((r) => r.intake_id))];
    const { data: intakes } =
      intakeIds.length > 0
        ? await supabase
            .from("hli_intakes")
            .select("id, full_name, dob, sex, primary_concern")
            .in("id", intakeIds)
        : { data: [] };
    const intakeMap = new Map((intakes ?? []).map((i) => [i.id, i]));

    return NextResponse.json({
      ok: true,
      referrals: (refs ?? []).map((r) => {
        const in0 = intakeMap.get(r.intake_id);
        return {
          id: r.id,
          intake_id: r.intake_id,
          report_id: r.report_id,
          status: r.status,
          reason: r.reason,
          patient_country: r.patient_country,
          created_at: r.created_at,
          intake_summary: in0
            ? { full_name: in0.full_name, dob: in0.dob, sex: in0.sex, primary_concern: in0.primary_concern }
            : null,
        };
      }),
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
