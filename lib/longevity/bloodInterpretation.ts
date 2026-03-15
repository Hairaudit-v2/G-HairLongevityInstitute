/**
 * Phase G: Blood result interpretation engine. Deterministic clinical logic only (no AI).
 * Hair-specific optimal ranges and mapping to triage flags (Fe, T, A, ⊕, !).
 */

export type InterpretationStatus =
  | "optimal"
  | "normal"
  | "low"
  | "high"
  | "critical"
  | "unknown";

/** Triage flag character for display in review workspace (maps to questionnaire-derived flags). */
export type ClinicalFlagChar = "Fe" | "T" | "A" | "⊕" | "!" | null;

export type InterpretedMarker = {
  marker: string;
  value: number;
  unit: string | null;
  status: InterpretationStatus;
  clinical_flag: ClinicalFlagChar;
  explanation: string;
};

/** Hair-specific optimal range: [low, high] for optimal; values outside lab ref but inside optimal are 'normal'. */
export type OptimalRange = {
  optimalLow: number;
  optimalHigh: number;
  /** Unit for display (e.g. µg/L, nmol/L). */
  unit: string;
  /** Which triage flag this marker maps to. */
  flag: ClinicalFlagChar;
  /** Short explanation when low. */
  explanationLow: string;
  /** Short explanation when high. */
  explanationHigh: string;
  /** Short explanation when optimal. */
  explanationOptimal: string;
};

