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
  endocrine_domain_summary: null,
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
          suggested_bloodwork_domains: [
            "female_endocrine_review",
            "androgen_adrenal_review",
          ],
          endocrine_domain_summary: {
            primaryDomain: "female_endocrine_review",
            secondaryDomains: ["androgen_adrenal_review"],
            escalationDomains: [],
            supportedBy: {
              female_endocrine_review: ["female hormonal-pattern pathway"],
              androgen_adrenal_review: ["androgen hormone review consideration"],
            },
          },
        },
      });
      assert(
        payload.recommended_tests.includes("hormonal_panel"),
        "Expected hormonal panel in recommended tests"
      );
      assert(
        payload.reason.toLowerCase().includes("female endocrine context"),
        "Expected female endocrine wording in reason"
      );
      assert(
        payload.reason.toLowerCase().includes("primary internal review domain"),
        "Expected internal domain summary in reason"
      );
    }),
    run("pituitary and trigger-overlap prefill", () => {
      const triage: AdaptiveDerivedSummary = {
        primary_pathway: "postpartum_pattern",
        possible_drivers: ["stress_trigger_delay_overlap", "pituitary_followup_prompt"],
      };
      const payload = buildGpLetterAdaptivePrefillPayload({
        adaptive_triage_output: triage,
        adaptive_bloodwork_eligibility: {
          ...BASE_ELIGIBILITY,
          suggested_bloodwork_domains: [
            "stress_trigger_overlap_review",
            "pituitary_prolactin_followup",
          ],
          endocrine_domain_summary: {
            primaryDomain: "pituitary_prolactin_followup",
            secondaryDomains: ["stress_trigger_overlap_review"],
            escalationDomains: ["pituitary_prolactin_followup"],
            supportedBy: {
              pituitary_prolactin_followup: ["pituitary follow-up prompt"],
              stress_trigger_overlap_review: ["delayed-shedding overlap"],
            },
          },
        },
      });
      assert(
        payload.recommended_tests.includes("hormonal_panel"),
        "Expected hormonal panel for pituitary/prolactin follow-up"
      );
      assert(
        payload.recommended_tests.includes("tsh"),
        "Expected thyroid coverage for stress-trigger overlap review"
      );
      assert(
        payload.reason.toLowerCase().includes("escalation-focused follow-up"),
        "Expected escalation wording in reason"
      );
    }),
    run("legacy hormonal context compatibility", () => {
      const triage: AdaptiveDerivedSummary = {
        bloodwork_considerations: ["hormonal_contextual_panel_if_indicated"],
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
        "Expected hormonal panel for legacy hormonal context path"
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

