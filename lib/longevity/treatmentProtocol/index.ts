/**
 * Hair Longevity Treatment Protocol Scoring Engine — public API.
 * Longevity namespace only.
 */

export { assessTreatmentProtocol } from "./assessment";
export type {
  TreatmentProtocolAssessment,
  ProtocolAssessmentInput,
  ProtocolBand,
  ResponseLikelihood,
  CoverageDomains,
  AdherenceModifier,
  ProtocolScoreBreakdown,
} from "./types";
