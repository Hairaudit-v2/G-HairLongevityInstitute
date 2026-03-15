import Link from "next/link";

type Intake = { id: string; status: string; created_at: string };

/**
 * Shows current case status and suggested next step for the portal dashboard.
 * Preserves longitudinal model: does not overwrite; suggests resume or new intake.
 */
export function PortalNextStep({ intakes }: { intakes: Intake[] }) {
  const latest = intakes[0] ?? null;
  const hasDraft = intakes.some((i) => i.status === "draft");
  const submittedCount = intakes.filter((i) => i.status === "submitted").length;

  if (intakes.length === 0) {
    return (
      <section className="rounded-2xl border border-[rgb(var(--gold))]/30 bg-[rgb(var(--gold))]/5 p-6">
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
          Start intake
        </Link>
      </section>
    );
  }

  if (latest?.status === "draft") {
    return (
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
          Next step
        </h2>
        <p className="mt-2 text-white/90">
          You have a draft in progress. Complete it or start a new intake.
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
            Start new intake
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">
        Current status
      </h2>
      <p className="mt-2 text-white/90">
        {submittedCount > 0 && !hasDraft
          ? "Your latest intake has been submitted. You can start a follow-up intake when ready."
          : "View your intakes below."}
      </p>
      <Link
        href="/longevity/start"
        className="mt-4 inline-flex rounded-2xl border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-6 py-3 text-sm font-semibold text-white hover:bg-[rgb(var(--gold))]/20"
      >
        New intake
      </Link>
    </section>
  );
}
