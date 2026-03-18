/**
 * Shared types for HLI email template system.
 * All outgoing emails use this structure for consistency.
 */

/** One CTA (e.g. "View Your Report", "Access Your Portal") */
export type EmailCTA = {
  text: string;
  url: string;
};

/** A section can have an optional heading, paragraphs, and/or bullets */
export type EmailSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};

/** Structured content for the main body (between greeting and sign-off) */
export type EmailBodyContent = {
  /** e.g. "Dear Jane" or "Hello" */
  greeting?: string;
  /** Short intro paragraph(s) — max 2–3 lines each */
  introParagraphs?: string[];
  /** Optional sections with heading + paragraphs/bullets */
  sections?: EmailSection[];
  /** Single primary CTA (optional) */
  cta?: EmailCTA;
  /** Closing paragraph(s) before sign-off */
  closingParagraphs?: string[];
  /** e.g. "The Hair Longevity Institute™ Clinical Team" */
  signOff?: string;
};
