// app/api/admin/intakes/[id]/report/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateDiagnosticReportPdf } from "@/lib/pdf-report";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(
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
      .select("kind")
      .eq("intake_id", id);

    const fileCount = { blood: 0, photo: 0 };
    for (const f of files || []) {
      if (f.kind === "blood") fileCount.blood++;
      if (f.kind === "photo") fileCount.photo++;
    }

    const selections =
      typeof intake.selections === "string"
        ? (() => {
            try {
              return JSON.parse(intake.selections);
            } catch {
              return {};
            }
          })()
        : intake.selections || {};

    const pdfBytes = await generateDiagnosticReportPdf({
      ...intake,
      selections,
      fileCount,
    });

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, "");
    const storagePath = `reports/${id}/diagnostic-report-${timestamp}.pdf`;

    const bucket = "hli-intakes";
    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 86400);

    return NextResponse.json({
      ok: true,
      storagePath,
      signedUrl: signed?.signedUrl || null,
      message: "Report generated and stored.",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}
