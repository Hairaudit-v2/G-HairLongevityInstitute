import type { VisionProvider } from "@/lib/ai/providers";

export const SCALP_IMAGE_QUALITY = {
  USABLE: "usable",
  BORDERLINE: "borderline",
  POOR: "poor",
} as const;

export const SCALP_SEVERITY_ESTIMATE = {
  MINIMAL: "minimal",
  MILD: "mild",
  MODERATE: "moderate",
  ADVANCED: "advanced",
  UNCERTAIN: "uncertain",
} as const;

export const SCALP_VISIBLE_FINDING = {
  POSSIBLE_SCALE: "possible_scale",
  POSSIBLE_REDNESS: "possible_redness",
  POSSIBLE_INFLAMMATION: "possible_inflammation",
} as const;

export const SCALP_COMPARISON_DIRECTION = {
  IMPROVED: "improved",
  STABLE: "stable",
  WORSENED: "worsened",
  UNCERTAIN: "uncertain",
  INSUFFICIENT_IMAGES: "insufficient_images",
} as const;

export const SCALP_DETECTED_VIEW = {
  UNKNOWN: "unknown",
  UNCLEAR: "unclear",
  FRONTAL_HAIRLINE: "frontal_hairline",
  TEMPLES: "temples",
  MID_SCALP: "mid_scalp",
  CROWN: "crown",
  PART_LINE: "part_line",
  VERTEX: "vertex",
  WHOLE_SCALP: "whole_scalp",
  DONOR_BACK: "donor_back",
} as const;

export const SCALP_QUALITY_FLAG = {
  BLUR: "blur",
  GLARE: "glare",
  POOR_LIGHTING: "poor_lighting",
  MOTION: "motion",
  OCCLUSION: "occlusion",
  TOO_FAR: "too_far",
  TOO_CLOSE: "too_close",
  COLOR_CAST: "color_cast",
  MIXED_ANGLE: "mixed_angle",
} as const;

export const SCALP_EVIDENCE_LEVEL = {
  NONE: "none",
  POSSIBLE: "possible",
  LIKELY: "likely",
  UNCERTAIN: "uncertain",
} as const;

export type ScalpEvidenceFeatureKey =
  | "temple_recession"
  | "crown_thinning"
  | "part_widening"
  | "diffuse_density"
  | "edge_thinning"
  | "redness_scale"
  | "patchy_loss";

export type ScalpEvidenceFeatures = Record<ScalpEvidenceFeatureKey, SCALP_EVIDENCE_LEVEL_VALUE>;

type SCALP_EVIDENCE_LEVEL_VALUE =
  (typeof SCALP_EVIDENCE_LEVEL)[keyof typeof SCALP_EVIDENCE_LEVEL];

const EVIDENCE_KEYS: ScalpEvidenceFeatureKey[] = [
  "temple_recession",
  "crown_thinning",
  "part_widening",
  "diffuse_density",
  "edge_thinning",
  "redness_scale",
  "patchy_loss",
];

const ANALYSIS_VERSION = "openai_scalp_draft_v2";
const ALLOWED_DISTRIBUTION = [
  "frontal_hairline",
  "temples",
  "mid_scalp",
  "crown",
  "part_line",
  "whole_scalp",
] as const;

const SCALP_IMAGE_JSON_SCHEMA = {
  name: "hli_longevity_scalp_image_analysis",
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "image_quality",
      "detected_view",
      "usability",
      "quality_flags",
      "thinning_distribution",
      "severity_estimate",
      "visible_findings",
      "evidence_features",
      "evidence_confidence",
      "limitations",
      "confidence",
      "manual_review_recommended",
      "draft_summary",
    ],
    properties: {
      image_quality: {
        type: "string",
        enum: Object.values(SCALP_IMAGE_QUALITY),
      },
      detected_view: {
        type: "string",
        enum: Object.values(SCALP_DETECTED_VIEW),
      },
      usability: {
        type: "string",
        enum: Object.values(SCALP_IMAGE_QUALITY),
      },
      quality_flags: {
        type: "array",
        items: {
          type: "string",
          enum: Object.values(SCALP_QUALITY_FLAG),
        },
      },
      thinning_distribution: {
        type: "array",
        items: { type: "string", enum: [...ALLOWED_DISTRIBUTION] },
      },
      severity_estimate: {
        type: "string",
        enum: Object.values(SCALP_SEVERITY_ESTIMATE),
      },
      visible_findings: {
        type: "array",
        items: {
          type: "string",
          enum: Object.values(SCALP_VISIBLE_FINDING),
        },
      },
      evidence_features: {
        type: "object",
        additionalProperties: false,
        required: [...EVIDENCE_KEYS],
        properties: Object.fromEntries(
          EVIDENCE_KEYS.map((k) => [
            k,
            { type: "string", enum: Object.values(SCALP_EVIDENCE_LEVEL) },
          ])
        ),
      },
      evidence_confidence: { type: "number" },
      limitations: {
        type: "array",
        items: { type: "string" },
      },
      confidence: { type: "number" },
      manual_review_recommended: { type: "boolean" },
      draft_summary: { type: "string" },
    },
  },
} as const;

