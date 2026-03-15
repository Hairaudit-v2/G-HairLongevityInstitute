"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PortalSignOut } from "@/components/longevity/PortalSignOut";
import { REVIEW_OUTCOME } from "@/lib/longevity/reviewConstants";
import type { ReviewComplexityResult } from "@/lib/longevity/reviewComplexity";

const REVIEW_OUTCOME_LABELS: Record<string, string> = {
  [REVIEW_OUTCOME.STANDARD_PATHWAY]: "Standard pathway",
  [REVIEW_OUTCOME.BLOODS_RECOMMENDED]: "Bloods recommended",
  [REVIEW_OUTCOME.REFERRAL_RECOMMENDED]: "Referral recommended",
  [REVIEW_OUTCOME.FOLLOW_UP_SCHEDULED]: "Follow-up scheduled",
  [REVIEW_OUTCOME.OTHER]: "Other",
};

const PRIORITY_BADGE = {
  urgent: "bg-red-500/20 text-red-200 border-red-500/40",
  high: "bg-orange-500/20 text-orange-200 border-orange-500/40",
  normal: "bg-white/10 text-white/70 border-white/20",
  low: "bg-white/10 text-white/60 border-white/20",
} as const;

const COMPLEXITY_BADGE = {
  complex: "bg-purple-500/25 text-purple-200 border-purple-500/50",
  high: "bg-amber-500/25 text-amber-200 border-amber-500/50",
  moderate: "bg-sky-500/20 text-sky-200 border-sky-500/40",
  low: "bg-white/10 text-white/60 border-white/20",
} as const;

