import type { CarePlanOutput } from "./carePlan";
import type { CaseComparisonResult } from "./caseComparison";
import type { ClinicalInsights } from "./clinicalInsights";
import {
  LONGEVITY_SIGNAL_CONTRACT_VERSION,
  LONGEVITY_SIGNAL_KEY,
  LONGEVITY_INTEGRATION_SOURCE_SYSTEM,
  buildLongevityEntityRefs,
  type LongevityEntityRefs,
  type LongevityEventType,
  type LongevitySignalKey,
} from "./integrationContracts";
import { REVIEW_OUTCOME } from "./reviewConstants";
import type { TriageFlags } from "./triage";

export type NormalizedLongevitySignalStatus =
  | "active"
  | "pending"
  | "recommended"
  | "improving";

export type NormalizedLongevitySignalSeverity =
  | "info"
  | "attention"
  | "action";

export type NormalizedLongevitySignal = {
  signal_key: LongevitySignalKey;
  source_system: typeof LONGEVITY_INTEGRATION_SOURCE_SYSTEM;
  source_version: typeof LONGEVITY_SIGNAL_CONTRACT_VERSION;
  generated_at: string;
  source_event_type?: LongevityEventType;
  status: NormalizedLongevitySignalStatus;
  severity: NormalizedLongevitySignalSeverity;
  entity_refs: LongevityEntityRefs;
  payload: Record<string, unknown>;
};

export type LongevitySignalBuilderInput = {
  profileId?: string | null;
  intakeId: string;
  derivedFlags?: Partial<TriageFlags> | null;
  clinicalInsights?: ClinicalInsights | null;
  carePlan?: CarePlanOutput | null;
  caseComparison?: CaseComparisonResult | null;
  bloodRequest?: {
    id?: string | null;
    status?: string | null;
    recommended_by?: string | null;
  } | null;
  reviewOutcome?: string | null;
  hasBloodResultUploadDocument?: boolean;
  hasStructuredMarkers?: boolean;
  generatedAt?: string;
  sourceEventType?: LongevityEventType;
};

function hasDriver(
  insights: ClinicalInsights | null | undefined,
  expected: string
): boolean {
  return (insights?.activeDrivers ?? []).includes(expected);
}

function includesInsensitive(values: string[], fragment: string): boolean {
  const lower = fragment.toLowerCase();
  return values.some((value) => value.toLowerCase().includes(lower));
}

function pushSignal(
  target: NormalizedLongevitySignal[],
  params: {
    signal_key: LongevitySignalKey;
    status: NormalizedLongevitySignalStatus;
    severity: NormalizedLongevitySignalSeverity;
    entity_refs: LongevityEntityRefs;
    generated_at: string;
    source_event_type?: LongevityEventType;
    payload: Record<string, unknown>;
  }
) {
  target.push({
    signal_key: params.signal_key,
    source_system: LONGEVITY_INTEGRATION_SOURCE_SYSTEM,
    source_version: LONGEVITY_SIGNAL_CONTRACT_VERSION,
    generated_at: params.generated_at,
    source_event_type: params.source_event_type,
    status: params.status,
    severity: params.severity,
    entity_refs: params.entity_refs,
    payload: params.payload,
  });
}

