export type SexAtBirth =
  | "female"
  | "male"
  | "intersex"
  | "prefer_not_to_say"
  | "unknown";

export type QuestionKind =
  | "base"
  | "conditional"
  | "branch_entry"
  | "branch_followup"
  | "upload_guidance";

export type AnswerType =
  | "single_select"
  | "multi_select"
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "scale";

export type FactOperator =
  | "eq"
  | "neq"
  | "in"
  | "not_in"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "includes"
  | "exists";

export type PathwayId =
  | "androgenic_pattern"
  | "telogen_effluvium_acute"
  | "telogen_effluvium_chronic"
  | "female_hormonal_pattern"
  | "male_androgen_exposure_pattern"
  | "nutritional_deficiency_pattern"
  | "inflammatory_scalp_pattern"
  | "traction_mechanical_pattern"
  | "medication_induced_pattern"
  | "postpartum_pattern"
  | "thyroid_metabolic_pattern"
  | "mixed_pattern"
  | "unclear_pattern";

export type UploadGuideId =
  | "frontal_hairline"
  | "temples"
  | "crown"
  | "top_down"
  | "center_part"
  | "diffuse_top"
  | "edges_closeup"
  | "scalp_closeup"
  | "patch_closeup"
  | "donor_back";

export type BloodworkConsiderationId =
  | "iron_studies"
  | "thyroid_panel"
  | "vitamin_d"
  | "b12_folate"
  | "androgen_hormone_review_if_clinically_appropriate"
  | "metabolic_review_if_clinically_appropriate";

export type ClinicianAttentionFlag =
  | "possible_pcos_signal"
  | "heavy_period_related_iron_risk"
  | "possible_scarring_red_flag"
  | "possible_exogenous_androgen_acceleration"
  | "possible_postpartum_shedding"
  | "possible_chronic_te"
  | "possible_inflammatory_scalp_disease"
  | "possible_traction_pattern"
  | "mixed_pattern_needs_clinician_review";

export type RedFlag =
  | "painful_inflamed_scalp"
  | "pustules_or_crusting"
  | "shiny_scarring_areas"
  | "rapid_patchy_loss"
  | "eyebrow_loss_with_inflammation"
  | "severe_sudden_shedding_with_systemic_symptoms";

export type QuestionOption = {
  value: string;
  label: string;
  scoreEffects?: Partial<Record<PathwayId, number>>;
};

export type RuleCondition = {
  fact: string;
  operator: FactOperator;
  value?: unknown;
};

export type QuestionValidation = {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
};

export type AdaptiveQuestion = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  helpText?: string;
  sensitive?: boolean;
  patientMaySkip?: boolean;
  answerType: AnswerType;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  showWhen?: RuleCondition[];
  tags?: string[];
};

export type PathwayScoringRule = {
  when: RuleCondition[];
  score: number;
  reason?: string;
};

export type PathwayDefinition = {
  id: PathwayId;
  label: string;
  entryCriteria: RuleCondition[];
  scoringRules?: PathwayScoringRule[];
  followupQuestionIds: string[];
  derivedSignals?: string[];
  bloodworkConsiderations?: BloodworkConsiderationId[];
  uploadGuidance?: UploadGuideId[];
};

export type AdaptiveAnswerValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

export type AdaptiveAnswers = Record<string, AdaptiveAnswerValue>;

export type PathwayScore = {
  pathwayId: PathwayId;
  score: number;
  reasons: string[];
};

export type AdaptiveFacts = Record<string, unknown>;

export type AdaptiveTriageOutput = {
  schema_version: string;
  primary_pathway: PathwayId;
  secondary_pathways: PathwayId[];
  pathway_confidence: Partial<Record<PathwayId, number>>;
  likely_pattern?: string;
  possible_drivers: string[];
  red_flags: RedFlag[];
  bloodwork_considerations: BloodworkConsiderationId[];
  document_requests: string[];
  upload_guidance: UploadGuideId[];
  clinician_attention_flags: ClinicianAttentionFlag[];
  confidence_summary?: string;
};

export type AdaptiveEngineResult = {
  facts: AdaptiveFacts;
  pathwayScores: PathwayScore[];
  visibleQuestionIds: string[];
  triage: AdaptiveTriageOutput;
};

export const HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION = "hli_adaptive_intake_v1";
