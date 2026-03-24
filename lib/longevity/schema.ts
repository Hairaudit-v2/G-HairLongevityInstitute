/**
 * Longevity questionnaire schema v1 (versioned).
 * Payload shape is structured by section. Do not flatten.
 */

export const QUESTIONNAIRE_SCHEMA_VERSION = "v1";

export type SexAtBirth = "female" | "male" | "intersex" | "prefer_not_to_say";

export type AboutYou = {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  dateOfBirth?: string;
  sexAtBirth?: SexAtBirth;
  country?: string;
  stateRegion?: string;
  city?: string;
  postcode?: string;
  gp?: {
    name?: string;
    clinic?: string;
    email?: string;
    phone?: string;
  };
  consents?: {
    healthData?: boolean;
    aiAssist?: boolean;
    documentGeneration?: boolean;
  };
};

export type MainConcern = {
  primaryConcerns?: string[];
  firstNoticed?:
    | "less_than_3_months"
    | "three_to_six_months"
    | "six_to_twelve_months"
    | "one_to_two_years"
    | "more_than_two_years"
    | "unsure";
  onsetPattern?: "sudden" | "gradual" | "fluctuating" | "unsure";
  /** How noticeable or bothersome the change feels to you (not a clinical grade). */
  perceivedSeverity?: "mild" | "moderate" | "severe" | "unsure";
  /** How well the pattern you described fits what you see (optional). */
  patternConfidence?: "confident" | "somewhat" | "mixed_or_unsure" | "prefer_not_to_say";
  affectedAreas?: string[];
  symptoms?: string[];
  freeText?: string;
};

export type TrtStatus = "no" | "yes_prescribed" | "yes_non_prescribed" | "previously_used";

export type TrtStartedWhen =
  | "less_than_6_months"
  | "six_to_twelve_months"
  | "one_to_two_years"
  | "more_than_two_years"
  | "prefer_not_to_say";

export type TimelineTriggers = {
  triggers?: string[];
  pastYearEvents?: string[];
  sheddingTrend?: "stable" | "improved" | "worsened" | "comes_and_goes";
  /** Testosterone replacement therapy (TRT) use. */
  trtStatus?: TrtStatus;
  /** When TRT was started; only relevant when trtStatus indicates current or previous use. */
  trtStartedWhen?: TrtStartedWhen;
};

export type MedicalHistory = {
  diagnoses?: string[];
  currentSymptoms?: string[];
  familyHistory?: string[];
  /**
   * Which side of the family hair thinning/loss runs on, when male- or female-pattern family history is selected.
   * Canonical with `familyHistory`; does not replace the multiselect.
   */
  familyHistorySide?: "mothers_side" | "fathers_side" | "both_sides" | "unsure" | "prefer_not_to_say";
  /** How similar affected relatives’ hair change is to yours; only relevant when pattern hair loss is selected. */
  familyHairPatternMatch?: "similar_to_mine" | "different_or_unclear" | "unsure" | "prefer_not_to_say";
  /** Approximate age when relatives’ hair changes began, if you know. */
  familyHairOnsetAgeBand?: "before_30" | "30s" | "40s" | "50_or_older" | "unsure" | "prefer_not_to_say";
  priorBloodTests?: "last_3_months" | "older_than_3_months" | "no" | "unsure";
  wantsToUploadBloodsNow?: boolean | null;
};

export type FemaleHistory = {
  cycles?: "regular" | "irregular" | "not_occurring" | "prefer_not_to_say";
  features?: string[];
  lifeStage?: string[];
};

export type MaleHistory = {
  therapies?: string[];
  associatedChanges?: string[];
};

export type LifestyleTreatments = {
  dietPattern?: string[];
  enoughProtein?: "yes" | "no" | "unsure";
  stressScore?: number;
  sleepQuality?: "good" | "average" | "poor";
  currentTreatments?: string[];
  treatmentHelpfulness?: "yes" | "no" | "unsure";
  treatmentResponse?: "improved" | "no_change" | "worsened" | "uncertain";
  medicationsSupplementsFreeText?: string;
};

