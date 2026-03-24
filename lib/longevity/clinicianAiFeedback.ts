import type { SupabaseClient } from "@supabase/supabase-js";

export const CLINICIAN_AI_USEFULNESS = {
  USEFUL: "useful",
  UNCLEAR: "unclear",
  MISLEADING: "misleading",
} as const;

export type ClinicianAiUsefulness =
  (typeof CLINICIAN_AI_USEFULNESS)[keyof typeof CLINICIAN_AI_USEFULNESS];

export type ClinicianAiFeedbackRow = {
  id: string;
  intake_id: string;
  profile_id: string;
  trichologist_id: string | null;
  adaptive_triage_usefulness: string | null;
  scalp_image_intelligence_usefulness: string | null;
  intake_image_fusion_usefulness: string | null;
  note: string | null;
  created_at: string;
};

function normalizeRating(
  value: unknown
): ClinicianAiUsefulness | null {
  if (value !== "useful" && value !== "unclear" && value !== "misleading") {
    return null;
  }
  return value;
}

export function parseClinicianAiFeedbackBody(body: Record<string, unknown>): {
  adaptive_triage_usefulness: ClinicianAiUsefulness | null;
  scalp_image_intelligence_usefulness: ClinicianAiUsefulness | null;
  intake_image_fusion_usefulness: ClinicianAiUsefulness | null;
  note: string | null;
} {
  const noteRaw = typeof body.note === "string" ? body.note.trim() : "";
  const note = noteRaw.length > 0 ? noteRaw.slice(0, 2000) : null;
  return {
    adaptive_triage_usefulness: normalizeRating(body.adaptive_triage_usefulness),
    scalp_image_intelligence_usefulness: normalizeRating(
      body.scalp_image_intelligence_usefulness
    ),
    intake_image_fusion_usefulness: normalizeRating(
      body.intake_image_fusion_usefulness
    ),
    note,
  };
}

export async function insertClinicianAiFeedback(
  supabase: SupabaseClient,
  params: {
    intake_id: string;
    profile_id: string;
    trichologist_id: string;
    adaptive_triage_usefulness: ClinicianAiUsefulness | null;
    scalp_image_intelligence_usefulness: ClinicianAiUsefulness | null;
    intake_image_fusion_usefulness: ClinicianAiUsefulness | null;
    note: string | null;
  }
): Promise<{ ok: true; id: string; created_at: string } | { ok: false; error: string }> {
  const hasAny =
    params.adaptive_triage_usefulness != null ||
    params.scalp_image_intelligence_usefulness != null ||
    params.intake_image_fusion_usefulness != null ||
    params.note != null;
  if (!hasAny) {
    return { ok: false, error: "Provide at least one rating or a note." };
  }

  const { data, error } = await supabase
    .from("hli_longevity_clinician_ai_feedback")
    .insert({
      intake_id: params.intake_id,
      profile_id: params.profile_id,
      trichologist_id: params.trichologist_id,
      adaptive_triage_usefulness: params.adaptive_triage_usefulness,
      scalp_image_intelligence_usefulness: params.scalp_image_intelligence_usefulness,
      intake_image_fusion_usefulness: params.intake_image_fusion_usefulness,
      note: params.note,
    })
    .select("id, created_at")
    .single();

  if (error || !data?.id) {
    return { ok: false, error: error?.message ?? "Failed to save feedback." };
  }
  return {
    ok: true,
    id: data.id,
    created_at: data.created_at as string,
  };
}

/** Latest feedback row from this trichologist for case UI (optional). */
export async function getLatestClinicianAiFeedbackForIntake(
  supabase: SupabaseClient,
  intake_id: string,
  trichologist_id: string
): Promise<ClinicianAiFeedbackRow | null> {
  const { data, error } = await supabase
    .from("hli_longevity_clinician_ai_feedback")
    .select(
      "id, intake_id, profile_id, trichologist_id, adaptive_triage_usefulness, scalp_image_intelligence_usefulness, intake_image_fusion_usefulness, note, created_at"
    )
    .eq("intake_id", intake_id)
    .eq("trichologist_id", trichologist_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as ClinicianAiFeedbackRow;
}
