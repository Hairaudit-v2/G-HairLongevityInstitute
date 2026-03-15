import type { FollowUpCadenceOutput } from "@/lib/longevity/followUpCadence";

const STATUS_LABELS: Record<FollowUpCadenceOutput["followUpStatus"], string> = {
  due: "Due",
  overdue: "Overdue",
  upcoming: "Upcoming",
  complete: "Complete",
  none: "Not set",
};

const STATUS_STYLES: Record<
  FollowUpCadenceOutput["followUpStatus"],
  { card: string; badge: string }
> = {
  due: {
    card: "border-amber-500/30 bg-amber-500/5",
    badge: "border-amber-400/40 bg-amber-400/10 text-amber-100",
  },
  overdue: {
    card: "border-rose-500/30 bg-rose-500/5",
    badge: "border-rose-400/40 bg-rose-400/10 text-rose-100",
  },
  upcoming: {
    card: "border-sky-500/30 bg-sky-500/5",
    badge: "border-sky-400/40 bg-sky-400/10 text-sky-100",
  },
  complete: {
    card: "border-emerald-500/30 bg-emerald-500/5",
    badge: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  },
  none: {
    card: "border-white/10 bg-white/5",
    badge: "border-white/15 bg-white/5 text-white/70",
  },
};

export function FollowUpCadenceCard({
  cadence,
  audience,
  title,
  description,
  className = "",
}: {
  cadence: FollowUpCadenceOutput;
  audience: "patient" | "clinician";
  title: string;
  description?: string;
  className?: string;
}) {
  const styles = STATUS_STYLES[cadence.followUpStatus];
  const reminders =
    audience === "patient"
      ? cadence.patientReminderText
      : cadence.clinicianReminderText;

  return (
    <section
      className={`rounded-2xl border p-5 ${styles.card} ${className}`.trim()}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-white/70">{description}</p>
          )}
        </div>
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${styles.badge}`}
        >
          {STATUS_LABELS[cadence.followUpStatus]}
        </span>
      </div>

      {cadence.suggestedDueWindow && (
        <p className="mt-3 text-sm text-[rgb(var(--gold))]/90">
          {cadence.suggestedDueWindow}
        </p>
      )}

      {reminders.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm text-white/90">
          {reminders.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      )}

      {cadence.dueReason.length > 0 && (
        <p className="mt-3 text-xs text-white/55">
          Why this is showing: {cadence.dueReason.join(" ")}
        </p>
      )}
    </section>
  );
}
