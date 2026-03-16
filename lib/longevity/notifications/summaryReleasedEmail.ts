/**
 * Longevity: email when a trichologist releases the patient-visible summary.
 * Reuses the longevity email adapter (Resend / console / none) from reminderEmail.
 * Isolated so more longevity notifications can be added here or in sibling modules.
 */

import {
  getLongevityReminderEmailAdapter,
  isValidReminderEmail,
  type SendReminderEmailResult,
} from "@/lib/longevity/reminderEmail";

export type SendSummaryReleasedParams = {
  to: string;
  /** Optional; used for "Dear {name}" or fallback to neutral greeting. */
  fullName?: string | null;
  /** Base URL of the app, e.g. from HLI_APP_URL. Portal path is appended. */
  appBaseUrl?: string;
};

const PORTAL_PATH = "/portal";
const DEFAULT_FOOTER =
  "\n\n—\nHair Longevity Institute. If you have questions, please contact your clinician.";

function buildSubject(): string {
  return "Your Hair Longevity review is ready";
}

function buildBodyText(params: SendSummaryReleasedParams): string {
  const portalUrl = params.appBaseUrl
    ? `${params.appBaseUrl.replace(/\/$/, "")}${PORTAL_PATH}`
    : null;
  const greeting =
    params.fullName?.trim() ? `Dear ${params.fullName.trim()}` : "Hello";
  const signInLine = portalUrl
    ? `Please sign in to the secure portal to view it:\n\n${portalUrl}`
    : "Please sign in to your secure portal to view your summary.";
  return `${greeting},

Your Hair Longevity review is now available. Our clinician has completed their assessment and released a summary for you.

${signInLine}
${DEFAULT_FOOTER}`;
}

/**
 * Send the "summary released" email to the patient.
 * Uses the same provider as reminder emails (LONGEVITY_EMAIL_PROVIDER).
 * Returns result; does not throw. Caller should log and not block release on failure.
 */
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
  const subject = buildSubject();
  const bodyText = buildBodyText(params);
  return adapter.send({ to: params.to, subject, bodyText });
}
