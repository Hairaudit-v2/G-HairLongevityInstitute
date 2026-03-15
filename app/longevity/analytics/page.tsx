import Link from "next/link";
import { redirect } from "next/navigation";
import { isLongevityApiEnabled } from "@/lib/features";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCohortReadinessSummary } from "@/lib/longevity/predictiveReadiness";
import type { ReadinessLevel, ReadinessDimension } from "@/lib/longevity/predictiveReadiness";

/** Readability labels for readiness dimensions (readiness layer only; not clinical). */
const DIMENSION_LABELS: Record<ReadinessDimension, string> = {
  longitudinal_history: "Longitudinal history",
  treatment_continuity_data: "Treatment continuity data",
  scalp_progression_data: "Scalp progression data",
  marker_history: "Marker history",
  reminder_follow_up_context: "Reminder / follow-up context",
};

export default async function LongevityAnalyticsPage() {
  if (!isLongevityApiEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Analytics</h1>
          <p className="mt-2 text-white/70">This feature is not currently available.</p>
          <Link href="/longevity" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
            Back
          </Link>
        </div>
      </main>
    );
  }

  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    redirect("/portal/login?redirect=/longevity/analytics");
  }

  const supabase = supabaseAdmin();
  let cohort: Awaited<ReturnType<typeof getCohortReadinessSummary>>;
  try {
    cohort = await getCohortReadinessSummary(supabase, { limit: 2000 });
  } catch {
    cohort = {
      readiness_version: "v1",
      level_counts: { low: 0, moderate: 0, high: 0 },
      dimension_prevalence: {
        longitudinal_history: 0,
        treatment_continuity_data: 0,
        scalp_progression_data: 0,
        marker_history: 0,
        reminder_follow_up_context: 0,
      },
      profile_count: 0,
    };
  }

  const total = cohort.profile_count;
  const levelCounts = cohort.level_counts;

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
              Hair Longevity Institute — Internal analytics
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-white">Analytics</h1>
            <p className="mt-1 text-white/70">Cohort and readiness summaries</p>
          </div>
          <Link
            href="/portal/trichologist/review"
            className="text-sm text-white/70 hover:text-white"
          >
            ← Back to review
          </Link>
        </div>

        {/* Predictive Readiness: structured data sufficiency for future FI workflows (not a clinical decision tool). */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">
            Predictive readiness
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Measures whether the cohort has enough structured signal quality for future
            intelligence workflows (e.g. longitudinal history, treatment continuity, scalp
            and marker data, reminder context). This is a readiness layer only — it does
            not provide treatment recommendations or predictive models.
          </p>
          <p className="mt-1 text-xs text-white/50">
            Not a clinical decision tool. For internal analytics only.
          </p>

          {total === 0 ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
              No cohort data yet. Readiness is computed from outbox analytics; add more
              profiles and signals to see distribution.
            </div>
          ) : (
            <>
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Readiness distribution
                </h3>
                <div className="mt-3 flex flex-wrap gap-4">
                  {(["low", "moderate", "high"] as ReadinessLevel[]).map((level) => {
                    const count = levelCounts[level];
                    const pct = total > 0 ? Math.round((100 * count) / total) : 0;
                    return (
                      <div
                        key={level}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 min-w-[7rem]"
                      >
                        <div className="text-lg font-semibold text-white">{count}</div>
                        <div className="text-xs capitalize text-white/70">{level}</div>
                        <div className="text-xs text-white/50">{pct}% of cohort</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Dimension prevalence (profiles with sufficient data)
                </h3>
                <ul className="mt-3 space-y-2">
                  {(Object.entries(cohort.dimension_prevalence) as [ReadinessDimension, number][]).map(
                    ([dim, count]) => {
                      const pct = total > 0 ? Math.round((100 * count) / total) : 0;
                      return (
                        <li
                          key={dim}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                        >
                          <span className="text-white/90">
                            {DIMENSION_LABELS[dim]}
                          </span>
                          <span className="text-white/70">
                            {count} <span className="text-white/50">({pct}%)</span>
                          </span>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>

              <p className="mt-4 text-xs text-white/50">
                Version: {cohort.readiness_version} · {total} profile{total !== 1 ? "s" : ""} in cohort
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
