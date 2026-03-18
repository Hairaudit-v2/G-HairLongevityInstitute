/**
 * Generic reminder email.
 * Subject: Continue Your Hair Assessment
 * Use for follow-up due, blood results pending, etc. when a single CTA is the focus.
 */

import { buildHliEmailHtml, buildHliEmailText } from "../hliEmailLayout";
import type { EmailBodyContent } from "../types";

export const SUBJECT_CONTINUE = "Continue Your Hair Assessment";

export type ReminderEmailParams = {
  fullName?: string | null;
  /** Short intro (1–2 sentences) */
  intro: string;
  /** Optional bullet points or short lines */
  lines?: string[];
  /** Primary CTA */
  ctaText?: string;
  ctaUrl?: string;
};

export function buildReminderEmail(
  params: ReminderEmailParams
): { subject: string; html: string; text: string } {
  const greeting = params.fullName?.trim()
    ? `Dear ${params.fullName.trim().split(/\s+/)[0]},`
    : "Hello,";

  const sections: EmailBodyContent["sections"] = [];
  if (params.lines?.length) {
    sections.push({
      paragraphs: params.lines,
    });
  }

  const content: EmailBodyContent = {
    greeting,
    introParagraphs: [params.intro],
    sections: sections.length ? sections : undefined,
    cta:
      params.ctaText && params.ctaUrl
        ? { text: params.ctaText, url: params.ctaUrl }
        : undefined,
    signOff: "Hair Longevity Institute™ Clinical Team",
  };

  return {
    subject: SUBJECT_CONTINUE,
    html: buildHliEmailHtml(content),
    text: buildHliEmailText(content),
  };
}
