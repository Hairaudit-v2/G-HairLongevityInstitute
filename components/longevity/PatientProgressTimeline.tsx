"use client";

/**
 * Patient-facing progress timeline for a single intake.
 * Shows 4 stages with complete / current / upcoming. No internal review states.
 * Uses intake status and patient_visible_released_at only.
 */

export type PatientProgressTimelineProps = {
  /** Has the patient submitted (status !== 'draft')? */
  submitted: boolean;
  /** Has the clinician released the summary to the patient? */
  released: boolean;
  /** Is there summary text available to view? */
  summaryAvailable: boolean;
};

const STAGES: { key: string; label: string }[] = [
  { key: "submitted", label: "Case submitted" },
  { key: "reviewing", label: "Trichologist reviewing" },
  { key: "complete", label: "Review complete" },
  { key: "summary", label: "Summary ready" },
];

type StepState = "complete" | "current" | "upcoming";

function getStepState(
  index: number,
  submitted: boolean,
  released: boolean,
  summaryAvailable: boolean
): StepState {
  const step1 = submitted;
  const step2 = released;
  const step3 = released;
  const step4 = summaryAvailable;

  switch (index) {
    case 0:
      return step1 ? "complete" : "current";
    case 1:
      if (step2) return "complete";
      return step1 ? "current" : "upcoming";
    case 2:
      if (step3) return "complete";
      return step2 ? "current" : "upcoming";
    case 3:
      if (step4) return "complete";
      return step3 ? "current" : "upcoming";
    default:
      return "upcoming";
  }
}

export function PatientProgressTimeline({
  submitted,
  released,
  summaryAvailable,
}: PatientProgressTimelineProps) {
  // If nothing started, show a minimal prompt instead of empty timeline
  if (!submitted) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5" aria-labelledby="case-progress-heading">
        <h2 id="case-progress-heading" className="text-base font-semibold text-white">
          Your case progress
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Submit your intake to see progress through review.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5" aria-labelledby="case-progress-heading">
      <h2 id="case-progress-heading" className="text-base font-semibold text-white">
        Your case progress
      </h2>
      <p className="mt-1 text-sm text-white/60">
        Where your latest submission is in the review process.
      </p>
      <ol className="mt-5 flex flex-wrap gap-4 sm:gap-6" aria-label="Progress stages">
        {STAGES.map((stage, index) => {
          const state = getStepState(index, submitted, released, summaryAvailable);
          return (
            <li
              key={stage.key}
              className="flex items-center gap-3"
              aria-current={state === "current" ? "step" : undefined}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium ${
                  state === "complete"
                    ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/20 text-[rgb(var(--gold))]"
                    : state === "current"
                      ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/10 text-white ring-2 ring-[rgb(var(--gold))]/40"
                      : "border-white/20 bg-white/5 text-white/50"
                }`}
                aria-hidden
              >
                {state === "complete" ? "✓" : index + 1}
              </span>
              <span
                className={`text-sm font-medium ${
                  state === "complete"
                    ? "text-white/90"
                    : state === "current"
                      ? "text-white"
                      : "text-white/50"
                }`}
              >
                {stage.label}
              </span>
              {index < STAGES.length - 1 && (
                <span
                  className={`hidden h-px w-6 shrink-0 sm:block ${
                    state === "complete" ? "bg-[rgb(var(--gold))]/40" : "bg-white/20"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
