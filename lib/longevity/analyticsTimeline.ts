/**
 * Person-level analytics timeline — chronological sequence of longitudinal events.
 * Longevity namespace only. Transforms analytics-ready outbox records into a
 * normalized timeline for clinicians/admins. Deterministic, inspectable.
 * Future FI work can expand into richer progression storytelling.
 */

import type { OutboxRow } from "./analytics";
import { LONGEVITY_EVENT_TYPE } from "./integrationContracts";
import { LONGEVITY_SIGNAL_KEY } from "./integrationContracts";

/** Source category for timeline item (reminder, treatment, marker, scalp, etc.). */
export type TimelineSourceCategory =
  | "intake"
  | "reminder"
  | "blood"
  | "scalp"
  | "review"
  | "treatment"
  | "marker"
  | "derived_state"
  | "general";

/** Normalized timeline item for person-level analytics. */
export type TimelineItem = {
  timestamp: string;
  event_type: string;
  title: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  source: TimelineSourceCategory;
  /** Outbox row id for traceability. */
  source_id?: string;
};

/** Event type -> title and source (for events). */
const EVENT_TITLES: Record<string, { title: string; source: TimelineSourceCategory }> = {
  [LONGEVITY_EVENT_TYPE.INTAKE_SUBMITTED]: { title: "Intake submitted", source: "intake" },
  [LONGEVITY_EVENT_TYPE.REMINDER_SENT]: { title: "Reminder sent", source: "reminder" },
  [LONGEVITY_EVENT_TYPE.REMINDER_FAILED]: { title: "Reminder failed", source: "reminder" },
  [LONGEVITY_EVENT_TYPE.FOLLOW_UP_COMPLETED_AFTER_REMINDER]: { title: "Follow-up returned", source: "reminder" },
  [LONGEVITY_EVENT_TYPE.BLOOD_RESULTS_UPLOADED]: { title: "Blood results uploaded", source: "blood" },
  [LONGEVITY_EVENT_TYPE.BLOOD_RESULTS_UPLOADED_AFTER_REMINDER]: { title: "Blood results uploaded (after reminder)", source: "blood" },
  [LONGEVITY_EVENT_TYPE.SCALP_PHOTO_UPLOADED_AFTER_REMINDER]: { title: "Scalp photos uploaded", source: "scalp" },
  [LONGEVITY_EVENT_TYPE.REVIEW_COMPLETED]: { title: "Review completed", source: "review" },
  [LONGEVITY_EVENT_TYPE.CARE_PLAN_GENERATED]: { title: "Care plan generated", source: "review" },
  [LONGEVITY_EVENT_TYPE.BLOOD_REQUEST_CREATED]: { title: "Blood request created", source: "blood" },
};

/** Signal key -> title and source (for signals). */
const SIGNAL_TITLES: Record<string, { title: string; source: TimelineSourceCategory }> = {
  [LONGEVITY_SIGNAL_KEY.TREATMENT_ADHERENCE_SUMMARY]: { title: "Treatment status change", source: "treatment" },
  [LONGEVITY_SIGNAL_KEY.OUTCOME_CORRELATION]: { title: "Treatment correlation state available", source: "treatment" },
  [LONGEVITY_SIGNAL_KEY.VISUAL_CHANGE_DETECTED]: { title: "Scalp review / visual change detected", source: "scalp" },
  [LONGEVITY_SIGNAL_KEY.VISUAL_CONCERN_PERSISTENT]: { title: "Visual concern persistent", source: "scalp" },
  [LONGEVITY_SIGNAL_KEY.VISUAL_COMPARISON_LIMITED]: { title: "Scalp comparison limited", source: "scalp" },
  [LONGEVITY_SIGNAL_KEY.MARKER_IMPROVING]: { title: "Marker improvement noted", source: "marker" },
  [LONGEVITY_SIGNAL_KEY.IRON_RISK_ACTIVE]: { title: "Iron risk signal", source: "derived_state" },
  [LONGEVITY_SIGNAL_KEY.THYROID_DRIVER_ACTIVE]: { title: "Thyroid driver signal", source: "derived_state" },
  [LONGEVITY_SIGNAL_KEY.INFLAMMATORY_BURDEN_PERSISTENT]: { title: "Inflammatory burden persistent", source: "derived_state" },
  [LONGEVITY_SIGNAL_KEY.BLOOD_RESULTS_PENDING]: { title: "Blood results pending", source: "blood" },
  [LONGEVITY_SIGNAL_KEY.FOLLOW_UP_RECOMMENDED]: { title: "Follow-up recommended", source: "review" },
  [LONGEVITY_SIGNAL_KEY.GP_FOLLOW_UP_SUGGESTED]: { title: "GP follow-up suggested", source: "review" },
  [LONGEVITY_SIGNAL_KEY.REENGAGEMENT_DELAY_DAYS]: { title: "Re-engagement after reminder", source: "reminder" },
};

function timestampForRow(row: OutboxRow): string {
  if (row.emission_kind === "event" && row.payload?.occurred_at && typeof row.payload.occurred_at === "string") {
    return row.payload.occurred_at;
  }
  if (row.payload?.generated_at && typeof row.payload.generated_at === "string") return row.payload.generated_at;
  return row.created_at;
}

/**
 * Transform analytics-ready outbox rows into a chronological timeline.
 * Sparse or empty input returns empty array. Deterministic.
 */
export function buildTimelineFromOutboxRows(rows: OutboxRow[]): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const row of rows) {
    const ts = timestampForRow(row);
    const sourceId = row.id;

    if (row.emission_kind === "event") {
      const mapped = EVENT_TITLES[row.emission_key];
      const title = mapped?.title ?? "Event";
      const source = mapped?.source ?? "general";
      items.push({
        timestamp: ts,
        event_type: row.emission_key,
        title,
        summary: undefined,
        metadata: row.intake_id ? { intake_id: row.intake_id } : undefined,
        source,
        source_id: sourceId,
      });
      continue;
    }

    if (row.emission_kind === "signal") {
      const mapped = SIGNAL_TITLES[row.emission_key];
      const title = mapped?.title ?? row.emission_key;
      const source = mapped?.source ?? "general";
      const summary = row.payload?.correlation_state
        ? String(row.payload.correlation_state)
        : Array.isArray(row.payload?.items)
          ? `${(row.payload.items as unknown[]).length} treatment item(s)`
          : undefined;
      items.push({
        timestamp: ts,
        event_type: row.emission_key,
        title,
        summary,
        metadata: row.intake_id ? { intake_id: row.intake_id } : undefined,
        source,
        source_id: sourceId,
      });
    }
  }

  items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return items;
}
