import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";
import type {
  AdaptiveClinicianSuggestion,
  AdaptiveRescoreComparison,
} from "@/lib/longevity/intake";

export type BloodworkEligibilityConfidenceBand = "low" | "moderate" | "high";

export type BloodworkEligibilityDomain =
  | "iron_studies"
  | "thyroid_panel"
  | "vitamin_d"
  | "b12_folate"
  | "hormonal_context_review"
  | "metabolic_context_review";

export type AdaptiveBloodworkEligibilitySupport = {
  eligible: boolean;
  confidence_band: BloodworkEligibilityConfidenceBand;
  reasons: string[];
  suggested_bloodwork_domains: BloodworkEligibilityDomain[];
  caution_notes: string[];
};

export type AdaptiveBloodworkEligibilityInput = {
  adaptive_triage_output: AdaptiveDerivedSummary | null | undefined;
  adaptive_rescore_comparison?: AdaptiveRescoreComparison | null;
  clinician_suggestions?: AdaptiveClinicianSuggestion[] | null;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function uniq<T extends string>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function includesAny(source: string[], match: string[]): boolean {
  return match.some((item) => source.includes(item));
}

export function deriveAdaptiveBloodworkEligibilitySupport(
  input: AdaptiveBloodworkEligibilityInput
): AdaptiveBloodworkEligibilitySupport {
  const triage = input.adaptive_triage_output;
  if (!triage) {
    return {
      eligible: false,
      confidence_band: "low",
      reasons: [],
      suggested_bloodwork_domains: [],
      caution_notes: [
        "No adaptive triage payload available for bloodwork consideration support.",
      ],
    };
  }

  const primaryPathway = typeof triage.primary_pathway === "string" ? triage.primary_pathway : "";
  const secondaryPathways = asStringArray(triage.secondary_pathways);
  const flags = asStringArray(triage.clinician_attention_flags);
  const drivers = asStringArray(triage.possible_drivers);
  const triageDomains = asStringArray(triage.bloodwork_considerations);
  const redFlags = asStringArray(triage.red_flags);
  const deltaChanged = input.adaptive_rescore_comparison?.changed === true;
  const suggestions = input.clinician_suggestions ?? [];

  const reasons: string[] = [];
  const domains: BloodworkEligibilityDomain[] = [];
  const cautionNotes: string[] = [];

  const hasPathway = (pathway: string) =>
    primaryPathway === pathway || secondaryPathways.includes(pathway);

  if (hasPathway("nutritional_deficiency_pattern")) {
    reasons.push("Nutritional-deficiency pathway signal present.");
    domains.push("iron_studies", "vitamin_d", "b12_folate");
  }

  if (
    hasPathway("telogen_effluvium_acute") ||
    hasPathway("telogen_effluvium_chronic")
  ) {
    reasons.push("Telogen-effluvium pathway signal with systemic trigger context.");
    domains.push("iron_studies", "thyroid_panel");
  }

  if (flags.includes("heavy_period_related_iron_risk")) {
    reasons.push("Heavy-period / iron-risk attention flag present.");
    domains.push("iron_studies");
  }

  if (hasPathway("thyroid_metabolic_pattern")) {
    reasons.push("Thyroid/metabolic pathway signal present.");
    domains.push("thyroid_panel", "metabolic_context_review");
  }

  if (
    hasPathway("postpartum_pattern") &&
    includesAny(drivers, ["recent_trigger_burden", "possible_postpartum_context"])
  ) {
    reasons.push("Postpartum signal with diffuse/shedding context.");
    domains.push("iron_studies", "thyroid_panel", "vitamin_d");
  }

  if (hasPathway("female_hormonal_pattern")) {
    reasons.push("Hormonal-pattern signal where hormone-context review may be useful.");
    domains.push("hormonal_context_review");
  }

  if (includesAny(triageDomains, ["iron_studies"])) domains.push("iron_studies");
  if (includesAny(triageDomains, ["thyroid_panel"])) domains.push("thyroid_panel");
  if (includesAny(triageDomains, ["vitamin_d"])) domains.push("vitamin_d");
  if (includesAny(triageDomains, ["b12_folate"])) domains.push("b12_folate");
  if (
    includesAny(triageDomains, [
      "androgen_hormone_review_if_clinically_appropriate",
    ])
  ) {
    domains.push("hormonal_context_review");
  }
  if (
    includesAny(triageDomains, ["metabolic_review_if_clinically_appropriate"])
  ) {
    domains.push("metabolic_context_review");
  }

  if (deltaChanged) {
    cautionNotes.push(
      "Adaptive interpretation changed under current engine; use bloodwork support in full clinical context."
    );
  }
  if (redFlags.length > 0) {
    cautionNotes.push(
      "Red-flag signals are present; prioritise direct clinical review over isolated rule interpretation."
    );
  }
  if (
    suggestions.some(
      (s) =>
        s.id === "mixed_pattern_caution" ||
        s.id === "prioritise_direct_scalp_review"
    )
  ) {
    cautionNotes.push(
      "Pattern-overlap caution present; avoid single-cause assumptions."
    );
  }

  const uniqueReasons = uniq(reasons);
  const uniqueDomains = uniq(domains);
  const eligible = uniqueReasons.length > 0 || uniqueDomains.length > 0;

  const confidence_band: BloodworkEligibilityConfidenceBand = !eligible
    ? "low"
    : uniqueReasons.length >= 3 || uniqueDomains.length >= 3
    ? "high"
    : "moderate";

  return {
    eligible,
    confidence_band,
    reasons: uniqueReasons,
    suggested_bloodwork_domains: uniqueDomains,
    caution_notes: uniq(cautionNotes),
  };
}

