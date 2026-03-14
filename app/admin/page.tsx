"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PRIMARY_LABELS: Record<string, string> = {
  hair_loss: "Hair loss",
  scalp_condition: "Scalp condition",
  post_transplant: "Post-transplant support",
  other: "Other / unsure",
};

type IntakeSummary = {
  id: string;
  full_name: string;
  email: string;
  dob: string;
  sex: string;
  country: string | null;
  primary_concern: string;
  created_at: string;
  file_counts: { blood: number; photo: number };
};

type IntakeDetail = IntakeSummary & {
  selections: Record<string, unknown>;
  notes: string | null;
  files: Array<{
    id: string;
    kind: string;
    filename: string;
    storage_path: string;
    signed_url: string | null;
    size_bytes: number | null;
  }>;
};

export default function AdminPage() {
  const [intakes, setIntakes] = useState<IntakeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPrimary, setFilterPrimary] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<IntakeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [runningAi, setRunningAi] = useState(false);
  const [regeneratingReport, setRegeneratingReport] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterPrimary) params.set("primary_concern", filterPrimary);
    if (search.trim()) params.set("search", search.trim());

    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/intakes?${params}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) {
            setIntakes(d.intakes || []);
            setTotal(d.total ?? 0);
            setError(null);
          } else setError(d.error || "Failed to load");
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, search ? 400 : 0);

    return () => clearTimeout(t);
  }, [filterPrimary, search]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setReportUrl(null);
      return;
    }
    setDetailLoading(true);
    setReportUrl(null);
    fetch(`/api/admin/intakes/${selectedId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setDetail(d.intake);
        else setDetail(null);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const handleRunAiPipeline = async () => {
    if (!selectedId) return;
    setRunningAi(true);
    try {
      const res = await fetch(`/api/admin/intakes/${selectedId}/ai/run`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        if (data.reportId) {
          window.location.href = `/audits/${selectedId}`;
        } else {
          alert("AI job queued. Check auditor page when complete.");
        }
      } else {
        alert(data.error || "Failed to run pipeline");
      }
    } catch (e) {
      alert("Failed to run pipeline");
    } finally {
      setRunningAi(false);
    }
  };

  const handleRegenerateReport = async () => {
    if (!selectedId) return;
    setRegeneratingReport(true);
    try {
      const res = await fetch(`/api/admin/intakes/${selectedId}/report/regenerate`, { method: "POST" });
      const data = await res.json();
      if (data.ok && data.signedUrl) {
        window.open(data.signedUrl, "_blank");
        alert(`Report regenerated with ${data.markersIncluded ?? 0} blood markers.`);
      } else {
        alert(data.error || "Failed to regenerate. Run AI pipeline first to extract blood markers.");
      }
    } catch (e) {
      alert("Failed to regenerate report");
    } finally {
      setRegeneratingReport(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedId) return;
    setGeneratingReport(true);
    try {
      const res = await fetch(`/api/admin/intakes/${selectedId}/report`, { method: "POST" });
      const data = await res.json();
      if (data.ok && data.signedUrl) {
        setReportUrl(data.signedUrl);
        window.open(data.signedUrl, "_blank");
      } else {
        alert(data.error || "Failed to generate report");
      }
    } catch (e) {
      alert("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString();
    } catch {
      return s;
    }
  };

  return (
    <main className="min-h-screen bg-[#0F1B2D] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-white/60 hover:text-white">
                ← Back to site
              </Link>
              <Link href="/admin/doctors" className="text-sm text-white/60 hover:text-white">
                Doctors
              </Link>
              <Link href="/admin/referrals" className="text-sm text-white/60 hover:text-white">
                Referrals
              </Link>
            </div>
            <h1 className="mt-2 text-2xl font-semibold">Admin — Intakes</h1>
            <p className="mt-1 text-sm text-white/60">
              View and review diagnostic intake submissions.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40 w-64"
          />
          <select
            value={filterPrimary}
            onChange={(e) => setFilterPrimary(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
          >
            <option value="">All concerns</option>
            <option value="hair_loss">Hair loss</option>
            <option value="scalp_condition">Scalp condition</option>
            <option value="post_transplant">Post-transplant</option>
            <option value="other">Other</option>
          </select>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-10 text-white/60">Loading...</div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* List */}
            <div>
              <div className="text-sm text-white/60">
                {total} intake{total !== 1 ? "s" : ""}
              </div>
              <div className="mt-4 space-y-2">
                {intakes.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setSelectedId(i.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedId === i.id
                        ? "border-[rgb(198,167,94)] bg-[rgba(198,167,94,0.1)]"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-white">{i.full_name}</div>
                        <div className="mt-1 text-sm text-white/60">{i.email}</div>
                        <div className="mt-1 text-xs text-white/50">
                          {PRIMARY_LABELS[i.primary_concern] || i.primary_concern} • {formatDate(i.created_at)}
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs text-white/50">
                        <span>{i.file_counts.blood} blood</span>
                        <span>{i.file_counts.photo} photo</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {intakes.length === 0 && !loading && (
                <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
                  No intakes found.
                </div>
              )}
            </div>

            {/* Detail */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              {selectedId ? (
                detailLoading ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
                    Loading...
                  </div>
                ) : detail ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <h2 className="text-lg font-semibold text-white">{detail.full_name}</h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/audits/${selectedId}`}
                          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                        >
                          Auditor review
                        </Link>
                        <button
                          type="button"
                          onClick={handleRunAiPipeline}
                          disabled={runningAi}
                          className="rounded-lg bg-indigo-600/80 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
                        >
                          {runningAi ? "Running..." : "Run AI pipeline"}
                        </button>
                        <button
                          type="button"
                          onClick={handleRegenerateReport}
                          disabled={regeneratingReport}
                          className="rounded-lg border border-amber-500/50 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30 disabled:opacity-50"
                        >
                          {regeneratingReport ? "Regenerating..." : "Regenerate report (from extraction)"}
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerateReport}
                          disabled={generatingReport}
                          className="rounded-lg bg-[rgb(198,167,94)] px-4 py-2 text-sm font-semibold text-[#0F1B2D] hover:opacity-90 disabled:opacity-50"
                        >
                          {generatingReport ? "Generating..." : "Generate PDF Report"}
                        </button>
                        {reportUrl && (
                          <a
                            href={reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[rgb(198,167,94)] hover:underline"
                          >
                            View report
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedId(null)}
                          className="text-sm text-white/60 hover:text-white"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <span className="text-white/50">Email:</span>{" "}
                        <a href={`mailto:${detail.email}`} className="text-[rgb(198,167,94)] hover:underline">
                          {detail.email}
                        </a>
                      </div>
                      <div><span className="text-white/50">DOB:</span> {detail.dob}</div>
                      <div><span className="text-white/50">Sex:</span> {detail.sex}</div>
                      {detail.country && (
                        <div><span className="text-white/50">Country:</span> {detail.country}</div>
                      )}
                      <div>
                        <span className="text-white/50">Primary concern:</span>{" "}
                        {PRIMARY_LABELS[detail.primary_concern] || detail.primary_concern}
                      </div>
                      <div><span className="text-white/50">Submitted:</span> {formatDate(detail.created_at)}</div>
                    </div>

                    {Object.keys(detail.selections || {}).length > 0 && (
                      <div className="mt-6">
                        <div className="text-sm font-medium text-white/80">Selections</div>
                        <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-white/10 bg-black/20 p-4 text-xs text-white/75">
                          {JSON.stringify(detail.selections, null, 2)}
                        </pre>
                      </div>
                    )}

                    {detail.notes && (
                      <div className="mt-6">
                        <div className="text-sm font-medium text-white/80">Notes</div>
                        <div className="mt-2 rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-white/75 whitespace-pre-wrap">
                          {detail.notes}
                        </div>
                      </div>
                    )}

                    {detail.files && detail.files.length > 0 && (
                      <div className="mt-6">
                        <div className="text-sm font-medium text-white/80">Files</div>
                        <div className="mt-3 space-y-2">
                          {detail.files.map((f) => (
                            <div
                              key={f.id}
                              className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3"
                            >
                              <div>
                                <span className="text-xs text-white/50">{f.kind}</span>{" "}
                                <span className="text-sm text-white">{f.filename}</span>
                              </div>
                              {f.signed_url ? (
                                <a
                                  href={f.signed_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg bg-[rgb(198,167,94)] px-3 py-1.5 text-xs font-semibold text-[#0F1B2D] hover:opacity-90"
                                >
                                  View
                                </a>
                              ) : (
                                <span className="text-xs text-white/50">No URL</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
                    Failed to load intake.
                  </div>
                )
              ) : (
                <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-white/50">
                  Select an intake to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
