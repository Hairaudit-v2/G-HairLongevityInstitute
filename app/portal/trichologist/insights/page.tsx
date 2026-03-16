import Link from "next/link";
import { redirect } from "next/navigation";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getBetaEventCounts,
  getBetaDerivedMetrics,
  getBetaRecentEvents,
} from "@/lib/longevity/betaInsights";
import { BETA_EVENT } from "@/lib/longevity/analytics";
import { PortalSignOut } from "@/components/longevity/PortalSignOut";

const EVENT_LABELS: Record<string, string> = {
  [BETA_EVENT.INTAKE_STARTED]: "Intake started",
  [BETA_EVENT.INTAKE_SUBMITTED]: "Intake submitted",
  [BETA_EVENT.DOCUMENT_UPLOADED]: "Document uploaded",
  [BETA_EVENT.PORTAL_VIEWED]: "Portal viewed",
  [BETA_EVENT.SUMMARY_VIEWED]: "Summary viewed",
  [BETA_EVENT.CASE_ASSIGNED]: "Case assigned",
  [BETA_EVENT.NOTE_ADDED]: "Note added",
  [BETA_EVENT.SUMMARY_RELEASED]: "Summary released",
};

function formatEventType(s: string): string {
  return EVENT_LABELS[s] ?? s.replace(/_/g, " ");
}

type PageProps = { searchParams: Promise<{ since?: string }> };

export default async function TrichologistInsightsPage({ searchParams }: PageProps) {
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    redirect("/portal/login?redirect=/portal/trichologist/insights");
  }

  const params = await searchParams;
  const sinceParam = params.since?.toLowerCase().trim() || "30d";
  const since =
    sinceParam === "all"
      ? null
      : sinceParam === "7d"
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const supabase = supabaseAdmin();
  const [counts, derived, recent] = await Promise.all([
    getBetaEventCounts(supabase, { since }),
    getBetaDerivedMetrics(supabase, { since }),
    getBetaRecentEvents(supabase, { since, limit: 50 }),
  ]);

  const periodLabel = sinceParam === "all" ? "All time" : sinceParam === "7d" ? "Last 7 days" : "Last 30 days";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
            Hair Longevity Institute™ — Beta insights
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Beta insights</h1>
          <p className="mt-1 text-sm text-white/60">
            Lightweight usage and conversion signals from beta instrumentation. Internal only.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PortalSignOut />
          <Link href="/portal/trichologist/review" className="text-sm text-white/70 hover:text-white">
            Review workspace
          </Link>
          <Link href="/portal/trichologist/provisioning" className="text-sm text-white/70 hover:text-white">
            Trichologist management
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/50">Period:</span>
        <div className="flex rounded-lg border border-white/20 bg-white/5 p-0.5">
          <Link
            href="/portal/trichologist/insights?since=7d"
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              sinceParam === "7d" ? "bg-white/15 text-white" : "text-white/70 hover:text-white/90"
            }`}
          >
            Last 7 days
          </Link>
          <Link
            href="/portal/trichologist/insights?since=30d"
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              sinceParam === "30d" ? "bg-white/15 text-white" : "text-white/70 hover:text-white/90"
            }`}
          >
            Last 30 days
          </Link>
          <Link
            href="/portal/trichologist/insights?since=all"
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              sinceParam === "all" ? "bg-white/15 text-white" : "text-white/70 hover:text-white/90"
            }`}
          >
            All time
          </Link>
        </div>
        <span className="text-xs text-white/40">({periodLabel})</span>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-white">Event counts</h2>
        <p className="mt-1 text-xs text-white/50">Raw counts per event type in the selected period.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(counts).map(([key, value]) => (
            <div
              key={key}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="text-2xl font-semibold text-white">{value}</div>
              <div className="mt-0.5 text-xs text-white/60">{formatEventType(key)}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Derived metrics</h2>
        <p className="mt-1 text-xs text-white/50">Conversion and backlog signals (best-effort from events).</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xl font-semibold text-white">{derived.conversion_start_submit}%</div>
            <div className="mt-0.5 text-xs text-white/60">Start → Submit conversion</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xl font-semibold text-white">{derived.conversion_submit_released}%</div>
            <div className="mt-0.5 text-xs text-white/60">Submitted → Released</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xl font-semibold text-white">{derived.conversion_released_viewed}%</div>
            <div className="mt-0.5 text-xs text-white/60">Released → Summary viewed</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xl font-semibold text-white">{derived.avg_docs_per_submitted}</div>
            <div className="mt-0.5 text-xs text-white/60">Avg documents per submitted intake</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xl font-semibold text-white">{derived.submitted_not_released}</div>
            <div className="mt-0.5 text-xs text-white/60">Submitted, not yet released</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xl font-semibold text-white">{derived.released_not_viewed}</div>
            <div className="mt-0.5 text-xs text-white/60">Released, not yet viewed (best effort)</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Recent activity</h2>
        <p className="mt-1 text-xs text-white/50">Latest beta events, reverse chronological.</p>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">No events in this period.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-left text-white/70">
                  <th className="px-4 py-2 font-medium">Event</th>
                  <th className="px-4 py-2 font-medium">Time</th>
                  <th className="px-4 py-2 font-medium">Intake</th>
                  <th className="px-4 py-2 font-medium">Profile</th>
                  <th className="px-4 py-2 font-medium">Actor</th>
                  <th className="max-w-[12rem] truncate px-4 py-2 font-medium">Payload</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((evt) => (
                  <tr key={evt.id} className="border-b border-white/5 text-white/90">
                    <td className="px-4 py-2">{formatEventType(evt.event_type)}</td>
                    <td className="px-4 py-2 text-white/70">
                      {new Date(evt.created_at).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="max-w-[8rem] truncate px-4 py-2 font-mono text-xs text-white/60">
                      {evt.intake_id ?? "—"}
                    </td>
                    <td className="max-w-[8rem] truncate px-4 py-2 font-mono text-xs text-white/60">
                      {evt.profile_id ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-white/60">{evt.actor_type ?? "—"}</td>
                    <td className="max-w-[12rem] truncate px-4 py-2 text-xs text-white/50" title={evt.payload_preview}>
                      {evt.payload_preview}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
