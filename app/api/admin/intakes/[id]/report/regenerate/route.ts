/**
 * Regenerate premium report from existing extraction data.
 * Use when extraction already succeeded but the report was generated without blood markers
 * (e.g. before the PDF extraction fix). No re-extraction - uses hli_ai_extractions + hli_ai_scores.
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { renderPremiumReport } from "@/lib/report/renderPremiumReport";

export const dynamic = "force-dynamic";

const BUCKET = "hli-intakes";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: intakeId } = await params;
    if (!intakeId) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });

    const supabase = supabaseAdmin();

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_intakes")
      .select("*")
      .eq("id", intakeId)
      .single();

    if (intakeErr || !intake)
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });

    const { data: bloodExtraction } = await supabase
      .from("hli_ai_extractions")
      .select("payload")
      .eq("intake_id", intakeId)
      .eq("type", "blood")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { data: imageExtractions } = await supabase
      .from("hli_ai_extractions")
      .select("payload")
      .eq("intake_id", intakeId)
      .eq("type", "image")
      .order("created_at", { ascending: true });

    const { data: scores } = await supabase
      .from("hli_ai_scores")
      .select("domain_scores, overall_score, risk_tier, explainability")
      .eq("intake_id", intakeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const bloodMarkers = (bloodExtraction?.payload?.markers ?? []).map(
      (m: { name: string; value?: unknown; unit?: string; referenceRange?: string; flag?: string }) => ({
        name: m.name,
        value: m.value ?? null,
        unit: m.unit,
        referenceRange: m.referenceRange,
        flag: m.flag,
      })
    );

    const imageCaptionsRaw = (imageExtractions ?? []).map((e: { payload?: { filename?: string; storage_path?: string; signals?: { summary?: string; scalp_visibility_proxy?: number; redness_proxy?: number } } }) => ({
      filename: e.payload?.filename ?? "Image",
      storage_path: e.payload?.storage_path,
      caption: e.payload?.signals?.summary ?? `Signals: visibility ${e.payload?.signals?.scalp_visibility_proxy ?? "—"}, redness ${e.payload?.signals?.redness_proxy ?? "—"}`,
    }));
    const imageCaptions: Array<{ filename: string; caption: string; imageBytes?: Uint8Array; mimeType?: string }> = [];
    for (const ic of imageCaptionsRaw) {
      let imageBytes: Uint8Array | undefined;
      let mimeType: string | undefined;
      if (ic.storage_path) {
        const { data } = await supabase.storage.from(BUCKET).download(ic.storage_path);
        if (data) {
          imageBytes = new Uint8Array(await data.arrayBuffer());
          const ext = (ic.filename || "").toLowerCase().split(".").pop();
          if (/(jpe?g|jfif)/.test(ext || "")) mimeType = "image/jpeg";
          else if (ext === "png") mimeType = "image/png";
        }
      }
      imageCaptions.push({
        filename: ic.filename,
        caption: ic.caption,
        imageBytes,
        mimeType,
      });
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
        : intake.selections ?? {};

    const domainScores = scores?.domain_scores ?? {
      androgen_exposure: 5,
      inflammatory_load: 5,
      thyroid_metabolic: 5,
      nutrient_sufficiency: 5,
      stress_regulation: 5,
    };
    const overallScore = scores?.overall_score ?? 5;
    const riskTier = scores?.risk_tier ?? "moderate";
    const explainability = scores?.explainability ?? {};

    const patientAge = intake.dob
      ? Math.floor((Date.now() - new Date(intake.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;
    const trt =
      selections.trt === true ||
      selections.trt === "yes" ||
      (Array.isArray(selections.meds) && selections.meds.includes("trt"));
    const dhtManagement =
      selections.dht_management === true ||
      selections.dht_management === "yes" ||
      (Array.isArray(selections.meds) &&
        (selections.meds.includes("finasteride") || selections.meds.includes("dutasteride")));

    type Marker = { name: string; value?: unknown; unit?: string; referenceRange?: string; flag?: string };
    const freeTMarker = bloodMarkers.find(
      (m: Marker) =>
        m.name === "Free Testosterone" &&
        (typeof m.value === "number" || typeof m.value === "string") &&
        m.referenceRange
    );
    let freeTPct: number | null = null;
    if (freeTMarker && freeTMarker.referenceRange) {
      const val = typeof freeTMarker.value === "string" ? parseFloat(freeTMarker.value) : (freeTMarker.value as number);
      const m = freeTMarker.referenceRange.match(/(\d+\.?\d*)\s*[-–to]+\s*(\d+\.?\d*)/i);
      if (m && !isNaN(val)) {
        const low = parseFloat(m[1]);
        const high = parseFloat(m[2]);
        if (high > low) freeTPct = Math.min(100, Math.max(0, ((val - low) / (high - low)) * 100));
      }
    }

    const androgenContext =
      intake.sex?.toLowerCase() === "male" && patientAge >= 15 && patientAge <= 70
        ? { patientAge, sex: intake.sex, trt, dhtManagement, freeTPct }
        : undefined;

    const pdfInput = {
      intake: {
        id: intake.id,
        full_name: intake.full_name,
        email: intake.email,
        dob: intake.dob,
        sex: intake.sex,
        country: intake.country,
        primary_concern: intake.primary_concern,
        selections,
        notes: intake.notes,
        created_at: intake.created_at,
      },
      bloodMarkers,
      domainScores,
      overallScore,
      riskTier,
      explainability,
      imageCaptions,
      androgenContext,
      version: 1,
    };

    const pdfBytes = await renderPremiumReport(pdfInput);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
    const storagePath = `reports/${intakeId}/diagnostic-report-${timestamp}.pdf`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadErr)
      return NextResponse.json({ ok: false, error: `Upload failed: ${uploadErr.message}` }, { status: 500 });

    const { data: reportRow, error: reportErr } = await supabase
      .from("hli_reports")
      .insert({
        intake_id: intakeId,
        version: 1,
        status: "draft",
        storage_path: storagePath,
      })
      .select("id")
      .single();

    if (reportErr) return NextResponse.json({ ok: false, error: reportErr.message }, { status: 500 });

    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 86400);

    return NextResponse.json({
      ok: true,
      reportId: reportRow!.id,
      storagePath,
      signedUrl: signed?.signedUrl ?? null,
      markersIncluded: bloodMarkers.length,
      message: `Report regenerated with ${bloodMarkers.length} blood markers.`,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
