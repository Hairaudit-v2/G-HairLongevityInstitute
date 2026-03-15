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

export type ScalpImageAnalysisPerImage = {
  image_quality: (typeof SCALP_IMAGE_QUALITY)[keyof typeof SCALP_IMAGE_QUALITY];
  thinning_distribution: string[];
  severity_estimate:
    (typeof SCALP_SEVERITY_ESTIMATE)[keyof typeof SCALP_SEVERITY_ESTIMATE];
  visible_findings: string[];
  confidence: number;
  manual_review_recommended: boolean;
  draft_summary: string;
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

const ANALYSIS_VERSION = "openai_scalp_draft_v1";
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
      "thinning_distribution",
      "severity_estimate",
      "visible_findings",
      "confidence",
      "manual_review_recommended",
      "draft_summary",
    ],
    properties: {
      image_quality: {
        type: "string",
        enum: Object.values(SCALP_IMAGE_QUALITY),
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
      confidence: { type: "number" },
      manual_review_recommended: { type: "boolean" },
      draft_summary: { type: "string" },
    },
  },
} as const;

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

function normalizePerImageAnalysis(payload: unknown): ScalpImageAnalysisPerImage {
  const record =
    payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const image_quality: ScalpImageQuality = Object.values(SCALP_IMAGE_QUALITY).includes(
    record.image_quality as ScalpImageQuality
  )
    ? (record.image_quality as ScalpImageQuality)
    : SCALP_IMAGE_QUALITY.BORDERLINE;
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
    thinning_distribution,
    severity_estimate,
    visible_findings,
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
    "Assess image quality, visible thinning distribution, draft severity estimate, and any possible visible scale, redness, or inflammation.",
    "If the image is low quality or ambiguous, lower confidence and set manual_review_recommended to true.",
    filename ? `Source filename: ${filename}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
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
      current_image_analyses: currentAnalyses,
      previous_image_analyses: previousAnalyses,
    },
  };
}

export const SCALP_IMAGE_ANALYSIS_VERSION = ANALYSIS_VERSION;
