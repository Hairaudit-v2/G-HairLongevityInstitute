/**
 * Longevity: email when a trichologist releases the patient-visible summary.
 * Uses HLI unified email template (Assessment Complete).
 */

import {
  getLongevityReminderEmailAdapter,
  isValidReminderEmail,
  type SendReminderEmailResult,
} from "@/lib/longevity/reminderEmail";
import { buildAssessmentCompleteEmail } from "@/lib/email/templates/assessmentComplete";

export type SendSummaryReleasedParams = {
  to: string;
  fullName?: string | null;
  /** Base URL of the app; portal path is appended for CTA */
  appBaseUrl?: string;
};

export async function sendLongevitySummaryReleasedEmail(
  params: SendSummaryReleasedParams
): Promise<SendReminderEmailResult> {
  const adapter = getLongevityReminderEmailAdapter();
  if (!adapter) {
    return {
      ok: false,
      error: "Email delivery not configured (LONGEVITY_EMAIL_PROVIDER)",
      provider: "none",
    };
  }
  if (!isValidReminderEmail(params.to)) {
    return {
      ok: false,
      error: "Invalid or missing recipient email",
      provider: adapter.name,
    };
  }

  const portalUrl = params.appBaseUrl
    ? `${params.appBaseUrl.replace(/\/$/, "")}/portal`
    : null;

  const { subject, html, text } = buildAssessmentCompleteEmail({
    fullName: params.fullName,
    portalUrl,
  });

  return adapter.send({
    to: params.to,
    subject,
    bodyText: text,
    html,
  });
}
