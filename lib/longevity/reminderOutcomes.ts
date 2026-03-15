/**
 * Phase S: Reminder outcome tracking and adherence metrics.
 * Longevity-only. Links sent reminders to subsequent patient actions; computes simple metrics.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { LONGEVITY_EVENT_TYPE } from "./integrationContracts";
import { buildLongevityEventEnvelope } from "./normalizedEvents";
import { buildLongevityEntityRefs } from "./integrationContracts";
import {
  LONGEVITY_SIGNAL_KEY,
  LONGEVITY_INTEGRATION_SOURCE_SYSTEM,
  LONGEVITY_SIGNAL_CONTRACT_VERSION,
} from "./integrationContracts";
import type { NormalizedLongevitySignal } from "./normalizedSignals";
import { stageLongevityIntegrationArtifacts } from "./integrationOutbox";

export const REMINDER_OUTCOME_TYPE = {
  FOLLOW_UP_INTAKE_SUBMITTED: "follow_up_intake_submitted",
  BLOOD_RESULTS_UPLOADED: "blood_results_uploaded",
  SCALP_PHOTO_UPLOADED: "scalp_photo_uploaded",
  REVIEW_RE_ENTRY: "review_re_entry",
} as const;

export type ReminderOutcomeType =
  (typeof REMINDER_OUTCOME_TYPE)[keyof typeof REMINDER_OUTCOME_TYPE];

const MAX_ATTRIBUTION_DAYS = 180;

const OUTCOME_TO_EVENT_TYPE: Record<
  ReminderOutcomeType,
  (typeof LONGEVITY_EVENT_TYPE)[keyof typeof LONGEVITY_EVENT_TYPE]
> = {
  [REMINDER_OUTCOME_TYPE.FOLLOW_UP_INTAKE_SUBMITTED]:
    LONGEVITY_EVENT_TYPE.FOLLOW_UP_COMPLETED_AFTER_REMINDER,
  [REMINDER_OUTCOME_TYPE.BLOOD_RESULTS_UPLOADED]:
    LONGEVITY_EVENT_TYPE.BLOOD_RESULTS_UPLOADED_AFTER_REMINDER,
  [REMINDER_OUTCOME_TYPE.SCALP_PHOTO_UPLOADED]:
    LONGEVITY_EVENT_TYPE.SCALP_PHOTO_UPLOADED_AFTER_REMINDER,
  [REMINDER_OUTCOME_TYPE.REVIEW_RE_ENTRY]:
    LONGEVITY_EVENT_TYPE.FOLLOW_UP_COMPLETED_AFTER_REMINDER,
};

export type ReminderOutcomeRow = {
  id: string;
  reminder_id: string;
  profile_id: string;
  outcome_type: ReminderOutcomeType;
  related_intake_id: string | null;
  related_document_id: string | null;
  occurred_at: string;
  delay_days: number;
  created_at: string;
};

/**
 * Find the most recent sent reminder for this profile that was sent before occurredAt
 * and within MAX_ATTRIBUTION_DAYS. Returns null if none.
 */
async function findAttributableReminder(
  supabase: SupabaseClient,
  profileId: string,
  occurredAt: string,
  outcomeType: ReminderOutcomeType
): Promise<{
  id: string;
  profile_id: string;
  intake_id: string;
  sent_at: string;
} | null> {
  const cutoff = new Date(occurredAt);
  cutoff.setDate(cutoff.getDate() - MAX_ATTRIBUTION_DAYS);
  const cutoffIso = cutoff.toISOString();

  const { data, error } = await supabase
    .from("hli_longevity_reminders")
    .select("id, profile_id, intake_id, sent_at")
    .eq("profile_id", profileId)
    .eq("status", "sent")
    .not("sent_at", "is", null)
    .lt("sent_at", occurredAt)
    .gte("sent_at", cutoffIso)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.sent_at) return null;
  return data as { id: string; profile_id: string; intake_id: string; sent_at: string };
}

function delayDays(sentAt: string, occurredAt: string): number {
  const sent = new Date(sentAt).getTime();
  const occ = new Date(occurredAt).getTime();
  return Math.max(0, Math.floor((occ - sent) / (24 * 60 * 60 * 1000)));
}

/**
 * Record a reminder outcome when a patient action is attributable to a prior sent reminder.
 * Inserts one row per (reminder_id, outcome_type). Stages normalized event and reengagement_delay_days signal.
 */
