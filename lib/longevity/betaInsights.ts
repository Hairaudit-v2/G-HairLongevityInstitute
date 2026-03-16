/**
 * Beta insights: read-only aggregation from hli_longevity_audit_events for the internal beta dashboard.
 * Uses canonical beta event_type values. No new tables; modular helpers for reuse.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { BETA_EVENT } from "./analytics";

const BETA_EVENT_TYPES: string[] = Object.values(BETA_EVENT) as string[];

export type BetaInsightsSince = string | null; // ISO timestamp; null = all time

export type BetaEventCounts = Record<string, number>;

/**
 * Count events by event_type in the given period. Returns counts for all BETA_EVENT keys.
 */
export async function getBetaEventCounts(
  supabase: SupabaseClient,
  options: { since?: BetaInsightsSince } = {}
): Promise<BetaEventCounts> {
  const since = options.since?.trim() || null;
  let query = supabase
    .from("hli_longevity_audit_events")
    .select("event_type")
    .in("event_type", BETA_EVENT_TYPES);
  if (since) {
    query = query.gte("created_at", since);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const counts: BetaEventCounts = {};
  for (const key of BETA_EVENT_TYPES) {
    counts[key] = 0;
  }
  const set = new Set(BETA_EVENT_TYPES);
  for (const row of data ?? []) {
    const t = row.event_type as string;
    if (set.has(t)) {
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  return counts;
}

export type BetaDerivedMetrics = {
  conversion_start_submit: number; // intake_submitted / intake_started
  conversion_submit_released: number; // summary_released / intake_submitted
  conversion_released_viewed: number; // summary_viewed / summary_released
  avg_docs_per_submitted: number; // document_uploaded / intake_submitted
  submitted_not_released: number; // distinct intakes submitted minus released (best effort)
  released_not_viewed: number; // distinct intakes released minus viewed (best effort)
};

/**
 * Compute derived metrics from event counts and distinct intake_id sets.
 */
export async function getBetaDerivedMetrics(
  supabase: SupabaseClient,
  options: { since?: BetaInsightsSince } = {}
): Promise<BetaDerivedMetrics> {
  const since = options.since?.trim() || null;

  const [counts, submittedIntakeIds, releasedIntakeIds, viewedIntakeIds] = await Promise.all([
    getBetaEventCounts(supabase, { since }),
    getDistinctIntakeIdsForEvent(supabase, BETA_EVENT.INTAKE_SUBMITTED, since),
    getDistinctIntakeIdsForEvent(supabase, BETA_EVENT.SUMMARY_RELEASED, since),
    getDistinctIntakeIdsForEvent(supabase, BETA_EVENT.SUMMARY_VIEWED, since),
  ]);

  const started = counts[BETA_EVENT.INTAKE_STARTED] ?? 0;
  const submitted = counts[BETA_EVENT.INTAKE_SUBMITTED] ?? 0;
  const released = counts[BETA_EVENT.SUMMARY_RELEASED] ?? 0;
  const viewed = counts[BETA_EVENT.SUMMARY_VIEWED] ?? 0;
  const docs = counts[BETA_EVENT.DOCUMENT_UPLOADED] ?? 0;

  return {
    conversion_start_submit: started > 0 ? Math.round((1000 * submitted) / started) / 10 : 0,
    conversion_submit_released: submitted > 0 ? Math.round((1000 * released) / submitted) / 10 : 0,
    conversion_released_viewed: released > 0 ? Math.round((1000 * viewed) / released) / 10 : 0,
    avg_docs_per_submitted: submitted > 0 ? Math.round((100 * docs) / submitted) / 100 : 0,
    submitted_not_released: Math.max(0, submittedIntakeIds.size - releasedIntakeIds.size),
    released_not_viewed: Math.max(0, releasedIntakeIds.size - viewedIntakeIds.size),
  };
}

async function getDistinctIntakeIdsForEvent(
  supabase: SupabaseClient,
  eventType: string,
  since: string | null
): Promise<Set<string>> {
  let query = supabase
    .from("hli_longevity_audit_events")
    .select("intake_id")
    .eq("event_type", eventType)
    .not("intake_id", "is", null);
  if (since) query = query.gte("created_at", since);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const set = new Set<string>();
  for (const row of data ?? []) {
    const id = row.intake_id as string;
    if (id) set.add(id);
  }
  return set;
}

export type BetaRecentEvent = {
  id: string;
  event_type: string;
  created_at: string;
  intake_id: string | null;
  profile_id: string | null;
  actor_type: string | null;
  payload_preview: string;
};

/**
 * Fetch recent beta events in reverse chronological order.
 */
export async function getBetaRecentEvents(
  supabase: SupabaseClient,
  options: { since?: BetaInsightsSince; limit?: number } = {}
): Promise<BetaRecentEvent[]> {
  const since = options.since?.trim() || null;
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);

  let query = supabase
    .from("hli_longevity_audit_events")
    .select("id, event_type, created_at, intake_id, profile_id, actor_type, payload")
    .in("event_type", BETA_EVENT_TYPES)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (since) {
    query = query.gte("created_at", since);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const payload = (row.payload as Record<string, unknown>) ?? {};
    const preview =
      Object.keys(payload).length === 0
        ? "—"
        : JSON.stringify(payload).slice(0, 80) + (JSON.stringify(payload).length > 80 ? "…" : "");
    return {
      id: row.id,
      event_type: row.event_type as string,
      created_at: row.created_at as string,
      intake_id: row.intake_id as string | null,
      profile_id: row.profile_id as string | null,
      actor_type: row.actor_type as string | null,
      payload_preview: preview,
    };
  });
}
