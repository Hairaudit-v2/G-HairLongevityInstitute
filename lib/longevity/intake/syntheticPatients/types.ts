import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import type {
  BloodworkConsiderationId,
  ClinicianAttentionFlag,
  PathwayId,
  RedFlag,
} from "@/src/lib/longevity/intake/adaptiveTypes";

/**
 * Ground-truth expectations for calibration / regression against the v2 triage engine.
 * Omit optional arrays when there is no requirement for that dimension.
 */
export type SyntheticExpectedOutcome = {
  /** Primary pathway must be one of these (use a singleton when exact). */
  primary_pathway: PathwayId | PathwayId[];
  /** Each listed pathway must appear in triage.secondary_pathways. */
  secondary_pathways_include?: PathwayId[];
  /** Each listed flag must appear in triage.clinician_attention_flags. */
  clinician_flags_include?: ClinicianAttentionFlag[];
  /** Each listed flag must appear in triage.red_flags. */
  red_flags_include?: RedFlag[];
  /** Each listed id must appear in triage.bloodwork_considerations. */
  bloodwork_include?: BloodworkConsiderationId[];
};

export type SyntheticPatientCase = {
  id: string;
  label: string;
  /** For reporting / weak-spot grouping (e.g. postpartum_overlap, inflammatory_shedding). */
  tags?: string[];
  /** Partial questionnaire payload; merge with helpers in cases if needed. */
  responses: LongevityQuestionnaireResponses;
  expected: SyntheticExpectedOutcome;
};

export type SyntheticCaseMismatch = {
  kind:
    | "primary_pathway"
    | "secondary_pathway"
    | "clinician_flag"
    | "red_flag"
    | "bloodwork";
  detail: string;
};

export type SyntheticSingleCaseResult = {
  case: SyntheticPatientCase;
  primary_ok: boolean;
  secondary_ok: boolean;
  flags_ok: boolean;
  red_ok: boolean;
  blood_ok: boolean;
  /** All specified expectations met. */
  passed: boolean;
  /** Primary OK but at least one other specified expectation failed. */
  partial: boolean;
  /** Primary not in accepted set. */
  failed: boolean;
  mismatches: SyntheticCaseMismatch[];
  actual: {
    primary_pathway: PathwayId;
    secondary_pathways: PathwayId[];
    clinician_attention_flags: ClinicianAttentionFlag[];
    red_flags: RedFlag[];
    bloodwork_considerations: BloodworkConsiderationId[];
    pathway_scores: { pathwayId: PathwayId; score: number }[];
  };
  /** Top two concrete pathways within 2 points (calibration-sensitive). */
  narrow_margin_top2: boolean;
  /** Gap between 1st and 2nd ranked concrete pathway scores. */
  score_gap_top2: number | null;
};

export type SyntheticSuiteSummary = {
  total: number;
  passed: number;
  partial: number;
  failed: number;
  primary_mismatches: { id: string; label: string; expected: string; actual: PathwayId }[];
  missing_secondaries: { id: string; label: string; missing: PathwayId[] }[];
  missing_clinician_flags: { id: string; label: string; missing: ClinicianAttentionFlag[] }[];
  missing_red_flags: { id: string; label: string; missing: RedFlag[] }[];
  missing_bloodwork: { id: string; label: string; missing: BloodworkConsiderationId[] }[];
  narrow_margin_cases: { id: string; label: string; gap: number; top: PathwayId; second: PathwayId }[];
  by_tag_weak: Record<string, { failed: number; partial: number; ids: string[] }>;
};

export type SyntheticSuiteRunResult = {
  results: SyntheticSingleCaseResult[];
  summary: SyntheticSuiteSummary;
};
