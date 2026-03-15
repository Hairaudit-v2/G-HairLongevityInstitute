/**
 * Phase V: Analytics consumption layer — outbox consumer and cohort aggregation.
 * Longevity namespace only. Read-only; HLI remains source of truth.
 * Reuses derivedReportingStates and adherenceStates; no duplicate rule logic.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { LONGEVITY_SIGNAL_KEY } from "./integrationContracts";
import { computeAdherenceStates } from "./adherenceStates";
import type { AdherenceContextResult } from "./adherenceContext";
import { computeDerivedReportingStates } from "./derivedReportingStates";
import type { SignalLike } from "./derivedReportingStates";

/** Single row from hli_longevity_integration_outbox (consumption view). */
export type OutboxRow = {
  id: string;
  profile_id: string | null;
  intake_id: string | null;
  emission_kind: "event" | "signal";
  emission_key: string;
  payload: Record<string, unknown>;
  created_at: string;
};

/** Options for outbox consumption (optional filters, e.g. for future query params). */
export type ConsumeOutboxOptions = {
  since?: string | null;
  limit?: number;
  /** Filter by profile (person-level analytics). */
  profile_id?: string | null;
};

/**
 * Read outbox rows for analytics. Does not modify or delete; consumption-only.
 * Deterministic given same options.
 */
