/**
 * AI extraction + scoring + premium report pipeline.
 * Idempotent and resumable. Used by Inngest worker and dev route.
 */
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { extractBloodMarkers } from "@/lib/ai/extractBlood";
import { extractImageSignals } from "@/lib/ai/extractImages";
import { computeScores } from "@/lib/scoring/scoreEngine";
import { renderPremiumReport } from "@/lib/report/renderPremiumReport";
import type { BloodMarker } from "@/lib/ai/extractBlood";
import type { ImageExtractionResult } from "@/lib/ai/extractImages";
import type { DomainId } from "@/lib/scoring/scoreEngine";

const BUCKET = "hli-intakes";

export type PipelineOptions = {
  intakeId: string;
  jobId?: string;
  dryRun?: boolean;
};

export type PipelineResult = {
  ok: boolean;
  error?: string;
  jobId?: string;
  reportId?: string;
  storagePath?: string;
}

export async function runPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const { intakeId, jobId: inputJobId, dryRun } = options;
  const supabase = supabaseAdmin();

  let jobId = inputJobId;
  let jobRow: { id: string; status: string; attempts: number } | null = null;

  try {
    // 1) Get or create job
    if (jobId) {
      const { data } = await supabase.from("hli_ai_jobs").select("id, status, attempts").eq("id", jobId).single();
      jobRow = data;
      if (!jobRow) return { ok: false, error: "Job not found" };
    } else {
      const { data, error } = await supabase
        .from("hli_ai_jobs")
        .insert({ intake_id: intakeId, status: "queued" })
        .select("id")
        .single();
      if (error) return { ok: false, error: error.message };
      const newId = data?.id;
      if (!newId) return { ok: false, error: "Failed to create job" };
      jobId = newId;
      jobRow = { id: newId, status: "queued", attempts: 0 };
    }

    if (jobRow.status === "complete") {
      const { data: report } = await supabase
        .from("hli_reports")
        .select("id, storage_path")
        .eq("intake_id", intakeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return { ok: true, jobId, reportId: report?.id, storagePath: report?.storage_path ?? undefined };
    }

    // 2) Lock job
    const { error: lockErr } = await supabase
      .from("hli_ai_jobs")
      .update({ status: "running", stage: "load", locked_at: new Date().toISOString(), attempts: jobRow.attempts + 1, updated_at: new Date().toISOString() })
      .eq("id", jobId!)
      .eq("status", jobRow.status);

    if (lockErr) return { ok: false, error: lockErr.message };

    // 3) Load intake + files
    const { data: intake, error: intakeErr } = await supabase
      .from("hli_intakes")
      .select("*")
      .eq("id", intakeId)
      .single();

    if (intakeErr || !intake) return { ok: false, error: "Intake not found" };

    const { data: files } = await supabase
      .from("hli_intake_files")
      .select("id, kind, filename, storage_path, mime_type")
      .eq("intake_id", intakeId)
      .in("kind", ["blood", "photo"]);

    const bloodFiles = (files || []).filter((f) => f.kind === "blood");
    const photoFiles = (files || []).filter((f) => f.kind === "photo");

    // 4) Download files from storage
    const bloodBytes: Array<{ bytes: Uint8Array; mimeType: string; filename: string }> = [];
    for (const f of bloodFiles) {
      const { data } = await supabase.storage.from(BUCKET).download(f.storage_path);
      if (data) bloodBytes.push({ bytes: new Uint8Array(await data.arrayBuffer()), mimeType: f.mime_type || "application/pdf", filename: f.filename });
    }

    const photoBytes: Array<{ bytes: Uint8Array; mimeType: string; filename: string; storage_path: string }> = [];
    for (const f of photoFiles) {
      const { data } = await supabase.storage.from(BUCKET).download(f.storage_path);
      if (data) photoBytes.push({
        bytes: new Uint8Array(await data.arrayBuffer()),
        mimeType: f.mime_type || "image/jpeg",
        filename: f.filename,
        storage_path: f.storage_path,
      });
    }

    // 5) Run extractors
    await supabase.from("hli_ai_jobs").update({ stage: "extract" }).eq("id", jobId!).select();
    const bloodResult = await extractBloodMarkers({ files: bloodBytes, dryRun });
    const imageResults = await extractImageSignals({ files: photoBytes, dryRun });

    // 6) Write extractions
    if (!dryRun) {
      await supabase.from("hli_ai_extractions").insert({
        intake_id: intakeId,
        type: "blood",
        payload: { markers: bloodResult.markers },
        confidence: { overall: bloodResult.confidence },
      });
      for (const img of imageResults) {
        await supabase.from("hli_ai_extractions").insert({
          intake_id: intakeId,
          type: "image",
          payload: { filename: img.filename, storage_path: img.storage_path, signals: img.signals },
          confidence: { overall: img.signals.confidence },
        });
      }
    }

    // 7) Compute scores
    await supabase.from("hli_ai_jobs").update({ stage: "score" }).eq("id", jobId!).select();
    const bloodInput = bloodResult.markers
      .filter((m) => typeof m.value === "number")
      .map((m) => ({ name: m.name, value: m.value as number, flag: m.flag, unit: m.unit }));
    const imageInput = imageResults.map((r) => ({
      scalp_visibility_proxy: r.signals.scalp_visibility_proxy,
      redness_proxy: r.signals.redness_proxy,
      flaking_proxy: r.signals.flaking_proxy,
      blur_score: r.signals.blur_score,
      lighting_score: r.signals.lighting_score,
    }));
    const selections = typeof intake.selections === "string" ? (() => { try { return JSON.parse(intake.selections); } catch { return {}; } })() : (intake.selections || {});

    const scoringResult = computeScores({
      bloodMarkers: bloodInput,
      imageSignals: imageInput,
      selections,
      dryRun,
    });

    if (!dryRun) {
      await supabase.from("hli_ai_scores").insert({
        intake_id: intakeId,
        domain_scores: scoringResult.domain_scores,
        overall_score: scoringResult.overall_score,
        risk_tier: scoringResult.risk_tier,
        explainability: scoringResult.explainability,
      });
    }

    // 8) Generate premium PDF
    await supabase.from("hli_ai_jobs").update({ stage: "report" }).eq("id", jobId!).select();

    let bloodMarkersForReport = bloodResult.markers.map((m: BloodMarker) => ({
      name: m.name,
      value: m.value,
      unit: m.unit,
      referenceRange: m.referenceRange,
      flag: m.flag,
    }));

    // Fallback: if extraction returned empty, load from prior hli_ai_extractions
    if (bloodMarkersForReport.length === 0 && !dryRun) {
      const { data: priorBlood } = await supabase
        .from("hli_ai_extractions")
        .select("payload")
        .eq("intake_id", intakeId)
        .eq("type", "blood")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      const priorMarkers = priorBlood?.payload?.markers;
      if (Array.isArray(priorMarkers) && priorMarkers.length > 0) {
        bloodMarkersForReport = priorMarkers.map((m: { name: string; value?: unknown; unit?: string; referenceRange?: string; flag?: string }) => ({
          name: m.name,
          value: typeof m.value === "number" || typeof m.value === "string" ? m.value : null,
          unit: m.unit,
          referenceRange: m.referenceRange,
          flag: (m.flag === "low" || m.flag === "normal" || m.flag === "high" || m.flag === "critical") ? m.flag : undefined,
        }));
      }
    }

    const imageCaptions = imageResults.map((r, idx) => {
      const photo = photoBytes[idx];
      return {
        filename: r.filename,
        caption: r.signals.summary || `Signals: scalp visibility ${r.signals.scalp_visibility_proxy}, redness ${r.signals.redness_proxy}`,
        imageBytes: photo?.bytes,
        mimeType: photo?.mimeType,
      };
    });

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

    const freeTMarker = bloodResult.markers.find(
      (m) =>
        m.name === "Free Testosterone" &&
        typeof m.value === "number" &&
        m.referenceRange
    );
    let freeTPct: number | null = null;
    if (freeTMarker && freeTMarker.referenceRange) {
      const m = freeTMarker.referenceRange.match(/(\d+\.?\d*)\s*[-–to]+\s*(\d+\.?\d*)/i);
      if (m) {
        const low = parseFloat(m[1]);
        const high = parseFloat(m[2]);
        const val = freeTMarker.value as number;
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
      bloodMarkers: bloodMarkersForReport,
      domainScores: scoringResult.domain_scores,
      overallScore: scoringResult.overall_score,
      riskTier: scoringResult.risk_tier,
      explainability: scoringResult.explainability,
      imageCaptions,
      androgenContext,
      version: 1,
    };

    const pdfBytes = await renderPremiumReport(pdfInput);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
    const storagePath = `reports/${intakeId}/diagnostic-report-${timestamp}.pdf`;

    if (!dryRun) {
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: true });

      if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

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

      if (reportErr) throw new Error(reportErr.message);

      await supabase
        .from("hli_ai_jobs")
        .update({ status: "complete", stage: "complete", last_error: null, updated_at: new Date().toISOString() })
        .eq("id", jobId!);

      return {
        ok: true,
        jobId,
        reportId: reportRow!.id,
        storagePath,
      };
    }

    await supabase
      .from("hli_ai_jobs")
      .update({ status: "complete", stage: "dry_run", updated_at: new Date().toISOString() })
      .eq("id", jobId!);

    return { ok: true, jobId, storagePath: "[DRY RUN] " + storagePath };
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    if (jobId) {
      await supabaseAdmin()
        .from("hli_ai_jobs")
        .update({ status: "failed", last_error: errMsg, updated_at: new Date().toISOString() })
        .eq("id", jobId);
    }
    return { ok: false, error: errMsg, jobId };
  }
}
