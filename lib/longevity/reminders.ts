import type { SupabaseClient } from "@supabase/supabase-js";
import { auditLongevityEvent } from "./documents";
import { REVIEW_OUTCOME } from "./reviewConstants";
import {
  getLongevityWorkflowSnapshotForIntake,
  type LongevityWorkflowSnapshot,
} from "./workflowSnapshot";

export const LONGEVITY_REMINDER_TYPE = {
  FOLLOW_UP_DUE: "follow_up_due",
  FOLLOW_UP_OVERDUE: "follow_up_overdue",
  BLOOD_RESULTS_PENDING: "blood_results_pending",
  SCALP_PHOTOS_RECOMMENDED: "scalp_photos_recommended",
  CLINICIAN_FOLLOW_UP_RECOMMENDED: "clinician_follow_up_recommended",
} as const;

export type LongevityReminderType =
  (typeof LONGEVITY_REMINDER_TYPE)[keyof typeof LONGEVITY_REMINDER_TYPE];

export type LongevityReminderRow = {
  id: string;
  profile_id: string;
  intake_id: string;
  blood_request_id: string | null;
  reminder_type: LongevityReminderType;
  delivery_channel: "email";
  status: "staged" | "sent" | "cancelled" | "failed";
  dedupe_key: string;
  recipient_email: string;
  subject: string;
  body_text: string;
  follow_up_status:
    | "due"
    | "overdue"
    | "upcoming"
    | "complete"
    | "none"
    | null;
  scheduled_for: string;
  sent_at: string | null;
  cancelled_at: string | null;
  last_error: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type ReminderCandidate = {
  profile_id: string;
  intake_id: string;
  blood_request_id: string | null;
  reminder_type: LongevityReminderType;
  delivery_channel: "email";
  dedupe_key: string;
  recipient_email: string;
  subject: string;
  body_text: string;
  follow_up_status:
    | "due"
    | "overdue"
    | "upcoming"
    | "complete"
    | "none"
    | null;
  scheduled_for: string;
  payload: Record<string, unknown>;
};

export type LongevityReminderStageResult = {
  intakeId: string;
  profileId: string;
  staged: number;
  cancelled: number;
  activeKeys: string[];
};

function pushUnique(target: string[], value: string | null | undefined) {
  if (!value || target.includes(value)) return;
  target.push(value);
}

function dedupeLines(values: Array<string | null | undefined>): string[] {
  const result: string[] = [];
  for (const value of values) {
    pushUnique(result, value);
  }
  return result;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function composeEmailBody(params: {
  recipientName?: string | null;
  intro: string;
  lines: string[];
}): string {
  const parts: string[] = [];
  parts.push(
    params.recipientName?.trim()
      ? `Hi ${params.recipientName.trim()},`
      : "Hi,"
  );
  parts.push("");
  parts.push(params.intro);
  for (const line of params.lines) {
    parts.push("");
    parts.push(line);
  }
  parts.push("");
  parts.push(
    "You can log in to your Hair Longevity Institute portal when you're ready to take the next step."
  );
  parts.push("");
  parts.push("Hair Longevity Institute");
  return parts.join("\n");
}

function isPatientVisible(snapshot: LongevityWorkflowSnapshot): boolean {
  return !!snapshot.patientVisibleReleasedAt;
}

function buildReminderCandidates(params: {
  snapshot: LongevityWorkflowSnapshot;
  recipientEmail: string;
  recipientName?: string | null;
  reviewOutcome: string | null;
}): ReminderCandidate[] {
  const { snapshot, recipientEmail, recipientName, reviewOutcome } = params;
  const candidates: ReminderCandidate[] = [];
  const cadence = snapshot.followUpCadence;
  const targetAnchor = cadence.targetDate ?? cadence.anchorDate ?? "na";
  const dueWindow = cadence.suggestedDueWindow;
  const targetDateLabel = formatDate(cadence.targetDate);
  const bloodRequest = snapshot.bloodRequest;
  const bloodResultsPending =
    bloodRequest?.status === "letter_generated" &&
    !snapshot.hasBloodResultUploadDocument &&
    !snapshot.hasStructuredMarkers;
  const followUpTimingRecommended =
    reviewOutcome === REVIEW_OUTCOME.FOLLOW_UP_SCHEDULED ||
    reviewOutcome === REVIEW_OUTCOME.BLOODS_RECOMMENDED ||
    reviewOutcome === REVIEW_OUTCOME.REFERRAL_RECOMMENDED ||
    snapshot.carePlan.followUpTimingSuggestion != null ||
    snapshot.carePlan.patientTimingSuggestion != null;

  if (
    isPatientVisible(snapshot) &&
    cadence.followUpStatus === "due"
  ) {
    const lines = dedupeLines([
      dueWindow,
      ...cadence.patientReminderText,
      targetDateLabel
        ? `A follow-up around ${targetDateLabel} would be a sensible time to check progress.`
        : null,
    ]);
    candidates.push({
      profile_id: snapshot.profileId,
      intake_id: snapshot.intakeId,
      blood_request_id: bloodRequest?.id ?? null,
      reminder_type: LONGEVITY_REMINDER_TYPE.FOLLOW_UP_DUE,
      delivery_channel: "email",
      dedupe_key: `${snapshot.intakeId}:follow_up_due:${targetAnchor}`,
      recipient_email: recipientEmail,
      subject: "Hair Longevity Institute: your follow-up review is due",
      body_text: composeEmailBody({
        recipientName,
        intro:
          "This is a gentle reminder that your next hair longevity follow-up now looks due.",
        lines,
      }),
      follow_up_status: cadence.followUpStatus,
      scheduled_for: new Date().toISOString(),
      payload: {
        due_reason: cadence.dueReason,
        suggested_due_window: cadence.suggestedDueWindow,
        patient_reminder_text: cadence.patientReminderText,
      },
    });
  }

  if (
    isPatientVisible(snapshot) &&
    cadence.followUpStatus === "overdue"
  ) {
    const lines = dedupeLines([
      dueWindow,
      ...cadence.patientReminderText,
      "If you're ready, starting a follow-up intake now can help your clinician reassess where things stand.",
    ]);
    candidates.push({
      profile_id: snapshot.profileId,
      intake_id: snapshot.intakeId,
      blood_request_id: bloodRequest?.id ?? null,
      reminder_type: LONGEVITY_REMINDER_TYPE.FOLLOW_UP_OVERDUE,
      delivery_channel: "email",
      dedupe_key: `${snapshot.intakeId}:follow_up_overdue:${targetAnchor}`,
      recipient_email: recipientEmail,
      subject:
        "Hair Longevity Institute: a follow-up review may now be helpful",
      body_text: composeEmailBody({
        recipientName,
        intro:
          "Your care plan suggests that a follow-up review may now be overdue, so this is a gentle check-in.",
        lines,
      }),
      follow_up_status: cadence.followUpStatus,
      scheduled_for: new Date().toISOString(),
      payload: {
        due_reason: cadence.dueReason,
        suggested_due_window: cadence.suggestedDueWindow,
        patient_reminder_text: cadence.patientReminderText,
      },
    });
  }

  if (
    isPatientVisible(snapshot) &&
    bloodResultsPending &&
    (cadence.followUpStatus === "due" || cadence.followUpStatus === "overdue")
  ) {
    const lines = dedupeLines([
      dueWindow,
      "When your blood test results are available, upload them in the portal so your clinician can review them.",
      ...cadence.patientReminderText,
    ]);
    candidates.push({
      profile_id: snapshot.profileId,
      intake_id: snapshot.intakeId,
      blood_request_id: bloodRequest?.id ?? null,
      reminder_type: LONGEVITY_REMINDER_TYPE.BLOOD_RESULTS_PENDING,
      delivery_channel: "email",
      dedupe_key: `${snapshot.intakeId}:blood_results_pending:${bloodRequest?.id ?? targetAnchor}:${cadence.followUpStatus}`,
      recipient_email: recipientEmail,
      subject:
        "Hair Longevity Institute: upload your blood results when ready",
      body_text: composeEmailBody({
        recipientName,
        intro:
          "Your recommended blood-test step still looks open, so this is a practical reminder for when results are ready.",
        lines,
      }),
      follow_up_status: cadence.followUpStatus,
      scheduled_for: new Date().toISOString(),
      payload: {
        blood_request_id: bloodRequest?.id ?? null,
        blood_request_status: bloodRequest?.status ?? null,
        due_reason: cadence.dueReason,
      },
    });
  }

  if (
    isPatientVisible(snapshot) &&
    snapshot.carePlan.scalpPhotoFollowUpNeeded &&
    (cadence.followUpStatus === "due" || cadence.followUpStatus === "overdue")
  ) {
    const lines = dedupeLines([
      dueWindow,
      "If you can, include updated scalp photos in your next follow-up so your clinician can compare changes more clearly over time.",
      ...cadence.patientReminderText,
    ]);
    candidates.push({
      profile_id: snapshot.profileId,
      intake_id: snapshot.intakeId,
      blood_request_id: bloodRequest?.id ?? null,
      reminder_type: LONGEVITY_REMINDER_TYPE.SCALP_PHOTOS_RECOMMENDED,
      delivery_channel: "email",
      dedupe_key: `${snapshot.intakeId}:scalp_photos_recommended:${targetAnchor}:${cadence.followUpStatus}`,
      recipient_email: recipientEmail,
      subject:
        "Hair Longevity Institute: updated scalp photos can help at your next review",
      body_text: composeEmailBody({
        recipientName,
        intro:
          "Updated scalp photos were suggested as part of your follow-up, so this is a quick reminder to include them if possible.",
        lines,
      }),
      follow_up_status: cadence.followUpStatus,
      scheduled_for: new Date().toISOString(),
      payload: {
        due_reason: cadence.dueReason,
        scalp_photo_follow_up_needed: true,
      },
    });
  }

  if (
    isPatientVisible(snapshot) &&
    followUpTimingRecommended &&
    (cadence.followUpStatus === "due" || cadence.followUpStatus === "overdue")
  ) {
    const lines = dedupeLines([
      dueWindow,
      ...cadence.patientReminderText,
      "Your clinician suggested follow-up as part of your ongoing plan, so checking in now would be appropriate when you're ready.",
    ]);
    candidates.push({
      profile_id: snapshot.profileId,
      intake_id: snapshot.intakeId,
      blood_request_id: bloodRequest?.id ?? null,
      reminder_type:
        LONGEVITY_REMINDER_TYPE.CLINICIAN_FOLLOW_UP_RECOMMENDED,
      delivery_channel: "email",
      dedupe_key: `${snapshot.intakeId}:clinician_follow_up_recommended:${targetAnchor}:${cadence.followUpStatus}`,
      recipient_email: recipientEmail,
      subject:
        "Hair Longevity Institute: a clinician follow-up is recommended",
      body_text: composeEmailBody({
        recipientName,
        intro:
          "Your clinician previously suggested follow-up, so this is a gentle reminder that the next review step now looks timely.",
        lines,
      }),
      follow_up_status: cadence.followUpStatus,
      scheduled_for: new Date().toISOString(),
      payload: {
        review_outcome: reviewOutcome,
        due_reason: cadence.dueReason,
      },
    });
  }

  return candidates;
}

async function stageReminderCandidates(
  supabase: SupabaseClient,
  params: {
    profileId: string;
    intakeId: string;
    candidates: ReminderCandidate[];
  }
): Promise<LongevityReminderStageResult> {
  const { data: existingRows, error } = await supabase
    .from("hli_longevity_reminders")
    .select("id, dedupe_key, reminder_type, status")
    .eq("profile_id", params.profileId)
    .eq("intake_id", params.intakeId);
  if (error) {
    throw new Error(error.message);
  }

  const existing = existingRows ?? [];
  const existingKeys = new Set(existing.map((row) => row.dedupe_key));
  const activeKeys = params.candidates.map((candidate) => candidate.dedupe_key);
  const activeKeySet = new Set(activeKeys);

  const toInsert = params.candidates.filter(
    (candidate) => !existingKeys.has(candidate.dedupe_key)
  );
  const stale = existing.filter(
    (row) => row.status === "staged" && !activeKeySet.has(row.dedupe_key)
  );

  if (stale.length > 0) {
    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from("hli_longevity_reminders")
      .update({
        status: "cancelled",
        cancelled_at: now,
        updated_at: now,
        last_error: "Superseded by a newer cadence evaluation.",
      })
      .in(
        "id",
        stale.map((row) => row.id)
      );
    if (updateErr) {
      throw new Error(updateErr.message);
    }
    await auditLongevityEvent(supabase, {
      profile_id: params.profileId,
      intake_id: params.intakeId,
      event_type: "longevity_reminders_cancelled",
      payload: {
        count: stale.length,
        reminder_types: stale.map((row) => row.reminder_type),
      },
      actor_type: "system",
    });
  }

  if (toInsert.length > 0) {
    const now = new Date().toISOString();
    const insertPayload = toInsert.map((candidate) => ({
      profile_id: candidate.profile_id,
      intake_id: candidate.intake_id,
      blood_request_id: candidate.blood_request_id,
      reminder_type: candidate.reminder_type,
      delivery_channel: candidate.delivery_channel,
      status: "staged",
      dedupe_key: candidate.dedupe_key,
      recipient_email: candidate.recipient_email,
      subject: candidate.subject,
      body_text: candidate.body_text,
      follow_up_status: candidate.follow_up_status,
      scheduled_for: candidate.scheduled_for,
      payload: candidate.payload,
      updated_at: now,
    }));
    const { error: insertErr } = await supabase
      .from("hli_longevity_reminders")
      .insert(insertPayload);
    if (insertErr) {
      throw new Error(insertErr.message);
    }
    await auditLongevityEvent(supabase, {
      profile_id: params.profileId,
      intake_id: params.intakeId,
      event_type: "longevity_reminders_staged",
      payload: {
        count: toInsert.length,
        reminder_types: toInsert.map((candidate) => candidate.reminder_type),
        delivery_channel: "email",
      },
      actor_type: "system",
    });
  }

  return {
    intakeId: params.intakeId,
    profileId: params.profileId,
    staged: toInsert.length,
    cancelled: stale.length,
    activeKeys,
  };
}

export async function stageLongevityRemindersForIntake(
  supabase: SupabaseClient,
  params: {
    profileId: string;
    intakeId: string;
    reviewOutcome?: string | null;
  }
): Promise<LongevityReminderStageResult> {
  const [{ data: intake, error: intakeErr }, { data: profile, error: profileErr }] =
    await Promise.all([
      supabase
        .from("hli_longevity_intakes")
        .select("id, review_outcome")
        .eq("id", params.intakeId)
        .eq("profile_id", params.profileId)
        .single(),
      supabase
        .from("hli_longevity_profiles")
        .select("email, full_name")
        .eq("id", params.profileId)
        .single(),
    ]);

  if (intakeErr || !intake) {
    throw new Error(intakeErr?.message ?? "Intake not found.");
  }
  if (profileErr || !profile?.email) {
    throw new Error(profileErr?.message ?? "Profile email not found.");
  }

  const reviewOutcome = params.reviewOutcome ?? intake.review_outcome ?? null;
  const snapshot = await getLongevityWorkflowSnapshotForIntake(supabase, {
    profileId: params.profileId,
    intakeId: params.intakeId,
    reviewOutcome,
  });
  const candidates = buildReminderCandidates({
    snapshot,
    recipientEmail: profile.email,
    recipientName: profile.full_name ?? null,
    reviewOutcome,
  });

  return stageReminderCandidates(supabase, {
    profileId: params.profileId,
    intakeId: params.intakeId,
    candidates,
  });
}

export async function runLongevityReminderSweep(
  supabase: SupabaseClient,
  params?: {
    intakeId?: string | null;
    profileId?: string | null;
    limit?: number;
  }
): Promise<{
  scanned: number;
  staged: number;
  cancelled: number;
  results: LongevityReminderStageResult[];
}> {
  const limit = Math.max(1, Math.min(params?.limit ?? 100, 500));
  let targets: Array<{ id: string; profile_id: string }> = [];

  if (params?.intakeId) {
    const { data, error } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id")
      .eq("id", params.intakeId)
      .neq("status", "draft")
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? "Intake not found for reminder sweep.");
    }
    targets = [{ id: data.id, profile_id: data.profile_id }];
  } else if (params?.profileId) {
    const { data, error } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id")
      .eq("profile_id", params.profileId)
      .neq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    targets = (data ?? []).map((row) => ({ id: row.id, profile_id: row.profile_id }));
  } else {
    const { data, error } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, created_at")
      .neq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(limit * 5);
    if (error) throw new Error(error.message);
    const seenProfiles = new Set<string>();
    for (const row of data ?? []) {
      if (!row.profile_id || seenProfiles.has(row.profile_id)) continue;
      seenProfiles.add(row.profile_id);
      targets.push({ id: row.id, profile_id: row.profile_id });
      if (targets.length >= limit) break;
    }
  }

  const results: LongevityReminderStageResult[] = [];
  let staged = 0;
  let cancelled = 0;

  for (const target of targets) {
    const result = await stageLongevityRemindersForIntake(supabase, {
      profileId: target.profile_id,
      intakeId: target.id,
    });
    results.push(result);
    staged += result.staged;
    cancelled += result.cancelled;
  }

  return {
    scanned: targets.length,
    staged,
    cancelled,
    results,
  };
}
