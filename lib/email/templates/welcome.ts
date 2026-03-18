/**
 * Welcome / onboarding email.
 * Subject: Welcome to Hair Longevity Institute™
 */

import { buildHliEmailHtml, buildHliEmailText } from "../hliEmailLayout";
import type { EmailBodyContent } from "../types";

export const SUBJECT = "Welcome to Hair Longevity Institute™";

export type WelcomeEmailParams = {
  fullName?: string | null;
  /** Optional: link to start or dashboard */
  startUrl?: string | null;
};

export function buildWelcomeEmail(
  params: WelcomeEmailParams
): { subject: string; html: string; text: string } {
  const greeting = params.fullName?.trim()
    ? `Dear ${params.fullName.trim().split(/\s+/)[0]},`
    : "Hello,";

  const content: EmailBodyContent = {
    greeting,
    introParagraphs: [
      "Thank you for starting your journey with Hair Longevity Institute™. We use a biology-first approach to support your hair and scalp care.",
      "Here is what happens next: our team will review your information and, where appropriate, a clinician will complete an assessment. You will receive a notification when your summary is ready to view in your secure portal.",
    ],
    sections: [
      {
        heading: "What to expect",
        bullets: [
          "Your information is reviewed by our clinical team.",
          "We will notify you when your assessment summary is available.",
          "You can sign in to your portal at any time to check progress or upload additional information.",
        ],
      },
    ],
    cta: params.startUrl
      ? { text: "Go to Your Portal", url: params.startUrl.replace(/\/$/, "") }
      : undefined,
    closingParagraphs: [
      "If you have questions in the meantime, please contact us or speak with your clinician.",
    ],
    signOff: "Hair Longevity Institute™ Clinical Team",
  };

  return {
    subject: SUBJECT,
    html: buildHliEmailHtml(content),
    text: buildHliEmailText(content),
  };
}
