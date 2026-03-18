/**
 * Shared PDF branding for HLI documents: premium clinical look.
 * Charcoal text, soft gold accents, clean layout. Reusable header, footer, section styles.
 */

import path from "node:path";
import { readFile } from "node:fs/promises";
import type { PDFDocument, PDFPage, PDFFont } from "pdf-lib";
import { rgb, RGB } from "pdf-lib";
import { HLI_BRAND, HLI_TYPOGRAPHY } from "@/lib/hliBranding";

/** PDF color palette — charcoal, soft gold, muted (aligned with HLI_COLORS). */
export const PDF_COLORS = {
  /** Primary text — charcoal */
  primary: rgb(44 / 255, 44 / 255, 44 / 255),
  /** Accent — restrained soft gold */
  accent: rgb(184 / 255, 160 / 255, 102 / 255),
  /** Muted — disclaimer, footer */
  muted: rgb(92 / 255, 92 / 255, 92 / 255),
  /** Body text */
  body: rgb(44 / 255, 44 / 255, 44 / 255),
  /** Divider — soft, minimal */
  divider: rgb(232 / 255, 230 / 255, 225 / 255),
} as const;

export const PDF_LAYOUT = {
  margin: 54,
  pageWidth: 595,
  pageHeight: 842,
  /** Max content width (page width minus margins); keeps body and divider within bounds */
  contentWidth: 595 - 54 * 2,
  logoMaxWidth: 150,
  /** Chars per line for body — comfortable line length, avoids mid-word wrap */
  bodyCharsPerLine: 72,
  disclaimerCharsPerLine: 82,
  /** Space below header divider before body starts */
  headerBottomGap: 28,
} as const;

/** Try to load logo as PNG buffer (from PNG file or SVG converted via sharp). */
export async function loadHliLogoPng(): Promise<Buffer | null> {
  const brandDir = path.join(process.cwd(), "public", "brand");
  const candidates: Array<{ path: string; resize?: number }> = [
    { path: "hli-logo.png" },
    { path: "Print_Transparent.svg", resize: 200 },
    { path: "Print.svg", resize: 200 },
  ];
  for (const { path: rel, resize } of candidates) {
    const p = path.join(brandDir, rel);
    try {
      const buf = await readFile(p);
      if (p.endsWith(".svg")) {
        const sharp = (await import("sharp")).default;
        let pipe = sharp(buf);
        if (resize) pipe = pipe.resize(resize);
        return pipe.png().toBuffer();
      }
      if (resize && p.endsWith(".png")) {
        const sharp = (await import("sharp")).default;
        return sharp(buf).resize(resize).png().toBuffer();
      }
      return buf;
    } catch {
      continue;
    }
  }
  return null;
}

export type HliLetterHeaderOptions = {
  logoPng?: Buffer | null;
  /** Draw a thin rule under the header */
  ruleBelow?: boolean;
};

/**
 * Draw the HLI branded header: logo (if available), business name, optional tagline,
 * address, contact line (email · website · phone · ABN), optional rule.
 * Returns y position after the header.
 */
export async function drawHliLetterHeader(
  doc: PDFDocument,
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  options: HliLetterHeaderOptions = {}
): Promise<number> {
  const { margin, pageHeight, contentWidth, logoMaxWidth } = PDF_LAYOUT;
  const { regular, bold } = fonts;
  let y = pageHeight - 54;

  const lineH = (size: number, mult: number = HLI_TYPOGRAPHY.lineHeightBody) =>
    size * mult + 2;

  // Logo
  let logoPng = options.logoPng;
  if (logoPng === undefined) logoPng = await loadHliLogoPng();
  if (logoPng && logoPng.length > 0) {
    try {
      const logoImg = await doc.embedPng(logoPng);
      const w = Math.min(logoMaxWidth, logoImg.width);
      const h = (logoImg.height / logoImg.width) * w;
      page.drawImage(logoImg, { x: margin, y: y - h, width: w, height: h });
      y -= h + 12;
    } catch {
      // no logo
    }
  }

  // Business name — soft gold accent
  page.drawText(HLI_BRAND.businessName, {
    x: margin,
    y,
    size: HLI_TYPOGRAPHY.headingSize,
    font: bold,
    color: PDF_COLORS.accent,
  });
  y -= lineH(HLI_TYPOGRAPHY.headingSize, HLI_TYPOGRAPHY.lineHeightHeading);

  if (HLI_BRAND.tagline) {
    page.drawText(HLI_BRAND.tagline, {
      x: margin,
      y,
      size: HLI_TYPOGRAPHY.smallSize,
      font: regular,
      color: PDF_COLORS.muted,
    });
    y -= lineH(HLI_TYPOGRAPHY.smallSize);
  }

  const small = HLI_TYPOGRAPHY.smallSize;
  if (HLI_BRAND.address) {
    page.drawText(HLI_BRAND.address, {
      x: margin,
      y,
      size: small,
      font: regular,
      color: PDF_COLORS.body,
    });
    y -= lineH(small);
  }
  const contactParts: string[] = [];
  if (HLI_BRAND.email) contactParts.push(HLI_BRAND.email);
  if (HLI_BRAND.website) contactParts.push(HLI_BRAND.website);
  if (HLI_BRAND.phone) contactParts.push(HLI_BRAND.phone);
  if (HLI_BRAND.abn) contactParts.push(`ABN: ${HLI_BRAND.abn}`);
  if (contactParts.length > 0) {
    const contactText = contactParts.join("  ·  ");
    page.drawText(contactText, {
      x: margin,
      y,
      size: small,
      font: regular,
      color: PDF_COLORS.muted,
      maxWidth: contentWidth,
    });
    y -= lineH(small);
  }

  y -= 14;

  if (options.ruleBelow !== false) {
    page.drawLine({
      start: { x: margin, y },
      end: { x: margin + contentWidth, y },
      thickness: 0.5,
      color: PDF_COLORS.divider,
    });
    y -= PDF_LAYOUT.headerBottomGap;
  }

  return y;
}

