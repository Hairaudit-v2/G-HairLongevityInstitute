import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const BUCKET = "hli-intakes";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ intakeId: string }> }
) {
  try {
    const { intakeId } = await params;
    if (!intakeId) return NextResponse.json({ ok: false, error: "Missing intakeId." }, { status: 400 });

    const supabase = supabaseAdmin();

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_intakes")
      .select("*")
      .eq("id", intakeId)
      .single();

    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }

    const { data: extractions } = await supabase
      .from("hli_ai_extractions")
      .select("*")
      .eq("intake_id", intakeId)
      .order("created_at", { ascending: true });

    const { data: scores } = await supabase
      .from("hli_ai_scores")
      .select("*")
      .eq("intake_id", intakeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { data: reports } = await supabase
      .from("hli_reports")
      .select("*")
      .eq("intake_id", intakeId)
      .order("created_at", { ascending: false });

    const latestReport = reports?.[0] ?? null;
    let reportSignedUrl: string | null = null;
    if (latestReport?.storage_path) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(latestReport.storage_path, 3600);
      reportSignedUrl = signed?.signedUrl ?? null;
    }

    const { data: auditorNotes } = latestReport
      ? await supabase
          .from("hli_auditor_notes")
          .select("*")
          .eq("report_id", latestReport.id)
          .order("created_at", { ascending: false })
      : { data: [] };

    const { data: files } = await supabase
      .from("hli_intake_files")
      .select("id, kind, filename, storage_path")
      .eq("intake_id", intakeId);

    const bloodExtraction = extractions?.find((e) => e.type === "blood");
    const imageExtractions = extractions?.filter((e) => e.type === "image") ?? [];

    return NextResponse.json({
      ok: true,
      intake,
      bloodMarkers: bloodExtraction?.payload?.markers ?? [],
      imageSignals: imageExtractions.map((e) => e.payload),
      scores: scores
        ? {
            domain_scores: scores.domain_scores,
            overall_score: scores.overall_score,
            risk_tier: scores.risk_tier,
            explainability: scores.explainability,
          }
        : null,
      report: latestReport
        ? { ...latestReport, signed_url: reportSignedUrl }
        : null,
      auditorNotes: auditorNotes ?? [],
      files: files ?? [],
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
