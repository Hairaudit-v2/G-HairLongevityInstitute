/**
 * Shared HLI branding: business identity, typography scale, and color palette.
 * Premium, clinical, modern — used by GP support letter, future PDFs, and HLI emails.
 * Config values read from env with sensible defaults.
 */

/** Display name with trademark for letterhead and formal documents */
const BUSINESS_NAME_BASE = "Hair Longevity Institute";

export const HLI_BRAND = {
  /** Display name for letterhead and emails (with ™ when desired) */
  businessName:
    process.env.HLI_BUSINESS_NAME?.trim() || `${BUSINESS_NAME_BASE}™`,
  /** Optional tagline, e.g. "Clinical Hair & Scalp Science" */
  tagline: process.env.HLI_TAGLINE?.trim() || undefined,
  /** Full legal or trading name if different (optional) */
  legalName: process.env.HLI_LEGAL_NAME?.trim() || undefined,
  /** Single-line or multi-line address (optional) */
  address: process.env.HLI_ADDRESS?.trim() || undefined,
  /** Contact email */
  email:
    process.env.HLI_EMAIL?.trim() ||
    process.env.LONGEVITY_EMAIL_FROM?.split("<")[1]?.replace(">", "").trim() ||
    undefined,
  /** Website URL */
  website:
    process.env.HLI_WEBSITE?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://hairlongevityinstitute.com",
  /** Phone (optional) */
  phone: process.env.HLI_PHONE?.trim() || undefined,
  /** ABN or company number (optional) */
  abn: process.env.HLI_ABN?.trim() || undefined,
} as const;

/**
 * Typography scale for documents.
 * Line height ~1.5–1.7, generous section spacing (24–32pt equivalent).
 */
export const HLI_TYPOGRAPHY = {
  /** Document title */
  titleSize: 14,
  /** Section headings */
  headingSize: 11,
  /** Body text */
  bodySize: 10,
  /** Small print, disclaimer */
  smallSize: 9,
  /** Fine print (ref, legal) */
  fineSize: 8,
  /** Body line height multiplier (~1.5–1.7) */
  lineHeightBody: 1.65,
  lineHeightHeading: 1.35,
  /** Section spacing (points) — generous white space */
  sectionGap: 24,
  /** Between paragraphs / blocks within a section */
  blockGap: 14,
} as const;

/**
 * Premium clinical palette: charcoal text, soft gold accents, white/ivory background.
 * Hex for emails/CSS; PDFs use matching rgb() in pdfBranding.
 */
export const HLI_COLORS = {
  /** Primary text — charcoal / near-black */
  primary: "#2C2C2C",
  /** Accent — restrained soft gold */
  accent: "#B8A066",
  /** Muted text — footer, disclaimer */
  muted: "#5C5C5C",
  /** Divider / border */
  border: "#E8E6E1",
  /** Background — white or soft ivory */
  background: "#FFFFFF",
  backgroundSubtle: "#FAF9F7",
} as const;

/** Format a date for letter display: e.g. "18 March 2026" */
export function formatLetterDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    const day = d.getDate();
    const month = d.toLocaleDateString("en-GB", { month: "long" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return isoDate;
  }
}
