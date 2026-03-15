/**
 * Longevity document persistence and listing. Isolated to hli_longevity_documents and audit.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { LONGEVITY_DOC_TYPE, type LongevityDocType } from "./documentTypes";

export type LongevityDocumentRow = {
  id: string;
  intake_id: string | null;
  profile_id: string | null;
  blood_request_id: string | null;
  doc_type: string;
  storage_path: string;
  filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export type LongevityDocumentMeta = {
  id: string;
  intake_id: string | null;
  profile_id: string | null;
  doc_type: string;
  filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

/**
 * List documents for profile: intake-linked and profile-level. Optionally filter by intakeId.
 * Profile-centric and additive: returns all documents the patient can see (across intakes); does not
 * overwrite or replace prior data. Document continuity: each document remains linked to its intake
 * (or profile). Future clinician workflows can rely on this listing as the patient-visible set.
 */
export async function listDocumentsForProfile(
  supabase: SupabaseClient,
  profileId: string,
  intakeId?: string
): Promise<LongevityDocumentMeta[]> {
  const intakeIdsQuery = supabase
    .from("hli_longevity_intakes")
    .select("id")
    .eq("profile_id", profileId);
  if (intakeId) {
    intakeIdsQuery.eq("id", intakeId);
  }
  const { data: intakes, error: intakeErr } = await intakeIdsQuery;
  const intakeIds = intakeErr ? [] : (intakes ?? []).map((r) => r.id);

  let query = supabase
    .from("hli_longevity_documents")
    .select("id, intake_id, profile_id, doc_type, filename, mime_type, size_bytes, created_at");
  if (intakeIds.length) {
    query = query.or(`intake_id.in.(${intakeIds.join(",")}),profile_id.eq.${profileId}`);
  } else {
    query = query.eq("profile_id", profileId);
  }
  const { data: docs, error } = await query.order("created_at", { ascending: false });
  if (error) return [];
  return (docs ?? []) as LongevityDocumentMeta[];
}

/** Get one document by id; returns full row if owned by profile (intake or profile-level). */
export async function getDocumentIfOwnedByProfile(
  supabase: SupabaseClient,
  documentId: string,
  profileId: string
): Promise<LongevityDocumentRow | null> {
  const { data: doc, error } = await supabase
    .from("hli_longevity_documents")
    .select("id, intake_id, profile_id, blood_request_id, doc_type, storage_path, filename, mime_type, size_bytes, created_at")
    .eq("id", documentId)
    .single();
  if (error || !doc) return null;

  if (doc.profile_id === profileId) return doc as LongevityDocumentRow;
  if (doc.intake_id) {
    const { data: intake } = await supabase
      .from("hli_longevity_intakes")
      .select("profile_id")
      .eq("id", doc.intake_id)
      .single();
    if (intake?.profile_id === profileId) return doc as LongevityDocumentRow;
  }
  return null;
}

/** Insert document row and return id. */
export async function createDocumentRecord(
  supabase: SupabaseClient,
  params: {
    intake_id: string;
    doc_type: LongevityDocType;
    storage_path: string;
    filename: string | null;
    mime_type: string | null;
    size_bytes: number | null;
  }
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from("hli_longevity_documents")
    .insert({
      intake_id: params.intake_id,
      blood_request_id: null,
      doc_type: params.doc_type,
      storage_path: params.storage_path,
      filename: params.filename,
      mime_type: params.mime_type,
      size_bytes: params.size_bytes,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  if (!data?.id) return { error: "Failed to create document record." };
  return { id: data.id };
}

/** Insert blood request letter document (Phase E). Links to intake and blood_request for ownership. */
export async function createBloodRequestLetterDocument(
  supabase: SupabaseClient,
  params: {
    intake_id: string;
    blood_request_id: string;
    storage_path: string;
    filename: string;
    size_bytes: number;
  }
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from("hli_longevity_documents")
    .insert({
      intake_id: params.intake_id,
      blood_request_id: params.blood_request_id,
      doc_type: LONGEVITY_DOC_TYPE.BLOOD_REQUEST_LETTER,
      storage_path: params.storage_path,
      filename: params.filename,
      mime_type: "application/pdf",
      size_bytes: params.size_bytes,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  if (!data?.id) return { error: "Failed to create document record." };
  return { id: data.id };
}

/**
 * Append audit event. Use for patient, system, admin, and Trichologist actions.
 * For Trichologist actions pass actor_type: "trichologist" and include trichologist_id in payload
 * when needed for audit-readiness. See docs/TRICHOLOGIST_PORTAL_SPEC.md and reviewConstants.AUDIT_ACTOR_TRICHOLOGIST.
 */
export async function auditLongevityEvent(
  supabase: SupabaseClient,
  params: {
    profile_id: string | null;
    intake_id: string | null;
    event_type: string;
    payload?: Record<string, unknown>;
    actor_type?: "user" | "system" | "admin" | "trichologist";
  }
): Promise<void> {
  await supabase.from("hli_longevity_audit_events").insert({
    profile_id: params.profile_id,
    intake_id: params.intake_id,
    event_type: params.event_type,
    payload: params.payload ?? {},
    actor_type: params.actor_type ?? "user",
  });
}
