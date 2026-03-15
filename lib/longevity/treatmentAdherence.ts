/**
 * Phase U: Treatment adherence — compare current vs previous intake treatment usage.
 * Primary: lifestyleTreatments.currentTreatments. Secondary: medicationsSupplementsFreeText (fallback only).
 * Direct mappings + fallback free-text inference when clear. Longevity-only, deterministic, no AI.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { LongevityQuestionnaireResponses } from "./schema";

/** Granular treatment keys (questionnaire / clinician). */
export const TREATMENT_KEYS = [
  "topical_minoxidil",
  "oral_minoxidil",
  "finasteride",
  "dutasteride",
  "prp",
  "exosomes",
  "iron_supplement",
  "vitamin_d",
  "zinc",
  "biotin",
  "ketoconazole_shampoo",
  "led_laser_cap",
  "microneedling",
  "saw_palmetto",
  "spironolactone",
  "other_topical",
  "other_systemic",
] as const;

export type TreatmentKey = (typeof TREATMENT_KEYS)[number];

/** Treatment status over time (current vs previous intakes). */
export type TreatmentStatus =
  | "started"
  | "continued"
  | "stopped"
  | "inconsistent"
  | "uncertain"
  | "not_using";

export type TreatmentAdherenceItem = {
  key: TreatmentKey;
  label: string;
  status: TreatmentStatus;
};

export type TreatmentAdherenceResult = {
  items: TreatmentAdherenceItem[];
  hasPreviousIntake: boolean;
  hasTwoPreviousIntakes: boolean;
};

const TREATMENT_LABELS: Record<TreatmentKey, string> = {
  topical_minoxidil: "Topical minoxidil",
  oral_minoxidil: "Oral minoxidil",
  finasteride: "Finasteride",
  dutasteride: "Dutasteride",
  prp: "PRP",
  exosomes: "Exosomes",
  iron_supplement: "Iron supplement",
  vitamin_d: "Vitamin D",
  zinc: "Zinc",
  biotin: "Biotin",
  ketoconazole_shampoo: "Ketoconazole shampoo",
  led_laser_cap: "LED / laser cap",
  microneedling: "Microneedling",
  saw_palmetto: "Saw palmetto",
  spironolactone: "Spironolactone",
  other_topical: "Other topical",
  other_systemic: "Other systemic",
};

/** Direct mapping: normalized array value -> canonical key. Only for structured currentTreatments. */
const DIRECT_MAPPINGS: Record<string, TreatmentKey> = {
  topical_minoxidil: "topical_minoxidil",
  oral_minoxidil: "oral_minoxidil",
  finasteride: "finasteride",
  dutasteride: "dutasteride",
  spironolactone: "spironolactone",
  saw_palmetto: "saw_palmetto",
  prp: "prp",
  exosomes: "exosomes",
  microneedling: "microneedling",
  ketoconazole_shampoo: "ketoconazole_shampoo",
  led_or_laser_cap: "led_laser_cap",
  led_laser_cap: "led_laser_cap",
  iron_supplement: "iron_supplement",
  vitamin_d: "vitamin_d",
  zinc: "zinc",
  biotin: "biotin",
};

