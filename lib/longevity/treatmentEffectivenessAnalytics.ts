/**
 * Treatment-effectiveness aggregation for internal analytics and future FI benchmarking.
 * Longevity namespace only. Consumes outbox-derived treatment adherence and outcome
 * correlation signals; does not duplicate treatmentAdherence or treatmentOutcomeCorrelation logic.
 * Deterministic, inspectable, versioned.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { LONGEVITY_SIGNAL_KEY } from "./integrationContracts";
import { consumeOutbox, type ConsumeOutboxOptions } from "./analytics";

/** Treatment key from normalized payload (aligns with Phase U treatment keys). */
export type TreatmentKey = string;

/** Continuity / status from Phase U treatment_adherence_summary payload items. */
export type TreatmentState = string;

/** Counts per treatment key for cohort aggregation. */
export type TreatmentKeyCounts = {
  response_count: number;
  non_response_count: number;
  continuity_count: number;
  stopped_count: number;
  inconsistent_count: number;
  insufficient_data_count: number;
};

/** Response = improvement or partial response; non-response = no clear change or worsening. */
const RESPONSE_STATES: Set<string> = new Set([
  "improvement_with_treatment_continuity",
  "possible_partial_response",
]);
const NON_RESPONSE_STATES: Set<string> = new Set([
  "no_clear_change",
  "worsening_after_stopping",
]);
const CONTINUITY_STATES: Set<string> = new Set(["continued", "started"]);
const STOPPED_STATE = "stopped";
const INCONSISTENT_STATE = "inconsistent";
const INSUFFICIENT_STATES: Set<string> = new Set(["uncertain", "not_using"]);

/** Optional breakdown bucket (v1: structure only; expand later for driver/marker/visual). */
export type TreatmentEffectivenessBreakdown = {
  by_driver_pattern?: Record<string, TreatmentKeyCounts>;
  by_marker_abnormality?: Record<string, TreatmentKeyCounts>;
  by_visual_progression?: Record<string, TreatmentKeyCounts>;
};

export type TreatmentEffectivenessSummary = {
  /** Counts per treatment key (response, non-response, continuity, stopped, inconsistent, insufficient). */
  by_treatment: Record<TreatmentKey, TreatmentKeyCounts>;
  /** Overall correlation state distribution (intake-level). */
  correlation_state_counts: Record<string, number>;
  /** Intakes with at least one treatment adherence summary. */
  intakes_with_adherence: number;
  /** Intakes with at least one outcome correlation signal. */
  intakes_with_outcome: number;
  /** Intakes with both adherence and outcome (for response/non-response attribution). */
  intakes_with_both: number;
  /** Optional breakdowns for future FI benchmarking (v1: omit or empty). */
  breakdown?: TreatmentEffectivenessBreakdown;
};

function emptyCounts(): TreatmentKeyCounts {
  return {
    response_count: 0,
    non_response_count: 0,
    continuity_count: 0,
    stopped_count: 0,
    inconsistent_count: 0,
    insufficient_data_count: 0,
  };
}

function ensureCounts(by_treatment: Record<string, TreatmentKeyCounts>, key: string): TreatmentKeyCounts {
  if (!by_treatment[key]) by_treatment[key] = emptyCounts();
  return by_treatment[key];
}

/**
 * Aggregate treatment-effectiveness summary from outbox treatment_adherence_summary
 * and outcome_correlation signals. Reuses analytics consumption; no duplicate treatment logic.
 */
export async function getTreatmentEffectivenessSummary(
  supabase: SupabaseClient,
  options?: ConsumeOutboxOptions
): Promise<TreatmentEffectivenessSummary> {
  const rows = await consumeOutbox(supabase, options);
  const signals = rows.filter((r) => r.emission_kind === "signal");

  const by_treatment: Record<string, TreatmentKeyCounts> = {};
  const correlation_state_counts: Record<string, number> = {};

  /** Group by intake_id: adherence items and correlation_state. */
  const byIntake = new Map<
    string,
    {
      adherence_items: { key: string; state: string }[];
      correlation_state: string | null;
    }
  >();

  for (const row of signals) {
    const intakeId = (row.intake_id ?? "unknown") as string;
    if (!byIntake.has(intakeId)) {
      byIntake.set(intakeId, { adherence_items: [], correlation_state: null });
    }
    const entry = byIntake.get(intakeId)!;

    if (row.emission_key === LONGEVITY_SIGNAL_KEY.TREATMENT_ADHERENCE_SUMMARY) {
      const items = row.payload?.items as { key?: string; state?: string }[] | undefined;
      if (Array.isArray(items)) {
        entry.adherence_items = items
          .filter((i) => i && typeof i.key === "string")
          .map((i) => ({ key: String(i.key), state: typeof i.state === "string" ? i.state : "unknown" }));
      }
    }
    if (row.emission_key === LONGEVITY_SIGNAL_KEY.OUTCOME_CORRELATION) {
      const state = row.payload?.correlation_state;
      entry.correlation_state = typeof state === "string" ? state : null;
    }
  }

  let intakes_with_adherence = 0;
  let intakes_with_outcome = 0;
  let intakes_with_both = 0;

  for (const [, { adherence_items, correlation_state }] of byIntake) {
    if (adherence_items.length > 0) intakes_with_adherence++;
    if (correlation_state != null) {
      intakes_with_outcome++;
      correlation_state_counts[correlation_state] = (correlation_state_counts[correlation_state] ?? 0) + 1;
    }
    if (adherence_items.length > 0 && correlation_state != null) intakes_with_both++;

    for (const { key, state } of adherence_items) {
      const k = key || "unknown";
      const c = ensureCounts(by_treatment, k);

      if (CONTINUITY_STATES.has(state)) c.continuity_count++;
      if (state === STOPPED_STATE) c.stopped_count++;
      if (state === INCONSISTENT_STATE) c.inconsistent_count++;
      if (INSUFFICIENT_STATES.has(state) || state === "unknown") c.insufficient_data_count++;

      if (CONTINUITY_STATES.has(state) && correlation_state != null) {
        if (RESPONSE_STATES.has(correlation_state)) c.response_count++;
        else if (NON_RESPONSE_STATES.has(correlation_state)) c.non_response_count++;
      }
      if ((state === STOPPED_STATE || state === INCONSISTENT_STATE) && correlation_state === "worsening_after_stopping") {
        c.non_response_count++;
      }
    }
  }

  return {
    by_treatment,
    correlation_state_counts,
    intakes_with_adherence,
    intakes_with_outcome,
    intakes_with_both,
  };
}
