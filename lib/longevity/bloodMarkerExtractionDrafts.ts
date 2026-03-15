import type { SupabaseClient } from "@supabase/supabase-js";

export type BloodMarkerExtractionDraftRow = {
  id: string;
  profile_id: string;
  intake_id: string;
  document_id: string | null;
  blood_request_id: string | null;
  marker_name: string;
  display_name: string;
  raw_marker_name: string | null;
  value: number;
  unit: string | null;
  reference_low: number | null;
  reference_high: number | null;
  raw_reference_range: string | null;
  confidence: number | null;
  source_filename: string | null;
  extraction_version: string;
  status: "draft" | "applied" | "dismissed";
  applied_marker_id: string | null;
  extracted_at: string;
  reviewed_at: string | null;
};

export type CreateBloodMarkerExtractionDraftPayload = {
  profile_id: string;
  intake_id: string;
  document_id?: string | null;
  blood_request_id?: string | null;
  marker_name: string;
  display_name: string;
  raw_marker_name?: string | null;
  value: number;
  unit?: string | null;
  reference_low?: number | null;
  reference_high?: number | null;
  raw_reference_range?: string | null;
  confidence?: number | null;
  source_filename?: string | null;
  extraction_version?: string;
};

const SELECT_FIELDS = [
  "id",
  "profile_id",
  "intake_id",
  "document_id",
  "blood_request_id",
  "marker_name",
  "display_name",
  "raw_marker_name",
  "value",
  "unit",
  "reference_low",
  "reference_high",
  "raw_reference_range",
  "confidence",
  "source_filename",
  "extraction_version",
  "status",
  "applied_marker_id",
  "extracted_at",
  "reviewed_at",
].join(", ");

export async function listPendingBloodMarkerExtractionDraftsForIntake(
  supabase: SupabaseClient,
  intake_id: string
): Promise<BloodMarkerExtractionDraftRow[]> {
  const { data, error } = await supabase
    .from("hli_longevity_blood_marker_extraction_drafts")
    .select(SELECT_FIELDS)
    .eq("intake_id", intake_id)
    .eq("status", "draft")
    .order("extracted_at", { ascending: false })
    .order("display_name", { ascending: true });
  if (error) return [];
  return ((data ?? []) as unknown) as BloodMarkerExtractionDraftRow[];
}

export async function getBloodMarkerExtractionDraftById(
  supabase: SupabaseClient,
  id: string
): Promise<BloodMarkerExtractionDraftRow | null> {
  const { data, error } = await supabase
    .from("hli_longevity_blood_marker_extraction_drafts")
    .select(SELECT_FIELDS)
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return (data as unknown) as BloodMarkerExtractionDraftRow;
}

export async function replacePendingBloodMarkerExtractionDraftsForIntake(
  supabase: SupabaseClient,
  intake_id: string,
  drafts: CreateBloodMarkerExtractionDraftPayload[]
): Promise<{ ok: true; inserted: number } | { ok: false; error: string }> {
  const { error: deleteError } = await supabase
    .from("hli_longevity_blood_marker_extraction_drafts")
    .delete()
    .eq("intake_id", intake_id)
    .in("status", ["draft", "dismissed"]);
  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  if (drafts.length === 0) {
    return { ok: true, inserted: 0 };
  }

  const rows = drafts.map((draft) => ({
    profile_id: draft.profile_id,
    intake_id: draft.intake_id,
    document_id: draft.document_id ?? null,
    blood_request_id: draft.blood_request_id ?? null,
    marker_name: draft.marker_name.trim(),
    display_name: draft.display_name.trim(),
    raw_marker_name: draft.raw_marker_name?.trim() || null,
    value: draft.value,
    unit: draft.unit?.trim() || null,
    reference_low: draft.reference_low ?? null,
    reference_high: draft.reference_high ?? null,
    raw_reference_range: draft.raw_reference_range?.trim() || null,
    confidence: draft.confidence ?? null,
    source_filename: draft.source_filename?.trim() || null,
    extraction_version: draft.extraction_version ?? "adapted_extractBlood_v1",
  }));

  const { data, error } = await supabase
    .from("hli_longevity_blood_marker_extraction_drafts")
    .insert(rows)
    .select("id");
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, inserted: data?.length ?? rows.length };
}

export async function markBloodMarkerExtractionDraftApplied(
  supabase: SupabaseClient,
  id: string,
  applied_marker_id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase
    .from("hli_longevity_blood_marker_extraction_drafts")
    .update({
      status: "applied",
      applied_marker_id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function dismissBloodMarkerExtractionDraft(
  supabase: SupabaseClient,
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase
    .from("hli_longevity_blood_marker_extraction_drafts")
    .update({
      status: "dismissed",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
