/**
 * Predictive-readiness summaries for future FI intelligence layers.
 * Longevity namespace only. Does not build ML models or recommend treatments.
 * Transparent, rule-based checks only: whether a person/case/cohort has enough
 * structured signal quality for future prediction workflows.
 *
 * This layer will support future predictive trichology without changing
 * operational HLI workflows. It does not generate treatment recommendations
 * or imply clinical decision automation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { LONGEVITY_EVENT_TYPE } from "./integrationContracts";
import { LONGEVITY_SIGNAL_KEY } from "./integrationContracts";
import type { OutboxRow } from "./analytics";
import { consumeOutbox, type ConsumeOutboxOptions } from "./analytics";

/** Readiness level from rule-based dimension counts. Not a clinical score. */
export type ReadinessLevel = "low" | "moderate" | "high";

/** Dimension names for explainability. */
export type ReadinessDimension =
  | "longitudinal_history"
  | "treatment_continuity_data"
  | "scalp_progression_data"
  | "marker_history"
  | "reminder_follow_up_context";

const READINESS_VERSION = "v1";

/** Minimum intakes for "sufficient" longitudinal history. */
const MIN_INTAKES_LONGITUDINAL = 2;
/** At least one treatment adherence summary. */
const MIN_TREATMENT_SIGNALS = 1;
/** At least one scalp-related signal or event. */
const MIN_SCALP_INDICATORS = 1;
/** At least one blood/marker-related signal or event. */
const MIN_MARKER_INDICATORS = 1;
/** Reminder sent and at least one return-after-reminder event. */
const MIN_REMINDER_CONTEXT = 1;

export type PredictiveReadinessSummary = {
  readiness_level: ReadinessLevel;
  contributing_dimensions: ReadinessDimension[];
  missing_dimensions: ReadinessDimension[];
  readiness_version: string;
};

/** Cohort-level: distribution of readiness levels and dimension prevalence. */
export type CohortReadinessSummary = {
  readiness_version: string;
  level_counts: Record<ReadinessLevel, number>;
  dimension_prevalence: Record<ReadinessDimension, number>;
  profile_count: number;
};

const ALL_DIMENSIONS: ReadinessDimension[] = [
  "longitudinal_history",
  "treatment_continuity_data",
  "scalp_progression_data",
  "marker_history",
  "reminder_follow_up_context",
];

/**
 * Rule-based: compute which dimensions are satisfied from outbox rows (one profile).
 * Deterministic; no ML. Thresholds are explicit.
 */