export type UploadsNextSteps = {
  availableUploads?: string[];
  currentBloodStatus?:
    | "uploading_now"
    | "upload_later"
    | "not_done"
    | "unsure";
};

export type AdaptiveIntake = {
  /** @deprecated Prefer `adaptiveEngine.answers.presentation_pattern`; kept for backward compatibility with saved drafts. */
  presentationPattern?:
    | "acute_shedding"
    | "chronic_shedding"
    | "patterned_thinning"
    | "frontal_temporal_recession"
    | "crown_loss"
    | "diffuse_thinning"
    | "broken_hairs"
    | "scalp_symptoms"
    | "mixed_or_unsure";
  pathwayHints?: string[];
  acuteWindow?:
    | "less_than_6_weeks"
    | "6_to_12_weeks"
    | "3_to_6_months"
    | "more_than_6_months"
    | "unsure";
  chronicWindow?:
    | "3_to_6_months"
    | "6_to_12_months"
    | "more_than_12_months"
    | "unsure";
  reportsBrokenHairs?: boolean | null;
  rapidProgressionWeeks?: boolean | null;
  tractionSignals?: string[];
  cosmeticSignals?: string[];
  sleepShiftWork?: "yes" | "no" | "unsure";
  majorStressEvent?: "yes" | "no" | "unsure";
  recentRapidWeightLoss?: boolean | null;
  restrictiveEating?: "yes" | "no" | "unsure";
  highIntensitySportBodybuilding?: "yes" | "no" | "unsure";
  androgenExposureSignals?: string[];
  stressSignals?: string[];
  femaleContext?: {
    cycleRegularity?: "regular" | "irregular" | "not_occurring" | "prefer_not_to_say";
    postpartumRecent?: "yes" | "no" | "unsure";
    hyperandrogenSigns?: string[];
    menopauseContext?: "none" | "perimenopause" | "menopause" | "unsure";
    fertilityHormonalContext?: "yes" | "no" | "prefer_not_to_say";
  };
  maleContext?: {
    androgenExposure?: string[];
    rapidRecessionProgression?: "yes" | "no" | "unsure";
    crownProgression?: "yes" | "no" | "unsure";
    medicationHistory?: string[];
  };
  neutralContext?: {
    endocrineHistoryKnown?: "yes" | "no" | "unsure";
    hormonalContextFreeText?: string;
  };
};

export type AdaptiveDerivedSummary = {
  likely_pattern?: string;
  possible_drivers?: string[];
  red_flags?: string[];
  bloodwork_considerations?: string[];
  document_requests?: string[];
  upload_guidance?: string[];
  clinician_attention_flags?: string[];
  confidence_summary?: string;
  primary_pathway?: string;
  secondary_pathways?: string[];
  pathway_confidence?: Array<{
    pathway: string;
    score: number;
    confidence: "high" | "medium" | "low";
  }>;
};

export type AdaptiveEnginePayload = {
  schemaVersion?: string;
  answers?: Record<string, string | string[] | boolean | null>;
  triage?: AdaptiveDerivedSummary;
  adaptive_answers?: Record<string, string | string[] | boolean | null>;
  adaptive_schema_version?: string;
  adaptive_triage_output?: AdaptiveDerivedSummary;
};

export type LongevityQuestionnaireResponses = {
  aboutYou?: AboutYou;
  mainConcern?: MainConcern;
  timelineTriggers?: TimelineTriggers;
  medicalHistory?: MedicalHistory;
  femaleHistory?: FemaleHistory;
  maleHistory?: MaleHistory;
  lifestyleTreatments?: LifestyleTreatments;
  uploadsNextSteps?: UploadsNextSteps;
  adaptiveIntake?: AdaptiveIntake;
  adaptiveDerivedSummary?: AdaptiveDerivedSummary;
  adaptiveEngine?: AdaptiveEnginePayload;
};
