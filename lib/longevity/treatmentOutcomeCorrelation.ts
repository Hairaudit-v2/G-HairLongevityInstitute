/**
 * Phase U: Deterministic treatment–outcome correlation.
 * Uses caseComparison, clinicalInsights, marker trends, scalp comparison, adherence, treatment adherence.
 * Outputs: correlation state, clinicianSummary, caveats, patient-safe summary.
 * Longevity-only. No AI.
 */

import type { CaseComparisonResult } from "./caseComparison";
import type { ClinicalInsights } from "./clinicalInsights";
import type { MarkerTrendRow } from "./bloodMarkerTrends";
import type { TreatmentAdherenceItem } from "./treatmentAdherence";
import type { AdherenceStateFlags } from "./adherenceStates";
import { SCALP_IMAGE_COMPARISON_STATUS } from "./scalpImageComparisons";

export type TreatmentOutcomeCorrelationState =
  | "improvement_with_treatment_continuity"
  | "no_clear_change"
  | "worsening_after_stopping"
  | "possible_partial_response"
  | "insufficient_data";

export type TreatmentOutcomeCorrelationResult = {
  correlation_state: TreatmentOutcomeCorrelationState;
  clinicianSummary: string[];
  caveats: string[];
  /** Short, non-judgmental patient-safe summary for portal */
  patient_safe_summary: string | null;
  outcome_domains_used: string[];
};

export type TreatmentOutcomeCorrelationInput = {
  treatmentAdherence: TreatmentAdherenceItem[];
  hasPreviousIntake: boolean;
  caseComparison: CaseComparisonResult | null;
  clinicalInsights: ClinicalInsights | null;
  markerTrends: MarkerTrendRow[];
  adherenceStates: AdherenceStateFlags | null;
};

function pushUnique(target: string[], value: string) {
  if (!value || target.includes(value)) return;
  target.push(value);
}

/**
 * Compute deterministic treatment–outcome correlation from adherence and outcome signals.
 * Clinician outputs: clinicianSummary, caveats. Patient: patient_safe_summary only.
 */