export async function consumeOutbox(
  supabase: SupabaseClient,
  options?: ConsumeOutboxOptions
): Promise<OutboxRow[]> {
  const since = options?.since?.trim() || null;
  const limit = Math.min(Math.max(options?.limit ?? 1000, 1), 5000);
  const profile_id = options?.profile_id?.trim() || null;

  let query = supabase
    .from("hli_longevity_integration_outbox")
    .select("id, profile_id, intake_id, emission_kind, emission_key, payload, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (since) {
    query = query.gte("created_at", since);
  }
  if (profile_id) {
    query = query.eq("profile_id", profile_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as OutboxRow[];
}

/** Driver-related signal keys for cohort driver aggregation. */
const DRIVER_SIGNAL_KEYS = new Set<string>([
  LONGEVITY_SIGNAL_KEY.IRON_RISK_ACTIVE,
  LONGEVITY_SIGNAL_KEY.THYROID_DRIVER_ACTIVE,
  LONGEVITY_SIGNAL_KEY.INFLAMMATORY_BURDEN_PERSISTENT,
  LONGEVITY_SIGNAL_KEY.VISUAL_CONCERN_PERSISTENT,
  LONGEVITY_SIGNAL_KEY.GP_FOLLOW_UP_SUGGESTED,
  LONGEVITY_SIGNAL_KEY.FOLLOW_UP_RECOMMENDED,
  LONGEVITY_SIGNAL_KEY.BLOOD_RESULTS_PENDING,
  LONGEVITY_SIGNAL_KEY.MARKER_IMPROVING,
  LONGEVITY_SIGNAL_KEY.VISUAL_CHANGE_DETECTED,
]);

export type CohortDriverSummary = {
  active_driver_distribution: Record<string, number>;
  persistent_driver_counts: Record<string, number>;
  driver_combination_counts: Record<string, number>;
  total_signal_rows: number;
  total_profiles_with_driver_signals: number;
};

/**
 * Aggregate cohort driver summary from outbox signals. Deterministic.
 */
export async function getCohortDriverSummary(
  supabase: SupabaseClient,
  options?: ConsumeOutboxOptions
): Promise<CohortDriverSummary> {
  const rows = await consumeOutbox(supabase, options);
  const signals = rows.filter((r) => r.emission_kind === "signal");

  const active_driver_distribution: Record<string, number> = {};
  const persistent_driver_counts: Record<string, number> = {};
  const profileDriverSets = new Map<string, Set<string>>();

  for (const row of signals) {
    if (DRIVER_SIGNAL_KEYS.has(row.emission_key)) {
      active_driver_distribution[row.emission_key] =
        (active_driver_distribution[row.emission_key] ?? 0) + 1;
    }

    const persistentDrivers = row.payload?.persistent_drivers as
      | string[]
      | undefined;
    if (Array.isArray(persistentDrivers)) {
      for (const d of persistentDrivers) {
        if (typeof d === "string" && d) {
          persistent_driver_counts[d] = (persistent_driver_counts[d] ?? 0) + 1;
        }
      }
    }

    const profileId = row.profile_id ?? "unknown";
    if (DRIVER_SIGNAL_KEYS.has(row.emission_key)) {
      let set = profileDriverSets.get(profileId);
      if (!set) {
        set = new Set();
        profileDriverSets.set(profileId, set);
      }
      set.add(row.emission_key);
    }
  }

  const driver_combination_counts: Record<string, number> = {};
  for (const set of profileDriverSets.values()) {
    const key = [...set].sort().join("|");
    driver_combination_counts[key] = (driver_combination_counts[key] ?? 0) + 1;
  }

  return {
    active_driver_distribution,
    persistent_driver_counts,
    driver_combination_counts,
    total_signal_rows: signals.length,
    total_profiles_with_driver_signals: profileDriverSets.size,
  };
}

/** Adherence context built from reminders + outcomes for one intake. */
type IntakeAdherenceContext = {
  profile_id: string;
  intake_id: string;
  reminders_sent_count: number;
  returned_after_reminder: boolean;
  days_to_return: number | null;
  repeated_overdue_pattern: boolean;
};

export type CohortAdherenceSummary = {
  high_follow_up_adherence_count: number;
  delayed_follow_up_pattern_count: number;
  repeat_reminder_required_count: number;
  prompt_response_good_count: number;
  intakes_with_reminders: number;
  intakes_with_outcome: number;
  percentages: {
    high_adherence_pct: number;
    delayed_pct: number;
    repeat_required_pct: number;
  };
};

/** Optional scoping for adherence cohort (since/limit only; no profile_id). */
export type AdherenceCohortOptions = {
  since?: string | null;
  limit?: number;
};

/**
 * Build adherence context from reminders + outcomes, then aggregate using computeAdherenceStates.
 * Reuses adherence rule logic; no duplication.
 * Optional since/limit scope reminders for consistent benchmark cohort (additive; does not change operational workflows).
 */
export async function getCohortAdherenceSummary(
  supabase: SupabaseClient,
  options?: AdherenceCohortOptions
): Promise<CohortAdherenceSummary> {
  const since = options?.since?.trim() || null;
  const limit = Math.min(Math.max(options?.limit ?? 10000, 1), 10000);

  let query = supabase
    .from("hli_longevity_reminders")
    .select("id, profile_id, intake_id, sent_at")
    .eq("status", "sent")
    .not("sent_at", "is", null)
    .order("sent_at", { ascending: false })
    .limit(limit);
  if (since) {
    query = query.gte("sent_at", since);
  }
  const { data: reminders } = await query;
  const list = reminders ?? [];
  if (list.length === 0) {
    return {
      high_follow_up_adherence_count: 0,
      delayed_follow_up_pattern_count: 0,
      repeat_reminder_required_count: 0,
      prompt_response_good_count: 0,
      intakes_with_reminders: 0,
      intakes_with_outcome: 0,
      percentages: {
        high_adherence_pct: 0,
        delayed_pct: 0,
        repeat_required_pct: 0,
      },
    };
  }

  const reminderIds = list.map((r) => r.id);
  const { data: outcomes } = await supabase
    .from("hli_longevity_reminder_outcomes")
    .select("reminder_id, outcome_type, delay_days, occurred_at")
    .in("reminder_id", reminderIds);

  const outcomeList = outcomes ?? [];
  const outcomesByReminderId = new Map<string, { delay_days: number }[]>();
  for (const o of outcomeList) {
    const rid = (o as { reminder_id: string; delay_days?: number }).reminder_id;
    const delay = (o as { delay_days?: number }).delay_days;
    if (!outcomesByReminderId.has(rid)) outcomesByReminderId.set(rid, []);
    if (typeof delay === "number") outcomesByReminderId.get(rid)!.push({ delay_days: delay });
  }

  const intakeKey = (p: string, i: string) => `${p}:${i}`;
  type ReminderRow = { id: string; profile_id: string; intake_id: string; sent_at: string };
  const intakeReminders = new Map<string, ReminderRow[]>();
  for (const r of list) {
    const row = r as ReminderRow;
    const key = intakeKey(row.profile_id, row.intake_id);
    if (!intakeReminders.has(key)) intakeReminders.set(key, []);
    intakeReminders.get(key)!.push(row);
  }

  const contexts: IntakeAdherenceContext[] = [];
  for (const [key, rems] of intakeReminders) {
    const [profile_id, intake_id] = key.split(":");
    const remindersSentCount = rems.length;
    const allOutcomes: { delay_days: number }[] = [];
    for (const rem of rems) {
      const out = outcomesByReminderId.get(rem.id) ?? [];
      allOutcomes.push(...out);
    }
    const returned_after_reminder = allOutcomes.length > 0;
    const daysToReturn =
      allOutcomes.length > 0
        ? Math.min(...allOutcomes.map((o) => o.delay_days))
        : null;
    const repeated_overdue_pattern = remindersSentCount >= 2;

    contexts.push({
      profile_id,
      intake_id,
      reminders_sent_count: remindersSentCount,
      returned_after_reminder,
      days_to_return: daysToReturn,
      repeated_overdue_pattern,
    });
  }

  let high_follow_up_adherence_count = 0;
  let delayed_follow_up_pattern_count = 0;
  let repeat_reminder_required_count = 0;
  let prompt_response_good_count = 0;
  let intakes_with_outcome = 0;

  for (const ctx of contexts) {
    const adherenceResult: AdherenceContextResult = {
      returned_after_reminder: ctx.returned_after_reminder,
      days_to_return: ctx.days_to_return,
      repeated_overdue_pattern: ctx.repeated_overdue_pattern,
      reminder_response_context: [],
      reminders_sent_count: ctx.reminders_sent_count,
      outcome_types: [],
    };
    const flags = computeAdherenceStates(adherenceResult);
    if (flags.high_adherence) high_follow_up_adherence_count++;
    if (flags.delayed_follow_up_pattern) delayed_follow_up_pattern_count++;
    if (flags.repeat_reminder_required) repeat_reminder_required_count++;
    if (flags.prompt_response_good) prompt_response_good_count++;
    if (ctx.returned_after_reminder) intakes_with_outcome++;
  }

  const n = contexts.length;
  return {
    high_follow_up_adherence_count,
    delayed_follow_up_pattern_count,
    repeat_reminder_required_count,
    prompt_response_good_count,
    intakes_with_reminders: n,
    intakes_with_outcome,
    percentages: {
      high_adherence_pct: n > 0 ? Math.round((1000 * high_follow_up_adherence_count) / n) / 10 : 0,
      delayed_pct: n > 0 ? Math.round((1000 * delayed_follow_up_pattern_count) / n) / 10 : 0,
      repeat_required_pct: n > 0 ? Math.round((1000 * repeat_reminder_required_count) / n) / 10 : 0,
    },
  };
}

export type CohortTreatmentSummary = {
  treatment_adherence_summary_count: number;
  outcome_correlation_count: number;
  continuity_distribution: Record<string, number>;
  correlation_state_counts: Record<string, number>;
};

/**
 * Aggregate treatment-related cohort summary from outbox signals. High-level only.
 */
export async function getCohortTreatmentSummary(
  supabase: SupabaseClient,
  options?: ConsumeOutboxOptions
): Promise<CohortTreatmentSummary> {
  const rows = await consumeOutbox(supabase, options);
  const signals = rows.filter((r) => r.emission_kind === "signal");

  let treatment_adherence_summary_count = 0;
  let outcome_correlation_count = 0;
  const continuity_distribution: Record<string, number> = {};
  const correlation_state_counts: Record<string, number> = {};

  for (const row of signals) {
    if (row.emission_key === LONGEVITY_SIGNAL_KEY.TREATMENT_ADHERENCE_SUMMARY) {
      treatment_adherence_summary_count++;
      const items = row.payload?.items as { state?: string }[] | undefined;
      if (Array.isArray(items)) {
        for (const item of items) {
          const state = item?.state ?? "unknown";
          continuity_distribution[state] = (continuity_distribution[state] ?? 0) + 1;
        }
      }
    }
    if (row.emission_key === LONGEVITY_SIGNAL_KEY.OUTCOME_CORRELATION) {
      outcome_correlation_count++;
      const state = row.payload?.correlation_state as string | undefined;
      const key = typeof state === "string" && state ? state : "unknown";
      correlation_state_counts[key] = (correlation_state_counts[key] ?? 0) + 1;
    }
  }

  return {
    treatment_adherence_summary_count,
    outcome_correlation_count,
    continuity_distribution,
    correlation_state_counts,
  };
}

/** Cohort-level counts for visual vs marker discordance (derived from outbox signals). */
export type CohortDiscordanceSummary = {
  visual_progression_without_marker_improvement_count: number;
  marker_improvement_without_visual_change_count: number;
  /** Intakes with both visual and marker signals; denominator for discordance rates. */
  intakes_with_visual_and_marker: number;
};

/**
 * Aggregate cohort discordance from outbox signals using derived reporting states.
 * Only intakes that have both visual and marker signals are included; rates are emitted only when supported by real data.
 */
export async function getCohortDiscordanceSummary(
  supabase: SupabaseClient,
  options?: ConsumeOutboxOptions
): Promise<CohortDiscordanceSummary> {
  const rows = await consumeOutbox(supabase, options);
  const signals = rows.filter((r) => r.emission_kind === "signal" && r.intake_id);

  const byIntake = new Map<string, SignalLike[]>();
  for (const row of signals) {
    const intakeId = row.intake_id as string;
    if (!byIntake.has(intakeId)) byIntake.set(intakeId, []);
    byIntake.get(intakeId)!.push({ signal_key: row.emission_key, payload: row.payload ?? {} });
  }

  let visual_progression_without_marker_improvement_count = 0;
  let marker_improvement_without_visual_change_count = 0;
  let intakes_with_visual_and_marker = 0;

  for (const intakeSignals of byIntake.values()) {
    const hasVisual = intakeSignals.some((s) => s.signal_key === LONGEVITY_SIGNAL_KEY.VISUAL_CHANGE_DETECTED);
    const hasMarker = intakeSignals.some((s) => s.signal_key === LONGEVITY_SIGNAL_KEY.MARKER_IMPROVING);
    if (!hasVisual || !hasMarker) continue;

    intakes_with_visual_and_marker++;
    const flags = computeDerivedReportingStates({
      signals: intakeSignals,
      adherenceContexts: [],
      caseComparisons: [],
    });
    if (flags.visual_progression_without_marker_improvement) visual_progression_without_marker_improvement_count++;
    if (flags.marker_improvement_without_visual_change) marker_improvement_without_visual_change_count++;
  }

  return {
    visual_progression_without_marker_improvement_count,
    marker_improvement_without_visual_change_count,
    intakes_with_visual_and_marker,
  };
}
