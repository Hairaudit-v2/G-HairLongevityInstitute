/**
 * Longevity document type constants for Phase 3 uploads and storage.
 * Use these when writing to hli_longevity_documents.doc_type so Phase 3 can plug in cleanly.
 * DB constraint may need to be extended to allow these values (additive migration in Phase 3).
 */

export const LONGEVITY_DOC_TYPE = {
  BLOOD_TEST_UPLOAD: "blood_test_upload",
  SCALP_PHOTO: "scalp_photo",
  MEDICAL_LETTER: "medical_letter",
  OTHER: "other",
} as const;

export type LongevityDocType =
  (typeof LONGEVITY_DOC_TYPE)[keyof typeof LONGEVITY_DOC_TYPE];

/** All document types for validation or dropdowns. */
export const LONGEVITY_DOC_TYPES: LongevityDocType[] = [
  LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD,
  LONGEVITY_DOC_TYPE.SCALP_PHOTO,
  LONGEVITY_DOC_TYPE.MEDICAL_LETTER,
  LONGEVITY_DOC_TYPE.OTHER,
];
