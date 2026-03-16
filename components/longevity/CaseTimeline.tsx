"use client";

import { getPatientDocTypeLabel } from "@/lib/longevity/documentTypes";

/**
 * Case timeline: chronological list of key events for a case.
 * Derived from existing CaseDetail fields only (no new event system).
 * Used in the trichologist review workspace.
 */

export type CaseTimelineEvent = {
  at: string;
  label: string;
  actor: "patient" | "trichologist" | "system";
  detail?: string;
};

export type CaseTimelineProps = {
  intake: {
    created_at: string;
    assigned_at: string | null;
  };
  questionnaire: { updated_at: string | null };
  documents: { filename: string | null; doc_type: string; created_at: string }[];
  notes: { created_at: string }[];
  released_summary_snapshot?: { released_at: string } | null;
  reminder_sents?: { sent_at: string; reminder_type: string }[];
};

function formatReminderType(reminder_type: string): string {
  const map: Record<string, string> = {
    follow_up_due: "Follow-up due",
    follow_up_overdue: "Follow-up overdue",
    blood_results_pending: "Blood results pending",
    scalp_photos_recommended: "Scalp photos recommended",
    clinician_follow_up_recommended: "Clinician follow-up recommended",
  };
  return map[reminder_type] ?? reminder_type.replace(/_/g, " ");
}

export function CaseTimeline(props: CaseTimelineProps) {
  const events: CaseTimelineEvent[] = [];

  events.push({ at: props.intake.created_at, label: "Intake submitted", actor: "patient" });

  if (props.questionnaire.updated_at) {
    events.push({
      at: props.questionnaire.updated_at,
      label: "Questionnaire completed",
      actor: "patient",
    });
  }

  for (const d of props.documents) {
    events.push({
      at: d.created_at,
      label: "Document uploaded",
      actor: "patient",
      detail: d.filename ?? getPatientDocTypeLabel(d.doc_type),
    });
  }

  if (props.intake.assigned_at) {
    events.push({
      at: props.intake.assigned_at,
      label: "Trichologist assigned",
      actor: "trichologist",
    });
  }

  for (const n of props.notes) {
    events.push({
      at: n.created_at,
      label: "Internal note added",
      actor: "trichologist",
    });
  }

  if (props.released_summary_snapshot?.released_at) {
    events.push({
      at: props.released_summary_snapshot.released_at,
      label: "Summary released",
      actor: "trichologist",
    });
  }

  for (const r of props.reminder_sents ?? []) {
    events.push({
      at: r.sent_at,
      label: "Email notification sent",
      actor: "system",
      detail: formatReminderType(r.reminder_type),
    });
  }

  events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const actorLabel = (actor: CaseTimelineEvent["actor"]) => {
    switch (actor) {
      case "patient":
        return "Patient";
      case "trichologist":
        return "Trichologist";
      case "system":
        return "System";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-1">
      {events.length === 0 ? (
        <p className="text-sm text-white/50">No events yet.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((evt, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-white/30"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <span className="text-white/90">{evt.label}</span>
                {evt.detail && (
                  <span className="ml-1.5 text-white/50">— {evt.detail}</span>
                )}
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-xs text-white/50">
                  <time dateTime={evt.at}>
                    {new Date(evt.at).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </time>
                  <span>{actorLabel(evt.actor)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