export function buildLongevitySignals(
  input: LongevitySignalBuilderInput
): NormalizedLongevitySignal[] {
  const generated_at = input.generatedAt ?? new Date().toISOString();
  const entity_refs = buildLongevityEntityRefs("intake", input.intakeId);
  const signals: NormalizedLongevitySignal[] = [];
  const flags = input.derivedFlags ?? {};
  const insights = input.clinicalInsights ?? null;
  const carePlan = input.carePlan ?? null;
  const comparison = input.caseComparison ?? null;
  const bloodRequest = input.bloodRequest ?? null;
  const hasBloodResultUploadDocument =
    input.hasBloodResultUploadDocument ?? false;
  const hasStructuredMarkers = input.hasStructuredMarkers ?? false;

  const ironRiskActive =
    !!flags.possibleIronRisk ||
    hasDriver(insights, "Iron / oxygen delivery");
  if (ironRiskActive) {
    pushSignal(signals, {
      signal_key: LONGEVITY_SIGNAL_KEY.IRON_RISK_ACTIVE,
      status: "active",
      severity: "attention",
      entity_refs,
      generated_at,
      source_event_type: input.sourceEventType,
      payload: {
        profile_id: input.profileId ?? null,
        intake_id: input.intakeId,
        evidence: [
          ...(flags.possibleIronRisk ? ["questionnaire_possible_iron_risk"] : []),
          ...(hasDriver(insights, "Iron / oxygen delivery")
            ? ["clinical_driver_iron_oxygen_delivery"]
            : []),
        ],
      },
    });
  }

  const thyroidDriverActive =
    !!flags.possibleThyroidRisk || hasDriver(insights, "Thyroid");
  if (thyroidDriverActive) {
    pushSignal(signals, {
      signal_key: LONGEVITY_SIGNAL_KEY.THYROID_DRIVER_ACTIVE,
      status: "active",
      severity: "attention",
      entity_refs,
      generated_at,
      source_event_type: input.sourceEventType,
      payload: {
        profile_id: input.profileId ?? null,
        intake_id: input.intakeId,
        evidence: [
          ...(flags.possibleThyroidRisk
            ? ["questionnaire_possible_thyroid_risk"]
            : []),
          ...(hasDriver(insights, "Thyroid") ? ["clinical_driver_thyroid"] : []),
        ],
      },
    });
  }

  const inflammatoryPersistent =
    (comparison?.persistentDrivers ?? []).some((driver) =>
      driver === "Inflammation / metabolic stress"
    ) ||
    includesInsensitive(insights?.followUpConsiderations ?? [], "inflammatory") ||
    includesInsensitive(insights?.followUpConsiderations ?? [], "metabolic");
  if (inflammatoryPersistent) {
    pushSignal(signals, {
      signal_key: LONGEVITY_SIGNAL_KEY.INFLAMMATORY_BURDEN_PERSISTENT,
      status: "active",
      severity: "attention",
      entity_refs,
      generated_at,
      source_event_type: input.sourceEventType,
      payload: {
        profile_id: input.profileId ?? null,
        intake_id: input.intakeId,
        persistent_drivers: (comparison?.persistentDrivers ?? []).filter((driver) =>
          driver === "Inflammation / metabolic stress"
        ),
        follow_up_considerations: (insights?.followUpConsiderations ?? []).filter(
          (item) =>
            item.toLowerCase().includes("inflammatory") ||
            item.toLowerCase().includes("metabolic")
        ),
      },
    });
  }

  if ((insights?.improvedAreas ?? []).length > 0) {
    pushSignal(signals, {
      signal_key: LONGEVITY_SIGNAL_KEY.MARKER_IMPROVING,
      status: "improving",
      severity: "info",
      entity_refs,
      generated_at,
      source_event_type: input.sourceEventType,
      payload: {
        profile_id: input.profileId ?? null,
        intake_id: input.intakeId,
        improved_areas: insights?.improvedAreas ?? [],
      },
    });
  }

  const followUpRecommended =
    !!carePlan?.followUpTimingSuggestion ||
    input.reviewOutcome === REVIEW_OUTCOME.FOLLOW_UP_SCHEDULED;
  if (followUpRecommended) {
    pushSignal(signals, {
      signal_key: LONGEVITY_SIGNAL_KEY.FOLLOW_UP_RECOMMENDED,
      status: "recommended",
      severity: "action",
      entity_refs,
      generated_at,
      source_event_type: input.sourceEventType,
      payload: {
        profile_id: input.profileId ?? null,
        intake_id: input.intakeId,
        review_outcome: input.reviewOutcome ?? null,
        follow_up_timing_suggestion: carePlan?.followUpTimingSuggestion ?? null,
      },
    });
  }

  const bloodResultsPending =
    !!bloodRequest?.status &&
    ["pending", "letter_requested", "letter_generated"].includes(
      bloodRequest.status
    ) &&
    !hasBloodResultUploadDocument &&
    !hasStructuredMarkers;
  if (bloodResultsPending) {
    pushSignal(signals, {
      signal_key: LONGEVITY_SIGNAL_KEY.BLOOD_RESULTS_PENDING,
      status: "pending",
      severity: "attention",
      entity_refs,
      generated_at,
      source_event_type: input.sourceEventType,
      payload: {
        profile_id: input.profileId ?? null,
        intake_id: input.intakeId,
        blood_request_id: bloodRequest?.id ?? null,
        blood_request_status: bloodRequest?.status ?? null,
      },
    });
  }

  const gpFollowUpSuggested =
    !!carePlan?.gpFollowUpSuggested ||
    input.reviewOutcome === REVIEW_OUTCOME.BLOODS_RECOMMENDED ||
    input.reviewOutcome === REVIEW_OUTCOME.REFERRAL_RECOMMENDED;
  if (gpFollowUpSuggested) {
    pushSignal(signals, {
      signal_key: LONGEVITY_SIGNAL_KEY.GP_FOLLOW_UP_SUGGESTED,
      status: "recommended",
      severity: "action",
      entity_refs,
      generated_at,
      source_event_type: input.sourceEventType,
      payload: {
        profile_id: input.profileId ?? null,
        intake_id: input.intakeId,
        review_outcome: input.reviewOutcome ?? null,
        gp_follow_up_suggested: carePlan?.gpFollowUpSuggested ?? false,
      },
    });
  }

  return signals;
}
