/**
 * Phase D: Blood request tracking. Create and list blood requests; no letter generation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { BloodTestCode } from "./bloodRequestEligibility";

export type BloodRequestRow = {
  id: string;
  intake_id: string;
  profile_id: string | null;
  recommended_tests: BloodTestCode[];
  reason: string | null;
  recommended_by: string | null;
  clinician_edited: boolean;
  status: string;
  created_at: string;
  updated_at: string | null;
  approved_at: string | null;
  letter_document_id: string | null;
};

export type BloodRequestForPatient = {
  id: string;
  intake_id: string;
  recommended_tests: string[];
  reason: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  letter_document_id: string | null;
};

/**
 * Ensure a blood request exists for the intake with the given eligibility data.
 * If one already exists, update recommended_tests, reason, recommended_by when provided.
 * Sets profile_id from intake when not set. Idempotent per intake (one active request per intake).
 */
export async function ensureBloodRequest(
  supabase: SupabaseClient,
  params: {
    intake_id: string;
    profile_id: string;
    recommended_tests: BloodTestCode[];
    reason: string;
    recommended_by: "rules" | "trichologist" | "system";
  }
) : Promise<
  { id: string; created: boolean; status: string } | { error: string }
> {
  const { data: existing } = await supabase
    .from("hli_longevity_blood_requests")
    .select("id, profile_id, status")
    .eq("intake_id", params.intake_id)
    .in("status", ["pending", "letter_requested", "letter_generated"])
    .limit(1)
    .maybeSingle();

  const payload = {
    profile_id: params.profile_id,
    recommended_tests: params.recommended_tests,
    reason: params.reason,
    recommended_by: params.recommended_by,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("hli_longevity_blood_requests")
      .update(payload)
      .eq("id", existing.id);
    if (error) return { error: error.message };
    return { id: existing.id, created: false, status: existing.status };
  }

  const { data: inserted, error } = await supabase
    .from("hli_longevity_blood_requests")
    .insert({
      intake_id: params.intake_id,
      profile_id: params.profile_id,
      recommended_tests: params.recommended_tests,
      reason: params.reason,
      recommended_by: params.recommended_by,
      status: "pending",
      schema_version: "1",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  if (!inserted?.id) return { error: "Failed to create blood request." };
  return { id: inserted.id, created: true, status: "pending" };
}

/**
 * Get the active blood request for an intake (if any). For internal/Trichologist use.
 */
export async function getBloodRequestByIntake(
  supabase: SupabaseClient,
  intake_id: string
): Promise<BloodRequestRow | null> {
  const { data, error } = await supabase
    .from("hli_longevity_blood_requests")
    .select("id, intake_id, profile_id, recommended_tests, reason, recommended_by, clinician_edited, status, created_at, updated_at, approved_at, letter_document_id")
    .eq("intake_id", intake_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    ...data,
    clinician_edited: data.clinician_edited === true,
  } as BloodRequestRow;
}

/**
 * Update an existing blood request's recommended_tests and/or reason (Phase D.1 trichologist refinement).
 * Sets clinician_edited = true. Does not change status, letter_document_id, or other lifecycle fields.
 * When reason is undefined, the existing reason is left unchanged.
 */
export async function updateBloodRequest(
  supabase: SupabaseClient,
  params: {
    blood_request_id: string;
    recommended_tests: BloodTestCode[];
    reason?: string | null;
  }
): Promise<{ id: string } | { error: string }> {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    recommended_tests: params.recommended_tests,
    clinician_edited: true,
    updated_at: now,
  };
  if (params.reason !== undefined) payload.reason = params.reason;
  const { error } = await supabase
    .from("hli_longevity_blood_requests")
    .update(payload)
    .eq("id", params.blood_request_id);
  if (error) return { error: error.message };
  return { id: params.blood_request_id };
}

/**
 * List blood requests for a profile (patient visibility). Returns only non-cancelled.
 */
export async function listBloodRequestsForProfile(
  supabase: SupabaseClient,
  profile_id: string
): Promise<BloodRequestForPatient[]> {
  const { data, error } = await supabase
    .from("hli_longevity_blood_requests")
    .select("id, intake_id, recommended_tests, reason, status, created_at, updated_at, letter_document_id")
    .eq("profile_id", profile_id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => ({
    id: r.id,
    intake_id: r.intake_id,
    recommended_tests: Array.isArray(r.recommended_tests) ? (r.recommended_tests as string[]) : [],
    reason: r.reason ?? null,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at ?? r.created_at,
    letter_document_id: r.letter_document_id ?? null,
  }));
}
