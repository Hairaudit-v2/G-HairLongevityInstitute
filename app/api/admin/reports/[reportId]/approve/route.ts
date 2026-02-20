import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    if (!reportId) return NextResponse.json({ ok: false, error: "Missing reportId." }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const author = body.author ?? "auditor";

    const supabase = supabaseAdmin();

    const { data: report, error: fetchErr } = await supabase
      .from("hli_reports")
      .select("id, intake_id, status")
      .eq("id", reportId)
      .single();

    if (fetchErr || !report) {
      return NextResponse.json({ ok: false, error: "Report not found." }, { status: 404 });
    }

    if (report.status === "released") {
      return NextResponse.json({ ok: false, error: "Report already released." }, { status: 400 });
    }

    const { error: updateErr } = await supabase
      .from("hli_reports")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", reportId);

    if (updateErr) return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });

    await supabase.from("hli_auditor_notes").insert({
      report_id: reportId,
      intake_id: report.intake_id,
      author,
      note: "Approved",
      status: "approved",
    });

    return NextResponse.json({ ok: true, message: "Report approved." });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
