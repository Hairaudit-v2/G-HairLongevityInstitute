/**
 * Follow-up / next steps email.
 * Subject: Your Next Steps
 */

import { buildHliEmailHtml, buildHliEmailText } from "../hliEmailLayout";
import type { EmailBodyContent } from "../types";

export const SUBJECT = "Your Next Steps";

export type FollowUpEmailParams = {
  fullName?: string | null;
  /** Short intro */
  intro: string;
  /** Bullet points for recommendations or steps */
  steps?: string[];
  portalUrl?: string | null;
};

export function buildFollowUpEmail(
  params: FollowUpEmailParams
): { subject: string; html: string; text: string } {
  const greeting = params.fullName?.trim()
    ? `Dear ${params.fullName.trim().split(/\s+/)[0]},`
    : "Hello,";

  const content: EmailBodyContent = {
    greeting,
    introParagraphs: [params.intro],
    sections:
      params.steps?.length ?
        [
          {
            heading: "Recommended next steps",
            bullets: params.steps,
          },
        ]
      : undefined,
    cta: params.portalUrl
      ? {
          text: "Access Your Portal",
          url: params.portalUrl.replace(/\/$/, ""),
        }
      : undefined,
    signOff: "Hair Longevity Institute™ Clinical Team",
  };

  return {
    subject: SUBJECT,
    html: buildHliEmailHtml(content),
    text: buildHliEmailText(content),
  };
}
