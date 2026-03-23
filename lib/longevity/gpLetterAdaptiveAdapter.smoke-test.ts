import { buildGpLetterAdaptivePrefillPayload } from "@/lib/longevity/gpLetterAdaptiveAdapter";
import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";
import type { AdaptiveBloodworkEligibilitySupport } from "@/lib/longevity/intake";

type GpAdapterSmokeTestResult = {
  name: string;
  passed: boolean;
  message?: string;
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function run(name: string, execute: () => void): GpAdapterSmokeTestResult {
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

const BASE_ELIGIBILITY: AdaptiveBloodworkEligibilitySupport = {
  eligible: true,
  confidence_band: "moderate",
  reasons: [],
  suggested_bloodwork_domains: [],
  caution_notes: [],
};

export function runGpLetterAdaptiveAdapterSmokeTests(): GpAdapterSmokeTestResult[] {
  return [
    run("adaptive iron-risk prefill", () => {
      const triage: AdaptiveDerivedSummary = {
        bloodwork_considerations: ["iron_studies"],
      };
      const payload = buildGpLetterAdaptivePrefillPayload({
        adaptive_triage_output: triage,
        adaptive_bloodwork_eligibility: {
          ...BASE_ELIGIBILITY,
          suggested_bloodwork_domains: ["iron_studies"],
        },
        clinician_patient_safe_summary: "Diffuse shedding with fatigue context.",
      });
      assert(
        payload.recommended_tests.includes("iron_studies"),
        "Expected iron studies in recommended tests"
      );
      assert(
        payload.reason.toLowerCase().includes("iron status"),
        "Expected iron context in reason"
      );
    }),
    run("postpartum-related prefill", () => {
      const triage: AdaptiveDerivedSummary = {
        primary_pathway: "postpartum_pattern",
        bloodwork_considerations: ["thyroid_panel", "vitamin_d"],
      };
      const payload = buildGpLetterAdaptivePrefillPayload({
        adaptive_triage_output: triage,
        adaptive_bloodwork_eligibility: {
          ...BASE_ELIGIBILITY,
          suggested_bloodwork_domains: ["thyroid_panel", "vitamin_d"],
        },
      });
      assert(payload.recommended_tests.includes("tsh"), "Expected TSH for postpartum context");
      assert(
        payload.recommended_tests.includes("vitamin_d"),
        "Expected vitamin D for postpartum context"
      );
    }),
    run("hormonal-context prefill", () => {
      const triage: AdaptiveDerivedSummary = {
        primary_pathway: "female_hormonal_pattern",
        bloodwork_considerations: [
          "androgen_hormone_review_if_clinically_appropriate",
        ],
      };
      const payload = buildGpLetterAdaptivePrefillPayload({
        adaptive_triage_output: triage,
        adaptive_bloodwork_eligibility: {
          ...BASE_ELIGIBILITY,
          suggested_bloodwork_domains: ["hormonal_context_review"],
        },
      });
      assert(
        payload.recommended_tests.includes("hormonal_panel"),
        "Expected hormonal panel in recommended tests"
      );
    }),
    run("release gating unchanged (adapter payload only)", () => {
      const payload = buildGpLetterAdaptivePrefillPayload({
        adaptive_triage_output: null,
        adaptive_bloodwork_eligibility: null,
      }) as Record<string, unknown>;
      assert(
        "recommended_tests" in payload && "reason" in payload,
        "Expected only reason/tests payload contract"
      );
      assert(
        !("auto_release" in payload) && !("release_now" in payload),
        "Adapter must not alter release gating semantics"
      );
    }),
  ];
}

