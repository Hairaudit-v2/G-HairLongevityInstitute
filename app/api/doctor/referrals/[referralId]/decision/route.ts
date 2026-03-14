/**
 * Doctor decision on referral: needs_more_info | approved | declined | completed.
 * Writes hli_medical_notes. Does NOT generate prescriptions.
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getDoctorIdFromRequest } from "@/lib/doctorAuth";
import { notifyPatientReferralUpdate } from "@/lib/notify";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["needs_more_info", "approved", "declined", "completed"] as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ referralId: string }> }
) {
  try {
    const doctorId = await getDoctorIdFromRequest();
    if (!doctorId) {
      return NextResponse.json({ ok: false, error: "Doctor session required." }, { status: 401 });
    }

    const { referralId } = await params;
    if (!referralId) {
      return NextResponse.json({ ok: false, error: "Missing referralId." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { status, note, recommendation_summary, next_steps, dht_modulation_consideration } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { data: doctor } = await supabase
      .from("hli_doctors")
      .select("id, full_name, email")
      .eq("id", doctorId)
      .eq("active", true)
      .single();
    if (!doctor) {
      return NextResponse.json({ ok: false, error: "Doctor not found." }, { status: 401 });
    }

    const { data: ref, error: refErr } = await supabase
      .from("hli_medical_referrals")
      .select("id, intake_id, status")
      .eq("id", referralId)
      .eq("assigned_doctor_id", doctorId)
      .single();

    if (refErr || !ref) {
      return NextResponse.json({ ok: false, error: "Referral not found or not assigned to you." }, { status: 404 });
    }

    const decisionPayload: Record<string, unknown> = {};
    if (status === "approved") {
      if (recommendation_summary) decisionPayload.recommendation_summary = recommendation_summary;
      if (next_steps) decisionPayload.next_steps = next_steps;
      if (dht_modulation_consideration !== undefined) decisionPayload.dht_modulation_consideration = !!dht_modulation_consideration;
    }

    const noteText = [
      note || "",
      status === "approved" && recommendation_summary ? `Recommendation: ${recommendation_summary}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const { error: noteErr } = await supabase.from("hli_medical_notes").insert({
      referral_id: referralId,
      author_type: "doctor",
      author: doctor.full_name || doctor.email,
      note: noteText || `Status changed to ${status}`,
    });

    if (noteErr) {
      return NextResponse.json({ ok: false, error: noteErr.message }, { status: 500 });
    }

    const { data: updated, error: updateErr } = await supabase
      .from("hli_medical_referrals")
      .update({
        status,
        decision_payload: Object.keys(decisionPayload).length > 0 ? decisionPayload : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", referralId)
      .select("id, status")
      .single();

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    notifyPatientReferralUpdate(ref.intake_id, status);

    return NextResponse.json({ ok: true, referral: updated });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
