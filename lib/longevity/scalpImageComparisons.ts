import type { SupabaseClient } from "@supabase/supabase-js";
import { LONGEVITY_DOC_TYPE } from "./documentTypes";
import {
  SCALP_FINDING_CONFIDENCE,
  SCALP_IMAGE_COMPARISON_STATUS,
  SCALP_VISUAL_LIKELIHOOD,
  compareConfirmedScalpImageFindings,
  isImageQualityInsufficient,
  type ConfirmedScalpImageFindings,
  type ScalpFindingConfidence,
  type ScalpImageComparisonStatus,
  type ScalpVisualLikelihood,
} from "./scalpImageComparison";
import {
  SCALP_IMAGE_QUALITY,
  SCALP_SEVERITY_ESTIMATE,
} from "./scalpImageAnalysis";

export { SCALP_IMAGE_COMPARISON_STATUS };
export type { ScalpImageComparisonStatus };

export type ScalpImageComparisonRow = {
  id: string;
  profile_id: string;
  intake_id: string;
  previous_intake_id: string | null;
  trichologist_id: string;
  comparison_status: ScalpImageComparisonStatus;
  compared_regions: string[];
  clinician_summary: string | null;
  current_thinning_distribution: string[];
  current_severity_band: string | null;
  current_visible_scale_likelihood: ScalpVisualLikelihood | null;
  current_visible_redness_likelihood: ScalpVisualLikelihood | null;
  current_image_quality: string | null;
  current_finding_confidence: ScalpFindingConfidence | null;
  visual_progress_summary: string[];
  visual_persistent_drivers: string[];
  visual_follow_up_considerations: string[];
  visual_comparison_confidence: ScalpFindingConfidence | null;
  progression_signals: string[];
  patient_visual_progress_summary: string[];
  created_at: string;
  updated_at: string;
};

export type ConfirmedScalpImageFindingSummary = ConfirmedScalpImageFindings & {
  suitableForComparison: boolean;
};

export type ScalpImageComparisonSummary = {
  recordId: string | null;
  previousIntakeId: string | null;
  previousConfirmedIntakeId: string | null;
  currentPhotoCount: number;
  previousPhotoCount: number;
  canCompare: boolean;
  hasCurrentConfirmedFindings: boolean;
  hasPreviousConfirmedFindings: boolean;
  canCompareConfirmed: boolean;
  comparisonStatus: ScalpImageComparisonStatus;
  comparedRegions: string[];
  clinicianSummary: string[];
  clinicianNotes: string | null;
  currentFindings: ConfirmedScalpImageFindingSummary | null;
  previousFindings: ConfirmedScalpImageFindingSummary | null;
  visualProgressSummary: string[];
  visualPersistentDrivers: string[];
  visualFollowUpConsiderations: string[];
  visualComparisonConfidence: ScalpFindingConfidence;
  progressionSignals: string[];
  patientVisualProgressSummary: string[];
  comparisonLimitedByImageQuality: boolean;
};

type ConfirmedScalpImageFindingsInput = Partial<ConfirmedScalpImageFindings> | null | undefined;

const SELECT_FIELDS = [
  "id",
  "profile_id",
  "intake_id",
  "previous_intake_id",
  "trichologist_id",
  "comparison_status",
  "compared_regions",
  "clinician_summary",
  "current_thinning_distribution",
  "current_severity_band",
  "current_visible_scale_likelihood",
  "current_visible_redness_likelihood",
  "current_image_quality",
  "current_finding_confidence",
  "visual_progress_summary",
  "visual_persistent_drivers",
  "visual_follow_up_considerations",
  "visual_comparison_confidence",
  "progression_signals",
  "patient_visual_progress_summary",
  "created_at",
  "updated_at",
].join(", ");

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function pushUnique(target: string[], value: string) {
  if (!value || target.includes(value)) return;
  target.push(value);
}

function normalizeSeverityBand(value: string | null | undefined) {
  return Object.values(SCALP_SEVERITY_ESTIMATE).includes(
    value as (typeof SCALP_SEVERITY_ESTIMATE)[keyof typeof SCALP_SEVERITY_ESTIMATE]
  )
    ? (value as (typeof SCALP_SEVERITY_ESTIMATE)[keyof typeof SCALP_SEVERITY_ESTIMATE])
    : null;
}