export type HliLetterFooterOptions = {
  ref?: string;
  disclaimer: string;
  disclaimerSecondary?: string;
};

/** Draw the HLI letter footer: optional ref, disclaimer(s) in small muted text. */
export function drawHliLetterFooter(
  page: PDFPage,
  font: PDFFont,
  options: HliLetterFooterOptions
): void {
  const { margin, contentWidth, disclaimerCharsPerLine } = PDF_LAYOUT;
  const fine = HLI_TYPOGRAPHY.fineSize;
  let y = 44;

  if (options.ref) {
    page.drawText(options.ref, {
      x: margin,
      y,
      size: fine,
      font,
      color: PDF_COLORS.muted,
    });
    y -= 12;
  }
  const lines = [options.disclaimer];
  if (options.disclaimerSecondary) lines.push(options.disclaimerSecondary);
  for (const text of lines) {
    for (const line of wrapText(text, disclaimerCharsPerLine)) {
      page.drawText(line, {
        x: margin,
        y,
        size: fine,
        font,
        color: PDF_COLORS.muted,
        maxWidth: contentWidth,
      });
      y -= 10;
    }
  }
}

/** Wrap text to max character width. Returns array of lines. */
export function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (current.length + w.length + 1 <= maxChars) {
      current += (current ? " " : "") + w;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Line height for body text (points). */
export function bodyLineHeight(): number {
  return HLI_TYPOGRAPHY.bodySize * HLI_TYPOGRAPHY.lineHeightBody + 2;
}

/** Space below section heading before body (points). */
const SECTION_HEADING_BOTTOM = 12;

/** Draw a section heading (bold, distinct); returns new y with spacing below. */
export function drawSectionHeading(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; font: PDFFont; fontBold: PDFFont }
): number {
  const { x, y, fontBold } = opts;
  page.drawText(text, {
    x,
    y,
    size: HLI_TYPOGRAPHY.headingSize,
    font: fontBold,
    color: PDF_COLORS.primary,
  });
  return (
    y -
    (HLI_TYPOGRAPHY.headingSize * HLI_TYPOGRAPHY.lineHeightHeading + 2) -
    SECTION_HEADING_BOTTOM
  );
}

/** Draw body paragraph(s); returns new y. Uses body line height and wrap. */
export function drawBodyParagraph(
  page: PDFPage,
  text: string,
  opts: {
    x: number;
    y: number;
    font: PDFFont;
    maxChars?: number;
    color?: RGB;
  }
): number {
  const { x, font } = opts;
  const maxChars = opts.maxChars ?? PDF_LAYOUT.bodyCharsPerLine;
  const color = opts.color ?? PDF_COLORS.body;
  const lh = bodyLineHeight();
  let y = opts.y;
  for (const line of wrapText(text, maxChars)) {
    page.drawText(line, { x, y, size: HLI_TYPOGRAPHY.bodySize, font, color });
    y -= lh;
  }
  return y;
}

/** Bullet list: gap between items (points) so items like "Free T4" stay clear. */
const BULLET_ITEM_GAP = 6;

/** Draw a bullet list; each item on one or more lines, no forced mid-term breaks. Returns new y. */
export function drawBulletList(
  page: PDFPage,
  items: string[],
  opts: { x: number; y: number; font: PDFFont; maxChars?: number }
): number {
  const { x, font } = opts;
  const lineWidth = opts.maxChars ?? PDF_LAYOUT.bodyCharsPerLine;
  const lh = bodyLineHeight();
  const bullet = "• ";
  let y = opts.y;
  for (const item of items) {
    const lines = wrapText(bullet + item.trim(), lineWidth);
    for (const line of lines) {
      page.drawText(line, {
        x,
        y,
        size: HLI_TYPOGRAPHY.bodySize,
        font,
        color: PDF_COLORS.body,
      });
      y -= lh;
    }
    y -= BULLET_ITEM_GAP;
  }
  return y + BULLET_ITEM_GAP; // don't double-gap after last item
}
