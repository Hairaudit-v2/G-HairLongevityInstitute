import {
  deriveAdaptiveBloodworkEligibilitySupport,
  type AdaptiveRescoreComparison,
} from "@/lib/longevity/intake";
import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";

type BloodworkSmokeTestResult = {
  name: string;
  passed: boolean;
  message?: string;
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function run(name: string, execute: () => void): BloodworkSmokeTestResult {
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

const NO_DELTA: AdaptiveRescoreComparison = {
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

export function runAdaptiveBloodworkEligibilitySmokeTests(): BloodworkSmokeTestResult[] {
  return [
    run("iron-risk / heavy period case", () => {
      const triage: AdaptiveDerivedSummary = {
        clinician_attention_flags: ["heavy_period_related_iron_risk"],
      };
      const result = deriveAdaptiveBloodworkEligibilitySupport({
        adaptive_triage_output: triage,
      });
      assert(result.eligible === true, "Expected eligibility true");
      assert(
        result.suggested_bloodwork_domains.includes("iron_studies"),
        "Expected iron studies suggestion"
      );
    }),
    run("chronic TE case", () => {
      const triage: AdaptiveDerivedSummary = {
        primary_pathway: "telogen_effluvium_chronic",
      };
      const result = deriveAdaptiveBloodworkEligibilitySupport({
        adaptive_triage_output: triage,
      });
      assert(result.eligible === true, "Expected eligibility true for chronic TE");
      assert(
        result.suggested_bloodwork_domains.includes("thyroid_panel"),
        "Expected thyroid panel domain"
      );
    }),
    run("postpartum diffuse shedding case", () => {
      const triage: AdaptiveDerivedSummary = {
        primary_pathway: "postpartum_pattern",
        possible_drivers: ["recent_trigger_burden", "possible_postpartum_context"],
      };
      const result = deriveAdaptiveBloodworkEligibilitySupport({
        adaptive_triage_output: triage,
      });
      assert(result.eligible === true, "Expected postpartum eligibility");
      assert(
        result.suggested_bloodwork_domains.includes("iron_studies"),
        "Expected iron domain for postpartum case"
      );
    }),
    run("thyroid/metabolic suspicion case", () => {
      const triage: AdaptiveDerivedSummary = {
        primary_pathway: "thyroid_metabolic_pattern",
      };
      const result = deriveAdaptiveBloodworkEligibilitySupport({
        adaptive_triage_output: triage,
        adaptive_rescore_comparison: { ...NO_DELTA, changed: true },
      });
      assert(result.eligible === true, "Expected thyroid/metabolic eligibility");
      assert(
        result.suggested_bloodwork_domains.includes("metabolic_context_review"),
        "Expected metabolic context suggestion"
      );
      assert(result.caution_notes.length > 0, "Expected caution notes with delta");
    }),
    run("negative / no-eligibility fallback", () => {
      const triage: AdaptiveDerivedSummary = {
        primary_pathway: "androgenic_pattern",
      };
      const result = deriveAdaptiveBloodworkEligibilitySupport({
        adaptive_triage_output: triage,
      });
      assert(result.eligible === false, "Expected non-eligible fallback");
      assert(
        result.suggested_bloodwork_domains.length === 0,
        "Expected no bloodwork domains in fallback"
      );
    }),
  ];
}

