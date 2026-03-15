import type { CarePlanOutput } from "./carePlan";
import { REVIEW_OUTCOME } from "./reviewConstants";

const DAY_MS = 24 * 60 * 60 * 1000;
const BLOOD_REQUEST_OPEN_STATUSES = [
  "pending",
  "letter_requested",
  "letter_generated",
] as const;

export type FollowUpStatus =
  | "due"
  | "overdue"
  | "upcoming"
  | "complete"
  | "none";

export type FollowUpCadenceInput = {
  carePlan?: CarePlanOutput | null;
  reviewOutcome?: string | null;
  bloodRequest?: {
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    approved_at?: string | null;
  } | null;
  hasBloodResultUploadDocument?: boolean;
  hasStructuredMarkers?: boolean;
  hasNewerSubmittedIntake?: boolean;
  scalpPhotoFollowUpRecommended?: boolean;
  intakeCreatedAt?: string | null;
  lastReviewedAt?: string | null;
  patientVisibleReleasedAt?: string | null;
  now?: Date;
};

export type FollowUpCadenceOutput = {
  followUpStatus: FollowUpStatus;
  dueReason: string[];
  suggestedDueWindow: string | null;
  patientReminderText: string[];
  clinicianReminderText: string[];
  anchorDate: string | null;
  targetDate: string | null;
};

type TimedStatusConfig = {
  targetDays: number;
  dueLeadDays: number;
  overdueGraceDays: number;
};

