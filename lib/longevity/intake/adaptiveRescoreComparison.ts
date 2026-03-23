import {
  evaluateAdaptiveIntake,
  HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
  type AdaptiveAnswers,
} from "@/lib/longevity/intake";

export type AdaptiveRescoreChangedField =
  | "schema_version"
  | "primary_pathway"
  | "secondary_pathways"
  | "red_flags"
  | "clinician_attention_flags";

export type AdaptiveTriageSnapshot = {
  schema_version?: string;
  primary_pathway?: string;
  secondary_pathways?: string[];
  red_flags?: string[];
  clinician_attention_flags?: string[];
};

export type AdaptiveRescoreComparison = {
  stored_schema_version: string | null;
  current_schema_version: string;
  stored_primary_pathway: string | null;
  current_primary_pathway: string;
  stored_secondary_pathways: string[];
  current_secondary_pathways: string[];
  stored_red_flags: string[];
  current_red_flags: string[];
  stored_clinician_attention_flags: string[];
  current_clinician_attention_flags: string[];
  changed: boolean;
  changed_fields: AdaptiveRescoreChangedField[];
  summary_note: string;
};

function toStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((item): item is string => typeof item === "string");
}

function sorted(arr: string[]): string[] {
  return [...new Set(arr)].sort((a, b) => a.localeCompare(b));
}

function sameStringArray(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, idx) => value === b[idx]);
}

function safeStoredSnapshot(stored: unknown): AdaptiveTriageSnapshot {
  if (!stored || typeof stored !== "object") return {};
  const payload = stored as Record<string, unknown>;
  return {
    schema_version:
      typeof payload.schema_version === "string" ? payload.schema_version : undefined,
    primary_pathway:
      typeof payload.primary_pathway === "string"
        ? payload.primary_pathway
        : undefined,
    secondary_pathways: toStringArray(payload.secondary_pathways),
    red_flags: toStringArray(payload.red_flags),
    clinician_attention_flags: toStringArray(payload.clinician_attention_flags),
  };
}

function summaryForChanges(
  changedFields: AdaptiveRescoreChangedField[]
): string {
  if (changedFields.length === 0) {
    return "Stored adaptive triage aligns with current engine interpretation.";
  }
  return `Adaptive triage interpretation changed in: ${changedFields
    .map((field) => field.replace(/_/g, " "))
    .join(", ")}.`;
}

export function compareAdaptiveTriageWithCurrentEngine(args: {
  adaptive_answers: AdaptiveAnswers | null | undefined;
  stored_adaptive_schema_version: string | null | undefined;
  stored_adaptive_triage_output: unknown;
}): AdaptiveRescoreComparison {
  const adaptiveAnswers = (args.adaptive_answers ?? {}) as AdaptiveAnswers;
  const stored = safeStoredSnapshot(args.stored_adaptive_triage_output);
  const current = evaluateAdaptiveIntake(adaptiveAnswers).triage;

  const storedSecondary = sorted(stored.secondary_pathways ?? []);
  const currentSecondary = sorted(toStringArray(current.secondary_pathways));
  const storedRedFlags = sorted(stored.red_flags ?? []);
  const currentRedFlags = sorted(toStringArray(current.red_flags));
  const storedAttention = sorted(stored.clinician_attention_flags ?? []);
  const currentAttention = sorted(
    toStringArray(current.clinician_attention_flags)
  );

  const changedFields: AdaptiveRescoreChangedField[] = [];
  const storedSchema = args.stored_adaptive_schema_version ?? stored.schema_version ?? null;

  if (storedSchema !== HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION) {
    changedFields.push("schema_version");
  }
  if ((stored.primary_pathway ?? null) !== current.primary_pathway) {
    changedFields.push("primary_pathway");
  }
  if (!sameStringArray(storedSecondary, currentSecondary)) {
    changedFields.push("secondary_pathways");
  }
  if (!sameStringArray(storedRedFlags, currentRedFlags)) {
    changedFields.push("red_flags");
  }
  if (!sameStringArray(storedAttention, currentAttention)) {
    changedFields.push("clinician_attention_flags");
  }

  return {
    stored_schema_version: storedSchema,
    current_schema_version: HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
    stored_primary_pathway: stored.primary_pathway ?? null,
    current_primary_pathway: current.primary_pathway,
    stored_secondary_pathways: storedSecondary,
    current_secondary_pathways: currentSecondary,
    stored_red_flags: storedRedFlags,
    current_red_flags: currentRedFlags,
    stored_clinician_attention_flags: storedAttention,
    current_clinician_attention_flags: currentAttention,
    changed: changedFields.length > 0,
    changed_fields: changedFields,
    summary_note: summaryForChanges(changedFields),
  };
}

