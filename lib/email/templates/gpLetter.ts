/**
 * GP Letter delivery email.
 * Subject: Your Clinical Support Letter for GP Review
 */

import { buildHliEmailHtml, buildHliEmailText } from "../hliEmailLayout";
import type { EmailBodyContent } from "../types";

export const SUBJECT = "Your Clinical Support Letter for GP Review";

export type GpLetterEmailParams = {
  fullName?: string | null;
  /** Optional portal URL for "View in portal" */
  portalUrl?: string | null;
};

export function buildGpLetterEmail(
  params: GpLetterEmailParams
): { subject: string; html: string; text: string } {
  const greeting = params.fullName?.trim()
    ? `Dear ${params.fullName.trim().split(/\s+/)[0]},`
    : "Hello,";

  const content: EmailBodyContent = {
    greeting,
    introParagraphs: [
      "Your clinical support letter for your treating GP is ready. This letter outlines the suggested investigations discussed in your Hair Longevity assessment.",
      "We encourage you to share it with your GP to support a collaborative approach to your care. Your GP will decide which tests, if any, are appropriate for you.",
    ],
    sections: [
      {
        heading: "What to do next",
        paragraphs: [
          "Download the letter from your portal if you have not already. Take it to your next GP appointment or send it to your practice ahead of your visit.",
        ],
      },
    ],
    cta: params.portalUrl
      ? { text: "View in Portal", url: params.portalUrl.replace(/\/$/, "") }
      : undefined,
    closingParagraphs: [
      "This letter is for your GP's information only and does not constitute a formal pathology request. All decisions remain with your treating doctor.",
    ],
    signOff: "Hair Longevity Institute™ Clinical Team",
  };

  return {
    subject: SUBJECT,
    html: buildHliEmailHtml(content),
    text: buildHliEmailText(content),
  };
}