function PriorityBadge({ priority }: { priority: string | null }) {
  const p = (priority === "urgent" || priority === "high" || priority === "normal" || priority === "low" ? priority : "normal") as keyof typeof PRIORITY_BADGE;
  const label = p === "urgent" ? "Urgent" : p === "high" ? "High" : p === "low" ? "Low" : "Normal";
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[p]}`}>
      {label}
    </span>
  );
}

function ComplexityBadge({ complexity }: { complexity: ReviewComplexityResult }) {
  const band = complexity.band as keyof typeof COMPLEXITY_BADGE;
  const style = COMPLEXITY_BADGE[band] ?? COMPLEXITY_BADGE.low;
  const label = complexity.band.charAt(0).toUpperCase() + complexity.band.slice(1);
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}
      title={`Score: ${complexity.score}. Drivers: ${complexity.drivers.join(", ") || "—"}`}
    >
      {label} ({complexity.score})
    </span>
  );
}

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
  complexity: ReviewComplexityResult;
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
  complexity?: ReviewComplexityResult;
};

function FlagIcons({ flags }: { flags: ReviewQueueItem["flags"] }) {
  const items: { key: string; on: boolean; label: string }[] = [
    { key: "iron", on: flags.possibleIronRisk, label: "Iron risk" },
    { key: "thyroid", on: flags.possibleThyroidRisk, label: "Thyroid risk" },
    { key: "androgen", on: flags.possibleAndrogenPattern, label: "Androgen pattern" },
    { key: "inflammatory", on: flags.possibleInflammatoryPattern, label: "Inflammatory pattern" },
    { key: "stress", on: flags.possibleStressTrigger, label: "Stress trigger" },
  ];
  return (
    <span className="flex flex-wrap items-center gap-1.5" title={items.filter((i) => i.on).map((i) => i.label).join(", ") || "No flags"}>
      {items.map(({ key, on, label }) => (
        <span
          key={key}
          className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-medium ${on ? "border-amber-500/50 bg-amber-500/20 text-amber-200" : "border-white/10 bg-white/5 text-white/30"}`}
          title={label}
        >
          {key === "iron" && (on ? "Fe" : "—")}
          {key === "thyroid" && (on ? "T" : "—")}
          {key === "androgen" && (on ? "A" : "—")}
          {key === "inflammatory" && (on ? "⊕" : "—")}
          {key === "stress" && (on ? "!" : "—")}
        </span>
      ))}
    </span>
  );
}

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
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterReviewStatus, setFilterReviewStatus] = useState<string>("all");
  const [filterAssignedToMe, setFilterAssignedToMe] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "complexity">("complexity");
  const [outcomeSelect, setOutcomeSelect] = useState<string>("");

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
        complexity: data.complexity ?? undefined,
      });
      if (data.intake.patient_visible_summary) {
        setSummaryText(data.intake.patient_visible_summary);
      }
      setOutcomeSelect(data.intake.review_outcome ?? "");
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

  const unassign = useCallback(async () => {
    if (!selectedId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/unassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ intake_id: selectedId }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Unassign failed");
        return;
      }
      await fetchQueue();
      if (caseDetail) setCaseDetail((prev) => (prev ? { ...prev, intake: { ...prev.intake, ...data.intake } } : null));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Unassign failed");
    } finally {
      setActionLoading(false);
    }
  }, [selectedId, caseDetail, fetchQueue]);

  const setOutcome = useCallback(async () => {
    if (!selectedId || !outcomeSelect) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ intake_id: selectedId, review_outcome: outcomeSelect }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Set outcome failed");
        return;
      }
      if (caseDetail) setCaseDetail((prev) => (prev ? { ...prev, intake: { ...prev.intake, ...data.intake } } : null));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Set outcome failed");
    } finally {
      setActionLoading(false);
    }
  }, [selectedId, outcomeSelect, caseDetail]);

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
          ...(outcomeSelect ? { review_outcome: outcomeSelect } : {}),
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
  }, [selectedId, summaryText, outcomeSelect, fetchQueue]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (filterPriority !== "all") {
      list = list.filter((i) => (i.review_priority ?? "normal") === filterPriority);
    }
    if (filterReviewStatus !== "all") {
      list = list.filter((i) => i.review_status === filterReviewStatus);
    }
    if (filterAssignedToMe) {
      list = list.filter((i) => i.assigned_trichologist_id === trichologistId);
    }
    return list;
  }, [items, filterPriority, filterReviewStatus, filterAssignedToMe, trichologistId]);

  const sortedByPriority = useMemo(() => {
    const order = (a: ReviewQueueItem, b: ReviewQueueItem) => {
      const pa = a.review_priority ?? "normal";
      const pb = b.review_priority ?? "normal";
      const rank = (p: string) => (p === "urgent" ? 4 : p === "high" ? 3 : p === "normal" ? 2 : 1);
      if (rank(pb) !== rank(pa)) return rank(pb) - rank(pa);
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    };
    return [...filteredItems].sort(order);
  }, [filteredItems]);

  const sortedByComplexity = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (b.complexity.score !== a.complexity.score) return b.complexity.score - a.complexity.score;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filteredItems]);

  const displayList = sortBy === "complexity" ? sortedByComplexity : sortedByPriority;
  const highPriority = displayList.filter((i) => i.review_priority === "high" || i.review_priority === "urgent");
  const normalPriority = displayList.filter((i) => i.review_priority === "normal" || i.review_priority === "low");
  const assignedToMe = displayList.filter((i) => i.assigned_trichologist_id === trichologistId);

  const metrics = useMemo(() => {
    const awaiting = items.filter((i) => i.review_status === "human_review_required").length;
    const underReview = items.filter((i) => i.review_status === "under_trichologist_review").length;
    const now = Date.now();
    const ages = items.map((i) => (now - new Date(i.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const avgDays = ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
    return { awaiting, underReview, avgDays };
  }, [items]);

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
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-white/70">{item.id}</span>
        <PriorityBadge priority={item.review_priority} />
        <ComplexityBadge complexity={item.complexity} />
        <span className="text-xs text-white/50">{item.review_status.replace(/_/g, " ")}</span>
      </div>
      <div className="mt-1 text-xs text-white/50">
        {new Date(item.created_at).toLocaleString()}
        {item.triaged_at ? ` · triaged ${new Date(item.triaged_at).toLocaleDateString()}` : ""}
      </div>
      {item.complexity.drivers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 text-xs text-white/60">
          {item.complexity.drivers.slice(0, 4).map((d) => (
            <span key={d} className="rounded bg-white/10 px-1.5 py-0.5">
              {d}
            </span>
          ))}
          {item.complexity.drivers.length > 4 && (
            <span className="text-white/40">+{item.complexity.drivers.length - 4}</span>
          )}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
        <FlagIcons flags={item.flags} />
        <span className="text-xs text-white/50">{flagsSummary(item.flags)}</span>
      </div>
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

      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="text-white/60">Cases awaiting review:</span>
          <span className="font-medium text-white">{metrics.awaiting}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/60">Under review:</span>
          <span className="font-medium text-white">{metrics.underReview}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/60">Avg. age in queue:</span>
          <span className="font-medium text-white">
            {metrics.avgDays < 1
              ? "< 1 day"
              : metrics.avgDays < 2
                ? "1 day"
                : `${metrics.avgDays.toFixed(1)} days`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-sm text-white/70">Filters:</span>
        <label className="flex items-center gap-2 text-sm text-white/80">
          <span className="text-white/50">Priority</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
          >
            <option value="all">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-white/80">
          <span className="text-white/50">Status</span>
          <select
            value={filterReviewStatus}
            onChange={(e) => setFilterReviewStatus(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
          >
            <option value="all">All</option>
            <option value="human_review_required">Awaiting review</option>
            <option value="under_trichologist_review">Under review</option>
            <option value="awaiting_patient_documents">Awaiting documents</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={filterAssignedToMe}
            onChange={(e) => setFilterAssignedToMe(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-[rgb(var(--gold))] focus:ring-[rgb(var(--gold))]"
          />
          <span>Assigned to me</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-white/80">
          <span className="text-white/50">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "priority" | "complexity")}
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
          >
            <option value="complexity">Complexity (high first)</option>
            <option value="priority">Priority then age</option>
          </select>
        </label>
      </div>

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
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">Case: {caseDetail.intake.id}</h2>
                  <PriorityBadge priority={caseDetail.intake.review_priority} />
                  {caseDetail.complexity && (
                    <ComplexityBadge complexity={caseDetail.complexity} />
                  )}
                </div>
                <p className="mt-1 text-xs text-white/50">
                  {caseDetail.intake.review_status.replace(/_/g, " ")} ·{" "}
                  {new Date(caseDetail.intake.created_at).toLocaleString()}
                </p>
                {caseDetail.complexity && caseDetail.complexity.drivers.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-xs font-medium text-white/60">Complexity drivers</h3>
                    <ul className="mt-1 flex flex-wrap gap-1.5 text-xs text-white/80">
                      {caseDetail.complexity.drivers.map((d) => (
                        <li key={d} className="rounded bg-white/10 px-2 py-1">
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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
                    {caseDetail.intake.assigned_trichologist_id === trichologistId ? "Claimed by you" : "Assign to me"}
                  </button>
                  {caseDetail.intake.assigned_trichologist_id === trichologistId && (
                    <button
                      type="button"
                      onClick={unassign}
                      disabled={actionLoading}
                      className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      Unassign
                    </button>
                  )}
                </div>
                <div>
                  <label htmlFor="review-outcome" className="block text-sm font-medium text-white/90">
                    Review outcome
                  </label>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <select
                      id="review-outcome"
                      value={outcomeSelect}
                      onChange={(e) => setOutcomeSelect(e.target.value)}
                      className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                    >
                      <option value="">—</option>
                      {Object.entries(REVIEW_OUTCOME_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={setOutcome}
                      disabled={actionLoading || !outcomeSelect}
                      className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      Set outcome
                    </button>
                  </div>
                  {caseDetail.intake.review_outcome && (
                    <p className="mt-1 text-xs text-white/50">Current: {REVIEW_OUTCOME_LABELS[caseDetail.intake.review_outcome] ?? caseDetail.intake.review_outcome}</p>
                  )}
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
