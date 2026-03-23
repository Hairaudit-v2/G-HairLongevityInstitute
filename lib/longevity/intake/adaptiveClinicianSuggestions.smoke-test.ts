import {
  deriveAdaptiveClinicianSuggestions,
  type AdaptiveRescoreComparison,
} from "@/lib/longevity/intake";
import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";

type SuggestionSmokeTestResult = {
  name: string;
  passed: boolean;
  message?: string;
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function run(name: string, execute: () => void): SuggestionSmokeTestResult {
  try {
    execute();
    return { name, passed: true };
  } catch (error) {
    return {
      name,
      passed: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const BASE_COMPARISON: AdaptiveRescoreComparison = {
  stored_schema_version: "hli_adaptive_intake_v1",
  current_schema_version: "hli_adaptive_intake_v1",
  stored_primary_pathway: "androgenic_pattern",
  current_primary_pathway: "androgenic_pattern",
  stored_secondary_pathways: [],
  current_secondary_pathways: [],
  stored_red_flags: [],
  current_red_flags: [],
  stored_clinician_attention_flags: [],
  current_clinician_attention_flags: [],
  changed: false,
  changed_fields: [],
  summary_note: "",
};

export function runAdaptiveClinicianSuggestionsSmokeTests(): SuggestionSmokeTestResult[] {
  return [
    run("inflammatory review priority", () => {
      const triage: AdaptiveDerivedSummary = {
        primary_pathway: "inflammatory_scalp_pattern",
        red_flags: ["pustules_or_crusting"],
      };
      const result = deriveAdaptiveClinicianSuggestions({
        adaptive_triage_output: triage,
      });
      assert(
        result.suggestions.some((s) => s.id === "prioritise_direct_scalp_review"),
        "Expected inflammatory review-priority suggestion"
      );
    }),
    run("image/document request suggestions", () => {
      const triage: AdaptiveDerivedSummary = {
        upload_guidance: ["center_part", "top_down"],
        clinician_attention_flags: ["heavy_period_related_iron_risk"],
      };
      const result = deriveAdaptiveClinicianSuggestions({
        adaptive_triage_output: triage,
        context: { has_scalp_photo_documents: false },
      });
      assert(
        result.suggestions.some((s) => s.id === "request_center_part_images"),
        "Expected image request suggestion"
      );
      assert(
        result.suggestions.some((s) => s.id === "review_recent_bloodwork_availability"),
        "Expected bloodwork document check suggestion"
      );
    }),
    run("mixed-pattern caution", () => {
      const triage: AdaptiveDerivedSummary = {
        primary_pathway: "mixed_pattern",
      };
      const result = deriveAdaptiveClinicianSuggestions({
        adaptive_triage_output: triage,
      });
      assert(
        result.suggestions.some((s) => s.id === "mixed_pattern_caution"),
        "Expected mixed-pattern caution suggestion"
      );
    }),
    run("androgen exposure chronology prompt", () => {
      const triage: AdaptiveDerivedSummary = {
        primary_pathway: "male_androgen_exposure_pattern",
      };
      const result = deriveAdaptiveClinicianSuggestions({
        adaptive_triage_output: triage,
      });
      assert(
        result.suggestions.some((s) => s.id === "confirm_androgen_exposure_chronology"),
        "Expected androgen chronology suggestion"
      );
    }),
    run("postpartum timing prompt", () => {
      const triage: AdaptiveDerivedSummary = {
        clinician_attention_flags: ["possible_postpartum_shedding"],
      };
      const result = deriveAdaptiveClinicianSuggestions({
        adaptive_triage_output: triage,
        adaptive_rescore_comparison: { ...BASE_COMPARISON, changed: true },
      });
      assert(
        result.suggestions.some((s) => s.id === "confirm_postpartum_timing"),
        "Expected postpartum timing suggestion"
      );
      assert(
        result.suggestions.some((s) => s.id === "mixed_pattern_caution"),
        "Expected mixed-pattern caution when adaptive delta changed"
      );
    }),
  ];
}

