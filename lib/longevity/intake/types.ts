export type IntakePathwayId =
  | "androgenic_pattern"
  | "telogen_effluvium_diffuse_shedding"
  | "hormonal_endocrine_female_pattern"
  | "inflammatory_scalp_disease"
  | "traction_mechanical_damage"
  | "nutritional_deficiency"
  | "medication_androgen_exposure"
  | "mixed_unclear_pattern";

export type IntakeConfidenceBand = "high" | "medium" | "low";

export type IntakeQuestionType = "single_select" | "multi_select" | "boolean" | "text";

export type IntakeAnswerValue = string | string[] | boolean | null;

export type IntakeAnswerMap = Record<string, IntakeAnswerValue>;

export type IntakeQuestionDefinition = {
  id: string;
  label: string;
  type: IntakeQuestionType;
  section: "base" | "sex_specific" | "trigger" | "lifestyle" | "mechanical";
  safeHelperText?: string;
  options?: Array<{ value: string; label: string }>;
  allowSkip?: boolean;
  pathwayHints?: IntakePathwayId[];
  visibleWhen?: (answers: IntakeAnswerMap) => boolean;
};

export type IntakePathwayDefinition = {
  id: IntakePathwayId;
  label: string;
  entryCriteria: Array<(answers: IntakeAnswerMap, context: IntakeEngineContext) => boolean>;
  exitCriteria: Array<(answers: IntakeAnswerMap, context: IntakeEngineContext) => boolean>;
  followupQuestionIds: string[];
};

export type IntakePathwayScore = {
  pathway: IntakePathwayId;
  score: number;
  confidence: IntakeConfidenceBand;
};

export type IntakeEngineContext = {
  sexAtBirth?: "female" | "male" | "intersex" | "prefer_not_to_say";
  ageYears?: number | null;
};

export type IntakeTriageOutput = {
  likely_pattern: IntakePathwayId;
  possible_drivers: string[];
  red_flags: string[];
  bloodwork_considerations: string[];
  document_requests: string[];
  upload_guidance: string[];
  clinician_attention_flags: string[];
  confidence_summary: string;
  primary_pathway: IntakePathwayId;
  secondary_pathways: IntakePathwayId[];
  pathway_confidence: IntakePathwayScore[];
};

export type AdaptiveIntakeEnginePayload = {
  schemaVersion: string;
  answers: IntakeAnswerMap;
  triage: IntakeTriageOutput;
};

