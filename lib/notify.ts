/**
 * Patient notification stub for referral workflow.
 * TODO: Implement email/SMS when notification service is integrated.
 */

export type ReferralNotificationStatus =
  | "pending"
  | "assigned"
  | "in_review"
  | "needs_more_info"
  | "approved"
  | "declined"
  | "completed";

export async function notifyPatientReferralUpdate(
  intakeId: string,
  status: ReferralNotificationStatus
): Promise<void> {
  // Stub: log only. No email/SMS sent.
  console.info(`[notify] Patient referral update: intake=${intakeId} status=${status}`);
  // TODO: Look up patient email from hli_intakes, send via email provider
  // TODO: For declined/needs_more_info: include note summary
  // TODO: For approved: include next steps (no dosing/prescription details)
}