export function computeReadinessFromOutboxRows(rows: OutboxRow[]): PredictiveReadinessSummary {
  const intakes = new Set<string>();
  let treatmentSignals = 0;
  let scalpIndicators = 0;
  let markerIndicators = 0;
  let reminderSent = false;
  let returnAfterReminder = false;

  for (const row of rows) {
    if (row.intake_id) intakes.add(row.intake_id);

    if (row.emission_kind === "event") {
      if (row.emission_key === LONGEVITY_EVENT_TYPE.INTAKE_SUBMITTED) {
        if (row.intake_id) intakes.add(row.intake_id);
      }
      if (row.emission_key === LONGEVITY_EVENT_TYPE.REMINDER_SENT) reminderSent = true;
      if (
        row.emission_key === LONGEVITY_EVENT_TYPE.FOLLOW_UP_COMPLETED_AFTER_REMINDER ||
        row.emission_key === LONGEVITY_EVENT_TYPE.BLOOD_RESULTS_UPLOADED_AFTER_REMINDER ||
        row.emission_key === LONGEVITY_EVENT_TYPE.SCALP_PHOTO_UPLOADED_AFTER_REMINDER
      ) {
        returnAfterReminder = true;
      }
      if (row.emission_key === LONGEVITY_EVENT_TYPE.BLOOD_RESULTS_UPLOADED) markerIndicators++;
      if (
        row.emission_key === LONGEVITY_EVENT_TYPE.SCALP_PHOTO_UPLOADED_AFTER_REMINDER
      ) {
        scalpIndicators++;
      }
    }

    if (row.emission_kind === "signal") {
      if (row.emission_key === LONGEVITY_SIGNAL_KEY.TREATMENT_ADHERENCE_SUMMARY) treatmentSignals++;
      if (
        row.emission_key === LONGEVITY_SIGNAL_KEY.VISUAL_CHANGE_DETECTED ||
        row.emission_key === LONGEVITY_SIGNAL_KEY.VISUAL_CONCERN_PERSISTENT ||
        row.emission_key === LONGEVITY_SIGNAL_KEY.VISUAL_COMPARISON_LIMITED
      ) {
        scalpIndicators++;
      }
      if (row.emission_key === LONGEVITY_SIGNAL_KEY.MARKER_IMPROVING) markerIndicators++;
      if (row.emission_key === LONGEVITY_SIGNAL_KEY.BLOOD_RESULTS_PENDING) markerIndicators++;
      if (row.emission_key === LONGEVITY_SIGNAL_KEY.REENGAGEMENT_DELAY_DAYS) returnAfterReminder = true;
    }
  }

  const longitudinal_history = intakes.size >= MIN_INTAKES_LONGITUDINAL;
  const treatment_continuity_data = treatmentSignals >= MIN_TREATMENT_SIGNALS;
  const scalp_progression_data = scalpIndicators >= MIN_SCALP_INDICATORS;
  const marker_history = markerIndicators >= MIN_MARKER_INDICATORS;
  const reminder_follow_up_context =
    (reminderSent && returnAfterReminder) || returnAfterReminder;

  const contributing_dimensions: ReadinessDimension[] = [];
  const missing_dimensions: ReadinessDimension[] = [];
  for (const d of ALL_DIMENSIONS) {
    const satisfied =
      d === "longitudinal_history"
        ? longitudinal_history
        : d === "treatment_continuity_data"
          ? treatment_continuity_data
          : d === "scalp_progression_data"
            ? scalp_progression_data
            : d === "marker_history"
              ? marker_history
              : reminder_follow_up_context;
    if (satisfied) contributing_dimensions.push(d);
    else missing_dimensions.push(d);
  }

  const n = contributing_dimensions.length;
  const readiness_level: ReadinessLevel =
    n >= 4 ? "high" : n >= 2 ? "moderate" : "low";

  return {
    readiness_level,
    contributing_dimensions,
    missing_dimensions,
    readiness_version: READINESS_VERSION,
  };
}

/**
 * Person-level readiness. Reuses consumeOutbox + computeReadinessFromOutboxRows.
 */
export async function getPersonReadiness(
  supabase: SupabaseClient,
  profile_id: string,
  options?: ConsumeOutboxOptions
): Promise<PredictiveReadinessSummary> {
  const rows = await consumeOutbox(supabase, { ...options, profile_id });
  return computeReadinessFromOutboxRows(rows);
}

/**
 * Cohort-level readiness: distribution of levels and dimension prevalence.
 * Groups outbox rows by profile_id, computes per-profile readiness, then aggregates.
 */
export async function getCohortReadinessSummary(
  supabase: SupabaseClient,
  options?: ConsumeOutboxOptions
): Promise<CohortReadinessSummary> {
  const rows = await consumeOutbox(supabase, options);
  const byProfile = new Map<string, OutboxRow[]>();
  for (const row of rows) {
    const pid = row.profile_id ?? "unknown";
    if (!byProfile.has(pid)) byProfile.set(pid, []);
    byProfile.get(pid)!.push(row);
  }

  const level_counts: Record<ReadinessLevel, number> = {
    low: 0,
    moderate: 0,
    high: 0,
  };
  const dimension_prevalence: Record<ReadinessDimension, number> = {
    longitudinal_history: 0,
    treatment_continuity_data: 0,
    scalp_progression_data: 0,
    marker_history: 0,
    reminder_follow_up_context: 0,
  };

  for (const profileRows of byProfile.values()) {
    const summary = computeReadinessFromOutboxRows(profileRows);
    level_counts[summary.readiness_level]++;
    for (const d of summary.contributing_dimensions) {
      dimension_prevalence[d]++;
    }
  }

  return {
    readiness_version: READINESS_VERSION,
    level_counts,
    dimension_prevalence,
    profile_count: byProfile.size,
  };
}
