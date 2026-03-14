/**
 * List and create doctors (AU).
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("hli_doctors")
      .select("*")
      .eq("country", "AU")
      .order("full_name");

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, doctors: data ?? [] });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { full_name, email, license_number, registration_body, specialty } = body;
    if (!full_name || !email) {
      return NextResponse.json({ ok: false, error: "Missing full_name or email." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("hli_doctors")
      .insert({
        full_name,
        email: email.trim().toLowerCase(),
        country: "AU",
        license_number: license_number || null,
        registration_body: registration_body || null,
        specialty: specialty || null,
        active: true,
      })
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
