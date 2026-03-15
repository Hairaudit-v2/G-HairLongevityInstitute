/**
 * Phase E: GP support letter PDF generator for blood requests.
 * Support letter only; not a pathology order. Final test selection is at GP's discretion.
 */

import { PDFDocument, StandardFonts } from "pdf-lib";

export type GpLetterInput = {
  patientName: string;
  generationDate: string;
  reason: string;
  recommendedTests: string[];
};

const DISCLAIMER =
  "This letter is for information and support only. Final pathology selection and any referral for testing are at the discretion of the patient's GP.";

/**
 * Generate a GP support letter PDF. Returns PDF bytes (no storage).
 */
export async function generateGpSupportLetterPdf(
  input: GpLetterInput
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  let currentPage = doc.addPage([595, 842]);
  const margin = 50;
  const lineHeight = 14;
  let y = 802;

  const draw = (text: string, size: number = 11, bold = false) => {
    const f = bold ? fontBold : font;
    const lines = wrapText(text, 75);
    for (const line of lines) {
      if (y < margin + lineHeight) {
        currentPage = doc.addPage([595, 842]);
        y = 802;
      }
      currentPage.drawText(line, { x: margin, y, size, font: f });
      y -= lineHeight;
    }
  };

  function wrapText(text: string, maxChars: number): string[] {
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

  currentPage.drawText("GP Support Letter – Suggested Blood Tests", {
    x: margin,
    y,
    size: 16,
    font: fontBold,
  });
  y -= lineHeight * 2;

  currentPage.drawText(`Patient: ${input.patientName}`, { x: margin, y, size: 11, font });
  y -= lineHeight;
  currentPage.drawText(`Date: ${input.generationDate}`, { x: margin, y, size: 11, font });
  y -= lineHeight * 2;

  currentPage.drawText(
    "The Hair Longevity Institute has assessed this patient and suggests the following blood tests may be helpful in the context of their hair and scalp assessment. This letter is for your support in considering pathology requests.",
    { x: margin, y, size: 11, font }
  );
  y -= lineHeight * 3;

  currentPage.drawText("Reason for suggested testing:", {
    x: margin,
    y,
    size: 11,
    font: fontBold,
  });
  y -= lineHeight;
  draw(input.reason);
  y -= lineHeight;

  currentPage.drawText("Suggested tests (at your discretion):", {
    x: margin,
    y,
    size: 11,
    font: fontBold,
  });
  y -= lineHeight;
  const testsText =
    input.recommendedTests.length > 0
      ? input.recommendedTests.map((t) => t.replace(/_/g, " ")).join(", ")
      : "As clinically appropriate.";
  draw(testsText);
  y -= lineHeight * 2;

  currentPage.drawText("Disclaimer:", { x: margin, y, size: 11, font: fontBold });
  y -= lineHeight;
  draw(DISCLAIMER, 10);
  y -= lineHeight * 2;

  currentPage.drawText(
    "This is not a pathology order. The GP retains full clinical responsibility for any tests requested.",
    { x: margin, y, size: 10, font }
  );

  return doc.save();
}
