"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PortalSignOut } from "@/components/longevity/PortalSignOut";
import { REVIEW_OUTCOME } from "@/lib/longevity/reviewConstants";
import type { ReviewComplexityResult } from "@/lib/longevity/reviewComplexity";
import type { InterpretedMarker } from "@/lib/longevity/bloodInterpretation";
import type { MarkerTrendRow } from "@/lib/longevity/bloodMarkerTrends";
import { getBloodMarkerOptionsByCategory } from "@/lib/longevity/bloodMarkerOptions";
import { getMarkerDefinition, getDefaultUnit } from "@/lib/longevity/bloodMarkerRegistry";
import type { ClinicalInsights } from "@/lib/longevity/clinicalInsights";
import type { CarePlanOutput } from "@/lib/longevity/carePlan";

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
  blood_results?: (InterpretedMarker & { id: string })[];
  blood_markers?: BloodMarkerRaw[];
  blood_marker_extraction_drafts?: BloodMarkerExtractionDraft[];
  case_comparison?: CaseComparisonResult | null;
  blood_request?: { id: string; status: string } | null;
  marker_trends?: MarkerTrendRow[];
  clinical_insights?: ClinicalInsights;
  care_plan?: CarePlanOutput | null;
};

export type BloodMarkerRaw = {
  id: string;
  marker_name: string;
  value: number;
  unit: string | null;
  reference_low: number | null;
  reference_high: number | null;
  collected_at: string | null;
  lab_name: string | null;
  blood_request_id: string | null;
};

export type BloodMarkerExtractionDraft = {
  id: string;
  marker_name: string;
  display_name: string;
  raw_marker_name: string | null;
  value: number;
  unit: string | null;
  reference_low: number | null;
  reference_high: number | null;
  raw_reference_range: string | null;
  confidence: number | null;
  source_filename: string | null;
  extracted_at: string;
};