export function computeTreatmentOutcomeCorrelation(
  input: TreatmentOutcomeCorrelationInput
): TreatmentOutcomeCorrelationResult {
  const {
    treatmentAdherence,
    hasPreviousIntake,
    caseComparison,
    clinicalInsights,
    markerTrends,
    adherenceStates,
  } = input;

  const clinicianSummary: string[] = [];
  const caveats: string[] = [];
  const domainsUsed: string[] = [];

  if (!hasPreviousIntake || !caseComparison?.previousIntake) {
    pushUnique(clinicianSummary, "No previous intake available for correlation.");
    pushUnique(caveats, "Longitudinal comparison requires at least two intakes.");
    return {
      correlation_state: "insufficient_data",
      clinicianSummary,
      caveats,
      patient_safe_summary: null,
      outcome_domains_used: [],
    };
  }

  const improvedAreas = caseComparison.improvedAreas ?? [];
  const worsenedAreas = caseComparison.worsenedAreas ?? [];
  const treatmentResponse = caseComparison.treatmentResponse;
  const stoppedTreatments = treatmentResponse?.stoppedTreatments ?? [];
  const continuedOrStarted =
    treatmentAdherence.filter(
      (i) => i.status === "continued" || i.status === "started"
    ).length > 0;
  const scalpStatus =
    caseComparison.scalpImageComparison?.comparisonStatus ?? null;
  const scalpImproved =
    scalpStatus === SCALP_IMAGE_COMPARISON_STATUS.IMPROVED;
  const scalpWorsened =
    scalpStatus === SCALP_IMAGE_COMPARISON_STATUS.WORSENED;

  const bloodImprovementNoted =
    (clinicalInsights?.improvedAreas?.length ?? 0) > 0;
  const anyBloodImproving =
    bloodImprovementNoted ||
    markerTrends.some(
      (t) =>
        t.direction === "down" &&
        /tsh|crp|hba1c|glucose/i.test(t.markerKey)
    ) ||
    markerTrends.some(
      (t) =>
        t.direction === "up" &&
        /ferritin|iron|vitamin|b12|folate|zinc/i.test(t.markerKey)
    );

  if (improvedAreas.length > 0 || worsenedAreas.length > 0)
    domainsUsed.push("questionnaire_or_insights");
  if (scalpImproved || scalpWorsened) domainsUsed.push("scalp_image");
  if (anyBloodImproving) domainsUsed.push("blood_markers");
  if (adherenceStates) domainsUsed.push("follow_up_adherence");
  if (treatmentAdherence.length > 0) domainsUsed.push("treatment_adherence");

  // Worsening after stopping
  if (
    stoppedTreatments.length > 0 &&
    (worsenedAreas.length > 0 || scalpWorsened)
  ) {
    pushUnique(
      clinicianSummary,
      `Stopped treatment(s): ${stoppedTreatments.join(", ")}. Worsened areas or scalp progression noted.`
    );
    pushUnique(clinicianSummary, "Consider discussing treatment re-initiation or alternatives.");
    pushUnique(caveats, "Correlation does not imply causation; other factors may contribute.");
    return {
      correlation_state: "worsening_after_stopping",
      clinicianSummary,
      caveats,
      patient_safe_summary:
        "Some changes were noted after stopping a treatment. Your clinician can help review your plan.",
      outcome_domains_used: [...new Set(domainsUsed)],
    };
  }

  // Improvement with treatment continuity
  const hasImprovement =
    improvedAreas.length > 0 || scalpImproved || anyBloodImproving;
  if (continuedOrStarted && hasImprovement && worsenedAreas.length === 0) {
    if (improvedAreas.length > 0)
      pushUnique(clinicianSummary, "Questionnaire or clinical insights show improvement.");
    if (scalpImproved)
      pushUnique(clinicianSummary, "Scalp image comparison suggests visible improvement.");
    if (anyBloodImproving)
      pushUnique(clinicianSummary, "Blood marker trends show improvement.");
    pushUnique(
      clinicianSummary,
      "Treatment continuity (continued or started) aligns with positive outcomes."
    );
    pushUnique(caveats, "Continue to monitor; individual response varies.");
    return {
      correlation_state: "improvement_with_treatment_continuity",
      clinicianSummary,
      caveats,
      patient_safe_summary:
        "Your current plan and follow-up align with the progress we're seeing. Continuing as agreed can help track progress.",
      outcome_domains_used: [...new Set(domainsUsed)],
    };
  }

  // Possible partial response: mixed or some improvement with some worsening
  if (
    continuedOrStarted &&
    (hasImprovement || worsenedAreas.length > 0) &&
    (improvedAreas.length > 0 || worsenedAreas.length > 0)
  ) {
    pushUnique(clinicianSummary, "Mixed picture: some improvement and some worsened or unchanged areas.");
    pushUnique(
      clinicianSummary,
      "Treatment may be having a partial effect; consider duration, adherence, and other factors."
    );
    pushUnique(caveats, "Insufficient data to attribute change solely to treatment.");
    pushUnique(caveats, "Review timing and consistency of treatment use.");
    return {
      correlation_state: "possible_partial_response",
      clinicianSummary,
      caveats,
      patient_safe_summary:
        "We're tracking your progress over time. Your clinician will review how your plan is working at your next review.",
      outcome_domains_used: [...new Set(domainsUsed)],
    };
  }

  // No clear change
  if (treatmentAdherence.length === 0)
    pushUnique(clinicianSummary, "No treatment adherence data to correlate.");
  else
    pushUnique(
      clinicianSummary,
      "No clear correlation between treatment continuity and outcomes in this interval."
    );
  pushUnique(caveats, "Longer follow-up or more consistent data may clarify pattern.");
  return {
    correlation_state: "no_clear_change",
    clinicianSummary: clinicianSummary.length > 0 ? clinicianSummary : ["No clear change to correlate."],
    caveats,
    patient_safe_summary:
      "We're tracking your progress over time. Your clinician will review how your plan is working at your next review.",
    outcome_domains_used: [...new Set(domainsUsed)],
  };
}
