import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getDefaultVisionProvider } from "@/lib/ai/openaiVisionProvider";
import { LONGEVITY_DOC_TYPE } from "./documentTypes";
import { downloadLongevityFile } from "./storage";
import { getPreviousSubmittedIntakeId } from "./scalpImageComparisons";
import {
  analyzeScalpImageSetDraft,
  SCALP_IMAGE_ANALYSIS_VERSION,
  type ScalpPerDocumentMetadata,
} from "./scalpImageAnalysis";
import { replacePendingScalpImageAnalysisDraftsForIntake } from "./scalpImageAnalysisDrafts";
import { mergeScalpImageIntoDocumentMetadata } from "./scalpImageDocumentMetadata";
import type { SupabaseClient } from "@supabase/supabase-js";

async function patchScalpPhotoDocumentMetadata(
  supabase: SupabaseClient,
  entries: ScalpPerDocumentMetadata[],
  analysisVersion: string
): Promise<void> {
  if (entries.length === 0) return;
  const ids = entries.map((e) => e.document_id);
  const { data: rows } = await supabase
    .from("hli_longevity_documents")
    .select("id, metadata")
    .in("id", ids);
  const byId = new Map(
    (rows ?? []).map((r) => [r.id as string, r.metadata as unknown])
  );
  const now = new Date().toISOString();
  for (const e of entries) {
    const prev = byId.get(e.document_id);
    const nextMeta = mergeScalpImageIntoDocumentMetadata(
      prev,
      e,
      analysisVersion,
      now
    );
    await supabase
      .from("hli_longevity_documents")
      .update({ metadata: nextMeta })
      .eq("id", e.document_id);
  }
}

export type LongevityScalpImageAnalysisJobResult = {
  ok: boolean;
  error?: string;
  jobId?: string;
  draftCount?: number;
};

export async function runLongevityScalpImageAnalysisJob(params: {
  intakeId: string;
  profileId: string;
  jobId?: string;
  trichologistId?: string | null;
}): Promise<LongevityScalpImageAnalysisJobResult> {
  const supabase = supabaseAdmin();
  let jobId = params.jobId;
  let attempts = 0;
  let currentStatus = "queued";

  try {
    if (jobId) {
      const { data: existing } = await supabase
        .from("hli_longevity_ai_jobs")
        .select("id, status, attempts")
        .eq("id", jobId)
        .single();
      if (!existing) return { ok: false, error: "Job not found.", jobId };
      attempts = existing.attempts ?? 0;
      currentStatus = existing.status;
      if (existing.status === "complete") {
        return { ok: true, jobId, draftCount: 1 };
      }
    } else {
      const { data: created, error } = await supabase
        .from("hli_longevity_ai_jobs")
        .insert({
          profile_id: params.profileId,
          intake_id: params.intakeId,
          trichologist_id: params.trichologistId ?? null,
          job_type: "scalp_image_analysis",
          status: "queued",
          stage: "queued",
        })
        .select("id")
        .single();
      if (error || !created?.id) {
        return {
          ok: false,
          error: error?.message ?? "Failed to create job.",
        };
      }
      jobId = created.id;
    }

    const { error: lockErr } = await supabase
      .from("hli_longevity_ai_jobs")
      .update({
        status: "running",
        stage: "load",
        attempts: attempts + 1,
        locked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .eq("status", currentStatus);
    if (lockErr) return { ok: false, error: lockErr.message, jobId };

    const previousIntakeId = await getPreviousSubmittedIntakeId(
      supabase,
      params.profileId,
      params.intakeId
    );

    const [{ data: currentDocs }, { data: previousDocs }] = await Promise.all([
      supabase
        .from("hli_longevity_documents")
        .select("id, filename, mime_type, storage_path")
        .eq("intake_id", params.intakeId)
        .eq("doc_type", LONGEVITY_DOC_TYPE.SCALP_PHOTO)
        .order("created_at", { ascending: false }),
      previousIntakeId
        ? supabase
            .from("hli_longevity_documents")
            .select("id, filename, mime_type, storage_path")
            .eq("intake_id", previousIntakeId)
            .eq("doc_type", LONGEVITY_DOC_TYPE.SCALP_PHOTO)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as Array<{ id: string; filename: string | null; mime_type: string | null; storage_path: string }> }),
    ]);

    if (!currentDocs || currentDocs.length === 0) {
      throw new Error("No scalp-photo documents found for this intake.");
    }

    await supabase
      .from("hli_longevity_ai_jobs")
      .update({ stage: "extract", updated_at: new Date().toISOString() })
      .eq("id", jobId);

    const currentFiles: Array<{
      documentId: string;
      bytes: Uint8Array;
      mimeType: string;
      filename: string | null;
    }> = [];
    for (const document of currentDocs) {
      const download = await downloadLongevityFile(supabase, document.storage_path);
      if (!download.ok) continue;
      currentFiles.push({
        documentId: document.id,
        bytes: download.bytes,
        mimeType: document.mime_type ?? "image/jpeg",
        filename: document.filename ?? null,
      });
    }
    if (currentFiles.length === 0) {
      throw new Error("Current scalp-photo documents could not be downloaded.");
    }

    const previousFiles: Array<{
      documentId: string;
      bytes: Uint8Array;
      mimeType: string;
      filename: string | null;
    }> = [];
    for (const document of previousDocs ?? []) {
      const download = await downloadLongevityFile(supabase, document.storage_path);
      if (!download.ok) continue;
      previousFiles.push({
        documentId: document.id,
        bytes: download.bytes,
        mimeType: document.mime_type ?? "image/jpeg",
        filename: document.filename ?? null,
      });
    }

    const draft = await analyzeScalpImageSetDraft({
      currentFiles,
      previousFiles,
      provider: getDefaultVisionProvider(),
    });

    const replaceResult = await replacePendingScalpImageAnalysisDraftsForIntake(
      supabase,
      params.intakeId,
      [
        {
          profile_id: params.profileId,
          intake_id: params.intakeId,
          previous_intake_id: previousIntakeId,
          current_document_ids: currentFiles.map((file) => file.documentId),
          previous_document_ids: previousFiles.map((file) => file.documentId),
          image_quality: draft.image_quality,
          thinning_distribution: draft.thinning_distribution,
          severity_estimate: draft.severity_estimate,
          visible_findings: draft.visible_findings,
          comparison_direction: draft.comparison_direction,
          confidence: draft.confidence,
          manual_review_recommended: draft.manual_review_recommended,
          draft_summary: draft.draft_summary,
          raw_payload: draft.raw_payload,
          analysis_version: SCALP_IMAGE_ANALYSIS_VERSION,
        },
      ]
    );
    if (!replaceResult.ok) {
      throw new Error(replaceResult.error);
    }

    const perMeta = (draft.raw_payload as { per_document_meta?: ScalpPerDocumentMetadata[] })
      .per_document_meta;
    if (Array.isArray(perMeta) && perMeta.length > 0) {
      await patchScalpPhotoDocumentMetadata(supabase, perMeta, SCALP_IMAGE_ANALYSIS_VERSION);
    }

    await supabase
      .from("hli_longevity_ai_jobs")
      .update({
        status: "complete",
        stage: "complete",
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return { ok: true, jobId, draftCount: replaceResult.inserted };
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : "Unexpected error.";
    if (jobId) {
      await supabase
        .from("hli_longevity_ai_jobs")
        .update({
          status: "failed",
          last_error: error,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    }
    return { ok: false, error, jobId };
  }
}