export async function recordReminderOutcome(
  supabase: SupabaseClient,
  params: {
    profileId: string;
    outcomeType: ReminderOutcomeType;
    relatedIntakeId?: string | null;
    relatedDocumentId?: string | null;
    occurredAt: string;
  }
): Promise<ReminderOutcomeRow | null> {
  const reminder = await findAttributableReminder(
    supabase,
    params.profileId,
    params.occurredAt,
    params.outcomeType
  );
  if (!reminder) return null;

  const delay_days = delayDays(reminder.sent_at, params.occurredAt);

  const { data: inserted, error } = await supabase
    .from("hli_longevity_reminder_outcomes")
    .insert({
      reminder_id: reminder.id,
      profile_id: params.profileId,
      outcome_type: params.outcomeType,
      related_intake_id: params.relatedIntakeId ?? null,
      related_document_id: params.relatedDocumentId ?? null,
      occurred_at: params.occurredAt,
      delay_days,
    })
    .select("id, reminder_id, profile_id, outcome_type, related_intake_id, related_document_id, occurred_at, delay_days, created_at")
    .single();

  if (error) {
    if (error.code === "23505") return null;
    throw new Error(error.message);
  }

  const eventType = OUTCOME_TO_EVENT_TYPE[params.outcomeType];
  const occurredAtIso = params.occurredAt;
  const entityRefs = buildLongevityEntityRefs("intake", reminder.intake_id);
  const event = buildLongevityEventEnvelope({
    event_type: eventType,
    occurred_at: occurredAtIso,
    actor_type: "user",
    local_entity_type: "intake",
    local_entity_id: reminder.intake_id,
    payload: {
      reminder_id: reminder.id,
      profile_id: params.profileId,
      intake_id: reminder.intake_id,
      outcome_type: params.outcomeType,
      delay_days,
      related_intake_id: params.relatedIntakeId ?? null,
      related_document_id: params.relatedDocumentId ?? null,
      occurred_at: params.occurredAt,
    },
  });

  const reengagementSignal: NormalizedLongevitySignal = {
    signal_key: LONGEVITY_SIGNAL_KEY.REENGAGEMENT_DELAY_DAYS,
    source_system: LONGEVITY_INTEGRATION_SOURCE_SYSTEM,
    source_version: LONGEVITY_SIGNAL_CONTRACT_VERSION,
    generated_at: occurredAtIso,
    status: "active",
    severity: "info",
    entity_refs: entityRefs,
    payload: {
      reminder_id: reminder.id,
      profile_id: params.profileId,
      outcome_type: params.outcomeType,
      delay_days,
      occurred_at: params.occurredAt,
    },
  };

  await stageLongevityIntegrationArtifacts(supabase, {
    profile_id: params.profileId,
    intake_id: reminder.intake_id,
    document_id: params.relatedDocumentId ?? null,
    event,
    signals: [reengagementSignal],
  });

  return inserted as ReminderOutcomeRow;
}

export type AdherenceMetrics = {
  reminders_sent: number;
  reminders_failed: number;
  reminder_to_follow_up_conversion: number;
  reminder_to_blood_upload_conversion: number;
  reminder_to_scalp_photo_conversion: number;
  outcomes_follow_up_intake: number;
  outcomes_blood_results: number;
  outcomes_scalp_photo: number;
  outcomes_review_re_entry: number;
  avg_delay_days: number | null;
  median_delay_days: number | null;
  overdue_follow_up_count: number;
  since: string | null;
};

/**
 * Compute adherence and return metrics from reminders and outcomes. Optional since filter (ISO).
 */
export async function getAdherenceMetrics(
  supabase: SupabaseClient,
  params?: { since?: string | null }
): Promise<AdherenceMetrics> {
  const since = params?.since?.trim() || null;

  const remindersQuery = supabase
    .from("hli_longevity_reminders")
    .select("id, status, sent_at");
  if (since) {
    remindersQuery.gte("created_at", since);
  }
  const { data: reminderRows } = await remindersQuery;

  const outcomesQuery = supabase
    .from("hli_longevity_reminder_outcomes")
    .select("outcome_type, delay_days");
  if (since) {
    outcomesQuery.gte("occurred_at", since);
  }
  const { data: outcomeRows } = await outcomesQuery;

  const list = reminderRows ?? [];
  const sent = list.filter((r) => r.status === "sent").length;
  const failed = list.filter((r) => r.status === "failed").length;

  const outcomes = outcomeRows ?? [];
  const followUp = outcomes.filter(
    (o) => o.outcome_type === REMINDER_OUTCOME_TYPE.FOLLOW_UP_INTAKE_SUBMITTED
  ).length;
  const bloodResults = outcomes.filter(
    (o) => o.outcome_type === REMINDER_OUTCOME_TYPE.BLOOD_RESULTS_UPLOADED
  ).length;
  const scalpPhoto = outcomes.filter(
    (o) => o.outcome_type === REMINDER_OUTCOME_TYPE.SCALP_PHOTO_UPLOADED
  ).length;
  const reviewReEntry = outcomes.filter(
    (o) => o.outcome_type === REMINDER_OUTCOME_TYPE.REVIEW_RE_ENTRY
  ).length;

  const conversionFollowUp = sent > 0 ? followUp / sent : 0;
  const conversionBlood = sent > 0 ? bloodResults / sent : 0;
  const conversionScalp = sent > 0 ? scalpPhoto / sent : 0;

  const delayDaysList = outcomes
    .map((o) => o.delay_days as number)
    .filter((d) => typeof d === "number");
  const avgDelay =
    delayDaysList.length > 0
      ? delayDaysList.reduce((a, b) => a + b, 0) / delayDaysList.length
      : null;
  const sorted = [...delayDaysList].sort((a, b) => a - b);
  const medianDelay =
    sorted.length > 0
      ? sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2
        : sorted[Math.floor(sorted.length / 2)]!
      : null;

  const { count: overdueCount } = await supabase
    .from("hli_longevity_reminders")
    .select("*", { count: "exact", head: true })
    .eq("status", "staged")
    .in("reminder_type", ["follow_up_overdue", "follow_up_due"]);
  const overdue_follow_up_count = Number(overdueCount ?? 0);

  return {
    reminders_sent: sent,
    reminders_failed: failed,
    reminder_to_follow_up_conversion: Math.round(conversionFollowUp * 1000) / 1000,
    reminder_to_blood_upload_conversion: Math.round(conversionBlood * 1000) / 1000,
    reminder_to_scalp_photo_conversion: Math.round(conversionScalp * 1000) / 1000,
    outcomes_follow_up_intake: followUp,
    outcomes_blood_results: bloodResults,
    outcomes_scalp_photo: scalpPhoto,
    outcomes_review_re_entry: reviewReEntry,
    avg_delay_days: avgDelay != null ? Math.round(avgDelay * 10) / 10 : null,
    median_delay_days: medianDelay != null ? Math.round(medianDelay * 10) / 10 : null,
    overdue_follow_up_count,
    since,
  };
}
