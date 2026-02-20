// Standalone OCR test - no Next.js. Run: node scripts/ocr-pdf-standalone.mjs "path/to/file.pdf"
import { readFile } from "node:fs/promises";

const pdfPath = process.argv[2] || "c:\\Users\\thelo.EVOLVEDPCHOME\\OneDrive\\Desktop\\Investigations Edla, V.pdf";

console.log("1. Reading PDF...");
const buffer = Buffer.from(await readFile(pdfPath));
console.log("   Size:", buffer.length);

console.log("2. Converting PDF to images (pdf-to-img)...");
let images = [];
try {
  const { pdf } = await import("pdf-to-img");
  const document = await pdf(buffer, { scale: 2 });
  for await (const image of document) {
    images.push(Buffer.isBuffer(image) ? image : Buffer.from(image));
  }
  console.log("   Pages:", images.length, "| First image size:", images[0]?.length);
} catch (e) {
  console.error("   pdf-to-img ERROR:", e.message);
}

if (images.length > 0) {
  console.log("3. Running Tesseract on first page...");
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(images[0]);
    await worker.terminate();
    console.log("   Text length:", data?.text?.length);
    console.log("   Preview:", (data?.text || "").slice(0, 300));
  } catch (e) {
    console.error("   Tesseract ERROR:", e.message);
  }
}