function normalizeImageQuality(value: string | null | undefined) {
  return Object.values(SCALP_IMAGE_QUALITY).includes(
    value as (typeof SCALP_IMAGE_QUALITY)[keyof typeof SCALP_IMAGE_QUALITY]
  )
    ? (value as (typeof SCALP_IMAGE_QUALITY)[keyof typeof SCALP_IMAGE_QUALITY])
    : null;
}

function normalizeLikelihood(value: string | null | undefined): ScalpVisualLikelihood | null {
  return Object.values(SCALP_VISUAL_LIKELIHOOD).includes(value as ScalpVisualLikelihood)
    ? (value as ScalpVisualLikelihood)
    : null;
}

function normalizeConfidence(value: string | null | undefined): ScalpFindingConfidence | null {
  return Object.values(SCALP_FINDING_CONFIDENCE).includes(
    value as ScalpFindingConfidence
  )
    ? (value as ScalpFindingConfidence)
    : null;
}

function toConfirmedFindings(
  row: Pick<
    ScalpImageComparisonRow,
    | "current_thinning_distribution"
    | "current_severity_band"
    | "current_visible_scale_likelihood"
    | "current_visible_redness_likelihood"
    | "current_image_quality"
    | "current_finding_confidence"
  > | null
): ConfirmedScalpImageFindings | null {
  if (!row) return null;
  const findings: ConfirmedScalpImageFindings = {
    thinningDistribution: row.current_thinning_distribution ?? [],
    severityBand: normalizeSeverityBand(row.current_severity_band),
    visibleScaleLikelihood: normalizeLikelihood(
      row.current_visible_scale_likelihood
    ),
    visibleRednessLikelihood: normalizeLikelihood(
      row.current_visible_redness_likelihood
    ),
    imageQuality: normalizeImageQuality(row.current_image_quality),
    findingConfidence: normalizeConfidence(row.current_finding_confidence),
  };
  const hasAny =
    findings.thinningDistribution.length > 0 ||
    !!findings.severityBand ||
    !!findings.visibleScaleLikelihood ||
    !!findings.visibleRednessLikelihood ||
    !!findings.imageQuality ||
    !!findings.findingConfidence;
  return hasAny ? findings : null;
}

function toFindingSummary(
  findings: ConfirmedScalpImageFindings | null
): ConfirmedScalpImageFindingSummary | null {
  if (!findings) return null;
  return {
    ...findings,
    suitableForComparison: !isImageQualityInsufficient(findings.imageQuality),
  };
}

function formatFindingSet(prefix: string, findings: ConfirmedScalpImageFindingSummary): string[] {
  const lines: string[] = [];
  if (findings.thinningDistribution.length > 0) {
    lines.push(
      `${prefix} thinning distribution: ${findings.thinningDistribution
        .join(", ")
        .replace(/_/g, " ")}.`
    );
  }
  if (findings.severityBand) {
    lines.push(`${prefix} severity band: ${findings.severityBand}.`);
  }
  if (findings.visibleScaleLikelihood) {
    lines.push(
      `${prefix} visible scale likelihood: ${findings.visibleScaleLikelihood}.`
    );
  }
  if (findings.visibleRednessLikelihood) {
    lines.push(
      `${prefix} visible redness / inflammatory feature likelihood: ${findings.visibleRednessLikelihood}.`
    );
  }
  if (findings.imageQuality) {
    lines.push(
      `${prefix} image quality: ${findings.imageQuality} (${findings.suitableForComparison ? "suitable for comparison" : "comparison limited"}).`
    );
  }
  if (findings.findingConfidence) {
    lines.push(`${prefix} finding confidence: ${findings.findingConfidence}.`);
  }
  return lines;
}

