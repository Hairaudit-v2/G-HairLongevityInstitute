/**
 * Hair Longevity Treatment Protocol Scoring Engine — shared types.
 * Longevity namespace only. Deterministic, clinician-safe, no AI.
 */

export type ProtocolBand = "minimal" | "basic" | "moderate" | "strong";

export type ResponseLikelihood = "low" | "uncertain" | "moderate" | "favourable";

export type DomainCoverageLevel = "none" | "partial" | "strong";

export type CoverageDomains = {
  dht_control: DomainCoverageLevel;
  growth_stimulation: DomainCoverageLevel;
  regenerative_support: DomainCoverageLevel;
  inflammation_scalp_support: DomainCoverageLevel;
  nutritional_support: DomainCoverageLevel;
};

export type AdherenceModifier = "negative" | "neutral" | "positive";

/** Optional internal-only score breakdown (not patient-visible). */
export type ProtocolScoreBreakdown = {
  dht_control: number;
  growth_stimulation: number;
  regenerative_support: number;
  inflammation_scalp_support: number;
  nutritional_support: number;
  adherence_adjustment: number;
};

export type TreatmentProtocolAssessment = {
  protocol_score: number;
  protocol_band: ProtocolBand;
  response_likelihood: ResponseLikelihood;
  coverage_domains: CoverageDomains;
  adherence_modifier: AdherenceModifier;
  gaps: string[];
  strengths: string[];
  recommendation_signals: string[];
  /** Stable version for backward compatibility. Additive only. */
  protocol_assessment_version?: "v1";
  /** Optional internal-only score breakdown. API/workspace internal, not patient portal. */
  score_breakdown?: ProtocolScoreBreakdown;
};

export type ProtocolAssessmentInput = {
  /** Currently used treatment keys (from current intake). */
  usedKeys: string[];
  /** Treatment adherence items (key + status) from Phase U. */
  adherenceItems: { key: string; status: string }[];
  /** Whether previous intake exists (for adherence interpretation). */
  hasPreviousIntake?: boolean;
  /** Optional follow-up adherence flags. */
  adherenceContext?: {
    high_adherence?: boolean;
    delayed_follow_up_pattern?: boolean;
    repeat_reminder_required?: boolean;
    prompt_response_good?: boolean;
  } | null;
  /** Optional triage-derived flags (for recommendation signals only). */
  derivedFlags?: Record<string, boolean> | null;
};
