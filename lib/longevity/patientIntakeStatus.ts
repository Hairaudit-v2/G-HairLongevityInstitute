/**
 * Patient-facing intake lifecycle status (hli_longevity_intakes.status).
 * Maps internal status to clear, non-technical labels for the portal and bridge.
 * review_status remains internal/operational; this is for patient display only.
 */

export const INTAKE_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  IN_REVIEW: "in_review",
  COMPLETE: "complete",
} as const;

export type IntakeStatus = (typeof INTAKE_STATUS)[keyof typeof INTAKE_STATUS];

const PATIENT_LABELS: Record<string, string> = {
  [INTAKE_STATUS.DRAFT]: "Draft",
  [INTAKE_STATUS.SUBMITTED]: "Submitted",
  [INTAKE_STATUS.IN_REVIEW]: "In review",
  [INTAKE_STATUS.COMPLETE]: "Review completed",
};

/**
 * Returns a patient-friendly label for intake status.
 * Falls back to a sanitized version of the raw value if unknown.
 */
export function getPatientIntakeStatusLabel(status: string | null | undefined): string {
  if (status == null || status === "") return "—";
  return PATIENT_LABELS[status] ?? status.replace(/_/g, " ");
}
