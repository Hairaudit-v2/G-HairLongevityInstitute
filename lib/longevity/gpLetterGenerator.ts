/**
 * Phase E: GP support letter PDF — premium branded clinical letter.
 * Support letter only; not a pathology order. All investigations at GP discretion.
 * Uses shared HLI PDF branding (header, footer, section/body helpers).
 */

import { PDFDocument, StandardFonts } from "pdf-lib";
import { formatLetterDate, HLI_TYPOGRAPHY } from "@/lib/hliBranding";
import {
  drawHliLetterHeader,
  drawHliLetterFooter,
  drawSectionHeading,
  drawBodyParagraph,
  drawBulletList,
  bodyLineHeight,
  estimateParagraphHeight,
  estimateBulletListHeight,
  estimateSectionHeadingHeight,
  ensureLetterSpace,
  wrapText,
  PDF_COLORS,
  PDF_LAYOUT,
} from "./pdfBranding";

export type GpLetterInput = {
  patientName: string;
  generationDate: string;
  reason: string;
  recommendedTests: string[];
};

// ——— Copy (premium clinical tone) ———

const DOCUMENT_TITLE = "GP SUPPORT LETTER — SUGGESTED INVESTIGATIONS";

const INTRO =
  "To the Treating General Practitioner,\n\n" +
  "Thank you for your continued care of this patient.\n\n" +
  "Following a recent clinical review conducted through Hair Longevity Institute™, we have identified several factors that may be contributing to the patient's current hair and scalp presentation. As part of a comprehensive assessment, we respectfully suggest consideration of the following investigations to help identify any underlying or contributory systemic influences.";

const CLINICAL_CONSIDERATIONS_INTRO =
  "Based on our findings, further evaluation of the following may be clinically relevant:";

const SUGGESTED_INVESTIGATIONS_INTRO =
  "At your clinical discretion, the following tests may be considered:";

const CLINICAL_NOTE =
  "These recommendations are provided to support a collaborative and comprehensive approach to patient care. All investigations, interpretation of results, and subsequent management remain entirely at your professional discretion.";

const DISCLAIMER_HEADING = "Disclaimer";

const DISCLAIMER_BODY =
  "This document is provided for clinical support purposes only and does not constitute a formal pathology request. All medical decisions and investigations should be determined by the treating General Practitioner.";

const SIGN_OFF_LINE_1 = "Kind regards,";
const SIGN_OFF_LINE_2 = "Hair Longevity Institute™ Clinical Team";
const SIGN_OFF_LINE_3 = "Hair Longevity Institute™";

