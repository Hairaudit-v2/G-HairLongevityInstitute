import type { SupabaseClient } from "@supabase/supabase-js";

export const SCALP_IMAGE_ANALYSIS_DRAFT_STATUS = {
  DRAFT: "draft",
  APPLIED: "applied",
  DISMISSED: "dismissed",
} as const;

export type ScalpImageAnalysisDraftStatus =
  (typeof SCALP_IMAGE_ANALYSIS_DRAFT_STATUS)[keyof typeof SCALP_IMAGE_ANALYSIS_DRAFT_STATUS];

export type ScalpImageAnalysisDraftRow = {
  id: string;
  profile_id: string;
  intake_id: string;
  previous_intake_id: string | null;
  current_document_ids: string[];
  previous_document_ids: string[];
  image_quality: string;
  thinning_distribution: string[];
  severity_estimate: string;
  visible_findings: string[];
  comparison_direction: string;
  confidence: number | null;
  manual_review_recommended: boolean;
  draft_summary: string;
  raw_payload: Record<string, unknown> | null;
  analysis_version: string;
  status: ScalpImageAnalysisDraftStatus;
  applied_comparison_id: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type CreateScalpImageAnalysisDraftPayload = {
  profile_id: string;
  intake_id: string;
  previous_intake_id?: string | null;
  current_document_ids: string[];
  previous_document_ids?: string[];
  image_quality: string;
  thinning_distribution: string[];
  severity_estimate: string;
  visible_findings: string[];
  comparison_direction: string;
  confidence?: number | null;
  manual_review_recommended: boolean;
  draft_summary: string;
  raw_payload?: Record<string, unknown> | null;
  analysis_version?: string;
};

const SELECT_FIELDS = [
  "id",
  "profile_id",
  "intake_id",
  "previous_intake_id",
  "current_document_ids",
  "previous_document_ids",
  "image_quality",
  "thinning_distribution",
  "severity_estimate",
  "visible_findings",
  "comparison_direction",
  "confidence",
  "manual_review_recommended",
  "draft_summary",
  "raw_payload",
  "analysis_version",
  "status",
  "applied_comparison_id",
  "created_at",
  "reviewed_at",
].join(", ");

export async function listPendingScalpImageAnalysisDraftsForIntake(
  supabase: SupabaseClient,
  intake_id: string
): Promise<ScalpImageAnalysisDraftRow[]> {
  const { data, error } = await supabase
    .from("hli_longevity_scalp_image_analysis_drafts")
    .select(SELECT_FIELDS)
    .eq("intake_id", intake_id)
    .eq("status", SCALP_IMAGE_ANALYSIS_DRAFT_STATUS.DRAFT)
    .order("created_at", { ascending: false });
  if (error) return [];
  return ((data ?? []) as unknown) as ScalpImageAnalysisDraftRow[];
}

export async function getScalpImageAnalysisDraftById(
  supabase: SupabaseClient,
  id: string
): Promise<ScalpImageAnalysisDraftRow | null> {
  const { data, error } = await supabase
    .from("hli_longevity_scalp_image_analysis_drafts")
    .select(SELECT_FIELDS)
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return (data as unknown) as ScalpImageAnalysisDraftRow;
}

export async function replacePendingScalpImageAnalysisDraftsForIntake(
  supabase: SupabaseClient,
  intake_id: string,
  drafts: CreateScalpImageAnalysisDraftPayload[]
): Promise<{ ok: true; inserted: number } | { ok: false; error: string }> {
  const { error: deleteError } = await supabase
    .from("hli_longevity_scalp_image_analysis_drafts")
    .delete()
    .eq("intake_id", intake_id)
    .in("status", [
      SCALP_IMAGE_ANALYSIS_DRAFT_STATUS.DRAFT,
      SCALP_IMAGE_ANALYSIS_DRAFT_STATUS.DISMISSED,
    ]);
  if (deleteError) return { ok: false, error: deleteError.message };

  if (drafts.length === 0) return { ok: true, inserted: 0 };

  const { data, error } = await supabase
    .from("hli_longevity_scalp_image_analysis_drafts")
    .insert(
      drafts.map((draft) => ({
        profile_id: draft.profile_id,
        intake_id: draft.intake_id,
        previous_intake_id: draft.previous_intake_id ?? null,
        current_document_ids: draft.current_document_ids,
        previous_document_ids: draft.previous_document_ids ?? [],
        image_quality: draft.image_quality,
        thinning_distribution: draft.thinning_distribution,
        severity_estimate: draft.severity_estimate,
        visible_findings: draft.visible_findings,
        comparison_direction: draft.comparison_direction,
        confidence: draft.confidence ?? null,
        manual_review_recommended: draft.manual_review_recommended,
        draft_summary: draft.draft_summary.trim(),
        raw_payload: draft.raw_payload ?? {},
        analysis_version: draft.analysis_version ?? "openai_scalp_draft_v1",
      }))
    )
    .select("id");
  if (error) return { ok: false, error: error.message };
  return { ok: true, inserted: data?.length ?? drafts.length };
}

export async function markScalpImageAnalysisDraftApplied(
  supabase: SupabaseClient,
  id: string,
  applied_comparison_id: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase
    .from("hli_longevity_scalp_image_analysis_drafts")
    .update({
      status: SCALP_IMAGE_ANALYSIS_DRAFT_STATUS.APPLIED,
      applied_comparison_id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function dismissScalpImageAnalysisDraft(
  supabase: SupabaseClient,
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase
    .from("hli_longevity_scalp_image_analysis_drafts")
    .update({
      status: SCALP_IMAGE_ANALYSIS_DRAFT_STATUS.DISMISSED,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
