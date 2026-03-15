/**
 * Internal benchmarking foundation for future Follicle Intelligence (FI) comparisons.
 * Longevity namespace only. Not a public ranking system; no clinic or doctor scores.
 *
 * Outputs are transparent metric summaries (numerator, denominator, percentage) for
 * internal comparison. Predictive readiness is included as a benchmark dimension only,
 * not a clinical claim. Discordance metrics are emitted only when supported by real
 * cohort-level data from the outbox/derived-state pipeline.
 *
 * Future: segmentation by age band, sex, driver pattern, treatment type.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConsumeOutboxOptions } from "./analytics";
import {
  getCohortAdherenceSummary,
  getCohortDriverSummary,
  getCohortTreatmentSummary,
  getCohortDiscordanceSummary,
} from "./analytics";
import { getTreatmentEffectivenessSummary } from "./treatmentEffectivenessAnalytics";
import { getCohortReadinessSummary } from "./predictiveReadiness";
import type { ReadinessDimension } from "./predictiveReadiness";

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
  const adherenceOptions = options ? { since: options.since, limit: options.limit } : undefined;

  const [adherence, drivers, treatments, effectiveness, readiness, discordance] = await Promise.all([
    getCohortAdherenceSummary(supabase, adherenceOptions),
    getCohortDriverSummary(supabase, options),
    getCohortTreatmentSummary(supabase, options),
    getTreatmentEffectivenessSummary(supabase, options),
    getCohortReadinessSummary(supabase, options),
    getCohortDiscordanceSummary(supabase, options),
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

  // --- Predictive readiness distribution (benchmark dimension only; not a clinical claim) ---
  const nProfiles = readiness.profile_count;
  const levelKeys = ["low", "moderate", "high"] as const;
  for (const level of levelKeys) {
    const count = readiness.level_counts[level];
    metrics.push({
      metric_key: "readiness_level_" + level + "_rate",
      metric_version: METRIC_VERSION,
      numerator: count,
      denominator: nProfiles,
      percentage: pct(count, nProfiles),
      cohort_label: cohortLabel,
    });
  }
  for (const dim of Object.keys(readiness.dimension_prevalence) as ReadinessDimension[]) {
    const count = readiness.dimension_prevalence[dim];
    const key = "readiness_dimension_" + dim + "_rate";
    metrics.push({
      metric_key: key,
      metric_version: METRIC_VERSION,
      numerator: count,
      denominator: nProfiles,
      percentage: pct(count, nProfiles),
      cohort_label: cohortLabel,
    });
  }

  // --- Visual vs marker discordance (only when supported by real cohort-level data) ---
  const nVisualMarker = discordance.intakes_with_visual_and_marker;
  metrics.push({
    metric_key: "visual_progression_without_marker_improvement_rate",
    metric_version: METRIC_VERSION,
    numerator: discordance.visual_progression_without_marker_improvement_count,
    denominator: nVisualMarker,
    percentage: pct(discordance.visual_progression_without_marker_improvement_count, nVisualMarker),
    cohort_label: cohortLabel,
  });
  metrics.push({
    metric_key: "marker_improvement_without_visual_change_rate",
    metric_version: METRIC_VERSION,
    numerator: discordance.marker_improvement_without_visual_change_count,
    denominator: nVisualMarker,
    percentage: pct(discordance.marker_improvement_without_visual_change_count, nVisualMarker),
    cohort_label: cohortLabel,
  });

  return metrics;
}