const HAIR_OPTIMAL: Record<string, OptimalRange> = {
  Ferritin: {
    optimalLow: 50,
    optimalHigh: 150,
    unit: "µg/L",
    flag: "Fe",
    explanationLow: "Low ferritin can contribute to telogen shedding; consider repletion for hair.",
    explanationHigh: "Elevated; may be acute-phase. Interpret with iron studies.",
    explanationOptimal: "Within range often associated with healthy hair growth.",
  },
  "Vitamin D": {
    optimalLow: 75,
    optimalHigh: 150,
    unit: "nmol/L",
    flag: "Fe",
    explanationLow: "Low vitamin D may be relevant to hair; consider supplementation.",
    explanationHigh: "Above target; avoid excessive supplementation.",
    explanationOptimal: "Adequate for bone and general health; may support hair.",
  },
  "25-OH Vitamin D": {
    optimalLow: 75,
    optimalHigh: 150,
    unit: "nmol/L",
    flag: "Fe",
    explanationLow: "Low vitamin D may be relevant to hair; consider supplementation.",
    explanationHigh: "Above target; avoid excessive supplementation.",
    explanationOptimal: "Adequate for bone and general health; may support hair.",
  },
  TSH: {
    optimalLow: 0.4,
    optimalHigh: 2.5,
    unit: "mU/L",
    flag: "T",
    explanationLow: "Low TSH may indicate hyperthyroidism; can affect hair.",
    explanationHigh: "Elevated TSH may indicate hypothyroidism; relevant to diffuse hair loss.",
    explanationOptimal: "Within range often associated with normal thyroid function for hair.",
  },
  "Free T3": {
    optimalLow: 3.5,
    optimalHigh: 6.5,
    unit: "pmol/L",
    flag: "T",
    explanationLow: "Low free T3 can be seen in hypothyroidism; may affect hair.",
    explanationHigh: "Elevated free T3 may indicate hyperthyroidism; can affect hair.",
    explanationOptimal: "Within normal thyroid range.",
  },
  "Free T4": {
    optimalLow: 10,
    optimalHigh: 22,
    unit: "pmol/L",
    flag: "T",
    explanationLow: "Low free T4 may indicate hypothyroidism; relevant to hair.",
    explanationHigh: "Elevated free T4 may indicate hyperthyroidism; can affect hair.",
    explanationOptimal: "Within normal thyroid range.",
  },
  T3: {
    optimalLow: 1.2,
    optimalHigh: 3.0,
    unit: "nmol/L",
    flag: "T",
    explanationLow: "Low T3 can be seen in hypothyroidism or illness.",
    explanationHigh: "Elevated T3 may indicate hyperthyroidism.",
    explanationOptimal: "Within normal thyroid range.",
  },
  T4: {
    optimalLow: 60,
    optimalHigh: 140,
    unit: "nmol/L",
    flag: "T",
    explanationLow: "Low T4 may indicate hypothyroidism.",
    explanationHigh: "Elevated T4 may indicate hyperthyroidism.",
    explanationOptimal: "Within normal thyroid range.",
  },
  B12: {
    optimalLow: 200,
    optimalHigh: 900,
    unit: "ng/L",
    flag: "Fe",
    explanationLow: "Low B12 can contribute to hair changes; consider supplementation.",
    explanationHigh: "Adequate; very high levels often from supplementation.",
    explanationOptimal: "Adequate for hair and general health.",
  },
  "Vitamin B12": {
    optimalLow: 200,
    optimalHigh: 900,
    unit: "ng/L",
    flag: "Fe",
    explanationLow: "Low B12 can contribute to hair changes; consider supplementation.",
    explanationHigh: "Adequate; very high levels often from supplementation.",
    explanationOptimal: "Adequate for hair and general health.",
  },
  CRP: {
    optimalLow: 0,
    optimalHigh: 5,
    unit: "mg/L",
    flag: "⊕",
    explanationLow: "No significant inflammation detected.",
    explanationHigh: "Elevated CRP suggests inflammation; may be relevant to scalp or systemic.",
    explanationOptimal: "Low inflammation; favourable for scalp health.",
  },
  "C-Reactive Protein": {
    optimalLow: 0,
    optimalHigh: 5,
    unit: "mg/L",
    flag: "⊕",
    explanationLow: "No significant inflammation detected.",
    explanationHigh: "Elevated CRP suggests inflammation; may be relevant to scalp or systemic.",
    explanationOptimal: "Low inflammation; favourable for scalp health.",
  },
  Zinc: {
    optimalLow: 10,
    optimalHigh: 18,
    unit: "µmol/L",
    flag: "Fe",
    explanationLow: "Low zinc can affect hair; consider diet or supplementation.",
    explanationHigh: "Adequate; very high levels can be toxic.",
    explanationOptimal: "Adequate for hair and immunity.",
  },
  HbA1c: {
    optimalLow: 0,
    optimalHigh: 42,
    unit: "mmol/mol",
    flag: "⊕",
    explanationLow: "Not applicable.",
    explanationHigh: "Elevated HbA1c may indicate glycaemic dysregulation; can affect hair.",
    explanationOptimal: "Within non-diabetic range.",
  },
  "HbA1c %": {
    optimalLow: 0,
    optimalHigh: 6.0,
    unit: "%",
    flag: "⊕",
    explanationLow: "Not applicable.",
    explanationHigh: "Elevated HbA1c may indicate glycaemic dysregulation; can affect hair.",
    explanationOptimal: "Within non-diabetic range.",
  },
  Testosterone: {
    optimalLow: 0.5,
    optimalHigh: 3,
    unit: "nmol/L",
    flag: "A",
    explanationLow: "Low testosterone; interpret in clinical context (e.g. female vs male).",
    explanationHigh: "Elevated testosterone may be relevant in androgen-related hair loss; interpret with SHBG.",
    explanationOptimal: "Interpret in context of sex and SHBG.",
  },
  "Total Testosterone": {
    optimalLow: 0.5,
    optimalHigh: 3,
    unit: "nmol/L",
    flag: "A",
    explanationLow: "Low testosterone; interpret in clinical context.",
    explanationHigh: "Elevated testosterone may be relevant in androgen-related hair loss; interpret with SHBG.",
    explanationOptimal: "Interpret in context of sex and SHBG.",
  },
  SHBG: {
    optimalLow: 20,
    optimalHigh: 120,
    unit: "nmol/L",
    flag: "A",
    explanationLow: "Low SHBG can increase free androgen; relevant to pattern loss.",
    explanationHigh: "High SHBG reduces free androgen; interpret with testosterone.",
    explanationOptimal: "Interpret with testosterone for androgen picture.",
  },
};

