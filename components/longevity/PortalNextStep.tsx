import Link from "next/link";

type Intake = { id: string; status: string; created_at: string };

/**
 * Shows current case status and suggested next step for the portal dashboard.
 * Preserves longitudinal model: does not overwrite; suggests resume (existing draft) or new intake (creates a new row).
 * When hasReleasedSummary, shows clear "Your review is ready" state with CTA to view summary.
 * When waiting (submitted, no release yet), shows reassuring waiting state.
 */
export function PortalNextStep({
  intakes,
  hasResultsUploaded = false,
  hasReleasedSummary = false,
}: {
  intakes: Intake[];
  hasResultsUploaded?: boolean;
  /** True when at least one intake has a released patient-visible summary (patient_visible_released_at + summary). */
  hasReleasedSummary?: boolean;
}) {
  const latest = intakes[0] ?? null;
  const hasDraft = intakes.some((i) => i.status === "draft");
  const nonDraftCount = intakes.filter((i) => i.status !== "draft").length;

  if (intakes.length === 0) {
    return (
      <section id="next-step-heading" className="rounded-2xl border border-[rgb(var(--gold))]/30 bg-[rgb(var(--gold))]/5 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">
          Next step
        </h2>
        <p className="mt-2 text-white/90">
          Start your first intake to begin your hair longevity assessment.
        </p>
        <Link
          href="/longevity/start"
          className="mt-4 inline-flex rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))]"
        >
          Start first intake
        </Link>
      </section>
    );
  }

  if (latest?.status === "draft") {
    return (
      <section id="next-step-heading" className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
          Next step
        </h2>
        <p className="mt-2 text-white/90">
          You have a draft in progress. Resume it to continue, or start a new intake (a separate follow-up; your previous submissions stay as-is).
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/longevity/start?resume=${latest.id}`}
            className="inline-flex rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))]"
          >
            Resume draft
          </Link>
          <Link
            href="/longevity/start"
            className="inline-flex rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            Start follow-up intake
          </Link>
        </div>
      </section>
    );
  }

  if (hasReleasedSummary) {
    return (
      <section id="next-step-heading" className="rounded-2xl border border-[rgb(var(--gold))]/30 bg-[rgb(var(--gold))]/10 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">
          Your review is ready
        </h2>
        <p className="mt-2 text-white/90">
          Your clinician has completed your assessment and released a summary with recommendations. Review it below and follow any next steps they have outlined.
        </p>
        <Link
          href="#clinician-summary-heading"
          className="mt-4 inline-flex rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))]"
        >
          View my summary
        </Link>
      </section>
    );
  }

  if (nonDraftCount > 0 && !hasDraft) {
    return (
      <section id="next-step-heading" className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">
          Current status
        </h2>
        <p className="mt-2 text-white/90">
          Your assessment is with our specialist. We will notify you when your summary is ready. You can check back here anytime.
        </p>
        <p className="mt-2 text-sm text-white/60">
          {hasResultsUploaded
            ? "You can also start a follow-up reassessment when ready—your previous data stays safe."
            : "You can add more documents from the intake flow or start a follow-up intake if needed."}
        </p>
        <Link
          href="/longevity/start"
          className="mt-4 inline-flex rounded-2xl border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-6 py-3 text-sm font-semibold text-white hover:bg-[rgb(var(--gold))]/20"
        >
          {hasResultsUploaded ? "Start follow-up reassessment" : "Start follow-up intake"}
      </Link>
    </section>
    );
  }

  return (
    <section id="next-step-heading" className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">
        Current status
      </h2>
      <p className="mt-2 text-white/90">
        View your intakes below.
      </p>
      <Link
        href="/longevity/start"
        className="mt-4 inline-flex rounded-2xl border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-6 py-3 text-sm font-semibold text-white hover:bg-[rgb(var(--gold))]/20"
      >
        Start follow-up intake
      </Link>
    </section>
  );
}