function normalizeStructuredValue(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

/** Map a value from currentTreatments (primary source) to a canonical key, or null. */
function directMapFromStructured(raw: string): TreatmentKey | null {
  const n = normalizeStructuredValue(raw);
  if (!n || n === "none") return null;
  return DIRECT_MAPPINGS[n] ?? (TREATMENT_KEYS.includes(n as TreatmentKey) ? (n as TreatmentKey) : null);
}

/**
 * Infer treatment keys from medicationsSupplementsFreeText only when clearly stated.
 * Minoxidil/rogaine/regaine -> topical_minoxidil or oral_minoxidil only if "oral" or "topical" specified.
 */
function inferKeysFromFreeText(freeText: string | undefined): Set<TreatmentKey> {
  const keys = new Set<TreatmentKey>();
  const t = (freeText ?? "").trim().toLowerCase();
  if (!t) return keys;

  // Minoxidil / rogaine / regaine -> topical_minoxidil or oral_minoxidil only if clearly specified
  if (/\boral\s+minoxidil\b|\bminoxidil\s+oral\b/.test(t)) keys.add("oral_minoxidil");
  if (/\btopical\s+minoxidil\b|\bminoxidil\s+topical\b/.test(t)) keys.add("topical_minoxidil");
  if ((/\brogaine\b|\bregaine\b|\bminoxidil\b/.test(t)) && !keys.has("oral_minoxidil") && !keys.has("topical_minoxidil")) {
    if (/\boral\b/.test(t)) keys.add("oral_minoxidil");
    else keys.add("topical_minoxidil");
  }

  if (/\bfinasteride\b|\bpropecia\b|\bproscar\b/.test(t)) keys.add("finasteride");
  if (/\bdutasteride\b|\bavodart\b/.test(t)) keys.add("dutasteride");
  if (/\bspironolactone\b/.test(t)) keys.add("spironolactone");
  if (/\bsaw\s*palmetto\b/.test(t)) keys.add("saw_palmetto");
  if (/\bprp\b|\bplatelet\s*rich\s*plasma\b/.test(t)) keys.add("prp");
  if (/\bexosome(s)?\b/.test(t)) keys.add("exosomes");
  if (/\bmicroneedling\b|\bdermaroller\b|\bdermapen\b/.test(t)) keys.add("microneedling");
  if (/\bketoconazole\b|\bnizoral\b/.test(t)) keys.add("ketoconazole_shampoo");
  if (/\blaser\s*cap\b|\bled\s*cap\b|\bred\s*light\b|\blllt\b/.test(t)) keys.add("led_laser_cap");
  if (/\biron\b|\bferrous\b/.test(t)) keys.add("iron_supplement");
  if (/\bvitamin\s*d\b|\bvit\s*d\b/.test(t)) keys.add("vitamin_d");
  if (/\bzinc\b/.test(t)) keys.add("zinc");
  if (/\bbiotin\b/.test(t)) keys.add("biotin");

  return keys;
}

/** Detect explicit irregular wording in free text (on and off, sometimes, irregular, when I remember). */
function hasIrregularWordingInFreeText(freeText: string | undefined): boolean {
  const t = (freeText ?? "").trim().toLowerCase();
  return (
    /\bsometimes\b/.test(t) ||
    /\bon\s*and\s*off\b|\boff\s*and\s*on\b/.test(t) ||
    /\birregular(ly)?\b/.test(t) ||
    /\bwhen\s*i\s*remember\b/.test(t) ||
    /\bintermittent(ly)?\b/.test(t) ||
    /\bnot\s*consistent\b/.test(t)
  );
}

function asResponses(value: unknown): LongevityQuestionnaireResponses {
  return value && typeof value === "object"
    ? (value as LongevityQuestionnaireResponses)
    : {};
}

/**
 * Extract used treatment keys from questionnaire.
 * Primary: lifestyleTreatments.currentTreatments (direct mappings).
 * Secondary: lifestyleTreatments.medicationsSupplementsFreeText (fallback inference only when clear).
 */
function getUsedTreatmentKeys(responses: LongevityQuestionnaireResponses): Set<TreatmentKey> {
  const keys = new Set<TreatmentKey>();
  const raw = (responses.lifestyleTreatments?.currentTreatments ?? []).filter(
    (v) => v && String(v).trim() && String(v).toLowerCase() !== "none"
  );
  for (const r of raw) {
    const k = directMapFromStructured(String(r));
    if (k) keys.add(k);
  }
  const freeText = responses.lifestyleTreatments?.medicationsSupplementsFreeText;
  const fromFreeText = inferKeysFromFreeText(freeText);
  for (const k of fromFreeText) keys.add(k);
  return keys;
}

/**
 * Keys that were inferred from free text (for inconsistent detection).
 * Only when free text contains explicit irregular wording do we mark these as inconsistent.
 */
function getKeysInferredFromFreeText(responses: LongevityQuestionnaireResponses): Set<TreatmentKey> {
  const freeText = responses.lifestyleTreatments?.medicationsSupplementsFreeText;
  return inferKeysFromFreeText(freeText);
}

/** When free text has irregular wording, treatments inferred from that free text are inconsistent. */
function getInconsistentKeysFromFreeText(responses: LongevityQuestionnaireResponses): Set<TreatmentKey> {
  const freeText = responses.lifestyleTreatments?.medicationsSupplementsFreeText;
  if (!hasIrregularWordingInFreeText(freeText)) return new Set();
  return getKeysInferredFromFreeText(responses);
}

/**
 * Get treatment adherence for an intake.
 * Continuity (v1): started / continued / stopped / not_using from structured array comparison.
 * inconsistent / uncertain only when clearly supported by free text or missing history.
 */
export async function getTreatmentAdherenceForIntake(
  supabase: SupabaseClient,
  profileId: string,
  intakeId: string
): Promise<TreatmentAdherenceResult> {
  const { data: currentIntake } = await supabase
    .from("hli_longevity_intakes")
    .select("id, created_at")
    .eq("id", intakeId)
    .eq("profile_id", profileId)
    .single();
  if (!currentIntake) {
    return {
      items: [],
      hasPreviousIntake: false,
      hasTwoPreviousIntakes: false,
    };
  }

  const { data: currentQ } = await supabase
    .from("hli_longevity_questionnaires")
    .select("responses")
    .eq("intake_id", intakeId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const currentResponses = asResponses(currentQ?.responses);
  const currentKeys = getUsedTreatmentKeys(currentResponses);
  const inconsistentKeysCurrent = getInconsistentKeysFromFreeText(currentResponses);

  const { data: previousIntakes } = await supabase
    .from("hli_longevity_intakes")
    .select("id, created_at")
    .eq("profile_id", profileId)
    .lt("created_at", currentIntake.created_at)
    .neq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(2);
  const previousList = previousIntakes ?? [];
  const previousIntake = previousList[0] ?? null;
  const previousPreviousIntake = previousList[1] ?? null;
  const hasPreviousIntake = !!previousIntake?.id;
  const hasTwoPreviousIntakes = !!previousPreviousIntake?.id;

  let previousKeys = new Set<TreatmentKey>();
  if (previousIntake?.id) {
    const { data: prevQ } = await supabase
      .from("hli_longevity_questionnaires")
      .select("responses")
      .eq("intake_id", previousIntake.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    previousKeys = getUsedTreatmentKeys(asResponses(prevQ?.responses));
  }

  const allKeys = new Set<TreatmentKey>([...currentKeys, ...previousKeys]);

  const items: TreatmentAdherenceItem[] = [];
  for (const key of allKeys) {
    const inCurrent = currentKeys.has(key);
    const inPrevious = previousKeys.has(key);
    let status: TreatmentStatus;

    if (!hasPreviousIntake) {
      status = inCurrent ? "uncertain" : "not_using";
    } else if (inCurrent && inPrevious) {
      status = "continued";
    } else if (inCurrent && !inPrevious) {
      status = "started";
    } else if (!inCurrent && inPrevious) {
      status = "stopped";
    } else {
      status = "not_using";
    }

    if (status === "not_using") continue;

    if (inCurrent && inconsistentKeysCurrent.has(key)) status = "inconsistent";

    items.push({
      key,
      label: TREATMENT_LABELS[key] ?? key.replace(/_/g, " "),
      status,
    });
  }

  return {
    items,
    hasPreviousIntake,
    hasTwoPreviousIntakes,
  };
}
