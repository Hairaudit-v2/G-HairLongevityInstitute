/**
 * HLI unified email system.
 * All outgoing emails use the same layout and tone.
 */

export * from "./types";
export {
  buildHliEmailHtml,
  buildHliEmailText,
  buildHliEmailHtmlFromPlainBody,
  getHliEmailFooterPlain,
} from "./hliEmailLayout";

export { buildAssessmentCompleteEmail, SUBJECT as SUBJECT_ASSESSMENT_COMPLETE } from "./templates/assessmentComplete";
export { buildGpLetterEmail, SUBJECT as SUBJECT_GP_LETTER } from "./templates/gpLetter";
export { buildReminderEmail, SUBJECT_CONTINUE } from "./templates/reminder";
export { buildFollowUpEmail, SUBJECT as SUBJECT_FOLLOW_UP } from "./templates/followUp";
export { buildWelcomeEmail, SUBJECT as SUBJECT_WELCOME } from "./templates/welcome";
export {
  buildMembershipCancelledEmail,
  buildMembershipStartedEmail,
  buildOneTimePurchaseEmail,
  buildTrichBookingFeeEmail,
  SUBJECT_MEMBERSHIP_CANCELLED,
  SUBJECT_MEMBERSHIP_STARTED,
  SUBJECT_ONE_TIME_PURCHASE,
  SUBJECT_TRICH_BOOKING_FEE,
} from "./templates/paymentTransactional";