/** Format test code to readable label (e.g. TSH, Ferritin, Free T4). */
function formatTestLabel(code: string): string {
  return code
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Turn reason text into bullet items (sentences or short clauses). */
function reasonToBulletItems(reason: string): string[] {
  const t = reason.trim();
  if (!t) return ["As part of the patient's hair and scalp assessment."];
  const sentences = t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length > 0 ? sentences : [t];
}

/**
 * Generate a GP support letter PDF. Returns PDF bytes (no storage).
 */
export async function generateGpSupportLetterPdf(
  input: GpLetterInput
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const letterFonts = { regular: font, bold: fontBold };
  let page = doc.addPage([PDF_LAYOUT.pageWidth, PDF_LAYOUT.pageHeight]);
  const pages = [page];
  const margin = PDF_LAYOUT.margin;
  const lh = bodyLineHeight();

  let y = await drawHliLetterHeader(doc, page, letterFonts);

  async function ensureSpace(requiredHeight: number): Promise<void> {
    const next = await ensureLetterSpace(doc, page, y, letterFonts, requiredHeight);
    if (next.page !== page) {
      page = next.page;
      pages.push(page);
    }
    y = next.y;
  }

  const formattedDate = formatLetterDate(input.generationDate);
  const contentWidth = PDF_LAYOUT.contentWidth;
  const titleSize = 16;
  const titleLineH = titleSize * HLI_TYPOGRAPHY.lineHeightHeading + 2;

  // Document title — larger, bold; spacing below
  page.drawText(DOCUMENT_TITLE, {
    x: margin,
    y,
    size: titleSize,
    font: fontBold,
    color: PDF_COLORS.primary,
  });
  y -= titleLineH + 10;

  // Date — right-aligned on its own line; then spacing
  const dateSize = HLI_TYPOGRAPHY.smallSize;
  const dateWidth = font.widthOfTextAtSize(formattedDate, dateSize);
  page.drawText(formattedDate, {
    x: margin + contentWidth - dateWidth,
    y,
    size: dateSize,
    font,
    color: PDF_COLORS.muted,
  });
  y -= dateSize * 1.4 + 2 + HLI_TYPOGRAPHY.sectionGap;

  // Patient block — two lines only: Patient: [Name], Date: [Date]
  await ensureSpace(lh * 2 + HLI_TYPOGRAPHY.sectionGap);
  page.drawText(`Patient: ${input.patientName}`, {
    x: margin,
    y,
    size: HLI_TYPOGRAPHY.bodySize,
    font,
    color: PDF_COLORS.body,
  });
  y -= lh;
  page.drawText(`Date: ${formattedDate}`, {
    x: margin,
    y,
    size: HLI_TYPOGRAPHY.bodySize,
    font,
    color: PDF_COLORS.body,
  });
  y -= lh + HLI_TYPOGRAPHY.sectionGap;

  // Intro (To the Treating GP + thank you + context)
  const introParagraphs = INTRO.split(/\n\n+/);
  const introHeight =
    introParagraphs.reduce((sum, para) => {
      return sum + estimateParagraphHeight(para) + HLI_TYPOGRAPHY.blockGap;
    }, 0) + HLI_TYPOGRAPHY.sectionGap;
  await ensureSpace(introHeight);
  for (const para of introParagraphs) {
    y = drawBodyParagraph(page, para, { x: margin, y, font });
    y -= HLI_TYPOGRAPHY.blockGap;
  }
  y -= HLI_TYPOGRAPHY.sectionGap;

  // Clinical Considerations
  const considerationItems = reasonToBulletItems(input.reason);
  const clinicalConsiderationsHeight =
    estimateSectionHeadingHeight() +
    estimateParagraphHeight(CLINICAL_CONSIDERATIONS_INTRO) +
    HLI_TYPOGRAPHY.blockGap +
    estimateBulletListHeight(considerationItems) +
    HLI_TYPOGRAPHY.sectionGap;
  await ensureSpace(clinicalConsiderationsHeight);
  y = drawSectionHeading(page, "Clinical Considerations", {
    x: margin,
    y,
    font,
    fontBold,
  });
  y = drawBodyParagraph(page, CLINICAL_CONSIDERATIONS_INTRO, {
    x: margin,
    y,
    font,
  });
  y -= HLI_TYPOGRAPHY.blockGap;
  y = drawBulletList(page, considerationItems, { x: margin, y, font });
  y -= HLI_TYPOGRAPHY.sectionGap;

  // Suggested Investigations
  const testItems =
    input.recommendedTests.length > 0
      ? input.recommendedTests.map(formatTestLabel)
      : ["As clinically appropriate."];
  const suggestedInvestigationsHeight =
    estimateSectionHeadingHeight() +
    estimateParagraphHeight(SUGGESTED_INVESTIGATIONS_INTRO) +
    HLI_TYPOGRAPHY.blockGap +
    estimateBulletListHeight(testItems) +
    HLI_TYPOGRAPHY.sectionGap;
  await ensureSpace(suggestedInvestigationsHeight);
  y = drawSectionHeading(page, "Suggested Investigations", {
    x: margin,
    y,
    font,
    fontBold,
  });
  y = drawBodyParagraph(page, SUGGESTED_INVESTIGATIONS_INTRO, {
    x: margin,
    y,
    font,
  });
  y -= HLI_TYPOGRAPHY.blockGap;
  y = drawBulletList(page, testItems, { x: margin, y, font });
  y -= HLI_TYPOGRAPHY.sectionGap;

  // Clinical Note
  const clinicalNoteHeight =
    estimateSectionHeadingHeight() +
    estimateParagraphHeight(CLINICAL_NOTE) +
    HLI_TYPOGRAPHY.sectionGap;
  await ensureSpace(clinicalNoteHeight);
  y = drawSectionHeading(page, "Clinical Note", {
    x: margin,
    y,
    font,
    fontBold,
  });
  y = drawBodyParagraph(page, CLINICAL_NOTE, { x: margin, y, font });
  y -= HLI_TYPOGRAPHY.sectionGap;

  // Disclaimer — divider above, spacing, smaller lighter text
  const disclaimerSize = 8;
  const disclaimerLh = disclaimerSize * 1.4 + 2;
  const inlineDisclaimerHeight =
    18 +
    16 +
    (HLI_TYPOGRAPHY.smallSize * 1.3 + 2) +
    wrapText(DISCLAIMER_BODY, PDF_LAYOUT.disclaimerCharsPerLine).length * disclaimerLh +
    HLI_TYPOGRAPHY.sectionGap;
  await ensureSpace(inlineDisclaimerHeight);
  y -= 18;
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + contentWidth, y },
    thickness: 0.5,
    color: PDF_COLORS.divider,
  });
  y -= 16;
  page.drawText(DISCLAIMER_HEADING, {
    x: margin,
    y,
    size: HLI_TYPOGRAPHY.smallSize,
    font: fontBold,
    color: PDF_COLORS.muted,
  });
  y -= HLI_TYPOGRAPHY.smallSize * 1.3 + 2;
  for (const line of wrapText(DISCLAIMER_BODY, PDF_LAYOUT.disclaimerCharsPerLine)) {
    page.drawText(line, {
      x: margin,
      y,
      size: disclaimerSize,
      font,
      color: PDF_COLORS.muted,
    });
    y -= disclaimerLh;
  }
  y -= HLI_TYPOGRAPHY.sectionGap;

  // Sign-off
  const signOffHeight = lh * 3 + 14 + HLI_TYPOGRAPHY.sectionGap;
  await ensureSpace(signOffHeight);
  page.drawText(SIGN_OFF_LINE_1, {
    x: margin,
    y,
    size: HLI_TYPOGRAPHY.bodySize,
    font,
    color: PDF_COLORS.body,
  });
  y -= lh + 14;
  page.drawText(SIGN_OFF_LINE_2, {
    x: margin,
    y,
    size: HLI_TYPOGRAPHY.bodySize,
    font: fontBold,
    color: PDF_COLORS.primary,
  });
  y -= lh;
  page.drawText(SIGN_OFF_LINE_3, {
    x: margin,
    y,
    size: HLI_TYPOGRAPHY.bodySize,
    font,
    color: PDF_COLORS.muted,
  });
  y -= lh + HLI_TYPOGRAPHY.sectionGap;

  // Footer (same disclaimer again in footer area for consistency)
  for (const footerPage of pages) {
    drawHliLetterFooter(footerPage, font, {
      disclaimer: DISCLAIMER_BODY,
    });
  }

  return doc.save();
}
