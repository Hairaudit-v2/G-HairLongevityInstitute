/**
 * Assessment Complete (Summary Released) email.
 * Subject: Your Hair Longevity Assessment — Now Available
 */

import { buildHliEmailHtml, buildHliEmailText } from "../hliEmailLayout";
import type { EmailBodyContent } from "../types";

export const SUBJECT = "Your Hair Longevity Assessment — Now Available";

export type AssessmentCompleteParams = {
  /** Recipient first name or full name for greeting */
  fullName?: string | null;
  /** Portal URL (e.g. from HLI_APP_URL + /portal) */
  portalUrl?: string | null;
};

export function buildAssessmentCompleteEmail(
  params: AssessmentCompleteParams
): { subject: string; html: string; text: string } {
  const greeting = params.fullName?.trim()
    ? `Dear ${params.fullName.trim().split(/\s+/)[0]},`
    : "Hello,";

  const portalUrl = params.portalUrl?.replace(/\/$/, "");
  const cta = portalUrl
    ? { text: "Access Your Portal", url: portalUrl }
    : undefined;

  const content: EmailBodyContent = {
    greeting,
    introParagraphs: [
      "Your Hair Longevity assessment is now available. Our clinician has completed their review and released a summary for you.",
    ],
    sections: portalUrl
      ? [
          {
            paragraphs: [
              "Sign in to your secure portal to view your summary and next steps.",
            ],
          },
        ]
      : undefined,
    cta,
    closingParagraphs: [
      "If you have any questions, please contact your clinician or reach out to us.",
    ],
    signOff: "Hair Longevity Institute™ Clinical Team",
  };

  return {
    subject: SUBJECT,
    html: buildHliEmailHtml(content),
    text: buildHliEmailText(content),
  };
}
