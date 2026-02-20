import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const BUCKET = "hli-intakes";
const URL_EXPIRY_SEC = 86400 * 7; // 7 days

export async function POST(
  req: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    if (!reportId) return NextResponse.json({ ok: false, error: "Missing reportId." }, { status: 400 });

    const supabase = supabaseAdmin();

    const { data: report, error: fetchErr } = await supabase
      .from("hli_reports")
      .select("id, intake_id, status, storage_path")
      .eq("id", reportId)
      .single();

    if (fetchErr || !report) {
      return NextResponse.json({ ok: false, error: "Report not found." }, { status: 404 });
    }

    if (report.status !== "approved") {
      return NextResponse.json(
        { ok: false, error: "Report must be approved before release." },
        { status: 400 }
      );
    }

    const { error: updateErr } = await supabase
      .from("hli_reports")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("id", reportId);

    if (updateErr) return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });

    let signedUrl: string | null = null;
    if (report.storage_path) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(report.storage_path, URL_EXPIRY_SEC);
      signedUrl = signed?.signedUrl ?? null;
    }

    // TODO: email hook stub - trigger patient notification here
    // await sendReportToPatient(report.intake_id, signedUrl);

    return NextResponse.json({
      ok: true,
      message: "Report released to patient.",
      signedUrl,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
