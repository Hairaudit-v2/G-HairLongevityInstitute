import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";
import type {
  AdaptiveBloodworkEligibilitySupport,
  BloodworkEligibilityDomain,
} from "@/lib/longevity/intake";
import {
  BLOOD_TEST_CODES,
  type BloodTestCode,
} from "@/lib/longevity/bloodRequestEligibility";

export type GpLetterAdaptivePrefillInput = {
  adaptive_triage_output: AdaptiveDerivedSummary | null | undefined;
  adaptive_bloodwork_eligibility: AdaptiveBloodworkEligibilitySupport | null | undefined;
  clinician_approved_bloodwork_domains?: BloodworkEligibilityDomain[] | null;
  clinician_patient_safe_summary?: string | null;
};

export type GpLetterAdaptivePrefillPayload = {
  recommended_tests: BloodTestCode[];
  reason: string;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function uniq<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function domainLabel(domain: BloodworkEligibilityDomain): string {
  switch (domain) {
    case "female_endocrine_review":
      return "female endocrine review";
    case "androgen_adrenal_review":
      return "androgen/adrenal-androgen review";
    case "thyroid_iron_nutrition_review":
      return "thyroid/iron/nutrition review";
    case "stress_trigger_overlap_review":
      return "stress-trigger overlap review";
    case "pituitary_prolactin_followup":
      return "pituitary/prolactin follow-up";
    case "hormonal_context_review":
      return "hormonal context review";
    default:
      return domain.replace(/_/g, " ");
  }
}

function mapDomainToTests(domain: BloodworkEligibilityDomain): BloodTestCode[] {
  switch (domain) {
    case "iron_studies":
      return [BLOOD_TEST_CODES.FERRITIN, BLOOD_TEST_CODES.IRON_STUDIES];
    case "thyroid_panel":
      return [BLOOD_TEST_CODES.TSH, BLOOD_TEST_CODES.T4];
    case "vitamin_d":
      return [BLOOD_TEST_CODES.VITAMIN_D];
    case "b12_folate":
      return [BLOOD_TEST_CODES.B12, BLOOD_TEST_CODES.FOLATE];
    case "female_endocrine_review":
      return [BLOOD_TEST_CODES.HORMONAL_PANEL];
    case "androgen_adrenal_review":
      return [BLOOD_TEST_CODES.HORMONAL_PANEL];
    case "thyroid_iron_nutrition_review":
      return [
        BLOOD_TEST_CODES.FERRITIN,
        BLOOD_TEST_CODES.IRON_STUDIES,
        BLOOD_TEST_CODES.TSH,
        BLOOD_TEST_CODES.T4,
        BLOOD_TEST_CODES.VITAMIN_D,
      ];
    case "stress_trigger_overlap_review":
      return [
        BLOOD_TEST_CODES.FERRITIN,
        BLOOD_TEST_CODES.IRON_STUDIES,
        BLOOD_TEST_CODES.TSH,
        BLOOD_TEST_CODES.T4,
      ];
    case "pituitary_prolactin_followup":
      return [BLOOD_TEST_CODES.HORMONAL_PANEL];
    case "hormonal_context_review":
      return [BLOOD_TEST_CODES.HORMONAL_PANEL];
    case "metabolic_context_review":
      return [BLOOD_TEST_CODES.FBC, BLOOD_TEST_CODES.ZINC];
    default:
      return [];
  }
}

function mapTriageConsiderationToDomain(
  item: string
): BloodworkEligibilityDomain | null {
  if (item === "iron_studies" || item === "ferritin_iron_if_not_recent") {
    return "iron_studies";
  }
  if (item === "thyroid_panel" || item === "thyroid_contextual_markers_if_indicated") {
    return "thyroid_panel";
  }
  if (item === "vitamin_d" || item === "nutritional_contextual_markers_if_indicated") {
    return "vitamin_d";
  }
  if (item === "b12_folate") return "b12_folate";
  if (
    item === "androgen_hormone_review_if_clinically_appropriate" ||
    item === "hormonal_contextual_panel_if_indicated"
  ) {
    return "androgen_adrenal_review";
  }
  if (item === "metabolic_review_if_clinically_appropriate") {
    return "metabolic_context_review";
  }
  return null;
}

function buildReasonText(args: {
  domains: BloodworkEligibilityDomain[];
  eligibility?: AdaptiveBloodworkEligibilitySupport | null;
  triage: AdaptiveDerivedSummary | null | undefined;
  patientSafeSummary?: string | null;
}): string {
  const reasons: string[] = [
    "Following clinical review, selected bloodwork may help assess potential systemic contributors to hair and scalp changes.",
  ];

  const domainReasonMap: Record<BloodworkEligibilityDomain, string> = {
    iron_studies: "Iron status context may be relevant.",
    thyroid_panel: "Thyroid context may be relevant.",
    vitamin_d: "Vitamin D context may be relevant.",
    b12_folate: "B12/folate context may be relevant.",
    female_endocrine_review:
      "Female endocrine context may be relevant where clinically appropriate.",
    androgen_adrenal_review:
      "Androgen or adrenal-androgen context may be relevant where clinically appropriate.",
    thyroid_iron_nutrition_review:
      "Thyroid, iron, or nutritional context may be relevant where clinically appropriate.",
    stress_trigger_overlap_review:
      "Trigger-related or delayed-shedding overlap may be relevant in clinical context.",
    pituitary_prolactin_followup:
      "A more specific endocrine follow-up context may be relevant where clinically appropriate.",
    hormonal_context_review: "Hormonal context may be relevant where clinically appropriate.",
    metabolic_context_review: "Metabolic context may be relevant where clinically appropriate.",
  };

  for (const domain of args.domains) {
    const line = domainReasonMap[domain];
    if (line) reasons.push(line);
  }

  const endocrineSummary = args.eligibility?.endocrine_domain_summary;
  if (endocrineSummary?.primaryDomain) {
    reasons.push(
      `Primary internal review domain: ${domainLabel(endocrineSummary.primaryDomain)}.`
    );
  }
  if (endocrineSummary && endocrineSummary.secondaryDomains.length > 0) {
    reasons.push(
      `Secondary internal review domains: ${endocrineSummary.secondaryDomains
        .map(domainLabel)
        .join(", ")}.`
    );
  }
  if (endocrineSummary && endocrineSummary.escalationDomains.length > 0) {
    reasons.push(
      `Escalation-focused follow-up: ${endocrineSummary.escalationDomains
        .map(domainLabel)
        .join(", ")}.`
    );
  }
  if (endocrineSummary) {
    for (const domain of [
      endocrineSummary.primaryDomain,
      ...endocrineSummary.secondaryDomains,
      ...endocrineSummary.escalationDomains,
    ].filter((value): value is BloodworkEligibilityDomain => value != null)) {
      const support = endocrineSummary.supportedBy[domain] ?? [];
      if (support.length > 0) {
        reasons.push(
          `${domainLabel(domain)} supported by: ${support.join(", ")}.`
        );
      }
    }
  }

  const likelyPattern =
    typeof args.triage?.likely_pattern === "string" ? args.triage.likely_pattern : null;
  if (likelyPattern) {
    reasons.push(
      `Pattern context for review: ${likelyPattern.replace(/_/g, " ")}.`
    );
  }

  const summary = (args.patientSafeSummary ?? "").trim();
  if (summary) {
    reasons.push(`Clinical summary context: ${summary}`);
  }

  return uniq(reasons).join(" ");
}

export function buildGpLetterAdaptivePrefillPayload(
  input: GpLetterAdaptivePrefillInput
): GpLetterAdaptivePrefillPayload {
  const triage = input.adaptive_triage_output;
  const eligibility = input.adaptive_bloodwork_eligibility;
  const approvedDomains = input.clinician_approved_bloodwork_domains ?? [];
  const triageDomains = toStringArray(triage?.bloodwork_considerations)
    .map(mapTriageConsiderationToDomain)
    .filter((value): value is BloodworkEligibilityDomain => value != null);
  const eligibilityDomains = (eligibility?.suggested_bloodwork_domains ??
    []) as BloodworkEligibilityDomain[];
  const domains = uniq([
    ...approvedDomains,
    ...eligibilityDomains,
    ...triageDomains,
  ]);

  const recommended_tests = uniq(
    domains.flatMap((domain) => mapDomainToTests(domain))
  );

  return {
    recommended_tests:
      recommended_tests.length > 0
        ? recommended_tests
        : [BLOOD_TEST_CODES.FERRITIN, BLOOD_TEST_CODES.FBC],
    reason: buildReasonText({
      domains,
      eligibility,
      triage,
      patientSafeSummary: input.clinician_patient_safe_summary,
    }),
  };
}

