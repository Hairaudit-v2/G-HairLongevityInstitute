/**
 * Phase I: Longitudinal blood marker trends and comparison.
 * Profile-level history grouped by normalised marker name; current vs previous for an intake.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getMarkersForProfile } from "./bloodResultMarkers";
import { getMarkersForIntake } from "./bloodResultMarkers";
import { getNormalisedMarkerKey, KEY_MARKERS_FOR_TRENDS } from "./bloodInterpretation";
import { getDisplayLabel } from "./bloodMarkerRegistry";

export type MarkerSnapshot = {
  value: number;
  unit: string | null;
  collected_at: string | null;
  intake_id: string;
  marker_name: string;
};

export type MarkerTrendRow = {
  markerKey: string;
  displayName: string;
  current: MarkerSnapshot;
  previous: MarkerSnapshot | null;
  direction: "up" | "down" | "stable" | null;
};

/**
 * Retrieve profile-level marker history grouped by normalised marker name.
 * Each group is sorted by collected_at desc (nulls last), then created_at desc.
 * Returns a map: normalisedKey -> array of snapshots (newest first).
 */
export async function getProfileMarkerHistoryGrouped(
  supabase: SupabaseClient,
  profile_id: string
): Promise<Record<string, MarkerSnapshot[]>> {
  const rows = await getMarkersForProfile(supabase, profile_id);
  const grouped: Record<string, MarkerSnapshot[]> = {};
  for (const r of rows) {
    const key = getNormalisedMarkerKey(r.marker_name);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      value: r.value,
      unit: r.unit,
      collected_at: r.collected_at,
      intake_id: r.intake_id,
      marker_name: r.marker_name,
    });
  }
  for (const key of Object.keys(grouped)) {
    const list = grouped[key];
    list.sort((a, b) => {
      const aVal = a.collected_at ?? "";
      const bVal = b.collected_at ?? "";
      if (aVal !== bVal) return bVal.localeCompare(aVal);
      return 0;
    });
  }
  return grouped;
}

/**
 * Current vs previous comparison for an intake. For each marker present in the current intake,
 * finds the most recent previous value (same profile, same normalised marker key, different intake,
 * earlier collection date). Returns trend rows with direction (up / down / stable).
 */
export async function getCurrentVsPreviousForIntake(
  supabase: SupabaseClient,
  profile_id: string,
  intake_id: string
): Promise<MarkerTrendRow[]> {
  const [currentRows, profileRows] = await Promise.all([
    getMarkersForIntake(supabase, intake_id),
    getMarkersForProfile(supabase, profile_id),
  ]);
  const grouped: Record<string, MarkerSnapshot[]> = {};
  for (const r of profileRows) {
    const key = getNormalisedMarkerKey(r.marker_name);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      value: r.value,
      unit: r.unit,
      collected_at: r.collected_at,
      intake_id: r.intake_id,
      marker_name: r.marker_name,
    });
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) =>
      (b.collected_at ?? "").localeCompare(a.collected_at ?? "")
    );
  }

  const currentByKey = new Map<string, MarkerSnapshot>();
  for (const r of currentRows) {
    const key = getNormalisedMarkerKey(r.marker_name);
    if (!currentByKey.has(key)) {
      currentByKey.set(key, {
        value: r.value,
        unit: r.unit,
        collected_at: r.collected_at,
        intake_id: r.intake_id,
        marker_name: r.marker_name,
      });
    }
  }

  const result: MarkerTrendRow[] = [];
  for (const [key, current] of currentByKey) {
    const history = grouped[key] ?? [];
    const previousCandidates = history.filter((s) => s.intake_id !== intake_id);
    const previous = previousCandidates.length > 0 ? previousCandidates[0] : null;

    let direction: "up" | "down" | "stable" | null = null;
    if (previous) {
      if (current.value > previous.value) direction = "up";
      else if (current.value < previous.value) direction = "down";
      else direction = "stable";
    }

    result.push({
      markerKey: key,
      displayName: getDisplayLabel(current.marker_name) || current.marker_name,
      current,
      previous,
      direction,
    });
  }

  result.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return result;
}

/**
 * Whether the profile has enough data for a meaningful trend view (e.g. markers from more than one date or intake).
 * Used for patient-facing "we track trends" message.
 */
export async function profileHasTrendData(
  supabase: SupabaseClient,
  profile_id: string
): Promise<boolean> {
  const rows = await getMarkersForProfile(supabase, profile_id);
  if (rows.length < 2) return false;
  const intakeIds = new Set(rows.map((r) => r.intake_id));
  const dates = new Set(rows.map((r) => r.collected_at ?? r.created_at).filter(Boolean));
  return intakeIds.size > 1 || dates.size > 1;
}

export { KEY_MARKERS_FOR_TRENDS };
