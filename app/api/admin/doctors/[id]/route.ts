/**
 * Update doctor (edit, activate/deactivate).
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const { full_name, email, license_number, registration_body, specialty, active } = body;

    const updates: Record<string, unknown> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (license_number !== undefined) updates.license_number = license_number || null;
    if (registration_body !== undefined) updates.registration_body = registration_body || null;
    if (specialty !== undefined) updates.specialty = specialty || null;
    if (active !== undefined) updates.active = !!active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: "No fields to update." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("hli_doctors")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, doctor: data });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
