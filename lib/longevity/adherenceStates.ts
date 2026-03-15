/**
 * Phase T: FI-ready higher-level adherence state helpers.
 * Deterministic, additive, easy to inspect. No lifecycle duplication.
 */

import type { AdherenceContextResult } from "./adherenceContext";

export type AdherenceStateFlags = {
  high_adherence: boolean;
  delayed_follow_up_pattern: boolean;
  repeat_reminder_required: boolean;
  prompt_response_good: boolean;
};

const PROMPT_RESPONSE_DAYS_THRESHOLD = 14;
const DELAYED_PATTERN_MIN_DAYS = 21;

/**
 * Compute deterministic adherence state flags from adherence context.
 * Safe for FI and clinician dashboards.
 */
export function computeAdherenceStates(
  context: AdherenceContextResult
): AdherenceStateFlags {
  const returned = context.returned_after_reminder;
  const daysToReturn = context.days_to_return;
  const repeatedOverdue = context.repeated_overdue_pattern;
  const remindersSent = context.reminders_sent_count;

  const promptResponseGood =
    returned &&
    daysToReturn != null &&
    daysToReturn <= PROMPT_RESPONSE_DAYS_THRESHOLD;

  const delayedFollowUpPattern =
    repeatedOverdue ||
    (returned && daysToReturn != null && daysToReturn > DELAYED_PATTERN_MIN_DAYS);

  const repeatReminderRequired =
    remindersSent >= 1 && !returned;

  const highAdherence =
    returned &&
    (daysToReturn == null || daysToReturn <= PROMPT_RESPONSE_DAYS_THRESHOLD) &&
    !repeatedOverdue;

  return {
    high_adherence: highAdherence,
    delayed_follow_up_pattern: delayedFollowUpPattern,
    repeat_reminder_required: repeatReminderRequired,
    prompt_response_good: promptResponseGood,
  };
}
