"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { LongevityReminderWithMeta } from "@/lib/longevity/reminders";

const STATUS_STYLES: Record<string, string> = {
  staged: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  sent: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  cancelled: "bg-white/10 text-white/60 border-white/20",
  failed: "bg-rose-500/20 text-rose-200 border-rose-500/40",
};

const REMINDER_TYPE_LABELS: Record<string, string> = {
  follow_up_due: "Follow-up due",
  follow_up_overdue: "Follow-up overdue",
  blood_results_pending: "Blood results pending",
  scalp_photos_recommended: "Scalp photos recommended",
  clinician_follow_up_recommended: "Clinician follow-up recommended",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function payloadLines(payload: Record<string, unknown>): string[] {
  const dueReason = payload.due_reason;
  const window = payload.suggested_due_window;
  const lines: string[] = [];
  if (Array.isArray(dueReason) && dueReason.length > 0) {
    lines.push(...dueReason.filter((x): x is string => typeof x === "string"));
  }
  if (typeof window === "string" && window.trim()) {
    lines.push(window.trim());
  }
  return lines;
}

export function ReminderInspectionTable() {
  const [reminders, setReminders] = useState<LongevityReminderWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "200");
      const res = await fetch(`/api/longevity/reminders?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Failed to load reminders");
        setReminders([]);
        return;
      }
      setReminders(data.reminders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reminders");
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  if (loading && reminders.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
        Loading reminders…
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-white/80">
          Status:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
          >
            <option value="">All</option>
            <option value="staged">Staged</option>
            <option value="sent">Sent</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => fetchReminders()}
          className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
        >
          Refresh
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
          No reminders match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/60">
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Profile / Intake</th>
                <th className="p-3 font-medium">Due reason / Window</th>
                <th className="p-3 font-medium">Dedupe key</th>
                <th className="p-3 font-medium">Created</th>
                <th className="p-3 font-medium">Cancelled / Sent</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="p-3">
                    <span
                      className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status] ?? "bg-white/10 text-white/70 border-white/20"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-white/90">
                    {REMINDER_TYPE_LABELS[r.reminder_type] ?? r.reminder_type}
                    {r.follow_up_status && (
                      <span className="ml-1 text-white/50">
                        ({r.follow_up_status})
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="space-y-0.5">
                      {r.profile && (
                        <div className="text-white/90">
                          {r.profile.full_name || r.profile.email}
                          {r.profile.full_name && (
                            <span className="text-white/50">
                              {" "}
                              — {r.profile.email}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-white/50 text-xs">
                        Profile: {r.profile_id.slice(0, 8)}… · Intake:{" "}
                        {r.intake_id.slice(0, 8)}…
                        {r.intake?.created_at && (
                          <> · {formatDate(r.intake.created_at)}</>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="max-w-xs p-3">
                    <ul className="list-inside list-disc space-y-0.5 text-xs text-white/80">
                      {payloadLines(r.payload).slice(0, 3).map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                      {payloadLines(r.payload).length === 0 && "—"}
                    </ul>
                  </td>
                  <td className="p-3 font-mono text-xs text-white/50 break-all">
                    {r.dedupe_key}
                  </td>
                  <td className="p-3 text-white/70 text-xs">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="p-3 text-xs text-white/50">
                    {r.cancelled_at && (
                      <div>Cancelled: {formatDate(r.cancelled_at)}</div>
                    )}
                    {r.sent_at && (
                      <div>Sent: {formatDate(r.sent_at)}</div>
                    )}
                    {r.last_error && (
                      <div className="mt-1 text-rose-300">{r.last_error}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-white/50">
        Internal use only. Staged reminders are not sent until outbound
        delivery is enabled.
      </p>
    </div>
  );
}

export function ReminderInspectionPageContent() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Longevity reminders (internal)
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Inspect staged, cancelled, and sent/failed reminders. Patient and
            intake linkage only — no outbound delivery yet.
          </p>
        </div>
        <Link
          href="/portal/trichologist/review"
          className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
        >
          Back to review
        </Link>
      </div>
      <div className="mt-8">
        <ReminderInspectionTable />
      </div>
    </>
  );
}
