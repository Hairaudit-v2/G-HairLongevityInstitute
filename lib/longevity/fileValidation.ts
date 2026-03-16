/**
 * Longevity document upload validation: MIME, extension, size, filename sanitization.
 * Reject executables and unsafe types.
 */

import type { LongevityDocType } from "./documentTypes";
import {
  LONGEVITY_DOC_TYPE,
} from "./documentTypes";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Allowed MIME types per document type. */
const ALLOWED_MIMES: Record<LongevityDocType, string[]> = {
  [LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD]: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ],
  [LONGEVITY_DOC_TYPE.SCALP_PHOTO]: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],
  [LONGEVITY_DOC_TYPE.MEDICAL_LETTER]: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ],
  [LONGEVITY_DOC_TYPE.PRESCRIPTIONS]: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ],
  [LONGEVITY_DOC_TYPE.BLOOD_REQUEST_LETTER]: ["application/pdf"],
  [LONGEVITY_DOC_TYPE.OTHER]: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],
};

/** Allowed file extensions per document type (lowercase). */
const ALLOWED_EXTENSIONS: Record<LongevityDocType, string[]> = {
  [LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD]: ["pdf", "jpg", "jpeg", "png"],
  [LONGEVITY_DOC_TYPE.SCALP_PHOTO]: ["jpg", "jpeg", "png", "webp"],
  [LONGEVITY_DOC_TYPE.MEDICAL_LETTER]: ["pdf", "jpg", "jpeg", "png"],
  [LONGEVITY_DOC_TYPE.PRESCRIPTIONS]: ["pdf", "jpg", "jpeg", "png"],
  [LONGEVITY_DOC_TYPE.BLOOD_REQUEST_LETTER]: ["pdf"],
  [LONGEVITY_DOC_TYPE.OTHER]: ["pdf", "jpg", "jpeg", "png", "webp"],
};

/** Extensions we always reject (executables, scripts, etc.). */
const UNSAFE_EXTENSIONS = new Set([
  "exe", "bat", "cmd", "com", "msi", "scr", "vbs", "js", "jar", "wsf",
  "sh", "bash", "ps1", "php", "phtml", "asp", "aspx", "jsp", "cgi",
  "dll", "so", "dylib",
]);

export type ValidationResult =
  | { ok: true; sanitizedFilename: string; mimeType: string; sizeBytes: number }
  | { ok: false; error: string };

export function validateLongevityUpload(
  docType: LongevityDocType,
  file: { name: string; type: string; size: number }
): ValidationResult {
  const mimes = ALLOWED_MIMES[docType];
  const exts = ALLOWED_EXTENSIONS[docType];

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (UNSAFE_EXTENSIONS.has(ext)) {
    return { ok: false, error: "This file type is not allowed for security reasons." };
  }
  if (!exts.includes(ext)) {
    return {
      ok: false,
      error: `Allowed formats for this document type: ${exts.join(", ")}. Your file has extension "${ext}".`,
    };
  }

  const mime = (file.type || "").toLowerCase().trim();
  const mimeOk = mimes.some((m) => m === mime || m === mime.replace(/;.*$/, ""));
  if (!mimeOk) {
    return {
      ok: false,
      error: `Allowed file types for this document: PDF or images (JPEG, PNG, etc.). Detected: ${file.type || "unknown"}.`,
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      ok: false,
      error: `File size must be 10 MB or less. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
    };
  }
  if (file.size <= 0) {
    return { ok: false, error: "File is empty." };
  }

  const sanitizedFilename = sanitizeFilename(file.name, ext);
  const normalizedMime =
    file.type === "image/jpg" ? "image/jpeg" : (file.type || "application/octet-stream");

  return {
    ok: true,
    sanitizedFilename,
    mimeType: normalizedMime,
    sizeBytes: file.size,
  };
}

function sanitizeFilename(original: string, ext: string): string {
  const base = original
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 100);
  const safe = base || "file";
  return `${safe}.${ext.toLowerCase()}`;
}

export { MAX_SIZE_BYTES };
