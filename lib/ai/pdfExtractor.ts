/**
 * PDF text extractor using pdf-parse with OCR fallback for scanned/image PDFs.
 * 1) Try native text extraction first (works for digital PDFs)
 * 2) If text is empty or minimal, render pages to images and run Tesseract OCR
 */
import type { DocumentExtractor } from "./providers";

const MIN_TEXT_LENGTH = 80; // Below this, assume scanned PDF and try OCR

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const buffer = Buffer.from(bytes);
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result?.text ?? "";
  } finally {
    await parser.destroy();
  }
}

async function extractPdfTextViaOcr(bytes: Uint8Array): Promise<string> {
  const { pdf } = await import("pdf-to-img");
  const { createWorker } = await import("tesseract.js");
  const buffer = Buffer.from(bytes);
  const texts: string[] = [];

  const document = await pdf(buffer, { scale: 2 });
  const worker = await createWorker("eng");

  try {
    for await (const image of document) {
      if (image && (image as Buffer).length > 0) {
        const imgBuffer = Buffer.isBuffer(image) ? image : Buffer.from(image as ArrayBuffer);
        const { data } = await worker.recognize(imgBuffer);
        if (data?.text?.trim()) {
          texts.push(data.text);
        }
      }
    }
  } finally {
    await worker.terminate();
  }

  return texts.join("\n\n");
}

export const pdfDocumentExtractor: DocumentExtractor = {
  async extractText({ bytes, mimeType, filename }) {
    const isPdf =
      mimeType === "application/pdf" ||
      mimeType === "application/x-pdf" ||
      (filename && filename.toLowerCase().endsWith(".pdf"));
    if (!isPdf) {
      return { text: "" };
    }
    try {
      let text = await extractPdfText(bytes);
      if (!text || text.trim().length < MIN_TEXT_LENGTH) {
        try {
          const ocrText = await extractPdfTextViaOcr(bytes);
          if (ocrText?.trim()) {
            text = ocrText;
          }
        } catch (ocrErr) {
          console.warn("PDF OCR fallback failed:", ocrErr);
        }
      }
      return { text: text || "" };
    } catch (e) {
      console.warn("PDF text extraction failed:", e);
      return { text: "" };
    }
  },
};
