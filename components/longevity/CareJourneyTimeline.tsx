import Link from "next/link";
import { getPatientIntakeStatusLabel } from "@/lib/longevity/patientIntakeStatus";

type IntakeForTimeline = {
  id: string;
  status: string;
  created_at: string;
  patient_visible_released_at: string | null;
};

type BloodRequestForTimeline = {
  id: string;
  intake_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  letter_document_id: string | null;
};

type TimelineEvent =
  | { type: "intake"; date: string; label: string; intakeId: string; isFirst: boolean; status: string }
  | { type: "summary"; date: string; label: string; intakeId: string }
  | { type: "blood_request"; date: string; label: string; bloodRequestId: string }
  | { type: "results_uploaded"; date: string; label: string; bloodRequestId: string };

function buildTimelineEvents(
  intakes: IntakeForTimeline[],
  bloodRequests: BloodRequestForTimeline[],
  intakesWithReleasedSummary: IntakeForTimeline[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const summaryReleasedSet = new Set(intakesWithReleasedSummary.map((i) => i.id));

  intakes.forEach((intake, index) => {
    events.push({
      type: "intake",
      date: intake.created_at,
      label: index === 0 ? "Initial intake" : "Follow-up intake",
      intakeId: intake.id,
      isFirst: index === 0,
      status: intake.status,
    });
    if (summaryReleasedSet.has(intake.id) && intake.patient_visible_released_at) {
      events.push({
        type: "summary",
        date: intake.patient_visible_released_at,
        label: "Clinician summary released",
        intakeId: intake.id,
      });
    }
  });

  bloodRequests.forEach((br) => {
    events.push({
      type: "blood_request",
      date: br.created_at,
      label: "Blood tests recommended",
      bloodRequestId: br.id,
    });
    if (br.status === "results_uploaded" || br.status === "completed") {
      events.push({
        type: "results_uploaded",
        date: br.updated_at,
        label: "Returned results uploaded",
        bloodRequestId: br.id,
      });
    }
  });

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return events;
}

export function CareJourneyTimeline({
  intakes,
  bloodRequests,
  intakesWithReleasedSummary,
}: {
  intakes: IntakeForTimeline[];
  bloodRequests: BloodRequestForTimeline[];
  intakesWithReleasedSummary: IntakeForTimeline[];
}) {
  const events = buildTimelineEvents(intakes, bloodRequests, intakesWithReleasedSummary);
  if (events.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="care-journey-heading">
      <h2 id="care-journey-heading" className="text-lg font-semibold text-white">
        Your care journey
      </h2>
      <p className="mt-1 text-sm text-white/60">
        Your longitudinal timeline: intakes, clinician summaries, blood tests, and follow-ups in order.
      </p>
      <ul className="mt-4 space-y-0">
        {events.map((evt, idx) => (
          <li key={`${evt.type}-${evt.date}-${idx}`} className="relative flex gap-4 pb-6 last:pb-0">
            {idx < events.length - 1 && (
              <span
                className="absolute left-[7px] top-6 bottom-0 w-px bg-white/20"
                aria-hidden
              />
            )}
            <span
              className="relative z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-[rgb(var(--gold))]/50 bg-[rgb(var(--bg))]"
              aria-hidden
            />
            <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs text-white/50">
                {new Date(evt.date).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </p>
              <p className="mt-1 font-medium text-white/95">
                {evt.label}
                {evt.type === "intake" && (
                  <span className="ml-2 text-xs font-normal text-white/60">({getPatientIntakeStatusLabel(evt.status)})</span>
                )}
              </p>
              {evt.type === "intake" && evt.status === "draft" && (
                <Link
                  href={`/longevity/start?resume=${evt.intakeId}`}
                  className="mt-2 inline-block text-sm text-[rgb(var(--gold))] hover:underline"
                >
                  Resume
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
