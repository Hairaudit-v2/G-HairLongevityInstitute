"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CaseTimeline } from "@/components/longevity/CaseTimeline";
import { AdaptiveBloodworkEligibilityPanel } from "@/components/longevity/AdaptiveBloodworkEligibilityPanel";
import { AdaptiveRescoreComparisonPanel } from "@/components/longevity/AdaptiveRescoreComparisonPanel";
import { AdaptiveSuggestedChecksPanel } from "@/components/longevity/AdaptiveSuggestedChecksPanel";
import { ReassessmentStatusPanel } from "@/components/longevity/ReassessmentStatusPanel";
import { FollowUpCadenceCard } from "@/components/longevity/FollowUpCadenceCard";
import { AdaptiveTriagePanel } from "@/components/longevity/AdaptiveTriagePanel";
import { PortalSignOut } from "@/components/longevity/PortalSignOut";
import { REVIEW_OUTCOME } from "@/lib/longevity/reviewConstants";
import {
  BLOOD_TEST_CODES,
  ALL_BLOOD_TEST_CODES,
  type BloodTestCode,
} from "@/lib/longevity/bloodRequestEligibility";
import type { ReviewComplexityResult } from "@/lib/longevity/reviewComplexity";
import type { InterpretedMarker } from "@/lib/longevity/bloodInterpretation";
import type { MarkerTrendRow } from "@/lib/longevity/bloodMarkerTrends";
import { getBloodMarkerOptionsByCategory } from "@/lib/longevity/bloodMarkerOptions";
import { getMarkerDefinition, getDefaultUnit } from "@/lib/longevity/bloodMarkerRegistry";
import type { ClinicalInsights } from "@/lib/longevity/clinicalInsights";
import type { CarePlanOutput } from "@/lib/longevity/carePlan";
import {
  SCALP_IMAGE_COMPARISON_STATUS,
  type ScalpImageComparisonSummary,
  type ScalpImageComparisonStatus,
} from "@/lib/longevity/scalpImageComparisons";
import {
  SCALP_FINDING_CONFIDENCE,
  SCALP_VISUAL_LIKELIHOOD,
  type ConfirmedScalpImageFindings,
  type ScalpFindingConfidence,
  type ScalpVisualLikelihood,
} from "@/lib/longevity/scalpImageComparison";
import type { TreatmentResponseComparison } from "@/lib/longevity/treatmentResponse";
import {
  SCALP_IMAGE_QUALITY,
  SCALP_SEVERITY_ESTIMATE,
} from "@/lib/longevity/scalpImageAnalysis";
import type { FollowUpCadenceOutput } from "@/lib/longevity/followUpCadence";
import { LONGEVITY_DOC_TYPE, getPatientDocTypeLabel } from "@/lib/longevity/documentTypes";
import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";
import {
  deriveAdaptiveClinicianSuggestions,
  deriveAdaptiveBloodworkEligibilitySupport,
  type AdaptiveRescoreComparison,
} from "@/lib/longevity/intake";
import { buildGpLetterAdaptivePrefillPayload } from "@/lib/longevity/gpLetterAdaptiveAdapter";
import type { ReassessmentSummary } from "@/lib/longevity/reassessmentSummary";

