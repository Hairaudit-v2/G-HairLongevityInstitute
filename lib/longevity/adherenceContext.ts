/**
 * Phase T: Adherence context for a case (intake).
 * Longevity-only. Surfaces return-after-reminder, delay, and response context from reminder outcomes.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { REMINDER_OUTCOME_TYPE } from "./reminderOutcomes";

export type AdherenceContextResult = {
  /** Patient returned (e.g. follow-up or re-entry) after at least one sent reminder for this intake */
  returned_after_reminder: boolean;
  /** Days from most recent sent reminder to first attributable outcome; null if none */
  days_to_return: number | null;
  /** Multiple reminders were sent for this intake before any outcome (suggests delayed engagement) */
  repeated_overdue_pattern: boolean;
  /** Human-readable summary lines for clinician */
  reminder_response_context: string[];
  /** Count of sent reminders for this intake */
  reminders_sent_count: number;
  /** Outcome types recorded for this intake's reminders (e.g. follow_up_intake_submitted) */
  outcome_types: string[];
};

/**
 * Get adherence context for an intake: reminders sent for this intake and outcomes linked to them.
 * Deterministic, additive, safe for FI consumption.
 */
export async function getAdherenceContextForIntake(
  supabase: SupabaseClient,
  params: { profileId: string; intakeId: string }
): Promise<AdherenceContextResult> {
  const { intakeId } = params;

  const { data: sentReminders } = await supabase
    .from("hli_longevity_reminders")
    .select("id, sent_at")
    .eq("intake_id", intakeId)
    .eq("status", "sent")
    .not("sent_at", "is", null)
    .order("sent_at", { ascending: true });

  const list = sentReminders ?? [];
  const remindersSentCount = list.length;
  const reminderIds = list.map((r) => r.id);

  if (reminderIds.length === 0) {
    return {
      returned_after_reminder: false,
      days_to_return: null,
      repeated_overdue_pattern: false,
      reminder_response_context: ["No reminders sent for this intake."],
      reminders_sent_count: 0,
      outcome_types: [],
    };
  }

  const { data: outcomes } = await supabase
    .from("hli_longevity_reminder_outcomes")
    .select("reminder_id, outcome_type, delay_days, occurred_at")
    .in("reminder_id", reminderIds)
    .order("occurred_at", { ascending: true });

  const outcomeList = outcomes ?? [];
  const returnedAfterReminder = outcomeList.length > 0;
  const outcomeTypes = [...new Set(outcomeList.map((o) => o.outcome_type))];

  let daysToReturn: number | null = null;
  if (outcomeList.length > 0) {
    const delays = outcomeList.map((o) => o.delay_days as number).filter((d) => typeof d === "number");
    daysToReturn = delays.length > 0 ? Math.min(...delays) : null;
  }

  const repeatedOverduePattern = remindersSentCount >= 2;

  const reminderResponseContext: string[] = [];
  if (returnedAfterReminder && daysToReturn != null) {
    reminderResponseContext.push(`Returned ${daysToReturn} day${daysToReturn !== 1 ? "s" : ""} after reminder.`);
  } else if (remindersSentCount > 0) {
    reminderResponseContext.push("No return after reminder yet.");
  }
  if (remindersSentCount > 0) {
    reminderResponseContext.push(`${remindersSentCount} reminder(s) sent for this intake.`);
  }
  if (outcomeTypes.length > 0) {
    const labels: Record<string, string> = {
      [REMINDER_OUTCOME_TYPE.FOLLOW_UP_INTAKE_SUBMITTED]: "Follow-up submitted",
      [REMINDER_OUTCOME_TYPE.BLOOD_RESULTS_UPLOADED]: "Blood results uploaded",
      [REMINDER_OUTCOME_TYPE.SCALP_PHOTO_UPLOADED]: "Scalp photo uploaded",
      [REMINDER_OUTCOME_TYPE.REVIEW_RE_ENTRY]: "Review re-entry",
    };
    const described = outcomeTypes.map((t) => labels[t] ?? t).join(", ");
    reminderResponseContext.push(`Outcomes: ${described}.`);
  }

  return {
    returned_after_reminder: returnedAfterReminder,
    days_to_return: daysToReturn,
    repeated_overdue_pattern: repeatedOverduePattern,
    reminder_response_context: reminderResponseContext.length > 0 ? reminderResponseContext : ["No reminder activity."],
    reminders_sent_count: remindersSentCount,
    outcome_types: outcomeTypes,
  };
}