function normalizeCurrentFindingsInput(
  input: ConfirmedScalpImageFindingsInput,
  fallbackRegions: string[]
): ConfirmedScalpImageFindings | null {
  if (!input) {
    return fallbackRegions.length > 0
      ? {
          thinningDistribution: fallbackRegions,
          severityBand: null,
          visibleScaleLikelihood: null,
          visibleRednessLikelihood: null,
          imageQuality: null,
          findingConfidence: null,
        }
      : null;
  }

  const findings: ConfirmedScalpImageFindings = {
    thinningDistribution: Array.isArray(input.thinningDistribution)
      ? input.thinningDistribution.filter(Boolean)
      : fallbackRegions,
    severityBand: normalizeSeverityBand(input.severityBand ?? null),
    visibleScaleLikelihood: normalizeLikelihood(
      input.visibleScaleLikelihood ?? null
    ),
    visibleRednessLikelihood: normalizeLikelihood(
      input.visibleRednessLikelihood ?? null
    ),
    imageQuality: normalizeImageQuality(input.imageQuality ?? null),
    findingConfidence: normalizeConfidence(input.findingConfidence ?? null),
  };

  const hasAny =
    findings.thinningDistribution.length > 0 ||
    !!findings.severityBand ||
    !!findings.visibleScaleLikelihood ||
    !!findings.visibleRednessLikelihood ||
    !!findings.imageQuality ||
    !!findings.findingConfidence;
  return hasAny ? findings : null;
}

function hasStructuredCurrentFindings(row: ScalpImageComparisonRow | null | undefined) {
  return !!toConfirmedFindings(row ?? null);
}

function statusLabel(status: ScalpImageComparisonStatus): string {
  switch (status) {
    case SCALP_IMAGE_COMPARISON_STATUS.IMPROVED:
      return "improved";
    case SCALP_IMAGE_COMPARISON_STATUS.STABLE:
      return "stable";
    case SCALP_IMAGE_COMPARISON_STATUS.WORSENED:
      return "worsened";
    case SCALP_IMAGE_COMPARISON_STATUS.UNCERTAIN:
      return "uncertain";
    case SCALP_IMAGE_COMPARISON_STATUS.INSUFFICIENT_IMAGES:
      return "insufficient images";
    default:
      return "pending review";
  }
}

export async function getPreviousSubmittedIntakeId(
  supabase: SupabaseClient,
  profile_id: string,
  intake_id: string
): Promise<string | null> {
  const { data: current } = await supabase
    .from("hli_longevity_intakes")
    .select("created_at")
    .eq("id", intake_id)
    .eq("profile_id", profile_id)
    .maybeSingle();
  if (!current?.created_at) return null;

  const { data: previous } = await supabase
    .from("hli_longevity_intakes")
    .select("id")
    .eq("profile_id", profile_id)
    .lt("created_at", current.created_at)
    .neq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return previous?.id ?? null;
}

async function countScalpPhotosForIntake(
  supabase: SupabaseClient,
  intake_id: string | null
): Promise<number> {
  if (!intake_id) return 0;
  const { count } = await supabase
    .from("hli_longevity_documents")
    .select("id", { count: "exact", head: true })
    .eq("intake_id", intake_id)
    .eq("doc_type", LONGEVITY_DOC_TYPE.SCALP_PHOTO);
  return count ?? 0;
}

async function getPreviousConfirmedComparisonRow(
  supabase: SupabaseClient,
  profile_id: string,
  intake_id: string
): Promise<ScalpImageComparisonRow | null> {
  const { data: current } = await supabase
    .from("hli_longevity_intakes")
    .select("created_at")
    .eq("id", intake_id)
    .eq("profile_id", profile_id)
    .maybeSingle();
  if (!current?.created_at) return null;

  const { data: previousIntakes } = await supabase
    .from("hli_longevity_intakes")
    .select("id")
    .eq("profile_id", profile_id)
    .lt("created_at", current.created_at)
    .neq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(12);

  const orderedIds = (previousIntakes ?? []).map((row) => row.id).filter(Boolean);
  if (!orderedIds.length) return null;

  const { data: rows } = await supabase
    .from("hli_longevity_scalp_image_comparisons")
    .select(SELECT_FIELDS)
    .in("intake_id", orderedIds);

  const rowByIntakeId = new Map<string, ScalpImageComparisonRow>();
  for (const row of ((rows ?? []) as unknown) as ScalpImageComparisonRow[]) {
    if (hasStructuredCurrentFindings(row)) {
      rowByIntakeId.set(row.intake_id, row);
    }
  }

  for (const priorId of orderedIds) {
    const row = rowByIntakeId.get(priorId);
    if (row) return row;
  }

  return null;
}