export type CaseComparisonResult = {
  previousIntake: {
    id: string;
    created_at: string;
    review_outcome: string | null;
  } | null;
  improvedAreas: string[];
  worsenedAreas: string[];
  persistentDrivers: string[];
  newConcerns: string[];
  suggestedReviewFocus: string[];
  patientSummary: {
    whatHasImproved: string[];
    stillNeedsFollowUp: string[];
    nextStepMayBe: string[];
  };
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

const BLOOD_STATUS_STYLE: Record<InterpretedMarker["status"], string> = {
  optimal: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  normal: "bg-white/10 text-white/80 border-white/20",
  low: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  high: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  critical: "bg-red-500/20 text-red-200 border-red-500/40",
  unknown: "bg-white/10 text-white/50 border-white/10",
};

function BloodResultRow({
  marker,
  onEdit,
}: {
  marker: InterpretedMarker & { id: string };
  onEdit?: (id: string) => void;
}) {
  const statusStyle = BLOOD_STATUS_STYLE[marker.status];
  const valueStr = marker.unit ? `${marker.value} ${marker.unit}` : String(marker.value);
  return (
    <tr className="border-b border-white/5 text-white/90">
      <td className="px-3 py-2 font-medium">{marker.marker}</td>
      <td className="px-3 py-2">{valueStr}</td>
      <td className="px-3 py-2">
        <span className={`inline-flex rounded border px-1.5 py-0.5 text-xs capitalize ${statusStyle}`}>
          {marker.status}
        </span>
      </td>
      <td className="px-3 py-2">
        {marker.clinical_flag ? (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-amber-500/50 bg-amber-500/20 text-[10px] font-medium text-amber-200" title={marker.clinical_flag === "Fe" ? "Iron" : marker.clinical_flag === "T" ? "Thyroid" : marker.clinical_flag === "A" ? "Androgen" : marker.clinical_flag === "⊕" ? "Inflammatory" : "Stress"}>
            {marker.clinical_flag}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="max-w-xs px-3 py-2 text-xs text-white/70">{marker.explanation}</td>
      {onEdit && (
        <td className="px-3 py-2">
          <button
            type="button"
            onClick={() => onEdit(marker.id)}
            className="text-xs text-[rgb(var(--gold))] hover:underline"
          >
            Edit
          </button>
        </td>
      )}
    </tr>
  );
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
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);
  const [addMarkerForm, setAddMarkerForm] = useState({
    marker_key: "",
    marker_other: "",
    value: "",
    unit: "",
    reference_low: "",
    reference_high: "",
    collected_at: "",
    lab_name: "",
    blood_request_id: "",
  });

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
        blood_results: data.blood_results ?? undefined,
        blood_markers: data.blood_markers ?? undefined,
        blood_marker_extraction_drafts: data.blood_marker_extraction_drafts ?? undefined,
        case_comparison: data.case_comparison ?? null,
        blood_request: data.blood_request ?? null,
        marker_trends: data.marker_trends ?? undefined,
        clinical_insights: data.clinical_insights ?? undefined,
        care_plan: data.care_plan ?? null,
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

  const markerOptionsByCategory = useMemo(() => getBloodMarkerOptionsByCategory(), []);

  const addBloodMarker = useCallback(async () => {
    if (!selectedId || !caseDetail) return;
    const markerName =
      addMarkerForm.marker_key === "__other__"
        ? addMarkerForm.marker_other.trim()
        : addMarkerForm.marker_key;
    const valueNum = Number(addMarkerForm.value);
    if (!markerName || !Number.isFinite(valueNum)) {
      setActionError("Select a marker (or enter Other) and enter a numeric value.");
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/blood-markers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          intake_id: selectedId,
          marker_name: markerName,
          value: valueNum,
          unit: addMarkerForm.unit.trim() || undefined,
          reference_low: addMarkerForm.reference_low.trim() ? Number(addMarkerForm.reference_low) : undefined,
          reference_high: addMarkerForm.reference_high.trim() ? Number(addMarkerForm.reference_high) : undefined,
          collected_at: addMarkerForm.collected_at.trim() || undefined,
          lab_name: addMarkerForm.lab_name.trim() || undefined,
          blood_request_id: addMarkerForm.blood_request_id.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Failed to add marker");
        return;
      }
      setAddMarkerForm({
        marker_key: "",
        marker_other: "",
        value: "",
        unit: "",
        reference_low: "",
        reference_high: "",
        collected_at: "",
        lab_name: "",
        blood_request_id: "",
      });
      fetchCase(selectedId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to add marker");
    } finally {
      setActionLoading(false);
    }
  }, [selectedId, caseDetail, addMarkerForm, fetchCase]);

  const runBloodMarkerExtraction = useCallback(async () => {
    if (!selectedId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/blood-marker-extractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ intake_id: selectedId }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Failed to extract blood markers");
        return;
      }
      await fetchCase(selectedId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to extract blood markers");
    } finally {
      setActionLoading(false);
    }
  }, [selectedId, fetchCase]);

  const reviewExtractionDraft = useCallback(async (draftId: string, action: "apply" | "dismiss") => {
    if (!selectedId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/longevity/review/blood-marker-extractions/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? `Failed to ${action} extracted draft`);
        return;
      }
      await fetchCase(selectedId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : `Failed to ${action} extracted draft`);
    } finally {
      setActionLoading(false);
    }
  }, [selectedId, fetchCase]);

  const [editMarkerForm, setEditMarkerForm] = useState<BloodMarkerRaw | null>(null);
  useEffect(() => {
    if (editingMarkerId && caseDetail?.blood_markers) {
      const raw = caseDetail.blood_markers.find((m) => m.id === editingMarkerId);
      setEditMarkerForm(raw ? { ...raw } : null);
    } else {
      setEditMarkerForm(null);
    }
  }, [editingMarkerId, caseDetail?.blood_markers]);

  const saveEditMarker = useCallback(async () => {
    if (!editingMarkerId || !editMarkerForm) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/longevity/review/blood-markers/${editingMarkerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          marker_name: editMarkerForm.marker_name,
          value: editMarkerForm.value,
          unit: editMarkerForm.unit || null,
          reference_low: editMarkerForm.reference_low,
          reference_high: editMarkerForm.reference_high,
          collected_at: editMarkerForm.collected_at,
          lab_name: editMarkerForm.lab_name,
          blood_request_id: editMarkerForm.blood_request_id,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Failed to update marker");
        return;
      }
      setEditingMarkerId(null);
      setEditMarkerForm(null);
      if (selectedId) fetchCase(selectedId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to update marker");
    } finally {
      setActionLoading(false);
    }
  }, [editingMarkerId, editMarkerForm, selectedId, fetchCase]);

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
              {(() => {
                const hasBloodUploadDocument = caseDetail.documents.some((doc) => doc.doc_type === "blood_test_upload");
                const extractionDrafts = caseDetail.blood_marker_extraction_drafts ?? [];
                return (
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

                <h3 className="mt-6 text-sm font-medium text-white/90">Extracted blood marker drafts</h3>
                <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-white/60">
                      Reuses the existing OCR/PDF blood extraction flow. Drafts stay internal until you apply them.
                    </p>
                    <button
                      type="button"
                      onClick={runBloodMarkerExtraction}
                      disabled={actionLoading || !hasBloodUploadDocument}
                      className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      {extractionDrafts.length > 0 ? "Re-run extraction" : "Extract from uploaded blood results"}
                    </button>
                  </div>
                  {!hasBloodUploadDocument ? (
                    <p className="mt-3 text-sm text-white/50">Upload a `blood_test_upload` document before running extraction.</p>
                  ) : extractionDrafts.length === 0 ? (
                    <p className="mt-3 text-sm text-white/50">No pending extracted drafts yet.</p>
                  ) : (
                    <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-left text-white/70">
                            <th className="px-3 py-2 font-medium">Marker</th>
                            <th className="px-3 py-2 font-medium">Value</th>
                            <th className="px-3 py-2 font-medium">Reference</th>
                            <th className="px-3 py-2 font-medium">Confidence</th>
                            <th className="px-3 py-2 font-medium">Source</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extractionDrafts.map((draft) => (
                            <tr key={draft.id} className="border-b border-white/5 text-white/90">
                              <td className="px-3 py-2">
                                <div className="font-medium">{draft.display_name}</div>
                                {draft.raw_marker_name && draft.raw_marker_name !== draft.display_name && (
                                  <div className="text-xs text-white/50">Extracted as {draft.raw_marker_name}</div>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {draft.unit ? `${draft.value} ${draft.unit}` : draft.value}
                              </td>
                              <td className="px-3 py-2 text-white/70">
                                {draft.raw_reference_range
                                  ? draft.raw_reference_range
                                  : draft.reference_low != null || draft.reference_high != null
                                    ? `${draft.reference_low ?? "—"} - ${draft.reference_high ?? "—"}`
                                    : "—"}
                              </td>
                              <td className="px-3 py-2 text-white/70">
                                {draft.confidence != null ? `${Math.round(draft.confidence * 100)}%` : "—"}
                              </td>
                              <td className="px-3 py-2 text-xs text-white/60">
                                <div>{draft.source_filename ?? "Uploaded document"}</div>
                                <div>{new Date(draft.extracted_at).toLocaleString()}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => reviewExtractionDraft(draft.id, "apply")}
                                    disabled={actionLoading}
                                    className="rounded border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-2.5 py-1 text-xs text-white hover:bg-[rgb(var(--gold))]/20 disabled:opacity-50"
                                  >
                                    Apply
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => reviewExtractionDraft(draft.id, "dismiss")}
                                    disabled={actionLoading}
                                    className="rounded border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-50"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <h3 className="mt-6 text-sm font-medium text-white/90">Change since previous review</h3>
                {!caseDetail.case_comparison?.previousIntake ? (
                  <p className="mt-2 text-sm text-white/50">No previous submitted intake available for comparison yet.</p>
                ) : (
                  <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-white/50">
                      Compared with intake from {new Date(caseDetail.case_comparison.previousIntake.created_at).toLocaleDateString()}.
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-emerald-200/80">Improved areas</h4>
                        {caseDetail.case_comparison.improvedAreas.length === 0 ? (
                          <p className="mt-2 text-sm text-white/50">No clear improvements detected yet.</p>
                        ) : (
                          <ul className="mt-2 space-y-1 text-sm text-white/85">
                            {caseDetail.case_comparison.improvedAreas.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-amber-200/80">Needs attention</h4>
                        {caseDetail.case_comparison.worsenedAreas.length === 0 && caseDetail.case_comparison.newConcerns.length === 0 ? (
                          <p className="mt-2 text-sm text-white/50">No newly worsened areas flagged.</p>
                        ) : (
                          <ul className="mt-2 space-y-1 text-sm text-white/85">
                            {[...caseDetail.case_comparison.worsenedAreas, ...caseDetail.case_comparison.newConcerns].map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-white/50">Persistent drivers</h4>
                        {caseDetail.case_comparison.persistentDrivers.length === 0 ? (
                          <p className="mt-2 text-sm text-white/50">None identified across both reviews.</p>
                        ) : (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {caseDetail.case_comparison.persistentDrivers.map((item) => (
                              <span key={item} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/80">
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-white/50">Suggested review focus</h4>
                        {caseDetail.case_comparison.suggestedReviewFocus.length === 0 ? (
                          <p className="mt-2 text-sm text-white/50">No additional comparison-driven focus items.</p>
                        ) : (
                          <ul className="mt-2 space-y-1 text-sm text-white/85">
                            {caseDetail.case_comparison.suggestedReviewFocus.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    </div>
                  )}

                {caseDetail.care_plan && (
                  <div className="mt-6 rounded-lg border border-[rgb(var(--gold))]/30 bg-[rgb(var(--gold))]/5 p-4">
                    <h3 className="text-sm font-medium text-white/90">Recommended next steps</h3>
                    {caseDetail.care_plan.nextStepRecommendations.length === 0 ? (
                      <p className="mt-2 text-xs text-white/50">No specific next steps from the care plan engine.</p>
                    ) : (
                      <ul className="mt-2 space-y-1.5 text-sm text-white/85">
                        {caseDetail.care_plan.nextStepRecommendations.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    )}
                    {caseDetail.care_plan.repeatBloodsConsideration.length > 0 && (
                      <p className="mt-3 text-xs text-white/60">
                        Repeat bloods: {caseDetail.care_plan.repeatBloodsConsideration.join(" ")}
                      </p>
                    )}
                    {caseDetail.care_plan.followUpTimingSuggestion && (
                      <p className="mt-2 text-xs text-[rgb(var(--gold))]/90">
                        Timing: {caseDetail.care_plan.followUpTimingSuggestion}
                      </p>
                    )}
                    {(caseDetail.care_plan.scalpPhotoFollowUpNeeded || caseDetail.care_plan.gpFollowUpSuggested) && (
                      <p className="mt-2 text-xs text-white/50">
                        {caseDetail.care_plan.scalpPhotoFollowUpNeeded && "Scalp photo follow-up suggested. "}
                        {caseDetail.care_plan.gpFollowUpSuggested && "GP follow-up suggested."}
                      </p>
                    )}
                  </div>
                )}

                <h3 className="mt-6 text-sm font-medium text-white/90">Add blood marker</h3>
                <div className="mt-2 grid gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="text-xs text-white/60">
                    Core hair markers are shown first for common trichology workups. Additional markers are available below when needed.
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                      <select
                        value={addMarkerForm.marker_key}
                        onChange={(e) => {
                          const key = e.target.value;
                          const defaultUnit = key && key !== "__other__" ? getDefaultUnit(key) : "";
                          setAddMarkerForm((f) => ({
                            ...f,
                            marker_key: key,
                            marker_other: key === "__other__" ? f.marker_other : "",
                            unit: defaultUnit || f.unit,
                          }));
                        }}
                        className="w-full rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                      >
                        <option value="">Choose marker…</option>
                        {markerOptionsByCategory.map((grp) => (
                          <optgroup key={grp.category} label={grp.category}>
                            {grp.options.map((opt) => (
                              <option key={opt.key} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                        <option value="__other__">Other (free text)</option>
                      </select>
                      {addMarkerForm.marker_key === "__other__" && (
                        <input
                          type="text"
                          placeholder="Enter marker name"
                          value={addMarkerForm.marker_other}
                          onChange={(e) => setAddMarkerForm((f) => ({ ...f, marker_other: e.target.value }))}
                          className="mt-1.5 w-full rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                        />
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Value"
                      value={addMarkerForm.value}
                      onChange={(e) => setAddMarkerForm((f) => ({ ...f, value: e.target.value }))}
                      className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={addMarkerForm.unit}
                      onChange={(e) => setAddMarkerForm((f) => ({ ...f, unit: e.target.value }))}
                      className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Lab name"
                      value={addMarkerForm.lab_name}
                      onChange={(e) => setAddMarkerForm((f) => ({ ...f, lab_name: e.target.value }))}
                      className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <input
                      type="text"
                      placeholder="Ref low"
                      value={addMarkerForm.reference_low}
                      onChange={(e) => setAddMarkerForm((f) => ({ ...f, reference_low: e.target.value }))}
                      className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Ref high"
                      value={addMarkerForm.reference_high}
                      onChange={(e) => setAddMarkerForm((f) => ({ ...f, reference_high: e.target.value }))}
                      className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Collected at (ISO date)"
                      value={addMarkerForm.collected_at}
                      onChange={(e) => setAddMarkerForm((f) => ({ ...f, collected_at: e.target.value }))}
                      className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                    />
                    {caseDetail.blood_request && (
                      <select
                        value={addMarkerForm.blood_request_id}
                        onChange={(e) => setAddMarkerForm((f) => ({ ...f, blood_request_id: e.target.value }))}
                        className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                      >
                        <option value="">No blood request link</option>
                        <option value={caseDetail.blood_request.id}>
                          Blood request ({caseDetail.blood_request.status})
                        </option>
                      </select>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addBloodMarker}
                    disabled={actionLoading}
                    className="w-fit rounded border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-3 py-1.5 text-sm text-white hover:bg-[rgb(var(--gold))]/20 disabled:opacity-50"
                  >
                    Add marker
                  </button>
                </div>

                <h3 className="mt-6 text-sm font-medium text-white/90">Blood Results Summary</h3>
                {!caseDetail.blood_results || caseDetail.blood_results.length === 0 ? (
                  <p className="mt-2 text-sm text-white/50">No structured blood results for this intake.</p>
                ) : (
                  <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-left text-white/70">
                          <th className="px-3 py-2 font-medium">Marker</th>
                          <th className="px-3 py-2 font-medium">Value</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2 font-medium">Flag</th>
                          <th className="px-3 py-2 font-medium">Explanation</th>
                          <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {caseDetail.blood_results.map((m, i) => (
                          <BloodResultRow key={m.id} marker={m} onEdit={setEditingMarkerId} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {editingMarkerId && editMarkerForm && (
                  <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <h4 className="text-sm font-medium text-white/90">Edit marker</h4>
                    <p className="mt-1 text-xs text-white/60">
                      Core hair markers are shown first for common trichology workups. Additional markers are available below when needed.
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <select
                          value={getMarkerDefinition(editMarkerForm.marker_name)?.key ?? "__other__"}
                          onChange={(e) => {
                            const key = e.target.value;
                            setEditMarkerForm((f) =>
                              f
                                ? {
                                    ...f,
                                    marker_name: key === "__other__" ? f.marker_name : key,
                                    unit: key !== "__other__" && !f.unit ? getDefaultUnit(key) : f.unit,
                                  }
                                : f
                            );
                          }}
                          className="w-full rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                        >
                          {markerOptionsByCategory.map((grp) => (
                            <optgroup key={grp.category} label={grp.category}>
                              {grp.options.map((opt) => (
                                <option key={opt.key} value={opt.key}>
                                  {opt.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                          <option value="__other__">Other (free text)</option>
                        </select>
                        {(getMarkerDefinition(editMarkerForm.marker_name)?.key ?? "__other__") === "__other__" && (
                          <input
                            type="text"
                            placeholder="Marker name"
                            value={editMarkerForm.marker_name}
                            onChange={(e) => setEditMarkerForm((f) => (f ? { ...f, marker_name: e.target.value } : f))}
                            className="mt-1.5 w-full rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                          />
                        )}
                      </div>
                      <input
                        type="number"
                        placeholder="Value"
                        value={editMarkerForm.value}
                        onChange={(e) => setEditMarkerForm((f) => (f ? { ...f, value: Number(e.target.value) } : f))}
                        className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={editMarkerForm.unit ?? ""}
                        onChange={(e) => setEditMarkerForm((f) => (f ? { ...f, unit: e.target.value || null } : f))}
                        className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Lab name"
                        value={editMarkerForm.lab_name ?? ""}
                        onChange={(e) => setEditMarkerForm((f) => (f ? { ...f, lab_name: e.target.value || null } : f))}
                        className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Ref low"
                        value={editMarkerForm.reference_low ?? ""}
                        onChange={(e) => setEditMarkerForm((f) => (f ? { ...f, reference_low: e.target.value === "" ? null : Number(e.target.value) } : f))}
                        className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Ref high"
                        value={editMarkerForm.reference_high ?? ""}
                        onChange={(e) => setEditMarkerForm((f) => (f ? { ...f, reference_high: e.target.value === "" ? null : Number(e.target.value) } : f))}
                        className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Collected at"
                        value={editMarkerForm.collected_at ?? ""}
                        onChange={(e) => setEditMarkerForm((f) => (f ? { ...f, collected_at: e.target.value || null } : f))}
                        className="rounded border border-white/20 bg-black/20 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={saveEditMarker}
                        disabled={actionLoading}
                        className="rounded border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-3 py-1.5 text-sm text-white hover:bg-[rgb(var(--gold))]/20 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingMarkerId(null); setEditMarkerForm(null); }}
                        className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <h3 className="mt-6 text-sm font-medium text-white/90">Marker trends (previous comparison)</h3>
                {!caseDetail.marker_trends || caseDetail.marker_trends.length === 0 ? (
                  <p className="mt-2 text-sm text-white/50">No trend data for this intake (single set of results or no previous values).</p>
                ) : (
                  <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-left text-white/70">
                          <th className="px-3 py-2 font-medium">Marker</th>
                          <th className="px-3 py-2 font-medium">Current</th>
                          <th className="px-3 py-2 font-medium">Previous</th>
                          <th className="px-3 py-2 font-medium">Direction</th>
                          <th className="px-3 py-2 font-medium">Current date</th>
                          <th className="px-3 py-2 font-medium">Previous date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {caseDetail.marker_trends.map((row) => (
                          <tr key={row.markerKey} className="border-b border-white/5 text-white/90">
                            <td className="px-3 py-2 font-medium">{row.displayName}</td>
                            <td className="px-3 py-2">
                              {row.current.unit ? `${row.current.value} ${row.current.unit}` : row.current.value}
                            </td>
                            <td className="px-3 py-2">
                              {row.previous
                                ? (row.previous.unit ? `${row.previous.value} ${row.previous.unit}` : row.previous.value)
                                : "—"}
                            </td>
                            <td className="px-3 py-2">
                              {row.direction === "up" && <span className="text-amber-300">↑ up</span>}
                              {row.direction === "down" && <span className="text-sky-300">↓ down</span>}
                              {row.direction === "stable" && <span className="text-white/60">→ stable</span>}
                              {row.direction === null && <span className="text-white/40">—</span>}
                            </td>
                            <td className="px-3 py-2 text-white/70">
                              {row.current.collected_at
                                ? new Date(row.current.collected_at).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="px-3 py-2 text-white/70">
                              {row.previous?.collected_at
                                ? new Date(row.previous.collected_at).toLocaleDateString()
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <h3 className="mt-6 text-sm font-medium text-white/90">Clinical insights</h3>
                {!caseDetail.clinical_insights ? (
                  <p className="mt-2 text-sm text-white/50">No structured insights yet.</p>
                ) : (
                  <div className="mt-2 space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
                    {caseDetail.clinical_insights.clinicianInsights.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-white/50">Clinician summary</h4>
                        <ul className="mt-2 space-y-1 text-sm text-white/85">
                          {caseDetail.clinical_insights.clinicianInsights.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {caseDetail.clinical_insights.activeDrivers.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-white/50">Active drivers</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {caseDetail.clinical_insights.activeDrivers.map((item) => (
                            <span key={item} className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-100">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {caseDetail.clinical_insights.improvedAreas.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-white/50">Improved areas</h4>
                        <ul className="mt-2 space-y-1 text-sm text-emerald-200">
                          {caseDetail.clinical_insights.improvedAreas.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {caseDetail.clinical_insights.followUpConsiderations.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-white/50">Follow-up considerations</h4>
                        <ul className="mt-2 space-y-1 text-sm text-white/75">
                          {caseDetail.clinical_insights.followUpConsiderations.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
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
                );
              })()}

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
