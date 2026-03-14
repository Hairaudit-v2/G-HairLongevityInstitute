/**
 * Doctor session: set or clear cookie for portal access.
 * POST { doctorId } -> sets session
 * DELETE -> clears session
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { setDoctorSession, clearDoctorSession } from "@/lib/doctorAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
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

    await setDoctorSession(doctorId);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearDoctorSession();
  return NextResponse.json({ ok: true });
}
