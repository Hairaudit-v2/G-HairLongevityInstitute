/**
 * Longevity trichologist management API. Trichologist-authenticated only.
 * GET: list trichologists. POST: add a new trichologist (create auth user + row).
 * Isolated to longevity; does not affect HLI admin or other auth.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const { data: rows, error } = await supabase
    .from("hli_longevity_trichologists")
    .select("id, email, display_name, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    trichologists: (rows ?? []).map((r) => ({
      id: r.id,
      email: r.email ?? null,
      display_name: r.display_name ?? null,
      is_active: r.is_active ?? true,
      created_at: r.created_at,
    })),
  });
}

export async function POST(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const full_name = typeof body.full_name === "string" ? body.full_name.trim() || null : null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "A valid email is required." }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  const { data: existingRow } = await supabase
    .from("hli_longevity_trichologists")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (existingRow) {
    return NextResponse.json({ ok: false, error: "A trichologist with this email already exists." }, { status: 409 });
  }

  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existingAuth = (authUsers?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email);
  let authUserId: string;

  if (existingAuth) {
    authUserId = existingAuth.id;
    const { data: linkRow } = await supabase
      .from("hli_longevity_trichologists")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (linkRow) {
      return NextResponse.json({ ok: false, error: "This email is already linked to a trichologist." }, { status: 409 });
    }
  } else {
    const password = `Tmp${Math.random().toString(36).slice(2, 14)}!`;
    const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) {
      return NextResponse.json({ ok: false, error: createErr.message }, { status: 400 });
    }
    authUserId = createData.user?.id ?? "";
    if (!authUserId) {
      return NextResponse.json({ ok: false, error: "Failed to create auth user." }, { status: 500 });
    }
    const { data: inserted, error: insertErr } = await supabase
      .from("hli_longevity_trichologists")
      .insert({
        auth_user_id: authUserId,
        email,
        display_name: full_name,
        is_active: true,
      })
      .select("id, email, display_name")
      .single();
    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      trichologist: {
        id: inserted.id,
        email: inserted.email,
        display_name: inserted.display_name ?? null,
      },
      initial_password: password,
      message: "Share the sign-in link and one-time password securely. They can change it after first sign-in at /portal/login.",
    });
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("hli_longevity_trichologists")
    .insert({
      auth_user_id: authUserId,
      email,
      display_name: full_name,
      is_active: true,
    })
    .select("id, email, display_name")
    .single();
  if (insertErr) {
    return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    trichologist: {
      id: inserted.id,
      email: inserted.email,
      display_name: inserted.display_name ?? null,
    },
    message: "Existing auth user linked as trichologist. They can sign in at /portal/login.",
  });
}
