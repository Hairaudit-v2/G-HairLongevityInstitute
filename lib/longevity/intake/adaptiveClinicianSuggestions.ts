import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";
import type { AdaptiveRescoreComparison } from "@/lib/longevity/intake";

export type AdaptiveSuggestionCategory =
  | "image_request"
  | "document_request"
  | "review_priority"
  | "pattern_caution"
  | "clinician_followup";

export type AdaptiveSuggestionId =
  | "request_center_part_images"
  | "prioritise_direct_scalp_review"
  | "review_recent_bloodwork_availability"
  | "mixed_pattern_caution"
  | "confirm_traction_history"
  | "confirm_androgen_exposure_chronology"
  | "confirm_postpartum_timing";

export type AdaptiveClinicianSuggestion = {
  id: AdaptiveSuggestionId;
  category: AdaptiveSuggestionCategory;
  message: string;
};

export type AdaptiveClinicianSuggestionsResult = {
  suggestions: AdaptiveClinicianSuggestion[];
};

export type AdaptiveClinicianSuggestionInput = {
  adaptive_triage_output: AdaptiveDerivedSummary | null | undefined;
  adaptive_rescore_comparison?: AdaptiveRescoreComparison | null;
  context?: {
    has_scalp_photo_documents?: boolean;
  };
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function includesAny(values: string[], keys: string[]): boolean {
  return keys.some((k) => values.includes(k));
}

export function deriveAdaptiveClinicianSuggestions(
  input: AdaptiveClinicianSuggestionInput
): AdaptiveClinicianSuggestionsResult {
  const triage = input.adaptive_triage_output;
  if (!triage) return { suggestions: [] };

  const uploadGuidance = asStringArray(triage.upload_guidance);
  const flags = asStringArray(triage.clinician_attention_flags);
  const redFlags = asStringArray(triage.red_flags);
  const primary = typeof triage.primary_pathway === "string" ? triage.primary_pathway : "";
  const secondary = asStringArray(triage.secondary_pathways);
  const deltaChanged = input.adaptive_rescore_comparison?.changed === true;
  const hasScalpPhotos = input.context?.has_scalp_photo_documents === true;

  const suggestions: AdaptiveClinicianSuggestion[] = [];

  if (!hasScalpPhotos && includesAny(uploadGuidance, ["center_part", "top_down", "scalp_closeup"])) {
    suggestions.push({
      id: "request_center_part_images",
      category: "image_request",
      message:
        "Request clearer center-part/top-down scalp images to improve pattern review confidence.",
    });
  }

  if (includesAny(redFlags, ["pustules_or_crusting", "painful_inflamed_scalp", "rapid_patchy_loss"])) {
    suggestions.push({
      id: "prioritise_direct_scalp_review",
      category: "review_priority",
      message:
        "Prioritise direct scalp-focused review due to inflammatory/rapid-change red-flag signals.",
    });
  }

  if (flags.includes("heavy_period_related_iron_risk")) {
    suggestions.push({
      id: "review_recent_bloodwork_availability",
      category: "document_request",
      message:
        "Check whether recent bloodwork is available before final interpretation (iron-related context).",
    });
  }

  if (
    primary === "mixed_pattern" ||
    secondary.includes("mixed_pattern") ||
    deltaChanged
  ) {
    suggestions.push({
      id: "mixed_pattern_caution",
      category: "pattern_caution",
      message:
        "Avoid single-cause assumptions; review for overlapping contributors before concluding.",
    });
  }

  if (
    primary === "traction_mechanical_pattern" ||
    secondary.includes("traction_mechanical_pattern") ||
    flags.includes("possible_traction_pattern")
  ) {
    suggestions.push({
      id: "confirm_traction_history",
      category: "clinician_followup",
      message:
        "Confirm chronology and consistency of styling/headgear/mechanical exposure history.",
    });
  }

  if (
    primary === "male_androgen_exposure_pattern" ||
    secondary.includes("male_androgen_exposure_pattern") ||
    flags.includes("possible_exogenous_androgen_acceleration")
  ) {
    suggestions.push({
      id: "confirm_androgen_exposure_chronology",
      category: "clinician_followup",
      message:
        "Confirm androgen exposure timing relative to onset/progression of hair changes.",
    });
  }

  if (
    primary === "postpartum_pattern" ||
    secondary.includes("postpartum_pattern") ||
    flags.includes("possible_postpartum_shedding")
  ) {
    suggestions.push({
      id: "confirm_postpartum_timing",
      category: "clinician_followup",
      message:
        "Confirm shedding timeline in relation to childbirth/postpartum period.",
    });
  }

  return { suggestions };
}