function pushUnique(target: string[], value: string) {
  if (!value || target.includes(value)) return;
  target.push(value);
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function pickAnchorDate(
  ...values: Array<string | null | undefined>
): Date | null {
  for (const value of values) {
    const date = parseDate(value);
    if (date) return date;
  }
  return null;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function resolveTimedStatus(
  now: Date,
  anchorDate: Date | null,
  config: TimedStatusConfig
): { status: FollowUpStatus; targetDate: Date | null } {
  if (!anchorDate) {
    return { status: "upcoming", targetDate: null };
  }

  const targetDate = addDays(anchorDate, config.targetDays);
  const daysUntilTarget = Math.floor(
    (targetDate.getTime() - now.getTime()) / DAY_MS
  );

  if (daysUntilTarget < -config.overdueGraceDays) {
    return { status: "overdue", targetDate };
  }
  if (daysUntilTarget <= config.dueLeadDays) {
    return { status: "due", targetDate };
  }
  return { status: "upcoming", targetDate };
}

function buildWindowText(
  baseLabel: string,
  targetDate: Date | null
): string {
  if (!targetDate) return baseLabel;
  return `${baseLabel} Around ${formatDate(targetDate)}.`;
}

function buildCompleteCadence(
  dueReason: string[],
  patientReminderText: string[],
  clinicianReminderText: string[],
  anchorDate: Date | null
): FollowUpCadenceOutput {
  return {
    followUpStatus: "complete",
    dueReason,
    suggestedDueWindow: null,
    patientReminderText,
    clinicianReminderText,
    anchorDate: anchorDate?.toISOString() ?? null,
    targetDate: null,
  };
}

function buildNoneCadence(
  dueReason: string[],
  patientReminderText: string[],
  clinicianReminderText: string[]
): FollowUpCadenceOutput {
  return {
    followUpStatus: "none",
    dueReason,
    suggestedDueWindow: null,
    patientReminderText,
    clinicianReminderText,
    anchorDate: null,
    targetDate: null,
  };
}

function buildTimedCadence(params: {
  now: Date;
  anchorDate: Date | null;
  config: TimedStatusConfig;
  dueReason: string[];
  patientReminderText: string[];
  clinicianReminderText: string[];
  suggestedDueWindow: string;
}): FollowUpCadenceOutput {
  const resolved = resolveTimedStatus(params.now, params.anchorDate, params.config);
  return {
    followUpStatus: resolved.status,
    dueReason: params.dueReason,
    suggestedDueWindow: buildWindowText(
      params.suggestedDueWindow,
      resolved.targetDate
    ),
    patientReminderText: params.patientReminderText,
    clinicianReminderText: params.clinicianReminderText,
    anchorDate: params.anchorDate?.toISOString() ?? null,
    targetDate: resolved.targetDate?.toISOString() ?? null,
  };
}

export function buildFollowUpCadence(
  input: FollowUpCadenceInput
): FollowUpCadenceOutput {
  const now = input.now ?? new Date();
  const carePlan = input.carePlan ?? null;
  const reviewOutcome = input.reviewOutcome ?? null;
  const bloodRequest = input.bloodRequest ?? null;
  const hasBloodResultUploadDocument =
    input.hasBloodResultUploadDocument ?? false;
  const hasStructuredMarkers = input.hasStructuredMarkers ?? false;
  const hasNewerSubmittedIntake = input.hasNewerSubmittedIntake ?? false;
  const scalpPhotoFollowUpRecommended =
    input.scalpPhotoFollowUpRecommended ?? carePlan?.scalpPhotoFollowUpNeeded ?? false;

  const reviewAnchorDate = pickAnchorDate(
    input.patientVisibleReleasedAt,
    input.lastReviewedAt,
    bloodRequest?.updated_at,
    bloodRequest?.approved_at,
    input.intakeCreatedAt
  );
  const bloodRequestAnchorDate = pickAnchorDate(
    bloodRequest?.updated_at,
    bloodRequest?.approved_at,
    bloodRequest?.created_at,
    input.patientVisibleReleasedAt,
    input.lastReviewedAt,
    input.intakeCreatedAt
  );
  const bloodRequestStatus = bloodRequest?.status ?? null;
  const bloodRequestOpen =
    bloodRequestStatus != null &&
    BLOOD_REQUEST_OPEN_STATUSES.includes(
      bloodRequestStatus as (typeof BLOOD_REQUEST_OPEN_STATUSES)[number]
    );
  const bloodResultsAvailable =
    bloodRequestStatus === "results_uploaded" ||
    hasBloodResultUploadDocument ||
    hasStructuredMarkers;
  const reviewReleased =
    reviewOutcome != null ||
    input.patientVisibleReleasedAt != null ||
    input.lastReviewedAt != null;

  if (hasNewerSubmittedIntake) {
    return buildCompleteCadence(
      ["A newer submitted intake already exists, so this reminder cycle has been actioned."],
      ["You're already up to date with a newer follow-up intake."],
      ["A newer submitted intake exists for this profile, so this cadence cycle is complete."],
      reviewAnchorDate
    );
  }

  if (bloodRequestOpen && !bloodResultsAvailable) {
    return buildTimedCadence({
      now,
      anchorDate: bloodRequestAnchorDate,
      config: {
        targetDays: 28,
        dueLeadDays: 7,
        overdueGraceDays: 21,
      },
      dueReason: [
        "Recommended blood tests are still outstanding for this intake.",
      ],
      suggestedDueWindow:
        "Upload blood results once available, ideally within the next few weeks.",
      patientReminderText: [
        "When your blood results are ready, upload them in the portal so your clinician can review the next step.",
      ],
      clinicianReminderText: [
        "Blood request remains open without uploaded results; follow up if the patient may still need a reminder or GP support.",
      ],
    });
  }

  if (bloodResultsAvailable && !hasStructuredMarkers) {
    return buildTimedCadence({
      now,
      anchorDate: bloodRequestAnchorDate,
      config: {
        targetDays: 7,
        dueLeadDays: 7,
        overdueGraceDays: 14,
      },
      dueReason: [
        "Blood results appear to be available but structured review work is still pending.",
      ],
      suggestedDueWindow: "Clinician review of uploaded blood results is the next step.",
      patientReminderText: [
        "Your blood results are in. Your clinician will review them and update your summary.",
      ],
      clinicianReminderText: [
        "Uploaded blood results look ready for structured marker entry or final review.",
      ],
    });
  }

  const followUpRecommended =
    reviewOutcome === REVIEW_OUTCOME.FOLLOW_UP_SCHEDULED ||
    reviewOutcome === REVIEW_OUTCOME.REFERRAL_RECOMMENDED ||
    reviewOutcome === REVIEW_OUTCOME.BLOODS_RECOMMENDED ||
    scalpPhotoFollowUpRecommended ||
    !!carePlan?.followUpTimingSuggestion ||
    !!carePlan?.patientTimingSuggestion;

  if (followUpRecommended && reviewReleased) {
    const dueReason: string[] = [];
    const patientReminderText: string[] = [];
    const clinicianReminderText: string[] = [];

    let schedule: TimedStatusConfig = {
      targetDays: 180,
      dueLeadDays: 21,
      overdueGraceDays: 30,
    };
    let suggestedDueWindow =
      carePlan?.patientTimingSuggestion ??
      carePlan?.followUpTimingSuggestion ??
      "A follow-up review is suggested after an interval from this review.";

    if (reviewOutcome === REVIEW_OUTCOME.FOLLOW_UP_SCHEDULED) {
      schedule = { targetDays: 90, dueLeadDays: 14, overdueGraceDays: 30 };
      pushUnique(
        dueReason,
        "The review outcome set a planned follow-up pathway."
      );
      pushUnique(
        patientReminderText,
        "Your clinician has planned a follow-up review, so your next intake will be helpful once that interval comes around."
      );
      pushUnique(
        clinicianReminderText,
        "A planned follow-up outcome is set; keep this case visible when the interval is reached."
      );
      if (!carePlan?.patientTimingSuggestion && !carePlan?.followUpTimingSuggestion) {
        suggestedDueWindow = "A follow-up review is usually helpful at about 3 months.";
      }
    }

    if (reviewOutcome === REVIEW_OUTCOME.REFERRAL_RECOMMENDED) {
      schedule = { targetDays: 56, dueLeadDays: 14, overdueGraceDays: 28 };
      pushUnique(
        dueReason,
        "GP or specialist referral follow-up was recommended."
      );
      pushUnique(
        patientReminderText,
        "After your GP or specialist review, a follow-up intake can help your clinician see what changed next."
      );
      pushUnique(
        clinicianReminderText,
        "Referral follow-up was recommended; reassess once the patient has had time to act on that advice."
      );
      if (!carePlan?.patientTimingSuggestion && !carePlan?.followUpTimingSuggestion) {
        suggestedDueWindow =
          "A follow-up check-in is usually helpful after the patient has had time to act on the referral advice.";
      }
    }

    if (
      reviewOutcome === REVIEW_OUTCOME.BLOODS_RECOMMENDED &&
      bloodResultsAvailable
    ) {
      schedule = { targetDays: 84, dueLeadDays: 14, overdueGraceDays: 28 };
      pushUnique(
        dueReason,
        "Blood-test follow-up has been completed, so interval reassessment can now be timed."
      );
      pushUnique(
        patientReminderText,
        "Once you've had a little time on your plan, a follow-up intake can help show how things are progressing."
      );
      pushUnique(
        clinicianReminderText,
        "Blood-test loop appears complete; use interval follow-up to reassess progress from this review."
      );
    }

    if (scalpPhotoFollowUpRecommended) {
      schedule = { targetDays: 90, dueLeadDays: 14, overdueGraceDays: 30 };
      pushUnique(
        dueReason,
        "Updated scalp photos were suggested for follow-up tracking."
      );
      pushUnique(
        patientReminderText,
        "If you can, include updated scalp photos in your next follow-up intake so changes can be compared more clearly."
      );
      pushUnique(
        clinicianReminderText,
        "Updated scalp-photo comparison was suggested; keep that context attached to the next follow-up intake."
      );
      if (!carePlan?.patientTimingSuggestion && !carePlan?.followUpTimingSuggestion) {
        suggestedDueWindow =
          "A follow-up with updated scalp photos is usually helpful at about 3 months.";
      }
    }

    if (dueReason.length === 0) {
      pushUnique(
        dueReason,
        "The care plan suggests an interval follow-up review."
      );
    }
    if (patientReminderText.length === 0) {
      pushUnique(
        patientReminderText,
        "A follow-up intake later in your care journey can help your clinician check your progress."
      );
    }
    if (clinicianReminderText.length === 0) {
      pushUnique(
        clinicianReminderText,
        "Interval follow-up remains part of the suggested care cadence for this intake."
      );
    }

    return buildTimedCadence({
      now,
      anchorDate: reviewAnchorDate,
      config: schedule,
      dueReason,
      patientReminderText,
      clinicianReminderText,
      suggestedDueWindow,
    });
  }

  if (reviewReleased) {
    return buildCompleteCadence(
      ["No active follow-up reminder is currently outstanding for this intake."],
      ["You're up to date for now. When you're ready, you can still start a follow-up intake to check progress."],
      ["No active cadence trigger is currently outstanding for this intake."],
      reviewAnchorDate
    );
  }

  return buildNoneCadence(
    ["Follow-up timing will appear after the current review has been completed."],
    ["Your clinician is still working through this review. Reminder timing will appear here once the summary is ready."],
    ["No cadence is assigned yet because the review outcome has not been finalized."],
  );
}

export const generateFollowUpCadence = buildFollowUpCadence;