export type ScalpImageAnalysisPerImage = {
  image_quality: (typeof SCALP_IMAGE_QUALITY)[keyof typeof SCALP_IMAGE_QUALITY];
  detected_view: (typeof SCALP_DETECTED_VIEW)[keyof typeof SCALP_DETECTED_VIEW];
  usability: (typeof SCALP_IMAGE_QUALITY)[keyof typeof SCALP_IMAGE_QUALITY];
  quality_flags: string[];
  thinning_distribution: string[];
  severity_estimate: (typeof SCALP_SEVERITY_ESTIMATE)[keyof typeof SCALP_SEVERITY_ESTIMATE];
  visible_findings: string[];
  evidence_features: ScalpEvidenceFeatures;
  evidence_confidence: number;
  limitations: string[];
  confidence: number;
  manual_review_recommended: boolean;
  draft_summary: string;
};

export type ScalpImageCaseSynthesis = {
  sufficient_for_pattern_review: boolean;
  missing_views: string[];
  image_confidence: number;
  visual_pattern_candidates: string[];
};

export type ScalpPerDocumentMetadata = {
  document_id: string;
  detected_view: string;
  usability: string;
  quality_flags: string[];
};

type ScalpImageQuality =
  (typeof SCALP_IMAGE_QUALITY)[keyof typeof SCALP_IMAGE_QUALITY];
type ScalpSeverityEstimate =
  (typeof SCALP_SEVERITY_ESTIMATE)[keyof typeof SCALP_SEVERITY_ESTIMATE];

export type ScalpImageAnalysisDraft = {
  image_quality: string;
  thinning_distribution: string[];
  severity_estimate: string;
  visible_findings: string[];
  comparison_direction: string;
  confidence: number;
  manual_review_recommended: boolean;
  draft_summary: string;
  raw_payload: Record<string, unknown>;
};

function clampConfidence(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return 0.4;
  return Math.max(0, Math.min(1, num));
}

function normalizeStringArray(
  input: unknown,
  allowed: readonly string[]
): string[] {
  if (!Array.isArray(input)) return [];
  const allowedSet = new Set(allowed);
  return input
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => allowedSet.has(item));
}

function normalizeEvidenceFeatures(input: unknown): ScalpEvidenceFeatures {
  const levels = Object.values(SCALP_EVIDENCE_LEVEL);
  const base = {} as ScalpEvidenceFeatures;
  const record =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  for (const key of EVIDENCE_KEYS) {
    const v = record[key];
    base[key] = levels.includes(v as SCALP_EVIDENCE_LEVEL_VALUE)
      ? (v as SCALP_EVIDENCE_LEVEL_VALUE)
      : SCALP_EVIDENCE_LEVEL.UNCERTAIN;
  }
  return base;
}

