/**
 * Longevity document type constants for uploads and storage.
 * Recommended categories for clinicians/patients: blood_tests, scalp_photos, medical_reports, prescriptions, other.
 * DB stores these values; legacy "upload" is treated as "other" for display (backward compatibility).
 */

export const LONGEVITY_DOC_TYPE = {
  BLOOD_TEST_UPLOAD: "blood_test_upload",
  SCALP_PHOTO: "scalp_photo",
  MEDICAL_LETTER: "medical_letter",
  PRESCRIPTIONS: "prescriptions",
  BLOOD_REQUEST_LETTER: "blood_request_letter",
  OTHER: "other",
} as const;

export type LongevityDocType =
  (typeof LONGEVITY_DOC_TYPE)[keyof typeof LONGEVITY_DOC_TYPE];

/** Patient-uploadable doc types (excludes system-generated blood_request_letter). */
export const LONGEVITY_DOC_TYPES_UPLOADABLE: LongevityDocType[] = [
  LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD,
  LONGEVITY_DOC_TYPE.SCALP_PHOTO,
  LONGEVITY_DOC_TYPE.MEDICAL_LETTER,
  LONGEVITY_DOC_TYPE.PRESCRIPTIONS,
  LONGEVITY_DOC_TYPE.OTHER,
];

/** All document types for validation or dropdowns. */
export const LONGEVITY_DOC_TYPES: LongevityDocType[] = [
  ...LONGEVITY_DOC_TYPES_UPLOADABLE,
  LONGEVITY_DOC_TYPE.BLOOD_REQUEST_LETTER,
];

/** Patient- and clinician-facing labels. Legacy "upload" maps to "Other". */
const DOC_TYPE_LABELS: Record<string, string> = {
  [LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD]: "Blood tests",
  [LONGEVITY_DOC_TYPE.SCALP_PHOTO]: "Scalp photos",
  [LONGEVITY_DOC_TYPE.MEDICAL_LETTER]: "Medical reports",
  [LONGEVITY_DOC_TYPE.PRESCRIPTIONS]: "Prescriptions",
  [LONGEVITY_DOC_TYPE.OTHER]: "Other",
  [LONGEVITY_DOC_TYPE.BLOOD_REQUEST_LETTER]: "Blood request letter",
  upload: "Other", // legacy; backward compatibility
};

export function getPatientDocTypeLabel(docType: string | null | undefined): string {
  if (docType == null || docType === "") return "Other";
  return DOC_TYPE_LABELS[docType] ?? docType.replace(/_/g, " ");
}