export async function getScalpImageComparisonSummaryForIntake(
  supabase: SupabaseClient,
  profile_id: string,
  intake_id: string
): Promise<ScalpImageComparisonSummary> {
  const previousIntakeId = await getPreviousSubmittedIntakeId(
    supabase,
    profile_id,
    intake_id
  );

  const [{ data: currentRow }, previousConfirmedRow, currentPhotoCount] =
    await Promise.all([
      supabase
        .from("hli_longevity_scalp_image_comparisons")
        .select(SELECT_FIELDS)
        .eq("intake_id", intake_id)
        .maybeSingle(),
      getPreviousConfirmedComparisonRow(supabase, profile_id, intake_id),
      countScalpPhotosForIntake(supabase, intake_id),
    ]);

  const previousPhotoIntakeId =
    previousConfirmedRow?.intake_id ?? previousIntakeId ?? null;
  const previousPhotoCount = await countScalpPhotosForIntake(
    supabase,
    previousPhotoIntakeId
  );

  const currentFindings = toFindingSummary(
    toConfirmedFindings(
      ((currentRow ?? null) as unknown) as Pick<
        ScalpImageComparisonRow,
        | "current_thinning_distribution"
        | "current_severity_band"
        | "current_visible_scale_likelihood"
        | "current_visible_redness_likelihood"
        | "current_image_quality"
        | "current_finding_confidence"
      >
    )
  );
  const previousFindings = toFindingSummary(
    toConfirmedFindings(previousConfirmedRow)
  );
  const derived = compareConfirmedScalpImageFindings({
    current: currentFindings,
    previous: previousFindings,
  });

  const canCompare = currentPhotoCount > 0 && previousPhotoCount > 0;
  const row = ((currentRow ?? null) as unknown) as ScalpImageComparisonRow | null;
  const comparisonStatus = row?.comparison_status
    ? row.comparison_status
    : canCompare
      ? SCALP_IMAGE_COMPARISON_STATUS.PENDING_REVIEW
      : SCALP_IMAGE_COMPARISON_STATUS.INSUFFICIENT_IMAGES;
  const visualProgressSummary =
    row?.visual_progress_summary?.length ? row.visual_progress_summary : derived.visualProgressSummary;
  const visualPersistentDrivers =
    row?.visual_persistent_drivers?.length
      ? row.visual_persistent_drivers
      : derived.visualPersistentDrivers;
  const visualFollowUpConsiderations =
    row?.visual_follow_up_considerations?.length
      ? row.visual_follow_up_considerations
      : derived.visualFollowUpConsiderations;
  const visualComparisonConfidence =
    row?.visual_comparison_confidence ?? derived.visualComparisonConfidence;
  const progressionSignals =
    row?.progression_signals?.length ? row.progression_signals : derived.progressionSignals;
  const patientVisualProgressSummary =
    row?.patient_visual_progress_summary?.length
      ? row.patient_visual_progress_summary
      : derived.patientVisualProgressSummary;

  const clinicianSummary: string[] = [];
  clinicianSummary.push(
    `Current intake includes ${pluralize(currentPhotoCount, "scalp photo")}.`
  );
  if (previousPhotoIntakeId) {
    clinicianSummary.push(
      `Previous comparison intake includes ${pluralize(previousPhotoCount, "scalp photo")}.`
    );
  } else {
    clinicianSummary.push(
      "No previous submitted intake is available for scalp-image comparison yet."
    );
  }
  if (currentFindings) clinicianSummary.push(...formatFindingSet("Current", currentFindings));
  if (previousFindings) clinicianSummary.push(...formatFindingSet("Previous", previousFindings));
  if (!previousFindings && canCompare) {
    clinicianSummary.push(
      "Previous photo sets exist, but no previous confirmed visual finding set is available yet."
    );
  }
  for (const item of visualProgressSummary) pushUnique(clinicianSummary, item);
  for (const item of visualPersistentDrivers) pushUnique(clinicianSummary, item);
  for (const item of visualFollowUpConsiderations) pushUnique(clinicianSummary, item);
  if (row?.clinician_summary?.trim()) {
    clinicianSummary.push(
      `Clinician comparison note (${statusLabel(comparisonStatus)}): ${row.clinician_summary.trim()}`
    );
  } else if (canCompare && !currentFindings) {
    clinicianSummary.push(
      "Current and previous scalp photo sets are available for clinician confirmation and structured comparison."
    );
  } else if (!canCompare) {
    clinicianSummary.push(
      "A structured scalp-image comparison can be added once both current and previous photo sets are available."
    );
  }

  return {
    recordId: row?.id ?? null,
    previousIntakeId,
    previousConfirmedIntakeId: previousConfirmedRow?.intake_id ?? null,
    currentPhotoCount,
    previousPhotoCount,
    canCompare,
    hasCurrentConfirmedFindings: !!currentFindings,
    hasPreviousConfirmedFindings: !!previousFindings,
    canCompareConfirmed: derived.canCompareConfirmed,
    comparisonStatus,
    comparedRegions:
      row?.compared_regions ?? currentFindings?.thinningDistribution ?? [],
    clinicianSummary,
    clinicianNotes: row?.clinician_summary ?? null,
    currentFindings,
    previousFindings,
    visualProgressSummary,
    visualPersistentDrivers,
    visualFollowUpConsiderations,
    visualComparisonConfidence,
    progressionSignals,
    patientVisualProgressSummary,
    comparisonLimitedByImageQuality:
      row?.progression_signals?.includes("comparison_limited_by_image_quality") ??
      derived.comparisonLimitedByImageQuality,
  };
}

