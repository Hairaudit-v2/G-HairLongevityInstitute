// app/api/admin/intakes/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured." },
        { status: 500 }
      );
    }

    const supabase = supabaseAdmin();

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_intakes")
      .select("*")
      .eq("id", id)
      .single();

    if (intakeErr || !intake) {
      return NextResponse.json(
        { ok: false, error: intakeErr?.message || "Intake not found." },
        { status: 404 }
      );
    }

    const { data: files } = await supabase
      .from("hli_intake_files")
      .select("id, kind, filename, storage_path, mime_type, size_bytes, created_at")
      .eq("intake_id", id)
      .order("created_at", { ascending: true });

    const bucket = "hli-intakes";
    const filesWithUrls = await Promise.all(
      (files || []).map(async (f) => {
        const { data: signed } = await supabase.storage
          .from(bucket)
          .createSignedUrl(f.storage_path, 3600);
        return {
          ...f,
          signed_url: signed?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      intake: { ...intake, files: filesWithUrls },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}
