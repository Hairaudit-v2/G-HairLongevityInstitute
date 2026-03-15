/**
 * Phase U: FI-ready helpers for treatment adherence and outcome correlation signals.
 * HLI is source of truth. Use with buildLongevitySignals() and stageLongevityIntegrationArtifacts().
 * Longevity namespace only.
 */

import type { TreatmentAdherenceResult } from "./treatmentAdherence";
import type { TreatmentOutcomeCorrelationResult } from "./treatmentOutcomeCorrelation";

/** Input shape for Phase U signals passed to buildLongevitySignals. */
export type PhaseUSignalInput = {
  treatmentContinuity: { key: string; label: string; state?: string; status?: string }[] | null;
  outcomeCorrelation: {
    correlation_state: string;
    clinicianSummary?: string[];
    caveats?: string[];
    patient_safe_summary: string | null;
    outcome_domains_used: string[];
  } | null;
};

/**
 * Build FI-ready Phase U signal input from adherence and correlation results.
 * Use the return value as treatmentContinuity and outcomeCorrelation in buildLongevitySignals().
 */
export function buildPhaseUSignalInput(
  adherence: TreatmentAdherenceResult,
  correlation: TreatmentOutcomeCorrelationResult
): PhaseUSignalInput {
  return {
    treatmentContinuity:
      adherence.items.length > 0
        ? adherence.items.map((i) => ({ key: i.key, label: i.label, status: i.status }))
        : null,
    outcomeCorrelation: {
      correlation_state: correlation.correlation_state,
      clinicianSummary: correlation.clinicianSummary,
      caveats: correlation.caveats,
      patient_safe_summary: correlation.patient_safe_summary,
      outcome_domains_used: correlation.outcome_domains_used,
    },
  };
}
