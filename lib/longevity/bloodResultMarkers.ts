/**
 * Phase G: Blood result markers — fetch from hli_longevity_blood_result_markers and interpret.
 * Longitudinal: multiple rows per intake/profile over time (collected_at); trend by profile.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { interpretMarkers, type InterpretedMarker } from "./bloodInterpretation";

export type BloodResultMarkerRow = {
  id: string;
  profile_id: string;
  intake_id: string;
  blood_request_id: string | null;
  marker_name: string;
  value: number;
  unit: string | null;
  reference_low: number | null;
  reference_high: number | null;
  collected_at: string | null;
  lab_name: string | null;
  created_at: string;
};

/**
 * Fetch raw blood result markers for an intake (current case). Supports longitudinal:
 * multiple result sets over time per profile; this returns all markers linked to this intake.
 */
export async function getMarkersForIntake(
  supabase: SupabaseClient,
  intake_id: string
): Promise<BloodResultMarkerRow[]> {
  const { data, error } = await supabase
    .from("hli_longevity_blood_result_markers")
    .select("id, profile_id, intake_id, blood_request_id, marker_name, value, unit, reference_low, reference_high, collected_at, lab_name, created_at")
    .eq("intake_id", intake_id)
    .order("collected_at", { ascending: false, nullsFirst: false })
    .order("marker_name", { ascending: true });
  if (error) return [];
  return (data ?? []) as BloodResultMarkerRow[];
}

/**
 * Fetch raw blood result markers for a profile (all intakes). For longitudinal trend
 * by collected_at; caller can group by collected_at or intake_id.
 */
export async function getMarkersForProfile(
  supabase: SupabaseClient,
  profile_id: string
): Promise<BloodResultMarkerRow[]> {
  const { data, error } = await supabase
    .from("hli_longevity_blood_result_markers")
    .select("id, profile_id, intake_id, blood_request_id, marker_name, value, unit, reference_low, reference_high, collected_at, lab_name, created_at")
    .eq("profile_id", profile_id)
    .order("collected_at", { ascending: false, nullsFirst: false })
    .order("marker_name", { ascending: true });
  if (error) return [];
  return (data ?? []) as BloodResultMarkerRow[];
}

/**
 * Fetch markers for an intake and return interpreted results for the Blood Results Summary panel.
 */
export async function getInterpretedMarkersForIntake(
  supabase: SupabaseClient,
  intake_id: string
): Promise<InterpretedMarker[]> {
  const rows = await getMarkersForIntake(supabase, intake_id);
  return interpretMarkers(
    rows.map((r) => ({
      marker_name: r.marker_name,
      value: r.value,
      unit: r.unit,
      reference_low: r.reference_low,
      reference_high: r.reference_high,
    }))
  );
}

/** Interpreted marker with id for edit support in review workspace (Phase H). */
export type InterpretedMarkerWithId = InterpretedMarker & { id: string };

/**
 * Fetch markers for an intake and return interpreted results with id for the Blood Results Summary panel and edit UI.
 */
export async function getInterpretedMarkersWithIdsForIntake(
  supabase: SupabaseClient,
  intake_id: string
): Promise<InterpretedMarkerWithId[]> {
  const rows = await getMarkersForIntake(supabase, intake_id);
  const interpreted = interpretMarkers(
    rows.map((r) => ({
      marker_name: r.marker_name,
      value: r.value,
      unit: r.unit,
      reference_low: r.reference_low,
      reference_high: r.reference_high,
    }))
  );
  return interpreted.map((m, i) => ({ ...m, id: rows[i].id }));
}

/** Payload for creating a blood result marker (Phase H ingestion). */
export type CreateBloodResultMarkerPayload = {
  profile_id: string;
  intake_id: string;
  blood_request_id?: string | null;
  marker_name: string;
  value: number;
  unit?: string | null;
  reference_low?: number | null;
  reference_high?: number | null;
  collected_at?: string | null;
  lab_name?: string | null;
};

/**
 * Create a single blood result marker. Additive only; does not overwrite. Caller must ensure
 * intake is in review queue and profile_id matches intake (audit/validation in API layer).
 */
export async function createBloodResultMarker(
  supabase: SupabaseClient,
  params: CreateBloodResultMarkerPayload
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from("hli_longevity_blood_result_markers")
    .insert({
      profile_id: params.profile_id,
      intake_id: params.intake_id,
      blood_request_id: params.blood_request_id ?? null,
      marker_name: params.marker_name.trim(),
      value: params.value,
      unit: params.unit ?? null,
      reference_low: params.reference_low ?? null,
      reference_high: params.reference_high ?? null,
      collected_at: params.collected_at ?? null,
      lab_name: params.lab_name ?? null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  if (!data?.id) return { error: "Failed to create marker." };
  return { id: data.id };
}

/** Payload for updating a blood result marker (partial). */
export type UpdateBloodResultMarkerPayload = {
  marker_name?: string;
  value?: number;
  unit?: string | null;
  reference_low?: number | null;
  reference_high?: number | null;
  collected_at?: string | null;
  lab_name?: string | null;
  blood_request_id?: string | null;
};

/**
 * Update an existing blood result marker by id. Caller must ensure marker's intake is in review queue.
 */
export async function updateBloodResultMarker(
  supabase: SupabaseClient,
  marker_id: string,
  params: UpdateBloodResultMarkerPayload
): Promise<{ ok: true } | { error: string }> {
  const payload: Record<string, unknown> = {};
  if (params.marker_name !== undefined) payload.marker_name = params.marker_name.trim();
  if (params.value !== undefined) payload.value = params.value;
  if (params.unit !== undefined) payload.unit = params.unit;
  if (params.reference_low !== undefined) payload.reference_low = params.reference_low;
  if (params.reference_high !== undefined) payload.reference_high = params.reference_high;
  if (params.collected_at !== undefined) payload.collected_at = params.collected_at;
  if (params.lab_name !== undefined) payload.lab_name = params.lab_name;
  if (params.blood_request_id !== undefined) payload.blood_request_id = params.blood_request_id;
  if (Object.keys(payload).length === 0) return { ok: true };
  const { error } = await supabase
    .from("hli_longevity_blood_result_markers")
    .update(payload)
    .eq("id", marker_id);
  if (error) return { error: error.message };
  return { ok: true };
}

/**
 * Get a single marker by id; returns null if not found or intake not in allowed set.
 * For use when verifying marker belongs to an intake in review queue before update.
 */
export async function getBloodResultMarkerById(
  supabase: SupabaseClient,
  marker_id: string
): Promise<BloodResultMarkerRow | null> {
  const { data, error } = await supabase
    .from("hli_longevity_blood_result_markers")
    .select("id, profile_id, intake_id, blood_request_id, marker_name, value, unit, reference_low, reference_high, collected_at, lab_name, created_at")
    .eq("id", marker_id)
    .single();
  if (error || !data) return null;
  return data as BloodResultMarkerRow;
}
