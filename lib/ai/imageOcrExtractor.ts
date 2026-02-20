/**
 * OCR extractor for image files (JPEG, PNG, etc.).
 * Used when patients upload photos of lab reports instead of PDFs.
 */
import type { DocumentExtractor } from "./providers";

async function ocrImage(bytes: Uint8Array): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const buffer = Buffer.from(bytes);
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    return data?.text ?? "";
  } finally {
    await worker.terminate();
  }
}

export const imageOcrExtractor: DocumentExtractor = {
  async extractText({ bytes, mimeType, filename }) {
    const isImage =
      mimeType?.startsWith("image/") ||
      (filename && /\.(jpg|jpeg|png|bmp|webp|gif)$/i.test(filename));
    if (!isImage) {
      return { text: "" };
    }
    try {
      const text = await ocrImage(bytes);
      return { text: text || "" };
    } catch (e) {
      console.warn("Image OCR failed:", e);
      return { text: "" };
    }
  },
};