const REVIEW_OUTCOME_LABELS: Record<string, string> = {
  [REVIEW_OUTCOME.REVIEW_COMPLETE]: "Review complete",
  [REVIEW_OUTCOME.AWAITING_PATIENT_DOCUMENTS]: "Awaiting patient documents",
  [REVIEW_OUTCOME.FOLLOW_UP_RECOMMENDED]: "Follow-up recommended",
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
    last_reviewed_at: string | null;
    patient_visible_released_at: string | null;
    assigned_trichologist_id: string | null;
    assigned_at: string | null;
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
  /** Snapshot of what was released to the patient (for traceability and review). */
  released_summary_snapshot?: {
    id: string;
    summary_text: string;
    released_at: string;
    released_by_trichologist_id: string | null;
  } | null;
  /** Reminder emails sent for this intake (for case timeline). */
  reminder_sents?: { sent_at: string; reminder_type: string }[];
  complexity?: ReviewComplexityResult;
  blood_results?: (InterpretedMarker & { id: string })[];
  blood_markers?: BloodMarkerRaw[];
  blood_marker_extraction_drafts?: BloodMarkerExtractionDraft[];
  scalp_image_analysis_drafts?: ScalpImageAnalysisDraft[];
  case_comparison?: CaseComparisonResult | null;
  blood_request?: {
    id: string;
    status: string;
    recommended_tests: string[];
    reason: string | null;
    recommended_by: string | null;
    clinician_edited: boolean;
    created_at?: string;
    updated_at?: string | null;
    approved_at?: string | null;
  } | null;
  marker_trends?: MarkerTrendRow[];
  clinical_insights?: ClinicalInsights;
  care_plan?: CarePlanOutput | null;
  follow_up_cadence?: FollowUpCadenceOutput | null;
  adherence_context?: {
    returned_after_reminder: boolean;
    days_to_return: number | null;
    repeated_overdue_pattern: boolean;
    reminder_response_context: string[];
    reminders_sent_count: number;
    outcome_types: string[];
  } | null;
  adherence_states?: {
    high_adherence: boolean;
    delayed_follow_up_pattern: boolean;
    repeat_reminder_required: boolean;
    prompt_response_good: boolean;
  } | null;
  /** Phase U: treatment adherence (started/continued/stopped/inconsistent/uncertain/not_using) */
  treatment_continuity?: {
    items: { key: string; label: string; status: string }[];
    hasPreviousIntake: boolean;
    hasTwoPreviousIntakes?: boolean;
  } | null;
  /** Phase U: outcome correlation state, clinician summary, caveats */
  outcome_correlation?: {
    correlation_state: string;
    clinicianSummary: string[];
    caveats: string[];
    patient_safe_summary: string | null;
    outcome_domains_used: string[];
  } | null;
  /** Protocol scoring engine: internal-only clinician signal */
  protocol_assessment?: {
    protocol_score: number;
    protocol_band: string;
    response_likelihood: string;
    coverage_domains: Record<string, string>;
    adherence_modifier: string;
    gaps: string[];
    strengths: string[];
    recommendation_signals: string[];
    protocol_assessment_version?: string;
    score_breakdown?: Record<string, number>;
  } | null;
  adaptive_triage?: AdaptiveDerivedSummary | null;
  adaptive_upload_guidance?: string[];
  adaptive_clinician_attention_flags?: string[];
  adaptive_red_flags?: string[];
  adaptive_rescore_comparison?: AdaptiveRescoreComparison | null;
  reassessment_summary?: ReassessmentSummary | null;
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

export type ScalpImageAnalysisDraft = {
  id: string;
  image_quality: string;
  thinning_distribution: string[];
  severity_estimate: string;
  visible_findings: string[];
  comparison_direction: string;
  confidence: number | null;
  manual_review_recommended: boolean;
  draft_summary: string;
  created_at: string;
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
  treatmentResponse: TreatmentResponseComparison | null;
  scalpImageComparison: ScalpImageComparisonSummary | null;
  patientSummary: {
    whatHasImproved: string[];
    stillNeedsFollowUp: string[];
    nextStepMayBe: string[];
  };
};

const SCALP_COMPARISON_LABELS: Record<string, string> = {
  [SCALP_IMAGE_COMPARISON_STATUS.PENDING_REVIEW]: "Pending review",
  [SCALP_IMAGE_COMPARISON_STATUS.IMPROVED]: "Improved",
  [SCALP_IMAGE_COMPARISON_STATUS.STABLE]: "Stable",
  [SCALP_IMAGE_COMPARISON_STATUS.WORSENED]: "Worsened",
  [SCALP_IMAGE_COMPARISON_STATUS.UNCERTAIN]: "Uncertain",
  [SCALP_IMAGE_COMPARISON_STATUS.INSUFFICIENT_IMAGES]: "Insufficient images",
};

const SCALP_VISUAL_LIKELIHOOD_LABELS: Record<ScalpVisualLikelihood, string> = {
  unlikely: "Unlikely",
  possible: "Possible",
  likely: "Likely",
  uncertain: "Uncertain",
};

const SCALP_CONFIDENCE_LABELS: Record<ScalpFindingConfidence, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

const SCALP_SEVERITY_LABELS: Record<string, string> = {
  [SCALP_SEVERITY_ESTIMATE.MINIMAL]: "Minimal",
  [SCALP_SEVERITY_ESTIMATE.MILD]: "Mild",
  [SCALP_SEVERITY_ESTIMATE.MODERATE]: "Moderate",
  [SCALP_SEVERITY_ESTIMATE.ADVANCED]: "Advanced",
  [SCALP_SEVERITY_ESTIMATE.UNCERTAIN]: "Uncertain",
};

const SCALP_QUALITY_LABELS: Record<string, string> = {
  [SCALP_IMAGE_QUALITY.USABLE]: "Usable",
  [SCALP_IMAGE_QUALITY.BORDERLINE]: "Borderline",
  [SCALP_IMAGE_QUALITY.POOR]: "Poor",
};

const SCALP_COMPARISON_REGIONS = [
  { key: "frontal_hairline", label: "Frontal hairline" },
  { key: "temples", label: "Temples" },
  { key: "crown", label: "Crown" },
  { key: "mid_scalp", label: "Mid scalp" },
  { key: "part_line", label: "Part line" },
  { key: "whole_scalp", label: "Whole scalp" },
] as const;

function VisualFindingCard({
  title,
  findings,
}: {
  title: string;
  findings:
    | (ConfirmedScalpImageFindings & { suitableForComparison?: boolean })
    | null
    | undefined;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <h4 className="text-xs font-medium uppercase tracking-wide text-white/50">
        {title}
      </h4>
      {!findings ? (
        <p className="mt-2 text-sm text-white/50">No confirmed visual findings saved yet.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm text-white/80">
          <li>
            Thinning distribution:{" "}
            {findings.thinningDistribution.length > 0
              ? findings.thinningDistribution.join(", ").replace(/_/g, " ")
              : "—"}
          </li>
          <li>
            Severity band:{" "}
            {findings.severityBand
              ? SCALP_SEVERITY_LABELS[findings.severityBand] ?? findings.severityBand
              : "—"}
          </li>
          <li>
            Visible scale:{" "}
            {findings.visibleScaleLikelihood
              ? SCALP_VISUAL_LIKELIHOOD_LABELS[findings.visibleScaleLikelihood]
              : "—"}
          </li>
          <li>
            Visible redness / inflammatory features:{" "}
            {findings.visibleRednessLikelihood
              ? SCALP_VISUAL_LIKELIHOOD_LABELS[findings.visibleRednessLikelihood]
              : "—"}
          </li>
          <li>
            Image quality:{" "}
            {findings.imageQuality
              ? SCALP_QUALITY_LABELS[findings.imageQuality] ?? findings.imageQuality
              : "—"}
          </li>
          <li>
            Finding confidence:{" "}
            {findings.findingConfidence
              ? SCALP_CONFIDENCE_LABELS[findings.findingConfidence]
              : "—"}
          </li>
          {"suitableForComparison" in findings && findings.suitableForComparison === false && (
            <li className="text-amber-200">Comparison suitability: limited</li>
          )}
        </ul>
      )}
    </div>
  );
}

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

export function TrichologistReviewWorkspace({
  trichologistId,
  initialIntakeId = null,
}: {
  trichologistId: string;
  initialIntakeId?: string | null;
}) {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialIntakeId ?? null);
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterReviewStatus, setFilterReviewStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"all" | "mine">("all");
  const [sortBy, setSortBy] = useState<"priority" | "complexity">("priority");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [outcomeSelect, setOutcomeSelect] = useState<string>("");
  const [scalpComparisonForm, setScalpComparisonForm] = useState<{
    comparison_status: ScalpImageComparisonStatus;
    compared_regions: string[];
    clinician_summary: string;
    current_findings: ConfirmedScalpImageFindings;
  }>({
    comparison_status: SCALP_IMAGE_COMPARISON_STATUS.PENDING_REVIEW,
    compared_regions: [],
    clinician_summary: "",
    current_findings: {
      thinningDistribution: [],
      severityBand: SCALP_SEVERITY_ESTIMATE.UNCERTAIN,
      visibleScaleLikelihood: SCALP_VISUAL_LIKELIHOOD.UNCERTAIN,
      visibleRednessLikelihood: SCALP_VISUAL_LIKELIHOOD.UNCERTAIN,
      imageQuality: SCALP_IMAGE_QUALITY.BORDERLINE,
      findingConfidence: SCALP_FINDING_CONFIDENCE.MODERATE,
    },
  });
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
  const [bloodRequestEditing, setBloodRequestEditing] = useState(false);
  const [bloodRequestForm, setBloodRequestForm] = useState<{
    recommended_tests: string[];
    reason: string;
  }>({ recommended_tests: [], reason: "" });
  const [bloodRequestSaving, setBloodRequestSaving] = useState(false);

  const [includeReleased, setIncludeReleased] = useState(false);
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all");
  const [queueMetrics, setQueueMetrics] = useState<{
    total_submitted: number;
    in_queue: number;
    assigned: number;
    completed: number;
    waiting_over_24h: number;
    waiting_over_48h: number;
    avg_hours_to_release: number | null;
  } | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/longevity/review/metrics", { credentials: "include" });
      const data = await res.json();
      if (data.ok && data.metrics) setQueueMetrics(data.metrics);
    } catch {
      // Non-blocking; leave previous metrics or null
    }
  }, []);

  const buildQueueParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (filterReviewStatus !== "all") params.set("review_status", filterReviewStatus);
    if (filterPriority !== "all") params.set("priority", filterPriority);
    if (viewMode === "mine") params.set("assigned_to_me", "1");
    if (includeReleased) params.set("include_released", "1");
    return params;
  }, [filterReviewStatus, filterPriority, viewMode, includeReleased]);

  const fetchQueue = useCallback(
    async (pageOffset?: number) => {
      const append = pageOffset != null && pageOffset > 0;
      const offset = pageOffset ?? 0;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      try {
        const params = buildQueueParams();
        params.set("offset", String(offset));
        const res = await fetch(`/api/longevity/review/queue?${params.toString()}`, { credentials: "include" });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error ?? "Failed to load queue");
          if (!append) setItems([]);
          return;
        }
        const next = data.items ?? [];
        setHasMore(!!data.hasMore);
        if (append) {
          setItems((prev) => [...prev, ...next]);
        } else {
          setItems(next);
          fetchMetrics();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load queue");
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildQueueParams, fetchMetrics]
  );

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    setDocumentTypeFilter("all");
  }, [selectedId]);

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
        released_summary_snapshot: data.released_summary_snapshot ?? null,
        complexity: data.complexity ?? undefined,
        blood_results: data.blood_results ?? undefined,
        blood_markers: data.blood_markers ?? undefined,
        blood_marker_extraction_drafts: data.blood_marker_extraction_drafts ?? undefined,
        scalp_image_analysis_drafts: data.scalp_image_analysis_drafts ?? undefined,
        case_comparison: data.case_comparison ?? null,
        blood_request: data.blood_request ?? null,
        marker_trends: data.marker_trends ?? undefined,
        clinical_insights: data.clinical_insights ?? undefined,
        care_plan: data.care_plan ?? null,
        follow_up_cadence: data.follow_up_cadence ?? null,
        adherence_context: data.adherence_context ?? null,
        adherence_states: data.adherence_states ?? null,
        treatment_continuity: data.treatment_continuity ?? null,
        outcome_correlation: data.outcome_correlation ?? null,
        protocol_assessment: data.protocol_assessment ?? null,
        adaptive_triage: data.adaptive_triage ?? null,
        adaptive_upload_guidance: data.adaptive_upload_guidance ?? [],
        adaptive_clinician_attention_flags: data.adaptive_clinician_attention_flags ?? [],
        adaptive_red_flags: data.adaptive_red_flags ?? [],
        adaptive_rescore_comparison: data.adaptive_rescore_comparison ?? null,
        reassessment_summary: data.reassessment_summary ?? null,
      });
      setBloodRequestEditing(false);
      if (data.intake.patient_visible_summary) {
        setSummaryText(data.intake.patient_visible_summary);
      }
      setOutcomeSelect(data.intake.review_outcome ?? "");
      setScalpComparisonForm({
        comparison_status:
          data.case_comparison?.scalpImageComparison?.comparisonStatus ??
          SCALP_IMAGE_COMPARISON_STATUS.PENDING_REVIEW,
        compared_regions:
          data.case_comparison?.scalpImageComparison?.comparedRegions ?? [],
        clinician_summary:
          data.case_comparison?.scalpImageComparison?.clinicianNotes ?? "",
        current_findings: {
          thinningDistribution:
            data.case_comparison?.scalpImageComparison?.currentFindings
              ?.thinningDistribution ?? [],
          severityBand:
            data.case_comparison?.scalpImageComparison?.currentFindings
              ?.severityBand ?? SCALP_SEVERITY_ESTIMATE.UNCERTAIN,
          visibleScaleLikelihood:
            data.case_comparison?.scalpImageComparison?.currentFindings
              ?.visibleScaleLikelihood ?? SCALP_VISUAL_LIKELIHOOD.UNCERTAIN,
          visibleRednessLikelihood:
            data.case_comparison?.scalpImageComparison?.currentFindings
              ?.visibleRednessLikelihood ?? SCALP_VISUAL_LIKELIHOOD.UNCERTAIN,
          imageQuality:
            data.case_comparison?.scalpImageComparison?.currentFindings
              ?.imageQuality ?? SCALP_IMAGE_QUALITY.BORDERLINE,
          findingConfidence:
            data.case_comparison?.scalpImageComparison?.currentFindings
              ?.findingConfidence ?? SCALP_FINDING_CONFIDENCE.MODERATE,
        },
      });
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

  const saveBloodRequestRefinement = useCallback(async () => {
    if (!selectedId || !caseDetail?.blood_request) return;
    setBloodRequestSaving(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/blood-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          intake_id: selectedId,
          blood_request_id: caseDetail.blood_request.id,
          recommended_tests: bloodRequestForm.recommended_tests,
          reason: bloodRequestForm.reason.trim() || null,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Failed to update blood request");
        return;
      }
      setBloodRequestEditing(false);
      await fetchCase(selectedId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to update blood request");
    } finally {
      setBloodRequestSaving(false);
    }
  }, [selectedId, caseDetail?.blood_request, bloodRequestForm, fetchCase]);

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

  const saveScalpComparison = useCallback(async () => {
    if (!selectedId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/scalp-image-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          intake_id: selectedId,
          comparison_status: scalpComparisonForm.comparison_status,
          compared_regions: scalpComparisonForm.compared_regions,
          clinician_summary: scalpComparisonForm.clinician_summary.trim(),
          current_findings: scalpComparisonForm.current_findings,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Failed to save scalp comparison");
        return;
      }
      await fetchCase(selectedId);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to save scalp comparison"
      );
    } finally {
      setActionLoading(false);
    }
  }, [selectedId, scalpComparisonForm, fetchCase]);

  const markerOptionsByCategory = useMemo(() => getBloodMarkerOptionsByCategory(), []);

  const adaptiveSuggestionResult = useMemo(() => {
    if (!caseDetail?.adaptive_triage) return null;
    return deriveAdaptiveClinicianSuggestions({
      adaptive_triage_output: caseDetail.adaptive_triage,
      adaptive_rescore_comparison: caseDetail.adaptive_rescore_comparison ?? null,
      context: {
        has_scalp_photo_documents: caseDetail.documents.some(
          (doc) => doc.doc_type === LONGEVITY_DOC_TYPE.SCALP_PHOTO
        ),
      },
    });
  }, [caseDetail]);

  const adaptiveBloodworkSupport = useMemo(() => {
    if (!caseDetail?.adaptive_triage) return null;
    return deriveAdaptiveBloodworkEligibilitySupport({
      adaptive_triage_output: caseDetail.adaptive_triage,
      adaptive_rescore_comparison: caseDetail.adaptive_rescore_comparison ?? null,
      clinician_suggestions: adaptiveSuggestionResult?.suggestions ?? [],
    });
  }, [caseDetail, adaptiveSuggestionResult]);

  const prefillBloodRequestFromAdaptive = useCallback(() => {
    if (!caseDetail?.blood_request || !caseDetail.adaptive_triage) return;
    const prefill = buildGpLetterAdaptivePrefillPayload({
      adaptive_triage_output: caseDetail.adaptive_triage,
      adaptive_bloodwork_eligibility: adaptiveBloodworkSupport,
      clinician_approved_bloodwork_domains:
        adaptiveBloodworkSupport?.suggested_bloodwork_domains ?? [],
      clinician_patient_safe_summary: summaryText,
    });
    setBloodRequestForm({
      recommended_tests: prefill.recommended_tests,
      reason: prefill.reason,
    });
    setBloodRequestEditing(true);
  }, [caseDetail, adaptiveBloodworkSupport, summaryText]);

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

  const runScalpImageAnalysis = useCallback(async () => {
    if (!selectedId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/scalp-image-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ intake_id: selectedId }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? "Failed to run scalp image analysis");
        return;
      }
      await fetchCase(selectedId);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to run scalp image analysis"
      );
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

  const reviewScalpImageAnalysisDraft = useCallback(async (draftId: string, action: "apply" | "dismiss") => {
    if (!selectedId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/longevity/review/scalp-image-analysis/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.ok) {
        setActionError(data.error ?? `Failed to ${action} scalp draft`);
        return;
      }
      await fetchCase(selectedId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : `Failed to ${action} scalp draft`);
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

  const saveSummaryDraft = useCallback(async () => {
    if (!selectedId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/longevity/review/summary", {
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
        setActionError(data.error ?? "Save failed");
        return;
      }
      if (selectedId) fetchCase(selectedId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setActionLoading(false);
    }
  }, [selectedId, summaryText, fetchCase]);

  const filteredItems = useMemo(() => items, [items]);

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

  const renderCard = (item: ReviewQueueItem) => {
    const isAssignedToMe = item.assigned_trichologist_id === trichologistId;
    const isAwaitingDocs = item.review_status === "awaiting_patient_documents";
    return (
    <button
      type="button"
      key={item.id}
      onClick={() => setSelectedId(item.id)}
      className={`w-full rounded-xl border p-4 text-left transition ${
        selectedId === item.id
          ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/10"
          : isAssignedToMe
            ? "border-[rgb(var(--gold))]/30 bg-[rgb(var(--gold))]/5 hover:border-[rgb(var(--gold))]/50"
            : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-white/70">{item.id}</span>
        <PriorityBadge priority={item.review_priority} />
        <ComplexityBadge complexity={item.complexity} />
        {isAssignedToMe && (
          <span className="inline-flex rounded-md border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/15 px-2 py-0.5 text-xs font-medium text-[rgb(var(--gold))]">
            You
          </span>
        )}
        {isAwaitingDocs && (
          <span className="inline-flex rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-200">
            Awaiting docs
          </span>
        )}
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
  };

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
          <Link href="/portal/trichologist/insights" className="text-sm text-white/70 hover:text-white">
            Beta insights
          </Link>
          <Link href="/portal/trichologist/exceptions" className="text-sm text-white/70 hover:text-white">
            Exceptions
          </Link>
          <Link href="/portal/trichologist/provisioning" className="text-sm text-white/70 hover:text-white">
            Trichologist management
          </Link>
          <Link href="/portal/trichologist/reminders" className="text-sm text-white/70 hover:text-white">
            Reminders
          </Link>
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

      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-white/50">Queue health</h3>
        {queueMetrics == null ? (
          <p className="text-sm text-white/50">Loading metrics…</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 min-w-[6rem]">
              <div className="text-xs text-white/50">Submitted</div>
              <div className="text-lg font-semibold text-white">{queueMetrics.total_submitted}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 min-w-[6rem]">
              <div className="text-xs text-white/50">In queue</div>
              <div className="text-lg font-semibold text-white">{queueMetrics.in_queue}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 min-w-[6rem]">
              <div className="text-xs text-white/50">Assigned</div>
              <div className="text-lg font-semibold text-white">{queueMetrics.assigned}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 min-w-[6rem]">
              <div className="text-xs text-white/50">Completed</div>
              <div className="text-lg font-semibold text-white">{queueMetrics.completed}</div>
            </div>
            {queueMetrics.avg_hours_to_release != null && (
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 min-w-[6rem]">
                <div className="text-xs text-white/50">Avg. time to release</div>
                <div className="text-lg font-semibold text-white">
                  {queueMetrics.avg_hours_to_release < 24
                    ? `${queueMetrics.avg_hours_to_release}h`
                    : `${(queueMetrics.avg_hours_to_release / 24).toFixed(1)}d`}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 ml-auto">
              {queueMetrics.waiting_over_24h > 0 && (
                <span
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                    queueMetrics.waiting_over_48h > 0
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
                      : "border-white/20 bg-white/10 text-white/80"
                  }`}
                  title="Cases in queue for more than 24 hours"
                >
                  {queueMetrics.waiting_over_24h} waiting &gt; 24h
                </span>
              )}
              {queueMetrics.waiting_over_48h > 0 && (
                <span
                  className="rounded-md border border-amber-500/50 bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-200"
                  title="Cases in queue for more than 48 hours"
                >
                  {queueMetrics.waiting_over_48h} waiting &gt; 48h
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-sm font-medium text-white/80">View</span>
        <div className="flex rounded-lg border border-white/20 bg-white/5 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("all")}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              viewMode === "all" ? "bg-white/15 text-white" : "text-white/70 hover:text-white/90"
            }`}
          >
            All cases
          </button>
          <button
            type="button"
            onClick={() => setViewMode("mine")}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              viewMode === "mine" ? "bg-[rgb(var(--gold))]/20 text-[rgb(var(--gold))]" : "text-white/70 hover:text-white/90"
            }`}
          >
            My cases
          </button>
        </div>
        <span className="text-white/30">|</span>
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
        <label className="flex items-center gap-2 text-sm text-white/80">
          <span className="text-white/50">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "priority" | "complexity")}
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-white focus:border-[rgb(var(--gold))] focus:outline-none"
          >
            <option value="priority">Priority then age</option>
            <option value="complexity">Complexity (high first)</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={includeReleased}
            onChange={(e) => setIncludeReleased(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-[rgb(var(--gold))] focus:ring-[rgb(var(--gold))]"
          />
          <span>Include released</span>
        </label>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-white">
              {viewMode === "mine" ? "My cases" : "Queue"}
            </h2>
            <p className="text-xs text-white/50">
              {viewMode === "mine"
                ? "Cases assigned to you"
                : "Highest priority first, then oldest. You = assigned to you; Awaiting docs = waiting on patient."}
            </p>
            <div className="mt-3 space-y-2">
              {loading ? (
                <p className="text-white/50">Loading…</p>
              ) : displayList.length === 0 ? (
                <p className="text-white/50">{viewMode === "mine" ? "No cases assigned to you" : "No cases in queue"}</p>
              ) : (
                displayList.map(renderCard)
              )}
            </div>
            {!loading && hasMore && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => fetchQueue(items.length)}
                  disabled={loadingMore}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
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
                const hasScalpPhotoDocument = caseDetail.documents.some((doc) => doc.doc_type === "scalp_photo");
                const extractionDrafts = caseDetail.blood_marker_extraction_drafts ?? [];
                const scalpImageDrafts = caseDetail.scalp_image_analysis_drafts ?? [];
                return (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">Case: {caseDetail.intake.id}</h2>
                  <PriorityBadge priority={caseDetail.intake.review_priority} />
                  {caseDetail.complexity && (
                    <ComplexityBadge complexity={caseDetail.complexity} />
                  )}
                  {caseDetail.adaptive_rescore_comparison?.changed && (
                    <span
                      className="inline-flex rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-100"
                      title={
                        caseDetail.adaptive_rescore_comparison.changed_fields.length > 0
                          ? `${caseDetail.adaptive_rescore_comparison.changed_fields.length} changed field(s)`
                          : "Adaptive interpretation changed"
                      }
                    >
                      Adaptive delta detected
                      {caseDetail.adaptive_rescore_comparison.changed_fields.length > 0 && (
                        <span className="ml-1 text-amber-200/80">
                          ({caseDetail.adaptive_rescore_comparison.changed_fields.length})
                        </span>
                      )}
                    </span>
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

                <h3 className="mt-6 text-sm font-medium text-white/90">Case timeline</h3>
                <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-4">
                  <CaseTimeline
                    intake={{
                      created_at: caseDetail.intake.created_at,
                      assigned_at: caseDetail.intake.assigned_at ?? null,
                    }}
                    questionnaire={caseDetail.questionnaire}
                    documents={caseDetail.documents}
                    notes={caseDetail.notes}
                    released_summary_snapshot={caseDetail.released_summary_snapshot ?? null}
                    reminder_sents={caseDetail.reminder_sents}
                  />
                </div>

                <h3 className="mt-6 text-sm font-medium text-white/90">Questionnaire snapshot</h3>
                <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white/80 whitespace-pre-wrap">
                  {JSON.stringify(caseDetail.questionnaire.responses, null, 2)}
                </pre>

                <h3 className="mt-6 text-sm font-medium text-white/90">Uploaded documents</h3>
                {caseDetail.documents.length === 0 ? (
                  <p className="mt-2 text-sm text-white/50">None</p>
                ) : (
                  <>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-white/50">Filter by type:</span>
                      <select
                        value={documentTypeFilter}
                        onChange={(e) => setDocumentTypeFilter(e.target.value)}
                        className="rounded border border-white/20 bg-white/5 px-2 py-1 text-xs text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                        aria-label="Filter documents by type"
                      >
                        <option value="all">All</option>
                        <option value={LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD}>{getPatientDocTypeLabel(LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD)}</option>
                        <option value={LONGEVITY_DOC_TYPE.SCALP_PHOTO}>{getPatientDocTypeLabel(LONGEVITY_DOC_TYPE.SCALP_PHOTO)}</option>
                        <option value={LONGEVITY_DOC_TYPE.MEDICAL_LETTER}>{getPatientDocTypeLabel(LONGEVITY_DOC_TYPE.MEDICAL_LETTER)}</option>
                        <option value={LONGEVITY_DOC_TYPE.PRESCRIPTIONS}>{getPatientDocTypeLabel(LONGEVITY_DOC_TYPE.PRESCRIPTIONS)}</option>
                        <option value={LONGEVITY_DOC_TYPE.OTHER}>{getPatientDocTypeLabel(LONGEVITY_DOC_TYPE.OTHER)}</option>
                      </select>
                    </div>
                    <div className="mt-3 space-y-3">
                      {(() => {
                        const MAIN_TYPES = [
                          LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD,
                          LONGEVITY_DOC_TYPE.SCALP_PHOTO,
                          LONGEVITY_DOC_TYPE.MEDICAL_LETTER,
                          LONGEVITY_DOC_TYPE.PRESCRIPTIONS,
                        ] as const;
                        const isOther = (docType: string) => !MAIN_TYPES.includes(docType as (typeof MAIN_TYPES)[number]);
                        const filteredDocs =
                          documentTypeFilter === "all"
                            ? caseDetail.documents
                            : documentTypeFilter === LONGEVITY_DOC_TYPE.OTHER
                              ? caseDetail.documents.filter((d) => isOther(d.doc_type))
                              : caseDetail.documents.filter((d) => d.doc_type === documentTypeFilter);
                        if (documentTypeFilter !== "all") {
                          if (filteredDocs.length === 0) return <p className="text-sm text-white/50">No documents in this category.</p>;
                          return (
                            <ul className="space-y-1 text-sm text-white/80">
                              {filteredDocs.map((d) => (
                                <li key={d.id}>
                                  {d.filename ?? getPatientDocTypeLabel(d.doc_type)} · {new Date(d.created_at).toLocaleDateString()}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <>
                            {MAIN_TYPES.map((type) => {
                              const list = caseDetail.documents.filter((d) => d.doc_type === type);
                              if (list.length === 0) return null;
                              return (
                                <div key={type}>
                                  <p className="text-xs font-medium text-white/60">{getPatientDocTypeLabel(type)}</p>
                                  <ul className="mt-1 space-y-1 text-sm text-white/80">
                                    {list.map((d) => (
                                      <li key={d.id}>
                                        {d.filename ?? getPatientDocTypeLabel(type)} · {new Date(d.created_at).toLocaleDateString()}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                            {(() => {
                              const otherDocs = caseDetail.documents.filter((d) => isOther(d.doc_type));
                              if (otherDocs.length === 0) return null;
                              return (
                                <div>
                                  <p className="text-xs font-medium text-white/60">{getPatientDocTypeLabel(LONGEVITY_DOC_TYPE.OTHER)}</p>
                                  <ul className="mt-1 space-y-1 text-sm text-white/80">
                                    {otherDocs.map((d) => (
                                      <li key={d.id}>
                                        {d.filename ?? getPatientDocTypeLabel(d.doc_type)} · {new Date(d.created_at).toLocaleDateString()}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                          </>
                        );
                      })()}
                    </div>
                  </>
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

                {caseDetail.follow_up_cadence && (
                  <FollowUpCadenceCard
                    cadence={caseDetail.follow_up_cadence}
                    audience="clinician"
                    title="Follow-up cadence"
                    description="Compact reminder context for whether follow-up looks upcoming, due, overdue, complete, or not yet set."
                    className="mt-6"
                  />
                )}

                {caseDetail.adaptive_triage && (
                  <>
                    <AdaptiveTriagePanel
                      triage={caseDetail.adaptive_triage}
                      uploadGuidance={caseDetail.adaptive_upload_guidance ?? []}
                      clinicianAttentionFlags={
                        caseDetail.adaptive_clinician_attention_flags ?? []
                      }
                      redFlags={caseDetail.adaptive_red_flags ?? []}
                    />
                    {caseDetail.adaptive_rescore_comparison && (
                      <AdaptiveRescoreComparisonPanel
                        comparison={caseDetail.adaptive_rescore_comparison}
                      />
                    )}
                    <AdaptiveSuggestedChecksPanel
                      suggestions={adaptiveSuggestionResult?.suggestions ?? []}
                    />
                    {adaptiveBloodworkSupport && (
                      <AdaptiveBloodworkEligibilityPanel
                        eligibility={adaptiveBloodworkSupport}
                        onSelectOutcome={setOutcomeSelect}
                      />
                    )}
                  </>
                )}
                {caseDetail.reassessment_summary && (
                  <ReassessmentStatusPanel
                    summary={caseDetail.reassessment_summary}
                    onSelectOutcome={setOutcomeSelect}
                  />
                )}

                {(caseDetail.adherence_context || caseDetail.adherence_states) && (
                  <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                    <h3 className="text-sm font-medium text-white/90">Adherence context</h3>
                    {caseDetail.adherence_context?.reminder_response_context?.length ? (
                      <ul className="mt-2 space-y-1 text-sm text-white/80">
                        {caseDetail.adherence_context.reminder_response_context.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-white/50">No reminder activity for this intake.</p>
                    )}
                    {caseDetail.adherence_states && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {caseDetail.adherence_states.high_adherence && (
                          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-200">
                            High adherence
                          </span>
                        )}
                        {caseDetail.adherence_states.prompt_response_good && !caseDetail.adherence_states.high_adherence && (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200">
                            Prompt response
                          </span>
                        )}
                        {caseDetail.adherence_states.delayed_follow_up_pattern && (
                          <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-xs text-amber-200">
                            Delayed follow-up pattern
                          </span>
                        )}
                        {caseDetail.adherence_states.repeat_reminder_required && (
                          <span className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                            Repeat reminder possible
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Phase U: treatment adherence & outcome correlation — always shown in case detail */}
                <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-medium text-white/90">Treatment adherence & outcome correlation</h3>
                  {caseDetail.treatment_continuity?.items?.length ? (
                    <div className="mt-2">
                      <p className="text-xs text-white/50">Status vs previous intake</p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {caseDetail.treatment_continuity.items.map((item) => (
                          <span
                            key={item.key}
                            className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/80"
                          >
                            {item.label} · {(item.status ?? item.key).replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                      {!caseDetail.treatment_continuity.hasPreviousIntake && (
                        <p className="mt-1.5 text-xs text-white/50">No previous intake for comparison yet.</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-white/50">No treatment adherence data for this intake.</p>
                  )}
                  {caseDetail.outcome_correlation ? (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <p className="text-xs text-white/50">Correlation state</p>
                      <p className="mt-1 text-sm font-medium text-white/90">
                        {caseDetail.outcome_correlation.correlation_state.replace(/_/g, " ")}
                      </p>
                      {caseDetail.outcome_correlation.clinicianSummary?.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-white/80">
                          {caseDetail.outcome_correlation.clinicianSummary.map((line, i) => (
                            <li key={i}>• {line}</li>
                          ))}
                        </ul>
                      )}
                      {caseDetail.outcome_correlation.caveats?.length > 0 && (
                        <>
                          <p className="mt-2 text-xs text-white/50">Caveats</p>
                          <ul className="mt-1 space-y-0.5 text-xs text-white/60">
                            {caseDetail.outcome_correlation.caveats.map((c, i) => (
                              <li key={i}>• {c}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 border-t border-white/10 pt-3 text-sm text-white/50">No correlation data for this intake.</p>
                  )}
                </div>

                {caseDetail.protocol_assessment && (
                  <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                    <h3 className="text-sm font-medium text-white/90">Protocol assessment (internal)</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-white/60">Score</span>
                      <span className="font-medium text-white/90">{caseDetail.protocol_assessment.protocol_score}</span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/60">Band</span>
                      <span className="rounded border border-white/20 bg-white/5 px-2 py-0.5 text-white/80">
                        {caseDetail.protocol_assessment.protocol_band}
                      </span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/60">Response likelihood</span>
                      <span className="text-white/80">
                        {caseDetail.protocol_assessment.response_likelihood.replace(/_/g, " ")}
                      </span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/60">Adherence</span>
                      <span className="text-white/80">{caseDetail.protocol_assessment.adherence_modifier}</span>
                    </div>
                    {caseDetail.protocol_assessment.coverage_domains && (
                      <div className="mt-2">
                        <p className="text-xs text-white/50">Domain coverage</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {Object.entries(caseDetail.protocol_assessment.coverage_domains).map(([domain, level]) => (
                            <span
                              key={domain}
                              className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70"
                            >
                              {domain.replace(/_/g, " ")}: {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(caseDetail.protocol_assessment.gaps?.length > 0 || caseDetail.protocol_assessment.strengths?.length > 0) && (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {caseDetail.protocol_assessment.gaps?.length > 0 && (
                          <div>
                            <p className="text-xs text-white/50">Gaps</p>
                            <ul className="mt-0.5 space-y-0.5 text-xs text-amber-200/90">
                              {caseDetail.protocol_assessment.gaps.map((g, i) => (
                                <li key={i}>• {g.replace(/_/g, " ")}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {caseDetail.protocol_assessment.strengths?.length > 0 && (
                          <div>
                            <p className="text-xs text-white/50">Strengths</p>
                            <ul className="mt-0.5 space-y-0.5 text-xs text-emerald-200/90">
                              {caseDetail.protocol_assessment.strengths.map((s, i) => (
                                <li key={i}>• {s.replace(/_/g, " ")}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {caseDetail.protocol_assessment.score_breakdown && (
                      <div className="mt-2 border-t border-white/10 pt-2">
                        <p className="text-xs text-white/50">Score breakdown (internal)</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-white/60">
                          {Object.entries(caseDetail.protocol_assessment.score_breakdown).map(([k, v]) => (
                            <span key={k}>{k.replace(/_/g, " ")}: {v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {caseDetail.case_comparison?.treatmentResponse && (
                  <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                    <h3 className="text-sm font-medium text-white/90">Treatment response summary</h3>
                    {caseDetail.case_comparison.treatmentResponse.items.length === 0 ? (
                      <p className="mt-2 text-sm text-white/50">No structured treatment changes captured yet.</p>
                    ) : (
                      <>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {caseDetail.case_comparison.treatmentResponse.items.map((item) => (
                            <span
                              key={`${item.key}-${item.status}`}
                              className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/80"
                            >
                              {item.label} · {item.status.replace(/_/g, " ")}
                              {item.response ? ` · ${item.response.replace(/_/g, " ")}` : ""}
                            </span>
                          ))}
                        </div>
                        {caseDetail.case_comparison.treatmentResponse.clinicianSummary.length > 0 && (
                          <ul className="mt-3 space-y-1 text-sm text-white/80">
                            {caseDetail.case_comparison.treatmentResponse.clinicianSummary.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                )}

                {caseDetail.case_comparison?.scalpImageComparison && (
                  <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                    <h3 className="text-sm font-medium text-white/90">Scalp-image comparison</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
                      <span>
                        Current photos: {caseDetail.case_comparison.scalpImageComparison.currentPhotoCount}
                      </span>
                      <span>·</span>
                      <span>
                        Previous photos: {caseDetail.case_comparison.scalpImageComparison.previousPhotoCount}
                      </span>
                      <span>·</span>
                      <span>
                        Status:{" "}
                        {SCALP_COMPARISON_LABELS[
                          caseDetail.case_comparison.scalpImageComparison
                            .comparisonStatus
                        ] ??
                          caseDetail.case_comparison.scalpImageComparison
                            .comparisonStatus}
                      </span>
                      <span>·</span>
                      <span>
                        Comparison confidence:{" "}
                        {
                          SCALP_CONFIDENCE_LABELS[
                            caseDetail.case_comparison.scalpImageComparison
                              .visualComparisonConfidence
                          ]
                        }
                      </span>
                    </div>
                    {caseDetail.case_comparison.scalpImageComparison
                      .comparisonLimitedByImageQuality && (
                      <p className="mt-2 text-xs text-amber-200">
                        Comparison limited by image quality. Interpret subtle change
                        cautiously.
                      </p>
                    )}
                    {!caseDetail.case_comparison.scalpImageComparison
                      .hasPreviousConfirmedFindings && (
                      <p className="mt-2 text-xs text-white/50">
                        No previous confirmed scalp-image findings are available yet,
                        so this intake will act as the structured visual baseline once
                        saved.
                      </p>
                    )}
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <VisualFindingCard
                        title="Current confirmed findings"
                        findings={
                          caseDetail.case_comparison.scalpImageComparison
                            .currentFindings
                        }
                      />
                      <VisualFindingCard
                        title="Previous confirmed findings"
                        findings={
                          caseDetail.case_comparison.scalpImageComparison
                            .previousFindings
                        }
                      />
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-emerald-200/80">
                          Progress summary
                        </h4>
                        {caseDetail.case_comparison.scalpImageComparison
                          .visualProgressSummary.length === 0 ? (
                          <p className="mt-2 text-sm text-white/50">
                            No confirmed visual progression summary yet.
                          </p>
                        ) : (
                          <ul className="mt-2 space-y-1 text-sm text-white/80">
                            {caseDetail.case_comparison.scalpImageComparison.visualProgressSummary.map(
                              (item) => (
                                <li key={item}>• {item}</li>
                              )
                            )}
                          </ul>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-white/50">
                          Persistent visible drivers
                        </h4>
                        {caseDetail.case_comparison.scalpImageComparison
                          .visualPersistentDrivers.length === 0 ? (
                          <p className="mt-2 text-sm text-white/50">
                            No persistent visible drivers flagged.
                          </p>
                        ) : (
                          <ul className="mt-2 space-y-1 text-sm text-white/80">
                            {caseDetail.case_comparison.scalpImageComparison.visualPersistentDrivers.map(
                              (item) => (
                                <li key={item}>• {item}</li>
                              )
                            )}
                          </ul>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-amber-200/80">
                          Follow-up considerations
                        </h4>
                        {caseDetail.case_comparison.scalpImageComparison
                          .visualFollowUpConsiderations.length === 0 ? (
                          <p className="mt-2 text-sm text-white/50">
                            No additional visual follow-up caveats.
                          </p>
                        ) : (
                          <ul className="mt-2 space-y-1 text-sm text-white/80">
                            {caseDetail.case_comparison.scalpImageComparison.visualFollowUpConsiderations.map(
                              (item) => (
                                <li key={item}>• {item}</li>
                              )
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                          Current severity band
                        </label>
                        <select
                          value={scalpComparisonForm.current_findings.severityBand ?? ""}
                          onChange={(e) =>
                            setScalpComparisonForm((prev) => ({
                              ...prev,
                              current_findings: {
                                ...prev.current_findings,
                                severityBand: e.target
                                  .value as ConfirmedScalpImageFindings["severityBand"],
                              },
                            }))
                          }
                          className="mt-2 w-full rounded border border-white/20 bg-black/20 px-2 py-1.5 text-sm text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                        >
                          {Object.entries(SCALP_SEVERITY_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                          Current image quality
                        </label>
                        <select
                          value={scalpComparisonForm.current_findings.imageQuality ?? ""}
                          onChange={(e) =>
                            setScalpComparisonForm((prev) => ({
                              ...prev,
                              current_findings: {
                                ...prev.current_findings,
                                imageQuality: e.target
                                  .value as ConfirmedScalpImageFindings["imageQuality"],
                              },
                            }))
                          }
                          className="mt-2 w-full rounded border border-white/20 bg-black/20 px-2 py-1.5 text-sm text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                        >
                          {Object.entries(SCALP_QUALITY_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                          Visible scale likelihood
                        </label>
                        <select
                          value={
                            scalpComparisonForm.current_findings
                              .visibleScaleLikelihood ?? ""
                          }
                          onChange={(e) =>
                            setScalpComparisonForm((prev) => ({
                              ...prev,
                              current_findings: {
                                ...prev.current_findings,
                                visibleScaleLikelihood: e.target
                                  .value as ConfirmedScalpImageFindings["visibleScaleLikelihood"],
                              },
                            }))
                          }
                          className="mt-2 w-full rounded border border-white/20 bg-black/20 px-2 py-1.5 text-sm text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                        >
                          {Object.entries(SCALP_VISUAL_LIKELIHOOD_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                          Visible redness / inflammatory features
                        </label>
                        <select
                          value={
                            scalpComparisonForm.current_findings
                              .visibleRednessLikelihood ?? ""
                          }
                          onChange={(e) =>
                            setScalpComparisonForm((prev) => ({
                              ...prev,
                              current_findings: {
                                ...prev.current_findings,
                                visibleRednessLikelihood: e.target
                                  .value as ConfirmedScalpImageFindings["visibleRednessLikelihood"],
                              },
                            }))
                          }
                          className="mt-2 w-full rounded border border-white/20 bg-black/20 px-2 py-1.5 text-sm text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                        >
                          {Object.entries(SCALP_VISUAL_LIKELIHOOD_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                          Finding confidence
                        </label>
                        <select
                          value={
                            scalpComparisonForm.current_findings.findingConfidence ??
                            ""
                          }
                          onChange={(e) =>
                            setScalpComparisonForm((prev) => ({
                              ...prev,
                              current_findings: {
                                ...prev.current_findings,
                                findingConfidence: e.target
                                  .value as ConfirmedScalpImageFindings["findingConfidence"],
                              },
                            }))
                          }
                          className="mt-2 w-full rounded border border-white/20 bg-black/20 px-2 py-1.5 text-sm text-white focus:border-[rgb(var(--gold))] focus:outline-none"
                        >
                          {Object.entries(SCALP_CONFIDENCE_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                          Derived comparison status
                        </label>
                        <div className="mt-2 rounded border border-white/20 bg-black/20 px-3 py-2 text-sm text-white/80">
                          {SCALP_COMPARISON_LABELS[
                            caseDetail.case_comparison.scalpImageComparison
                              .comparisonStatus
                          ] ??
                            caseDetail.case_comparison.scalpImageComparison
                              .comparisonStatus}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                        Current thinning distribution
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {SCALP_COMPARISON_REGIONS.map((region) => {
                          const active = scalpComparisonForm.current_findings.thinningDistribution.includes(
                            region.key
                          );
                          return (
                            <button
                              key={region.key}
                              type="button"
                              onClick={() =>
                                setScalpComparisonForm((prev) => {
                                  const thinningDistribution = active
                                    ? prev.current_findings.thinningDistribution.filter(
                                        (item) => item !== region.key
                                      )
                                    : [
                                        ...prev.current_findings.thinningDistribution,
                                        region.key,
                                      ];
                                  return {
                                    ...prev,
                                    compared_regions: thinningDistribution,
                                    current_findings: {
                                      ...prev.current_findings,
                                      thinningDistribution,
                                    },
                                  };
                                })
                              }
                              className={`rounded border px-2.5 py-1 text-xs ${
                                active
                                  ? "border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 text-white"
                                  : "border-white/20 bg-white/5 text-white/70"
                              }`}
                            >
                              {region.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                        Clinician comparison note
                      </label>
                      <textarea
                        value={scalpComparisonForm.clinician_summary}
                        onChange={(e) =>
                          setScalpComparisonForm((prev) => ({
                            ...prev,
                            clinician_summary: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Visible pattern, confidence caveats, or photo limitations."
                        className="mt-2 w-full rounded border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={saveScalpComparison}
                      disabled={actionLoading}
                      className="mt-3 rounded border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-3 py-1.5 text-sm text-white hover:bg-[rgb(var(--gold))]/20 disabled:opacity-50"
                    >
                      Save scalp comparison
                    </button>
                  </div>
                )}

                <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium text-white/90">AI scalp-image draft analysis</h3>
                      <p className="mt-1 text-xs text-white/60">
                        Draft-only OpenAI-assisted image review. Internal only and never patient-visible until confirmed by a Trichologist.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={runScalpImageAnalysis}
                      disabled={actionLoading || !hasScalpPhotoDocument}
                      className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      {scalpImageDrafts.length > 0 ? "Re-run AI draft analysis" : "Run AI draft analysis"}
                    </button>
                  </div>
                  {!hasScalpPhotoDocument ? (
                    <p className="mt-3 text-sm text-white/50">Upload a `scalp_photo` document before running draft analysis.</p>
                  ) : scalpImageDrafts.length === 0 ? (
                    <p className="mt-3 text-sm text-white/50">No pending scalp-image drafts yet.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {scalpImageDrafts.map((draft) => (
                        <div key={draft.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                            <span>Quality: {draft.image_quality}</span>
                            <span>Severity: {draft.severity_estimate}</span>
                            <span>Change: {draft.comparison_direction}</span>
                            <span>
                              Confidence: {draft.confidence != null ? `${Math.round(draft.confidence * 100)}%` : "—"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-white/85">{draft.draft_summary}</p>
                          {(draft.thinning_distribution.length > 0 || draft.visible_findings.length > 0) && (
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              {draft.thinning_distribution.map((item) => (
                                <span key={item} className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/75">
                                  {item.replace(/_/g, " ")}
                                </span>
                              ))}
                              {draft.visible_findings.map((item) => (
                                <span key={item} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-amber-100/80">
                                  {item.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          )}
                          {draft.manual_review_recommended && (
                            <p className="mt-2 text-xs text-amber-200">Manual review recommended.</p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => reviewScalpImageAnalysisDraft(draft.id, "apply")}
                              disabled={actionLoading}
                              className="rounded border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-2.5 py-1 text-xs text-white hover:bg-[rgb(var(--gold))]/20 disabled:opacity-50"
                            >
                              Apply to scalp comparison
                            </button>
                            <button
                              type="button"
                              onClick={() => reviewScalpImageAnalysisDraft(draft.id, "dismiss")}
                              disabled={actionLoading}
                              className="rounded border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-50"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {caseDetail.blood_request && (
                  <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                    <h3 className="text-sm font-medium text-white/90">Blood request</h3>
                    <p className="mt-1 text-xs text-white/50">
                      Status: {caseDetail.blood_request.status}
                      {" · "}
                      {caseDetail.blood_request.recommended_by === "rules"
                        ? "Rule-derived"
                        : caseDetail.blood_request.clinician_edited
                          ? "Clinician-edited"
                          : "Clinician-confirmed (unchanged)"}
                    </p>
                    {!bloodRequestEditing ? (
                      <>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {caseDetail.blood_request.recommended_tests.map((code) => (
                            <span
                              key={code}
                              className="rounded border border-white/20 bg-white/5 px-2 py-1 text-xs text-white/90 capitalize"
                            >
                              {code.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                        {caseDetail.blood_request.reason && (
                          <p className="mt-2 text-xs text-white/70">{caseDetail.blood_request.reason}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setBloodRequestForm({
                              recommended_tests: [...caseDetail.blood_request!.recommended_tests],
                              reason: caseDetail.blood_request!.reason ?? "",
                            });
                            setBloodRequestEditing(true);
                          }}
                          className="mt-3 rounded border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-3 py-1.5 text-xs text-white hover:bg-[rgb(var(--gold))]/20"
                        >
                          Refine tests &amp; reason
                        </button>
                        {caseDetail.adaptive_triage && (
                          <button
                            type="button"
                            onClick={prefillBloodRequestFromAdaptive}
                            className="ml-2 mt-3 rounded border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                          >
                            Prefill from adaptive signals
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs text-white/60">
                          Select approved tests only. Patient and GP letter will use this list.
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {(ALL_BLOOD_TEST_CODES as readonly BloodTestCode[]).map((code) => (
                            <label key={code} className="flex items-center gap-1.5 text-sm text-white/90">
                              <input
                                type="checkbox"
                                checked={bloodRequestForm.recommended_tests.includes(code)}
                                onChange={(e) => {
                                  setBloodRequestForm((f) => ({
                                    ...f,
                                    recommended_tests: e.target.checked
                                      ? [...f.recommended_tests, code]
                                      : f.recommended_tests.filter((c) => c !== code),
                                  }));
                                }}
                                className="rounded border-white/30"
                              />
                              <span className="capitalize">{code.replace(/_/g, " ")}</span>
                            </label>
                          ))}
                        </div>
                        <div>
                          <label className="block text-xs text-white/60">Reason (patient/GP-facing)</label>
                          <textarea
                            value={bloodRequestForm.reason}
                            onChange={(e) =>
                              setBloodRequestForm((f) => ({ ...f, reason: e.target.value }))
                            }
                            rows={2}
                            placeholder="e.g. Iron/ferritin relevance; thyroid relevance"
                            className="mt-1 w-full rounded border border-white/20 bg-black/20 px-2 py-1.5 text-sm text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={saveBloodRequestRefinement}
                            disabled={bloodRequestSaving || bloodRequestForm.recommended_tests.length === 0}
                            className="rounded border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-3 py-1.5 text-xs text-white hover:bg-[rgb(var(--gold))]/20 disabled:opacity-50"
                          >
                            {bloodRequestSaving ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setBloodRequestEditing(false)}
                            disabled={bloodRequestSaving}
                            className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
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

                {caseDetail.released_summary_snapshot && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <h4 className="text-sm font-semibold text-emerald-200">
                      Released summary (what the patient saw)
                    </h4>
                    <p className="mt-1 text-xs text-white/50">
                      Released {new Date(caseDetail.released_summary_snapshot.released_at).toLocaleString()}
                    </p>
                    <div className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/90">
                      {caseDetail.released_summary_snapshot.summary_text}
                    </div>
                  </div>
                )}
                <div>
                  <label htmlFor="patient-summary" className="block text-sm font-medium text-white/90">
                    {caseDetail.released_summary_snapshot
                      ? "Patient summary (current / draft — already released above)"
                      : "Patient summary (release to patient)"}
                  </label>
                  <textarea
                    id="patient-summary"
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    placeholder="Summary or next steps to release to patient"
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={saveSummaryDraft}
                      disabled={actionLoading}
                      className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      Save draft
                    </button>
                    <button
                      type="button"
                      onClick={releaseSummary}
                      disabled={actionLoading || !summaryText.trim()}
                      className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      Release patient summary
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
