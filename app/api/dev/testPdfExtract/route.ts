/**
 * Dev route to test PDF extraction. POST a PDF file to debug extraction.
 * curl -X POST -F "file=@/path/to/file.pdf" http://localhost:3000/api/dev/testPdfExtract
 */
import { NextResponse } from "next/server";
import { extractBloodMarkers } from "@/lib/ai/extractBlood";
import { pdfDocumentExtractor } from "@/lib/ai/pdfExtractor";

export const dynamic = "force-dynamic";

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
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
        if (data?.text?.trim()) texts.push(data.text);
      }
    }
  } finally {
    await worker.terminate();
  }
  return texts.join("\n\n");
}

export async function POST(req: Request) {
  if (isProd()) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: "No file. POST with field 'file'." }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const mimeType = file.type || "application/pdf";
    const filename = file.name || "test.pdf";

    const result: Record<string, unknown> = { filename, size: bytes.length, mimeType };

    // 1) Direct pdf extractor (text only)
    try {
      const { text } = await pdfDocumentExtractor.extractText({ bytes, mimeType, filename });
      result.rawTextLength = text.length;
      result.rawTextPreview = text.slice(0, 1200);
      result.rawTextTooShortForOcr = text.trim().length < 80;
    } catch (e) {
      result.pdfExtractError = e instanceof Error ? e.message : String(e);
    }

    // 2) Explicit OCR test (if native text was empty)
    if ((result.rawTextLength as number) === 0) {
      try {
        const ocrText = await extractPdfTextViaOcr(bytes);
        result.ocrTextLength = ocrText.length;
        result.ocrTextPreview = ocrText.slice(0, 1200);
      } catch (e) {
        result.ocrError = e instanceof Error ? e.message : String(e);
      }
    }

    // 3) Full blood marker extraction
    try {
      const bloodResult = await extractBloodMarkers({
        files: [{ bytes, mimeType, filename }],
      });
      result.markersCount = bloodResult.markers.length;
      result.markers = bloodResult.markers;
    } catch (e) {
      result.bloodExtractError = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
