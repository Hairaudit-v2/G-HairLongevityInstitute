"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Metrics = {
  reminders_sent: number;
  reminders_failed: number;
  reminder_to_follow_up_conversion: number;
  reminder_to_blood_upload_conversion: number;
  reminder_to_scalp_photo_conversion: number;
  outcomes_follow_up_intake: number;
  outcomes_blood_results: number;
  outcomes_scalp_photo: number;
  outcomes_review_re_entry: number;
  avg_delay_days: number | null;
  median_delay_days: number | null;
  overdue_follow_up_count: number;
  since: string | null;
};

type RecentOutcome = {
  id: string;
  reminder_id: string;
  profile_id: string;
  outcome_type: string;
  related_intake_id: string | null;
  occurred_at: string;
  delay_days: number;
};

const OUTCOME_LABELS: Record<string, string> = {
  follow_up_intake_submitted: "Follow-up submitted",
  blood_results_uploaded: "Blood results uploaded",
  scalp_photo_uploaded: "Scalp photo uploaded",
  review_re_entry: "Review re-entry",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdherenceOverviewContent() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentOutcomes, setRecentOutcomes] = useState<RecentOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [since, setSince] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (since.trim()) params.set("since", since.trim());
      const res = await fetch(`/api/longevity/analytics/adherence?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Failed to load adherence data");
        return;
      }
      setMetrics(data.metrics ?? null);
      setRecentOutcomes(data.recent_outcomes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [since]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !metrics) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
        Loading adherence overview…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Adherence overview (internal)
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Reminder conversion, overdue follow-up count, and recent outcomes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-white/80">
            Since (ISO):
            <input
              type="text"
              placeholder="e.g. 2025-01-01"
              value={since}
              onChange={(e) => setSince(e.target.value)}
              className="w-36 rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => fetchData()}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
          >
            Refresh
          </button>
          <Link
            href="/portal/trichologist/review"
            className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
          >
            Back to review
          </Link>
        </div>
      </div>

      {metrics && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              Reminders sent
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {metrics.reminders_sent}
            </p>
            {metrics.reminders_failed > 0 && (
              <p className="mt-0.5 text-xs text-amber-300">
                {metrics.reminders_failed} failed
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              Overdue follow-up
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {metrics.overdue_follow_up_count}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              Follow-up conversion
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {metrics.reminder_to_follow_up_conversion != null
                ? `${(metrics.reminder_to_follow_up_conversion * 100).toFixed(1)}%`
                : "—"}
            </p>
            <p className="mt-0.5 text-xs text-white/60">
              {metrics.outcomes_follow_up_intake} outcomes
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              Avg delay (days)
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {metrics.avg_delay_days != null ? metrics.avg_delay_days : "—"}
            </p>
            {metrics.since && (
              <p className="mt-0.5 text-xs text-white/50">Since {metrics.since}</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <h2 className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white/90">
          Recent reminder outcomes
        </h2>
        {recentOutcomes.length === 0 ? (
          <p className="p-6 text-center text-sm text-white/50">
            No recent outcomes.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/60">
                  <th className="p-3 font-medium">Outcome</th>
                  <th className="p-3 font-medium">Occurred</th>
                  <th className="p-3 font-medium">Delay (days)</th>
                </tr>
              </thead>
              <tbody>
                {recentOutcomes.slice(0, 20).map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="p-3">
                      {OUTCOME_LABELS[o.outcome_type] ?? o.outcome_type}
                    </td>
                    <td className="p-3 text-white/80">
                      {formatDate(o.occurred_at)}
                    </td>
                    <td className="p-3 text-white/80">{o.delay_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
