"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PortalSignOut } from "@/components/longevity/PortalSignOut";

export type ReviewQueueItem = {
  id: string;
  review_status: string;
  review_priority: string | null;
  created_at: string;
  assigned_trichologist_id: string | null;
  triaged_at: string | null;
  triage_version: string | null;
  flags: {
    manualReviewRecommended: boolean;
    bloodsLikelyNeeded: boolean;
    possibleIronRisk: boolean;
    possibleThyroidRisk: boolean;
    possibleHormonalPattern: boolean;
    possibleInflammatoryPattern: boolean;
    possibleAndrogenPattern: boolean;
    possibleStressTrigger: boolean;
    postpartumFlag: boolean;
  };
};

export type CaseDetail = {
  intake: {
    id: string;
    status: string;
    review_status: string;
    review_priority: string | null;
    created_at: string;
    updated_at: string;
    assigned_trichologist_id: string | null;
    patient_visible_summary: string | null;
    review_outcome: string | null;
  };
  questionnaire: {
    schema_version: string;
    responses: Record<string, unknown>;
    updated_at: string | null;
  };
  documents: { id: string; doc_type: string; filename: string | null; created_at: string }[];
  notes: { id: string; body: string; created_at: string }[];
};

function flagsSummary(flags: ReviewQueueItem["flags"]): string {
  const active: string[] = [];
  if (flags.manualReviewRecommended) active.push("Manual review");
  if (flags.bloodsLikelyNeeded) active.push("Bloods likely");
  if (flags.possibleIronRisk) active.push("Iron risk");
  if (flags.possibleThyroidRisk) active.push("Thyroid risk");
  if (flags.possibleHormonalPattern) active.push("Hormonal");
  if (flags.possibleInflammatoryPattern) active.push("Inflammatory");
  if (flags.possibleAndrogenPattern) active.push("Androgen");
  if (flags.possibleStressTrigger) active.push("Stress/trigger");
  if (flags.postpartumFlag) active.push("Postpartum");
  return active.length ? active.join(", ") : "—";
}