function normalizeLimitations(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function normalizePerImageAnalysis(payload: unknown): ScalpImageAnalysisPerImage {
  const record =
    payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const image_quality: ScalpImageQuality = Object.values(SCALP_IMAGE_QUALITY).includes(
    record.image_quality as ScalpImageQuality
  )
    ? (record.image_quality as ScalpImageQuality)
    : SCALP_IMAGE_QUALITY.BORDERLINE;
  const detected_view = Object.values(SCALP_DETECTED_VIEW).includes(
    record.detected_view as (typeof SCALP_DETECTED_VIEW)[keyof typeof SCALP_DETECTED_VIEW]
  )
    ? (record.detected_view as (typeof SCALP_DETECTED_VIEW)[keyof typeof SCALP_DETECTED_VIEW])
    : SCALP_DETECTED_VIEW.UNCLEAR;
  const usability: ScalpImageQuality = Object.values(SCALP_IMAGE_QUALITY).includes(
    record.usability as ScalpImageQuality
  )
    ? (record.usability as ScalpImageQuality)
    : image_quality;
  const quality_flags = normalizeStringArray(
    record.quality_flags,
    Object.values(SCALP_QUALITY_FLAG)
  );
  const severity_estimate: ScalpSeverityEstimate = Object.values(SCALP_SEVERITY_ESTIMATE).includes(
    record.severity_estimate as ScalpSeverityEstimate
  )
    ? (record.severity_estimate as ScalpSeverityEstimate)
    : SCALP_SEVERITY_ESTIMATE.UNCERTAIN;
  const visible_findings = normalizeStringArray(
    record.visible_findings,
    Object.values(SCALP_VISIBLE_FINDING)
  );
  const thinning_distribution = normalizeStringArray(
    record.thinning_distribution,
    ALLOWED_DISTRIBUTION
  );

  return {
    image_quality,
    detected_view,
    usability,
    quality_flags,
    thinning_distribution,
    severity_estimate,
    visible_findings,
    evidence_features: normalizeEvidenceFeatures(record.evidence_features),
    evidence_confidence: clampConfidence(record.evidence_confidence),
    limitations: normalizeLimitations(record.limitations),
    confidence: clampConfidence(record.confidence),
    manual_review_recommended:
      typeof record.manual_review_recommended === "boolean"
        ? record.manual_review_recommended
        : true,
    draft_summary:
      typeof record.draft_summary === "string" && record.draft_summary.trim()
        ? record.draft_summary.trim()
        : "Draft estimate only. Manual review recommended.",
  };
}

function severityRank(severity: string): number | null {
  switch (severity) {
    case SCALP_SEVERITY_ESTIMATE.MINIMAL:
      return 1;
    case SCALP_SEVERITY_ESTIMATE.MILD:
      return 2;
    case SCALP_SEVERITY_ESTIMATE.MODERATE:
      return 3;
    case SCALP_SEVERITY_ESTIMATE.ADVANCED:
      return 4;
    default:
      return null;
  }
}

function aggregateQuality(items: ScalpImageAnalysisPerImage[]): string {
  if (items.some((item) => item.image_quality === SCALP_IMAGE_QUALITY.POOR)) {
    return SCALP_IMAGE_QUALITY.POOR;
  }
  if (
    items.some((item) => item.image_quality === SCALP_IMAGE_QUALITY.BORDERLINE)
  ) {
    return SCALP_IMAGE_QUALITY.BORDERLINE;
  }
  return SCALP_IMAGE_QUALITY.USABLE;
}

function aggregateSeverity(items: ScalpImageAnalysisPerImage[]): string {
  let maxRank = 0;
  let selected = SCALP_SEVERITY_ESTIMATE.UNCERTAIN;
  for (const item of items) {
    const rank = severityRank(item.severity_estimate);
    if (rank != null && rank >= maxRank) {
      maxRank = rank;
      selected = item.severity_estimate as typeof selected;
    }
  }
  return selected;
}

function averageConfidence(items: ScalpImageAnalysisPerImage[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + item.confidence, 0);
  return Math.round((total / items.length) * 100) / 100;
}

function averageEvidenceConfidence(items: ScalpImageAnalysisPerImage[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + item.evidence_confidence, 0);
  return Math.round((total / items.length) * 100) / 100;
}

function unionLists(items: string[][]): string[] {
  return Array.from(new Set(items.flat().filter(Boolean)));
}

function comparisonDirection(
  currentItems: ScalpImageAnalysisPerImage[],
  previousItems: ScalpImageAnalysisPerImage[]
): string {
  if (currentItems.length === 0 || previousItems.length === 0) {
    return SCALP_COMPARISON_DIRECTION.INSUFFICIENT_IMAGES;
  }
  const currentRank = severityRank(aggregateSeverity(currentItems));
  const previousRank = severityRank(aggregateSeverity(previousItems));
  if (currentRank == null || previousRank == null) {
    return SCALP_COMPARISON_DIRECTION.UNCERTAIN;
  }
  if (currentRank < previousRank) return SCALP_COMPARISON_DIRECTION.IMPROVED;
  if (currentRank > previousRank) return SCALP_COMPARISON_DIRECTION.WORSENED;
  return SCALP_COMPARISON_DIRECTION.STABLE;
}

function buildDraftSummary(params: {
  image_quality: string;
  thinning_distribution: string[];
  severity_estimate: string;
  visible_findings: string[];
  comparison_direction: string;
  confidence: number;
  manual_review_recommended: boolean;
}): string {
  const parts: string[] = [];
  parts.push(`Draft estimate only: image quality is ${params.image_quality}.`);
  if (params.thinning_distribution.length > 0) {
    parts.push(
      `Possible visible thinning distribution: ${params.thinning_distribution
        .join(", ")
        .replace(/_/g, " ")}.`
    );
  }
  parts.push(`Draft severity estimate: ${params.severity_estimate}.`);
  if (params.visible_findings.length > 0) {
    parts.push(
      `Possible visible findings: ${params.visible_findings
        .join(", ")
        .replace(/_/g, " ")}.`
    );
  }
  if (params.comparison_direction !== SCALP_COMPARISON_DIRECTION.INSUFFICIENT_IMAGES) {
    parts.push(
      `Possible visible change versus previous photos: ${params.comparison_direction}.`
    );
  }
  parts.push(`Confidence: ${Math.round(params.confidence * 100)}%.`);
  parts.push(
    params.manual_review_recommended
      ? "Manual review recommended before any interpretation."
      : "Trichologist review still required before use."
  );
  return parts.join(" ");
}

function buildPrompt(filename?: string): string {
  return [
    "You are supporting Hair Longevity Institute clinical review.",
    "Analyze this scalp photograph and return only the requested JSON.",
    "Use non-diagnostic, draft-only language.",
    "Do not state diagnoses. Use terms like possible, likely, draft estimate, and manual review recommended.",
    "Assess image quality, detected_view (camera angle), usability for assessment, quality_flags, thinning distribution, draft severity, visible scale/redness/inflammation.",
    "evidence_features: rate each scalp evidence feature as none, possible, likely, or uncertain (not diagnostic).",
    "evidence_confidence: 0–1 for how much visible evidence supports those feature ratings.",
    "limitations: short bullet strings describing what the image cannot show (e.g. crown not visible).",
    "If the image is low quality or ambiguous, lower confidence and set manual_review_recommended to true.",
    filename ? `Source filename: ${filename}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

const IDEAL_VIEWS = new Set([
  SCALP_DETECTED_VIEW.FRONTAL_HAIRLINE,
  SCALP_DETECTED_VIEW.TEMPLES,
  SCALP_DETECTED_VIEW.CROWN,
  SCALP_DETECTED_VIEW.PART_LINE,
]);

function itemIncludesWholeScalp(
  items: Array<ScalpImageAnalysisPerImage & { document_id: string }>
): boolean {
  return items.some(
    (i) =>
      i.detected_view === SCALP_DETECTED_VIEW.WHOLE_SCALP ||
      i.thinning_distribution.includes("whole_scalp")
  );
}

function evidenceLevelScore(level: SCALP_EVIDENCE_LEVEL_VALUE): number {
  switch (level) {
    case SCALP_EVIDENCE_LEVEL.LIKELY:
      return 3;
    case SCALP_EVIDENCE_LEVEL.POSSIBLE:
      return 2;
    case SCALP_EVIDENCE_LEVEL.UNCERTAIN:
      return 1;
    default:
      return 0;
  }
}

function deriveVisualPatternCandidates(
  items: ScalpImageAnalysisPerImage[]
): string[] {
  const out: string[] = [];
  const dist = unionLists(items.map((i) => i.thinning_distribution));
  const agg = items.reduce(
    (acc, item) => {
      for (const k of EVIDENCE_KEYS) {
        acc[k] = Math.max(acc[k] ?? 0, evidenceLevelScore(item.evidence_features[k]));
      }
      return acc;
    },
    {} as Record<string, number>
  );

  if (
    (agg.temple_recession ?? 0) >= 2 ||
    dist.includes("temples") ||
    dist.includes("frontal_hairline")
  ) {
    out.push("androgenetic_pattern");
  }
  if ((agg.crown_thinning ?? 0) >= 2 || dist.includes("crown")) {
    out.push("crown_or_vertex_thinning");
  }
  if ((agg.part_widening ?? 0) >= 2 || dist.includes("part_line")) {
    out.push("part_line_or_mid_scalp_change");
  }
  if ((agg.diffuse_density ?? 0) >= 2 || dist.includes("whole_scalp") || dist.includes("mid_scalp")) {
    out.push("diffuse_density_change");
  }
  if ((agg.edge_thinning ?? 0) >= 2) {
    out.push("marginal_or_traction_pattern");
  }
  if ((agg.redness_scale ?? 0) >= 2 ||
    items.some((i) => i.visible_findings.includes(SCALP_VISIBLE_FINDING.POSSIBLE_REDNESS) ||
      i.visible_findings.includes(SCALP_VISIBLE_FINDING.POSSIBLE_SCALE))) {
    out.push("inflammatory_or_scaling_pattern");
  }
  if ((agg.patchy_loss ?? 0) >= 2) {
    out.push("patchy_or_multifocal_loss");
  }

  return Array.from(new Set(out));
}

export function buildCaseLevelSynthesis(
  items: Array<ScalpImageAnalysisPerImage & { document_id: string }>
): ScalpImageCaseSynthesis {
  const detected = new Set<string>();
  for (const item of items) {
    if (
      item.detected_view !== SCALP_DETECTED_VIEW.UNKNOWN &&
      item.detected_view !== SCALP_DETECTED_VIEW.UNCLEAR
    ) {
      detected.add(item.detected_view);
    }
  }
  if (itemIncludesWholeScalp(items)) {
    detected.add(SCALP_DETECTED_VIEW.FRONTAL_HAIRLINE);
    detected.add(SCALP_DETECTED_VIEW.CROWN);
  }

  const missing_views = [...IDEAL_VIEWS].filter((v) => !detected.has(v));

  const usableCount = items.filter(
    (i) =>
      i.usability === SCALP_IMAGE_QUALITY.USABLE ||
      (i.usability === SCALP_IMAGE_QUALITY.BORDERLINE &&
        i.image_quality !== SCALP_IMAGE_QUALITY.POOR)
  ).length;

  const ev = averageEvidenceConfidence(items);
  const conf = averageConfidence(items);
  const usabilityWeight = usableCount / Math.max(1, items.length);
  const blended = Math.min(
    1,
    ev * 0.55 + conf * 0.35 + usabilityWeight * 0.1
  );
  const clampedConfidence = Math.round(Math.max(0, blended) * 100) / 100;

  const visual_pattern_candidates = deriveVisualPatternCandidates(items);

  const sufficient_for_pattern_review =
    usableCount >= 1 &&
    clampedConfidence >= 0.35 &&
    (missing_views.length <= 2 ||
      detected.has(SCALP_DETECTED_VIEW.WHOLE_SCALP) ||
      usableCount >= 2);

  return {
    sufficient_for_pattern_review,
    missing_views,
    image_confidence: clampedConfidence,
    visual_pattern_candidates,
  };
}

export type ScalpImageEvidenceSummaryRow = {
  document_id: string;
  evidence_features: ScalpEvidenceFeatures;
  evidence_confidence: number;
  limitations: string[];
};

export function extractPerImageEvidenceFromRawPayload(
  raw: Record<string, unknown> | null | undefined
): ScalpImageEvidenceSummaryRow[] {
  if (!raw || typeof raw !== "object") return [];
  const cur = (raw as { current_image_analyses?: unknown }).current_image_analyses;
  if (!Array.isArray(cur)) return [];
  const out: ScalpImageEvidenceSummaryRow[] = [];
  for (const item of cur) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const id = typeof rec.document_id === "string" ? rec.document_id : "";
    if (!id) continue;
    out.push({
      document_id: id,
      evidence_features: normalizeEvidenceFeatures(rec.evidence_features),
      evidence_confidence: clampConfidence(rec.evidence_confidence),
      limitations: normalizeLimitations(rec.limitations),
    });
  }
  return out;
}

export function extractCaseSynthesisFromRawPayload(
  raw: Record<string, unknown> | null | undefined
): ScalpImageCaseSynthesis | null {
  if (!raw || typeof raw !== "object") return null;
  const cs = (raw as { case_synthesis?: unknown }).case_synthesis;
  if (!cs || typeof cs !== "object") return null;
  const o = cs as Record<string, unknown>;
  return {
    sufficient_for_pattern_review: o.sufficient_for_pattern_review === true,
    missing_views: Array.isArray(o.missing_views)
      ? o.missing_views.filter((x): x is string => typeof x === "string")
      : [],
    image_confidence: clampConfidence(o.image_confidence),
    visual_pattern_candidates: Array.isArray(o.visual_pattern_candidates)
      ? o.visual_pattern_candidates.filter((x): x is string => typeof x === "string")
      : [],
  };
}

export async function analyzeSingleScalpImage(params: {
  bytes: Uint8Array;
  mimeType: string;
  filename?: string;
  provider: VisionProvider;
}): Promise<ScalpImageAnalysisPerImage> {
  const { text } = await params.provider.analyzeImage({
    imageBytes: params.bytes,
    mimeType: params.mimeType,
    prompt: buildPrompt(params.filename),
    jsonSchema: SCALP_IMAGE_JSON_SCHEMA,
  });

  let parsed: unknown = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {};
  }

  return normalizePerImageAnalysis(parsed);
}

export async function analyzeScalpImageSetDraft(params: {
  currentFiles: Array<{
    documentId: string;
    bytes: Uint8Array;
    mimeType: string;
    filename: string | null;
  }>;
  previousFiles?: Array<{
    documentId: string;
    bytes: Uint8Array;
    mimeType: string;
    filename: string | null;
  }>;
  provider: VisionProvider;
}): Promise<ScalpImageAnalysisDraft> {
  const currentAnalyses = await Promise.all(
    params.currentFiles.map((file) =>
      analyzeSingleScalpImage({
        bytes: file.bytes,
        mimeType: file.mimeType,
        filename: file.filename ?? undefined,
        provider: params.provider,
      })
    )
  );
  const previousAnalyses = await Promise.all(
    (params.previousFiles ?? []).map((file) =>
      analyzeSingleScalpImage({
        bytes: file.bytes,
        mimeType: file.mimeType,
        filename: file.filename ?? undefined,
        provider: params.provider,
      })
    )
  );

  const currentWithIds: Array<ScalpImageAnalysisPerImage & { document_id: string }> =
    params.currentFiles.map((file, i) => ({
      ...currentAnalyses[i],
      document_id: file.documentId,
    }));

  const per_document_meta: ScalpPerDocumentMetadata[] = currentWithIds.map((row) => ({
    document_id: row.document_id,
    detected_view: row.detected_view,
    usability: row.usability,
    quality_flags: row.quality_flags,
  }));

  const case_synthesis = buildCaseLevelSynthesis(currentWithIds);

  const image_quality = aggregateQuality(currentAnalyses);
  const thinning_distribution = unionLists(
    currentAnalyses.map((item) => item.thinning_distribution)
  );
  const severity_estimate = aggregateSeverity(currentAnalyses);
  const visible_findings = unionLists(
    currentAnalyses.map((item) => item.visible_findings)
  );
  const comparison_direction = comparisonDirection(
    currentAnalyses,
    previousAnalyses
  );
  const confidence = averageConfidence(currentAnalyses);
  const manual_review_recommended =
    currentAnalyses.some((item) => item.manual_review_recommended) ||
    image_quality !== SCALP_IMAGE_QUALITY.USABLE ||
    confidence < 0.75;

  const draft_summary = buildDraftSummary({
    image_quality,
    thinning_distribution,
    severity_estimate,
    visible_findings,
    comparison_direction,
    confidence,
    manual_review_recommended,
  });

  return {
    image_quality,
    thinning_distribution,
    severity_estimate,
    visible_findings,
    comparison_direction,
    confidence,
    manual_review_recommended,
    draft_summary,
    raw_payload: {
      version: ANALYSIS_VERSION,
      case_synthesis,
      per_document_meta,
      current_image_analyses: currentWithIds,
      previous_image_analyses: previousAnalyses,
    },
  };
}

export const SCALP_IMAGE_ANALYSIS_VERSION = ANALYSIS_VERSION;