export async function upsertScalpImageComparison(
  supabase: SupabaseClient,
  params: {
    profile_id: string;
    intake_id: string;
    trichologist_id: string;
    comparison_status?: ScalpImageComparisonStatus | null;
    compared_regions?: string[];
    clinician_summary?: string | null;
    current_findings?: ConfirmedScalpImageFindingsInput;
  }
): Promise<{ ok: true; id: string | null } | { error: string }> {
  const previous_intake_id = await getPreviousSubmittedIntakeId(
    supabase,
    params.profile_id,
    params.intake_id
  );
  const previousConfirmedRow = await getPreviousConfirmedComparisonRow(
    supabase,
    params.profile_id,
    params.intake_id
  );

  const currentFindings = normalizeCurrentFindingsInput(
    params.current_findings,
    params.compared_regions ?? []
  );
  const derived = currentFindings
    ? compareConfirmedScalpImageFindings({
        current: currentFindings,
        previous: toConfirmedFindings(previousConfirmedRow),
      })
    : null;

  const comparison_status =
    derived?.comparisonStatus ??
    params.comparison_status ??
    (params.compared_regions?.length
      ? SCALP_IMAGE_COMPARISON_STATUS.PENDING_REVIEW
      : SCALP_IMAGE_COMPARISON_STATUS.INSUFFICIENT_IMAGES);

  const { data, error } = await supabase
    .from("hli_longevity_scalp_image_comparisons")
    .upsert(
      {
        profile_id: params.profile_id,
        intake_id: params.intake_id,
        previous_intake_id,
        trichologist_id: params.trichologist_id,
        comparison_status,
        compared_regions:
          params.compared_regions ?? currentFindings?.thinningDistribution ?? [],
        clinician_summary: params.clinician_summary ?? null,
        current_thinning_distribution: currentFindings?.thinningDistribution ?? [],
        current_severity_band: currentFindings?.severityBand ?? null,
        current_visible_scale_likelihood:
          currentFindings?.visibleScaleLikelihood ?? null,
        current_visible_redness_likelihood:
          currentFindings?.visibleRednessLikelihood ?? null,
        current_image_quality: currentFindings?.imageQuality ?? null,
        current_finding_confidence: currentFindings?.findingConfidence ?? null,
        visual_progress_summary: derived?.visualProgressSummary ?? [],
        visual_persistent_drivers: derived?.visualPersistentDrivers ?? [],
        visual_follow_up_considerations:
          derived?.visualFollowUpConsiderations ?? [],
        visual_comparison_confidence:
          derived?.visualComparisonConfidence ?? null,
        progression_signals: derived?.progressionSignals ?? [],
        patient_visual_progress_summary:
          derived?.patientVisualProgressSummary ?? [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "intake_id" }
    )
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { ok: true, id: data?.id ?? null };
}