export function TrichologistReviewWorkspace({ trichologistId }: { trichologistId: string }) {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/longevity/review/queue", { credentials: "include" });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Failed to load queue");
        setItems([]);
        return;
      }
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load queue");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const fetchCase = useCallback(async (id: string) => {
    setCaseLoading(true);
    setCaseDetail(null);
    setActionError(null);
    setNoteText("");
    setSummaryText("");
    try {
      const res = await fetch(`/api/longevity/review/intakes/${id}`, { credentials: "include" });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Failed to load case");
        return;
      }
      setCaseDetail({
        intake: data.intake,
        questionnaire: data.questionnaire,
        documents: data.documents ?? [],
        notes: data.notes ?? [],
      });
      if (data.intake.patient_visible_summary) {
        setSummaryText(data.intake.patient_visible_summary);
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to load case");
    } finally {
      setCaseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) fetchCase(selectedId);
    else setCaseDetail(null);
  }, [selectedId, fetchCase]);

  const claim = useCallback(async () => {
    if (!selectedId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ intake_id: selectedId }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Claim failed");
        return;
      }
      await fetchQueue();
      if (caseDetail) setCaseDetail((prev) => (prev ? { ...prev, intake: { ...prev.intake, ...data.intake } } : null));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setActionLoading(false);
    }
  }, [selectedId, caseDetail, fetchQueue]);

  const addNote = useCallback(async () => {
    if (!selectedId || !noteText.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ intake_id: selectedId, body: noteText.trim() }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Failed to add note");
        return;
      }
      setNoteText("");
      if (selectedId) fetchCase(selectedId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to add note");
    } finally {
      setActionLoading(false);
    }
  }, [selectedId, noteText, fetchCase]);

  const releaseSummary = useCallback(async () => {
    if (!selectedId || !summaryText.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          intake_id: selectedId,
          patient_visible_summary: summaryText.trim(),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Release failed");
        return;
      }
      await fetchQueue();
      setSelectedId(null);
      setCaseDetail(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Release failed");
    } finally {
      setActionLoading(false);
    }
  }, [selectedId, summaryText, caseDetail, fetchQueue]);

  const highPriority = items.filter((i) => i.review_priority === "high" || i.review_priority === "urgent");
  const normalPriority = items.filter((i) => i.review_priority === "normal" || i.review_priority === "low");
  const assignedToMe = items.filter((i) => i.assigned_trichologist_id === trichologistId);

  const renderCard = (item: ReviewQueueItem) => (
    <button
      type="button"
      key={item.id}
      onClick={() => setSelectedId(item.id)}
      className={`w-full rounded-xl border p-4 text-left transition ${
        selectedId === item.id
          ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/10"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <div className="font-mono text-xs text-white/70">{item.id}</div>
      <div className="mt-1 text-xs text-white/50">
        {new Date(item.created_at).toLocaleString()} · {item.review_status}
        {item.triaged_at ? ` · triaged ${new Date(item.triaged_at).toLocaleDateString()}` : ""}
      </div>
      <div className="mt-2 text-sm text-white/90">{flagsSummary(item.flags)}</div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
            Hair Longevity Institute™ — Trichologist review
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Review workspace</h1>
          <p className="mt-1 text-white/70">Queue and case review. Internal only.</p>
        </div>
        <div className="flex items-center gap-3">
          <PortalSignOut />
          <Link href="/portal" className="text-sm text-white/70 hover:text-white">
            Portal
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-white">High priority</h2>
            <p className="text-xs text-white/50">Oldest first</p>
            <div className="mt-3 space-y-2">
              {loading ? (
                <p className="text-white/50">Loading…</p>
              ) : highPriority.length === 0 ? (
                <p className="text-white/50">None</p>
              ) : (
                highPriority.map(renderCard)
              )}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Normal priority</h2>
            <div className="mt-3 space-y-2">
              {loading ? null : normalPriority.length === 0 ? (
                <p className="text-white/50">None</p>
              ) : (
                normalPriority.map(renderCard)
              )}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white">Assigned to me</h2>
            <div className="mt-3 space-y-2">
              {loading ? null : assignedToMe.length === 0 ? (
                <p className="text-white/50">None</p>
              ) : (
                assignedToMe.map(renderCard)
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {!selectedId ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
              Select a case from the queue
            </div>
          ) : caseLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
              Loading case…
            </div>
          ) : caseDetail ? (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">Case: {caseDetail.intake.id}</h2>
                <p className="mt-1 text-xs text-white/50">
                  {caseDetail.intake.review_status} · {caseDetail.intake.review_priority ?? "—"} ·{" "}
                  {new Date(caseDetail.intake.created_at).toLocaleString()}
                </p>

                <h3 className="mt-6 text-sm font-medium text-white/90">Questionnaire snapshot</h3>
                <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white/80 whitespace-pre-wrap">
                  {JSON.stringify(caseDetail.questionnaire.responses, null, 2)}
                </pre>

                <h3 className="mt-6 text-sm font-medium text-white/90">Uploaded documents</h3>
                {caseDetail.documents.length === 0 ? (
                  <p className="mt-2 text-sm text-white/50">None</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm text-white/80">
                    {caseDetail.documents.map((d) => (
                      <li key={d.id}>
                        {d.filename ?? d.doc_type} · {new Date(d.created_at).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                )}

                <h3 className="mt-6 text-sm font-medium text-white/90">Internal notes</h3>
                {caseDetail.notes.length === 0 ? (
                  <p className="mt-2 text-sm text-white/50">None</p>
                ) : (
                  <ul className="mt-2 space-y-3">
                    {caseDetail.notes.map((n) => (
                      <li key={n.id} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/80">
                        <span className="text-white/50">{new Date(n.created_at).toLocaleString()}</span>
                        <p className="mt-1">{n.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {actionError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {actionError}
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={claim}
                    disabled={actionLoading || caseDetail.intake.assigned_trichologist_id === trichologistId}
                    className="rounded-xl border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-4 py-2 text-sm font-medium text-white hover:bg-[rgb(var(--gold))]/20 disabled:opacity-50"
                  >
                    {caseDetail.intake.assigned_trichologist_id === trichologistId ? "Claimed by you" : "Claim case"}
                  </button>
                </div>

                <div>
                  <label htmlFor="review-note" className="block text-sm font-medium text-white/90">
                    Add internal note
                  </label>
                  <textarea
                    id="review-note"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Internal note (not patient-visible)"
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addNote}
                    disabled={actionLoading || !noteText.trim()}
                    className="mt-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    Add note
                  </button>
                </div>

                <div>
                  <label htmlFor="patient-summary" className="block text-sm font-medium text-white/90">
                    Patient summary (release to patient)
                  </label>
                  <textarea
                    id="patient-summary"
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    placeholder="Summary or next steps to release to patient"
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={releaseSummary}
                    disabled={actionLoading || !summaryText.trim()}
                    className="mt-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    Release patient summary
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
