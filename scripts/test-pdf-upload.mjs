// Run: node scripts/test-pdf-upload.mjs [path/to/file.pdf]
// Requires dev server running: npm run dev
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pdfPath = process.argv[2] || "c:\\Users\\thelo.EVOLVEDPCHOME\\OneDrive\\Desktop\\Investigations Edla, V.pdf";

const bytes = await readFile(pdfPath);
const form = new FormData();
form.append("file", new Blob([bytes], { type: "application/pdf" }), "Investigations Edla, V.pdf");

const port = process.env.PORT || 3000;
const res = await fetch(`http://localhost:${port}/api/dev/testPdfExtract`, { method: "POST", body: form });
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
