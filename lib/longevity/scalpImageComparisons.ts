import type { SupabaseClient } from "@supabase/supabase-js";
import { LONGEVITY_DOC_TYPE } from "./documentTypes";

export const SCALP_IMAGE_COMPARISON_STATUS = {
  PENDING_REVIEW: "pending_review",
  IMPROVED: "improved",
  STABLE: "stable",
  WORSENED: "worsened",
  UNCERTAIN: "uncertain",
  INSUFFICIENT_IMAGES: "insufficient_images",
} as const;

export type ScalpImageComparisonStatus =
  (typeof SCALP_IMAGE_COMPARISON_STATUS)[keyof typeof SCALP_IMAGE_COMPARISON_STATUS];

export type ScalpImageComparisonRow = {
  id: string;
  profile_id: string;
  intake_id: string;
  previous_intake_id: string | null;
  trichologist_id: string;
  comparison_status: ScalpImageComparisonStatus;
  compared_regions: string[];
  clinician_summary: string | null;
  created_at: string;
  updated_at: string;
};

export type ScalpImageComparisonSummary = {
  recordId: string | null;
  previousIntakeId: string | null;
  currentPhotoCount: number;
  previousPhotoCount: number;
  canCompare: boolean;
  comparisonStatus: ScalpImageComparisonStatus;
  comparedRegions: string[];
  clinicianSummary: string[];
  clinicianNotes: string | null;
};

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
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

  const [{ data: row }, currentPhotoCount, previousPhotoCount] = await Promise.all([
    supabase
      .from("hli_longevity_scalp_image_comparisons")
      .select(
        "id, profile_id, intake_id, previous_intake_id, trichologist_id, comparison_status, compared_regions, clinician_summary, created_at, updated_at"
      )
      .eq("intake_id", intake_id)
      .maybeSingle(),
    countScalpPhotosForIntake(supabase, intake_id),
    countScalpPhotosForIntake(supabase, previousIntakeId),
  ]);

  const canCompare = currentPhotoCount > 0 && previousPhotoCount > 0;
  const comparisonStatus = (row?.comparison_status ??
    (canCompare
      ? SCALP_IMAGE_COMPARISON_STATUS.PENDING_REVIEW
      : SCALP_IMAGE_COMPARISON_STATUS.INSUFFICIENT_IMAGES)) as ScalpImageComparisonStatus;

  const clinicianSummary: string[] = [];
  clinicianSummary.push(
    `Current intake includes ${pluralize(currentPhotoCount, "scalp photo")}.`
  );

  if (previousIntakeId) {
    clinicianSummary.push(
      `Previous comparison intake includes ${pluralize(
        previousPhotoCount,
        "scalp photo"
      )}.`
    );
  } else {
    clinicianSummary.push(
      "No previous submitted intake is available for scalp-image comparison yet."
    );
  }

  if (row?.clinician_summary?.trim()) {
    clinicianSummary.push(
      `Clinician comparison note (${statusLabel(comparisonStatus)}): ${row.clinician_summary.trim()}`
    );
  } else if (canCompare) {
    clinicianSummary.push(
      "Current and previous scalp photo sets are available for clinician comparison."
    );
  } else {
    clinicianSummary.push(
      "A structured scalp-image comparison can be added once both current and previous photo sets are available."
    );
  }

  return {
    recordId: row?.id ?? null,
    previousIntakeId,
    currentPhotoCount,
    previousPhotoCount,
    canCompare,
    comparisonStatus,
    comparedRegions: row?.compared_regions ?? [],
    clinicianSummary,
    clinicianNotes: row?.clinician_summary ?? null,
  };
}

export async function upsertScalpImageComparison(
  supabase: SupabaseClient,
  params: {
    profile_id: string;
    intake_id: string;
    trichologist_id: string;
    comparison_status: ScalpImageComparisonStatus;
    compared_regions: string[];
    clinician_summary?: string | null;
  }
): Promise<{ ok: true; id: string | null } | { error: string }> {
  const previous_intake_id = await getPreviousSubmittedIntakeId(
    supabase,
    params.profile_id,
    params.intake_id
  );

  const { data, error } = await supabase
    .from("hli_longevity_scalp_image_comparisons")
    .upsert(
      {
        profile_id: params.profile_id,
        intake_id: params.intake_id,
        previous_intake_id,
        trichologist_id: params.trichologist_id,
        comparison_status: params.comparison_status,
        compared_regions: params.compared_regions,
        clinician_summary: params.clinician_summary ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "intake_id" }
    )
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { ok: true, id: data?.id ?? null };
}
