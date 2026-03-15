/**
 * Phase V: Derived reporting states — single source of truth for FI-style analytics.
 * Longevity namespace only. Deterministic, inspectable, versioned.
 * Used by analytics consumption, cohort aggregation, and fixture validation.
 */

import type { AdherenceContextResult } from "./adherenceContext";
import { LONGEVITY_SIGNAL_KEY } from "./integrationContracts";
import { computeAdherenceStates } from "./adherenceStates";

/** Minimal signal-like shape for derived state computation (outbox or normalized records). */
export type SignalLike = {
  signal_key: string;
  payload: Record<string, unknown>;
};

/** Minimal case-comparison-like shape for persistent drivers and visual/marker state. */
export type CaseComparisonLike = {
  persistentDrivers?: string[];
  improvedAreas?: string[];
  /** e.g. "improved" | "stable" | "worsened" */
  comparisonStatus?: string;
};

/** Input for computing derived reporting states across a set of records. */
export type DerivedStateInput = {
  signals?: SignalLike[] | null;
  adherenceContexts?: AdherenceContextResult[] | null;
  caseComparisons?: CaseComparisonLike[] | null;
};

/** Derived reporting state flags (deterministic, same rules as adherenceStates + visual/marker). */
export type DerivedReportingStateFlags = {
  persistent_driver_pattern: boolean;
  high_follow_up_adherence: boolean;
  delayed_follow_up_pattern: boolean;
  repeat_reminder_required: boolean;
  visual_progression_without_marker_improvement: boolean;
  marker_improvement_without_visual_change: boolean;
};

/**
 * Compute derived reporting states from analytics-ready records.
 * Single source of truth; do not duplicate this logic elsewhere.
 */
export function computeDerivedReportingStates(
  input: DerivedStateInput
): DerivedReportingStateFlags {
  const signals = input.signals ?? [];
  const adherenceContexts = input.adherenceContexts ?? [];
  const caseComparisons = input.caseComparisons ?? [];

  const persistentDriverPattern = caseComparisons.some(
    (c) => (c.persistentDrivers?.length ?? 0) > 0
  );

  const highFollowUpAdherence = adherenceContexts.some((ctx) => {
    const flags = computeAdherenceStates(ctx);
    return flags.high_adherence;
  });

  const delayedFollowUpPattern = adherenceContexts.some((ctx) => {
    const flags = computeAdherenceStates(ctx);
    return flags.delayed_follow_up_pattern;
  });

  const repeatReminderRequired = adherenceContexts.some((ctx) => {
    const flags = computeAdherenceStates(ctx);
    return flags.repeat_reminder_required;
  });

  const hasVisualProgression = signals.some(
    (s) =>
      s.signal_key === LONGEVITY_SIGNAL_KEY.VISUAL_CHANGE_DETECTED &&
      s.payload?.comparison_status === "worsened"
  );

  const hasMarkerImprovement = signals.some(
    (s) => s.signal_key === LONGEVITY_SIGNAL_KEY.MARKER_IMPROVING
  );

  return {
    persistent_driver_pattern: persistentDriverPattern,
    high_follow_up_adherence: highFollowUpAdherence,
    delayed_follow_up_pattern: delayedFollowUpPattern,
    repeat_reminder_required: repeatReminderRequired,
    visual_progression_without_marker_improvement:
      hasVisualProgression && !hasMarkerImprovement,
    marker_improvement_without_visual_change:
      hasMarkerImprovement && !hasVisualProgression,
  };
}
