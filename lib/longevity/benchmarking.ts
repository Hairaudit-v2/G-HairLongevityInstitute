/**
 * Internal benchmarking foundation for future Follicle Intelligence (FI) comparisons.
 * Longevity namespace only.
 *
 * This is a benchmark foundation layer only — not a final public ranking system.
 * No clinic or doctor scores are produced or exposed. Outputs are transparent
 * metric summaries (numerator, denominator, percentage) for internal comparison.
 * Future: segmentation by age band, sex, driver pattern, treatment type.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConsumeOutboxOptions } from "./analytics";
import {
  getCohortAdherenceSummary,
  getCohortDriverSummary,
  getCohortTreatmentSummary,
} from "./analytics";
import { getTreatmentEffectivenessSummary } from "./treatmentEffectivenessAnalytics";

/** Transparent benchmark metric for internal comparison. Not for public display. */
export type BenchmarkMetric = {
  metric_key: string;
  metric_version: string;
  numerator: number;
  denominator: number;
  percentage: number;
  cohort_label: string;
};

const METRIC_VERSION = "v1";

/**
 * Round percentage for display; deterministic.
 */
function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((1000 * numerator) / denominator) / 10;
}

/**
 * Build benchmark-ready metric summaries from existing cohort analytics.
 * Reuses cohort helpers only; no duplicate aggregation logic.
 */
export async function getBenchmarkMetrics(
  supabase: SupabaseClient,
  options?: ConsumeOutboxOptions
): Promise<BenchmarkMetric[]> {
  const cohortLabel = "internal";
  const metrics: BenchmarkMetric[] = [];

  const [adherence, drivers, treatments, effectiveness] = await Promise.all([
    getCohortAdherenceSummary(supabase),
    getCohortDriverSummary(supabase, options),
    getCohortTreatmentSummary(supabase, options),
    getTreatmentEffectivenessSummary(supabase, options),
  ]);

  const nReminders = adherence.intakes_with_reminders;

  // --- Follow-up adherence distribution ---
  metrics.push({
    metric_key: "follow_up_high_adherence_rate",
    metric_version: METRIC_VERSION,
    numerator: adherence.high_follow_up_adherence_count,
    denominator: nReminders,
    percentage: pct(adherence.high_follow_up_adherence_count, nReminders),
    cohort_label: cohortLabel,
  });
  metrics.push({
    metric_key: "follow_up_delayed_pattern_rate",
    metric_version: METRIC_VERSION,
    numerator: adherence.delayed_follow_up_pattern_count,
    denominator: nReminders,
    percentage: pct(adherence.delayed_follow_up_pattern_count, nReminders),
    cohort_label: cohortLabel,
  });
  metrics.push({
    metric_key: "follow_up_repeat_reminder_required_rate",
    metric_version: METRIC_VERSION,
    numerator: adherence.repeat_reminder_required_count,
    denominator: nReminders,
    percentage: pct(adherence.repeat_reminder_required_count, nReminders),
    cohort_label: cohortLabel,
  });

  // --- Reminder conversion distribution ---
  metrics.push({
    metric_key: "reminder_conversion_rate",
    metric_version: METRIC_VERSION,
    numerator: adherence.intakes_with_outcome,
    denominator: nReminders,
    percentage: pct(adherence.intakes_with_outcome, nReminders),
    cohort_label: cohortLabel,
  });

  // --- Persistent driver prevalence (per driver label) ---
  const totalProfilesWithDriver = drivers.total_profiles_with_driver_signals;
  for (const [driverLabel, count] of Object.entries(drivers.persistent_driver_counts)) {
    const key = "persistent_driver_prevalence_" + (driverLabel.replace(/\s+/g, "_").toLowerCase() || "other");
    metrics.push({
      metric_key: key,
      metric_version: METRIC_VERSION,
      numerator: count,
      denominator: totalProfilesWithDriver,
      percentage: pct(count, totalProfilesWithDriver),
      cohort_label: cohortLabel,
    });
  }

  // --- Treatment response rates (from outcome correlation) ---
  const nBoth = effectiveness.intakes_with_both;
  const responseCount =
    (effectiveness.correlation_state_counts["improvement_with_treatment_continuity"] ?? 0) +
    (effectiveness.correlation_state_counts["possible_partial_response"] ?? 0);
  const nonResponseCount =
    (effectiveness.correlation_state_counts["no_clear_change"] ?? 0) +
    (effectiveness.correlation_state_counts["worsening_after_stopping"] ?? 0);

  metrics.push({
    metric_key: "treatment_response_rate",
    metric_version: METRIC_VERSION,
    numerator: responseCount,
    denominator: nBoth,
    percentage: pct(responseCount, nBoth),
    cohort_label: cohortLabel,
  });
  metrics.push({
    metric_key: "treatment_non_response_rate",
    metric_version: METRIC_VERSION,
    numerator: nonResponseCount,
    denominator: nBoth,
    percentage: pct(nonResponseCount, nBoth),
    cohort_label: cohortLabel,
  });
  metrics.push({
    metric_key: "treatment_insufficient_data_rate",
    metric_version: METRIC_VERSION,
    numerator: effectiveness.correlation_state_counts["insufficient_data"] ?? 0,
    denominator: effectiveness.intakes_with_outcome,
    percentage: pct(effectiveness.correlation_state_counts["insufficient_data"] ?? 0, effectiveness.intakes_with_outcome),
    cohort_label: cohortLabel,
  });

  // --- Treatment continuity distribution (from cohort treatment summary) ---
  const totalContinuity = Object.values(treatments.continuity_distribution).reduce((a, b) => a + b, 0);
  for (const [state, count] of Object.entries(treatments.continuity_distribution)) {
    const key = "treatment_continuity_" + (state || "unknown");
    metrics.push({
      metric_key: key,
      metric_version: METRIC_VERSION,
      numerator: count,
      denominator: totalContinuity,
      percentage: pct(count, totalContinuity),
      cohort_label: cohortLabel,
    });
  }

  // --- Visual vs marker discordance placeholders ---
  // Future: derive from cohort-level aggregation of derived states (visual_progression_without_marker_improvement,
  // marker_improvement_without_visual_change). For v1 we expose metric keys with denominator from intakes_with_both.
  metrics.push({
    metric_key: "visual_progression_without_marker_improvement_rate",
    metric_version: METRIC_VERSION,
    numerator: 0,
    denominator: nBoth,
    percentage: 0,
    cohort_label: cohortLabel,
  });
  metrics.push({
    metric_key: "marker_improvement_without_visual_change_rate",
    metric_version: METRIC_VERSION,
    numerator: 0,
    denominator: nBoth,
    percentage: 0,
    cohort_label: cohortLabel,
  });

  return metrics;
}
