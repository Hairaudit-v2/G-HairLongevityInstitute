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
  status: string;
  created_at: string;
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
): Promise<{ id: string } | { error: string }> {
  const { data: existing } = await supabase
    .from("hli_longevity_blood_requests")
    .select("id, profile_id")
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
    return { id: existing.id };
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
  return { id: inserted.id };
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
    .select("id, intake_id, profile_id, recommended_tests, reason, recommended_by, status, created_at, approved_at, letter_document_id")
    .eq("intake_id", intake_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as BloodRequestRow;
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
