/**
 * Operational exceptions: deterministic detection of cases stuck or leaking in the workflow.
 * Uses hli_longevity_audit_events and hli_longevity_intakes. No new tables or analytics stack.
 * All helpers return lists of actionable rows with intake_id, profile_id, timestamps, and age.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { BETA_EVENT } from "./analytics";
import { REVIEW_STATUS } from "./reviewConstants";

/** olderThan: "24h" | "72h" | "7d" | "all". Returns ms; null = no minimum age filter. */
export function parseOlderThan(param: string | null): number | null {
  const v = param?.toLowerCase().trim();
  if (!v || v === "all") return null;
  const now = Date.now();
  if (v === "24h") return now - 24 * 60 * 60 * 1000;
  if (v === "72h") return now - 72 * 60 * 60 * 1000;
  if (v === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  return null;
}

export type StartedNeverSubmittedRow = {
  intake_id: string;
  profile_id: string | null;
  started_at: string;
  age_hours: number;
};

/**
 * 1. Started but never submitted.
 * Definition: Has intake_started event for intake_id; no intake_submitted event for that intake_id.
 * Optional filter: started_at older than threshold.
 */
export async function getStartedNeverSubmitted(
  supabase: SupabaseClient,
  options: { olderThanMs?: number | null } = {}
): Promise<StartedNeverSubmittedRow[]> {
  const [startedRes, submittedRes] = await Promise.all([
    supabase
      .from("hli_longevity_audit_events")
      .select("intake_id, profile_id, created_at")
      .eq("event_type", BETA_EVENT.INTAKE_STARTED)
      .not("intake_id", "is", null),
    supabase
      .from("hli_longevity_audit_events")
      .select("intake_id")
      .eq("event_type", BETA_EVENT.INTAKE_SUBMITTED)
      .not("intake_id", "is", null),
  ]);
  if (startedRes.error) throw new Error(startedRes.error.message);
  if (submittedRes.error) throw new Error(submittedRes.error.message);

  const submittedIds = new Set((submittedRes.data ?? []).map((r) => r.intake_id as string));
  const cutoff = options.olderThanMs ?? null;
  const rows: StartedNeverSubmittedRow[] = [];

  for (const r of startedRes.data ?? []) {
    const intake_id = r.intake_id as string;
    if (!intake_id || submittedIds.has(intake_id)) continue;
    const started_at = r.created_at as string;
    const age_hours = (Date.now() - new Date(started_at).getTime()) / (1000 * 60 * 60);
    if (cutoff != null && new Date(started_at).getTime() > cutoff) continue;
    rows.push({
      intake_id,
      profile_id: r.profile_id as string | null,
      started_at,
      age_hours,
    });
  }

  rows.sort((a, b) => b.age_hours - a.age_hours);
  return rows;
}

export type SubmittedNoDocumentsRow = {
  intake_id: string;
  profile_id: string | null;
  submitted_at: string;
  age_hours: number;
};

/**
 * 2. Submitted but no documents.
 * Definition: Has intake_submitted event for intake_id; no row in hli_longevity_documents for that intake_id.
 */
export async function getSubmittedNoDocuments(
  supabase: SupabaseClient,
  options: { olderThanMs?: number | null } = {}
): Promise<SubmittedNoDocumentsRow[]> {
  const [submittedRes, docsRes] = await Promise.all([
    supabase
      .from("hli_longevity_audit_events")
      .select("intake_id, profile_id, created_at")
      .eq("event_type", BETA_EVENT.INTAKE_SUBMITTED)
      .not("intake_id", "is", null),
    supabase.from("hli_longevity_documents").select("intake_id").not("intake_id", "is", null),
  ]);
  if (submittedRes.error) throw new Error(submittedRes.error.message);
  if (docsRes.error) throw new Error(docsRes.error.message);

  const intakesWithDocs = new Set((docsRes.data ?? []).map((r) => r.intake_id as string));
  const cutoff = options.olderThanMs ?? null;
  const rows: SubmittedNoDocumentsRow[] = [];

  for (const r of submittedRes.data ?? []) {
    const intake_id = r.intake_id as string;
    if (!intake_id || intakesWithDocs.has(intake_id)) continue;
    const submitted_at = r.created_at as string;
    const age_hours = (Date.now() - new Date(submitted_at).getTime()) / (1000 * 60 * 60);
    if (cutoff != null && new Date(submitted_at).getTime() > cutoff) continue;
    rows.push({
      intake_id,
      profile_id: r.profile_id as string | null,
      submitted_at,
      age_hours,
    });
  }

  rows.sort((a, b) => b.age_hours - a.age_hours);
  return rows;
}

export type SubmittedNeverClaimedRow = {
  intake_id: string;
  profile_id: string | null;
  submitted_at: string;
  review_priority: string | null;
  age_hours: number;
};

/**
 * 3. Submitted but never claimed.
 * Definition: Has intake_submitted event; no case_assigned event for that intake_id.
 * Uses audit events only (deterministic). Optional: older than threshold.
 */
export async function getSubmittedNeverClaimed(
  supabase: SupabaseClient,
  options: { olderThanMs?: number | null } = {}
): Promise<SubmittedNeverClaimedRow[]> {
  const [submittedRes, assignedRes, intakesRes] = await Promise.all([
    supabase
      .from("hli_longevity_audit_events")
      .select("intake_id, profile_id, created_at")
      .eq("event_type", BETA_EVENT.INTAKE_SUBMITTED)
      .not("intake_id", "is", null),
    supabase
      .from("hli_longevity_audit_events")
      .select("intake_id")
      .eq("event_type", BETA_EVENT.CASE_ASSIGNED)
      .not("intake_id", "is", null),
    supabase
      .from("hli_longevity_intakes")
      .select("id, review_priority")
      .in("review_status", [
        REVIEW_STATUS.HUMAN_REVIEW_REQUIRED,
        REVIEW_STATUS.UNDER_TRICHOLOGIST_REVIEW,
        REVIEW_STATUS.AWAITING_PATIENT_DOCUMENTS,
      ]),
  ]);
  if (submittedRes.error) throw new Error(submittedRes.error.message);
  if (assignedRes.error) throw new Error(assignedRes.error.message);
  if (intakesRes.error) throw new Error(intakesRes.error.message);

  const assignedIds = new Set((assignedRes.data ?? []).map((r) => r.intake_id as string));
  const priorityByIntake = new Map((intakesRes.data ?? []).map((r) => [r.id, r.review_priority as string | null]));
  const cutoff = options.olderThanMs ?? null;
  const rows: SubmittedNeverClaimedRow[] = [];

  for (const r of submittedRes.data ?? []) {
    const intake_id = r.intake_id as string;
    if (!intake_id || assignedIds.has(intake_id)) continue;
    const submitted_at = r.created_at as string;
    const age_hours = (Date.now() - new Date(submitted_at).getTime()) / (1000 * 60 * 60);
    if (cutoff != null && new Date(submitted_at).getTime() > cutoff) continue;
    rows.push({
      intake_id,
      profile_id: r.profile_id as string | null,
      submitted_at,
      review_priority: priorityByIntake.get(intake_id) ?? null,
      age_hours,
    });
  }

  rows.sort((a, b) => b.age_hours - a.age_hours);
  return rows;
}

export type ClaimedNoNoteRow = {
  intake_id: string;
  profile_id: string | null;
  claimed_at: string;
  age_hours: number;
};

/**
 * 4. Claimed but no note added.
 * Definition: Has case_assigned event for intake_id; no note_added event for that intake_id.
 * Optional: claimed_at older than threshold.
 */
export async function getClaimedNoNote(
  supabase: SupabaseClient,
  options: { olderThanMs?: number | null } = {}
): Promise<ClaimedNoNoteRow[]> {
  const [assignedRes, noteRes] = await Promise.all([
    supabase
      .from("hli_longevity_audit_events")
      .select("intake_id, profile_id, created_at")
      .eq("event_type", BETA_EVENT.CASE_ASSIGNED)
      .not("intake_id", "is", null),
    supabase
      .from("hli_longevity_audit_events")
      .select("intake_id")
      .eq("event_type", BETA_EVENT.NOTE_ADDED)
      .not("intake_id", "is", null),
  ]);
  if (assignedRes.error) throw new Error(assignedRes.error.message);
  if (noteRes.error) throw new Error(noteRes.error.message);

  const noteIds = new Set((noteRes.data ?? []).map((r) => r.intake_id as string));
  const cutoff = options.olderThanMs ?? null;
  const rows: ClaimedNoNoteRow[] = [];

  for (const r of assignedRes.data ?? []) {
    const intake_id = r.intake_id as string;
    if (!intake_id || noteIds.has(intake_id)) continue;
    const claimed_at = r.created_at as string;
    const age_hours = (Date.now() - new Date(claimed_at).getTime()) / (1000 * 60 * 60);
    if (cutoff != null && new Date(claimed_at).getTime() > cutoff) continue;
    rows.push({
      intake_id,
      profile_id: r.profile_id as string | null,
      claimed_at,
      age_hours,
    });
  }

  rows.sort((a, b) => b.age_hours - a.age_hours);
  return rows;
}

export type ReleasedNotViewedRow = {
  intake_id: string;
  profile_id: string | null;
  released_at: string;
  age_hours: number;
};

/**
 * 5. Released but not viewed.
 * Definition: Has summary_released event for intake_id; no summary_viewed event for that intake_id.
 * Optional: released_at older than threshold (e.g. 24h).
 */
export async function getReleasedNotViewed(
  supabase: SupabaseClient,
  options: { olderThanMs?: number | null } = {}
): Promise<ReleasedNotViewedRow[]> {
  const [releasedRes, viewedRes] = await Promise.all([
    supabase
      .from("hli_longevity_audit_events")
      .select("intake_id, profile_id, created_at")
      .eq("event_type", BETA_EVENT.SUMMARY_RELEASED)
      .not("intake_id", "is", null),
    supabase
      .from("hli_longevity_audit_events")
      .select("intake_id")
      .eq("event_type", BETA_EVENT.SUMMARY_VIEWED)
      .not("intake_id", "is", null),
  ]);
  if (releasedRes.error) throw new Error(releasedRes.error.message);
  if (viewedRes.error) throw new Error(viewedRes.error.message);

  const viewedIds = new Set((viewedRes.data ?? []).map((r) => r.intake_id as string));
  const cutoff = options.olderThanMs ?? null;
  const rows: ReleasedNotViewedRow[] = [];

  for (const r of releasedRes.data ?? []) {
    const intake_id = r.intake_id as string;
    if (!intake_id || viewedIds.has(intake_id)) continue;
    const released_at = r.created_at as string;
    const age_hours = (Date.now() - new Date(released_at).getTime()) / (1000 * 60 * 60);
    if (cutoff != null && new Date(released_at).getTime() > cutoff) continue;
    rows.push({
      intake_id,
      profile_id: r.profile_id as string | null,
      released_at,
      age_hours,
    });
  }

  rows.sort((a, b) => b.age_hours - a.age_hours);
  return rows;
}

export type AwaitingPatientDocumentsRow = {
  intake_id: string;
  profile_id: string;
  last_reviewed_at: string | null;
  age_hours: number;
};

/**
 * 6. Awaiting patient documents.
 * Definition: review_status = 'awaiting_patient_documents'. Age from last_reviewed_at or updated_at.
 * Optional: older than threshold.
 */
export async function getAwaitingPatientDocuments(
  supabase: SupabaseClient,
  options: { olderThanMs?: number | null } = {}
): Promise<AwaitingPatientDocumentsRow[]> {
  const { data, error } = await supabase
    .from("hli_longevity_intakes")
    .select("id, profile_id, last_reviewed_at, updated_at")
    .eq("review_status", REVIEW_STATUS.AWAITING_PATIENT_DOCUMENTS);
  if (error) throw new Error(error.message);

  const cutoff = options.olderThanMs ?? null;
  const rows: AwaitingPatientDocumentsRow[] = [];

  for (const r of data ?? []) {
    const ts = r.last_reviewed_at ?? r.updated_at ?? null;
    const tsStr = typeof ts === "string" ? ts : null;
    const age_hours = tsStr ? (Date.now() - new Date(tsStr).getTime()) / (1000 * 60 * 60) : 0;
    if (cutoff != null && tsStr && new Date(tsStr).getTime() > cutoff) continue;
    rows.push({
      intake_id: r.id,
      profile_id: r.profile_id as string,
      last_reviewed_at: tsStr,
      age_hours,
    });
  }

  rows.sort((a, b) => b.age_hours - a.age_hours);
  return rows;
}

export type ExceptionsResult = {
  olderThan: string;
  started_never_submitted: StartedNeverSubmittedRow[];
  submitted_no_documents: SubmittedNoDocumentsRow[];
  submitted_never_claimed: SubmittedNeverClaimedRow[];
  claimed_no_note: ClaimedNoNoteRow[];
  released_not_viewed: ReleasedNotViewedRow[];
  awaiting_patient_documents: AwaitingPatientDocumentsRow[];
};

/**
 * Fetch all exception groups in one go. Reusable for API and server-rendered page.
 */
export async function getExceptions(
  supabase: SupabaseClient,
  options: { olderThan?: string | null } = {}
): Promise<ExceptionsResult> {
  const olderThanMs = parseOlderThan(options.olderThan ?? null);
  const olderThan = options.olderThan?.toLowerCase() ?? "all";

  const [
    started_never_submitted,
    submitted_no_documents,
    submitted_never_claimed,
    claimed_no_note,
    released_not_viewed,
    awaiting_patient_documents,
  ] = await Promise.all([
    getStartedNeverSubmitted(supabase, { olderThanMs }),
    getSubmittedNoDocuments(supabase, { olderThanMs }),
    getSubmittedNeverClaimed(supabase, { olderThanMs }),
    getClaimedNoNote(supabase, { olderThanMs }),
    getReleasedNotViewed(supabase, { olderThanMs }),
    getAwaitingPatientDocuments(supabase, { olderThanMs }),
  ]);

  return {
    olderThan,
    started_never_submitted,
    submitted_no_documents,
    submitted_never_claimed,
    claimed_no_note,
    released_not_viewed,
    awaiting_patient_documents,
  };
}