/** Normalise marker name for lookup (trim, collapse spaces, common aliases). */
function normaliseMarkerName(name: string): string {
  const t = name.trim().replace(/\s+/g, " ");
  const aliases: Record<string, string> = {
    "25-OH Vit D": "25-OH Vitamin D",
    "25OHD": "25-OH Vitamin D",
    "Vit D": "Vitamin D",
    "Vitamin D3": "Vitamin D",
    "Free T3": "Free T3",
    "Free T4": "Free T4",
    "fT3": "Free T3",
    "fT4": "Free T4",
    "CRP": "CRP",
    "C-Reactive Protein": "C-Reactive Protein",
    "B12": "B12",
    "Vitamin B12": "Vitamin B12",
    "Ferritin": "Ferritin",
    "TSH": "TSH",
    "HbA1c": "HbA1c",
    "Testosterone": "Testosterone",
    "SHBG": "SHBG",
    "Zinc": "Zinc",
  };
  return aliases[t] ?? t;
}

/** Canonical marker keys for trend comparison (Phase I). Same keys as HAIR_OPTIMAL. */
export const KEY_MARKERS_FOR_TRENDS: string[] = Object.keys(HAIR_OPTIMAL);

/**
 * Normalise marker name for grouping and comparison (Phase I). Use when building longitudinal views.
 */
export function getNormalisedMarkerKey(name: string): string {
  return normaliseMarkerName(name);
}

/**
 * Interpret a single blood marker using hair-specific optimal ranges.
 * Uses lab reference range when provided; otherwise only optimal range.
 */
export function interpretMarker(
  markerName: string,
  value: number,
  unit: string | null,
  referenceLow: number | null,
  referenceHigh: number | null
): InterpretedMarker {
  const normalised = normaliseMarkerName(markerName);
  const opt = HAIR_OPTIMAL[normalised];

  const displayUnit = unit ?? opt?.unit ?? null;

  if (opt) {
    const { optimalLow, optimalHigh, flag, explanationLow, explanationHigh, explanationOptimal } = opt;
    const isLow = value < optimalLow;
    const isHigh = optimalHigh > 0 && value > optimalHigh;
    const isCriticalLow = value < optimalLow * 0.5 || (normalised === "Ferritin" && value < 15);
    const isCriticalHigh =
      (normalised === "TSH" && value > 10) ||
      (normalised === "CRP" && value > 50) ||
      (normalised === "HbA1c %" && value > 10) ||
      (normalised === "HbA1c" && value > 86);

    let status: InterpretationStatus = "optimal";
    let explanation = explanationOptimal;

    if (isCriticalLow || isCriticalHigh) {
      status = "critical";
      explanation = isCriticalLow ? explanationLow : explanationHigh;
    } else if (isLow) {
      status = "low";
      explanation = explanationLow;
    } else if (isHigh) {
      status = "high";
      explanation = explanationHigh;
    }

    return {
      marker: markerName,
      value,
      unit: displayUnit,
      status,
      clinical_flag: flag,
      explanation,
    };
  }

  // Unknown marker: use lab reference if provided
  if (referenceLow != null && referenceHigh != null) {
    let status: InterpretationStatus = "normal";
    let explanation = "Within lab reference range.";
    if (value < referenceLow) {
      status = value < referenceLow * 0.7 ? "critical" : "low";
      explanation = "Below lab reference range.";
    } else if (value > referenceHigh) {
      status = value > referenceHigh * 1.3 ? "critical" : "high";
      explanation = "Above lab reference range.";
    }
    return {
      marker: markerName,
      value,
      unit: displayUnit,
      status,
      clinical_flag: null,
      explanation,
    };
  }

  return {
    marker: markerName,
    value,
    unit: displayUnit,
    status: "unknown",
    clinical_flag: null,
    explanation: "No hair-specific or lab reference available; interpret clinically.",
  };
}

/**
 * Interpret multiple raw markers (e.g. from hli_longevity_blood_result_markers).
 */
export function interpretMarkers(
  raw: Array<{
    marker_name: string;
    value: number;
    unit?: string | null;
    reference_low?: number | null;
    reference_high?: number | null;
  }>
): InterpretedMarker[] {
  return raw.map((m) =>
    interpretMarker(
      m.marker_name,
      m.value,
      m.unit ?? null,
      m.reference_low ?? null,
      m.reference_high ?? null
    )
  );
}

/** Get triage flag character for a marker name (for display only). */
export function getClinicalFlagForMarker(markerName: string): ClinicalFlagChar {
  const normalised = normaliseMarkerName(markerName);
  return HAIR_OPTIMAL[normalised]?.flag ?? null;
}
