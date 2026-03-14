/**
 * Assign a doctor to a referral.
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ referralId: string }> }
) {
  try {
    const { referralId } = await params;
    if (!referralId) {
      return NextResponse.json({ ok: false, error: "Missing referralId." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { doctorId } = body;
    if (!doctorId) {
      return NextResponse.json({ ok: false, error: "Missing doctorId." }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { data: doctor } = await supabase
      .from("hli_doctors")
      .select("id")
      .eq("id", doctorId)
      .eq("active", true)
      .single();
    if (!doctor) {
      return NextResponse.json({ ok: false, error: "Doctor not found or inactive." }, { status: 404 });
    }

    const { data: ref, error } = await supabase
      .from("hli_medical_referrals")
      .update({
        assigned_doctor_id: doctorId,
        status: "assigned",
        updated_at: new Date().toISOString(),
      })
      .eq("id", referralId)
      .select("id, status, assigned_doctor_id")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    if (!ref) {
      return NextResponse.json({ ok: false, error: "Referral not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, referral: ref });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
