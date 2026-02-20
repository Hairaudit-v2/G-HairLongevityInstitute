"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PRIMARY_LABELS: Record<string, string> = {
  hair_loss: "Hair loss",
  scalp_condition: "Scalp condition",
  post_transplant: "Post-transplant support",
  other: "Other / unsure",
};

const DOMAIN_LABELS: Record<string, string> = {
  androgen_exposure: "Androgen Exposure",
  inflammatory_load: "Inflammatory Load",
  thyroid_metabolic: "Thyroid & Metabolic",
  nutrient_sufficiency: "Nutrient Sufficiency",
  stress_regulation: "Stress Regulation",
};

type AuditData = {
  intake: Record<string, unknown>;
  bloodMarkers: Array<{ name: string; value: unknown; unit?: string; referenceRange?: string; flag?: string }>;
  imageSignals: Array<{ filename?: string; signals?: { summary: string; scalp_visibility_proxy?: number; redness_proxy?: number } }>;
  scores: {
    domain_scores: Record<string, number>;
    overall_score: number;
    risk_tier: string;
    explainability: Record<string, string[]>;
  } | null;
  report: { id: string; status: string; signed_url: string | null } | null;
  auditorNotes: Array<{ author: string; note: string; status: string; created_at: string }>;
};

export default function AuditPage({ params }: { params: { intakeId: string } }) {
  const intakeId = params.intakeId;
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changesNote, setChangesNote] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!intakeId) return;
    setLoading(true);
    fetch(`/api/admin/audits/${intakeId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setData(d);
        else setError(d.error || "Failed to load");
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [intakeId]);

  const runAction = async (action: "approve" | "release" | "changes") => {
    if (!data?.report) return;
    setActionLoading(action);
    try {
      const url = `/api/admin/reports/${data.report.id}/${action}`;
      const body = action === "changes" ? { note: changesNote } : {};
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const out = await res.json();
      if (out.ok) {
        const d = await fetch(`/api/admin/audits/${intakeId}`).then((r) => r.json());
        if (d.ok) setData(d);
      } else alert(out.error || "Failed");
    } catch (e) {
      alert("Request failed");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString();
    } catch {
      return s;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F1B2D] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10 text-center text-white/60">Loading...</div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#0F1B2D] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link href="/admin" className="text-sm text-white/60 hover:text-white">← Back to admin</Link>
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            {error || "Not found"}
          </div>
        </div>
      </main>
    );
  }

  const intake = data.intake as { full_name: string; email: string; dob: string; sex: string; country?: string; primary_concern: string; selections?: Record<string, unknown>; notes?: string; created_at: string };
  const report = data.report;
  const canRelease = report?.status === "approved";
  const hasReport = !!report;

  return (
    <main className="min-h-screen bg-[#0F1B2D] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/admin" className="text-sm text-white/60 hover:text-white">← Back to admin</Link>
        <h1 className="mt-4 text-2xl font-semibold text-white">Auditor review</h1>
        <p className="mt-1 text-sm text-white/60">{intake.full_name} — {intake.email}</p>

        <div className="mt-8 space-y-8">
          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-[rgb(198,167,94)]">Intake summary</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <div><span className="text-white/50">DOB:</span> {intake.dob}</div>
              <div><span className="text-white/50">Sex:</span> {intake.sex}</div>
              {intake.country && <div><span className="text-white/50">Country:</span> {intake.country}</div>}
              <div><span className="text-white/50">Primary concern:</span> {PRIMARY_LABELS[intake.primary_concern] || intake.primary_concern}</div>
              <div><span className="text-white/50">Submitted:</span> {formatDate(intake.created_at)}</div>
            </div>
            {intake.selections && Object.keys(intake.selections).length > 0 && (
              <pre className="mt-4 max-h-32 overflow-auto rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white/75">
                {JSON.stringify(intake.selections, null, 2)}
              </pre>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-[rgb(198,167,94)]">Blood markers</h2>
            {data.bloodMarkers.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-2 text-left text-white/70">Marker</th>
                      <th className="py-2 text-left text-white/70">Value</th>
                      <th className="py-2 text-left text-white/70">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bloodMarkers.map((m, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2 text-white">{m.name}</td>
                        <td className="py-2 text-white/90">{String(m.value)}{m.unit ? ` ${m.unit}` : ""}</td>
                        <td className="py-2">{m.flag ? <span className="rounded px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-200">{m.flag}</span> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/50">No blood markers extracted yet. Run the AI pipeline first.</p>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-[rgb(198,167,94)]">Image signals</h2>
            {data.imageSignals.length > 0 ? (
              <div className="mt-4 space-y-3">
                {data.imageSignals.map((img, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
                    <div className="font-medium text-white/90">{img.filename || "Image"}</div>
                    <div className="mt-1 text-white/70">{img.signals?.summary || "—"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/50">No image signals extracted yet.</p>
            )}
          </section>

          {data.scores && (
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-[rgb(198,167,94)]">Domain scores</h2>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="rounded-lg bg-black/20 px-4 py-2">
                  <span className="text-white/50">Overall</span>
                  <span className="ml-2 font-semibold text-white">{data.scores.overall_score}/10</span>
                </div>
                <div className="rounded-lg bg-black/20 px-4 py-2">
                  <span className="text-white/50">Risk tier</span>
                  <span className="ml-2 font-semibold text-white capitalize">{data.scores.risk_tier}</span>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {Object.entries(data.scores.domain_scores || {}).map(([k, v]) => (
                  <div key={k}>
                    <div className="text-sm text-white/80">{DOMAIN_LABELS[k] || k}: {v}/10</div>
                    {data.scores.explainability?.[k]?.length ? (
                      <div className="text-xs text-white/50 ml-4">Drivers: {data.scores.explainability[k].join("; ")}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          {report && (
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-[rgb(198,167,94)]">Draft report</h2>
              <div className="mt-2 text-sm text-white/70">Status: <span className="capitalize">{report.status.replace("_", " ")}</span></div>
              {report.signed_url && (
                <a
                  href={report.signed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-lg bg-[rgb(198,167,94)] px-4 py-2 text-sm font-semibold text-[#0F1B2D] hover:opacity-90"
                >
                  View PDF
                </a>
              )}
            </section>
          )}

          {data.auditorNotes.length > 0 && (
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-[rgb(198,167,94)]">Auditor notes</h2>
              <div className="mt-4 space-y-2">
                {data.auditorNotes.map((n, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
                    <div className="text-white/50 text-xs">{n.author} • {formatDate(n.created_at)} • {n.status}</div>
                    <div className="mt-1 text-white/80">{n.note}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-[rgb(198,167,94)]">Actions</h2>
            {!hasReport ? (
              <p className="mt-4 text-sm text-white/50">Run the AI pipeline from the admin intake detail to generate a draft report.</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-4">
                {report?.status !== "approved" && report?.status !== "released" && (
                  <button
                    type="button"
                    onClick={() => runAction("approve")}
                    disabled={!!actionLoading}
                    className="rounded-lg bg-green-600/80 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    {actionLoading === "approve" ? "..." : "Approve"}
                  </button>
                )}
                {report?.status !== "released" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Changes requested..."
                      value={changesNote}
                      onChange={(e) => setChangesNote(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 w-64"
                    />
                    <button
                      type="button"
                      onClick={() => runAction("changes")}
                      disabled={!!actionLoading}
                      className="rounded-lg bg-amber-600/80 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                    >
                      {actionLoading === "changes" ? "..." : "Request changes"}
                    </button>
                  </div>
                )}
                {canRelease && (
                  <button
                    type="button"
                    onClick={() => runAction("release")}
                    disabled={!!actionLoading}
                    className="rounded-lg bg-[rgb(198,167,94)] px-4 py-2 text-sm font-semibold text-[#0F1B2D] hover:opacity-90 disabled:opacity-50"
                  >
                    {actionLoading === "release" ? "..." : "Release to patient"}
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
