/**
 * Intake–image fusion: compares adaptive triage (questionnaire-derived) with
 * case-level scalp image synthesis. Heuristic only; does not modify adaptive scoring.
 */

import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";
import type { ScalpImageCaseSynthesis } from "@/lib/longevity/scalpImageAnalysis";

export const INTAKE_IMAGE_ALIGNMENT = {
  STRONG: "strong",
  PARTIAL: "partial",
  CONFLICTING: "conflicting",
  INSUFFICIENT: "insufficient",
} as const;

export type IntakeImageAlignment =
  (typeof INTAKE_IMAGE_ALIGNMENT)[keyof typeof INTAKE_IMAGE_ALIGNMENT];

export type IntakeImageFusionResult = {
  alignment: IntakeImageAlignment;
  supports_primary_pathway: "yes" | "partial" | "no" | "unclear";
  suggested_next_images: string[];
  clinician_notes: string[];
};

const STANDARD_REQUESTED_VIEWS = [
  "frontal_hairline",
  "temples",
  "crown",
  "part_line",
] as const;

function normalizeToken(s: string | undefined | null): string {
  if (!s || typeof s !== "string") return "";
  return s.trim().toLowerCase().replace(/\s+/g, "_");
}

function primaryPathwayFromTriage(triage: AdaptiveDerivedSummary | null): string {
  if (!triage) return "";
  const raw =
    triage.primary_pathway ??
    (typeof triage.likely_pattern === "string" ? triage.likely_pattern : "") ??
    "";
  return normalizeToken(raw);
}

/** Expected visual anchors per pathway (keywords matched against synthesis / candidates). */
function pathwayVisualExpectations(pathway: string): {
  want: string[];
  avoidConflict: string[];
} {
  switch (pathway) {
    case "androgenic_pattern":
    case "male_androgen_exposure_pattern":
      return {
        want: ["temple", "frontal", "crown", "vertex", "androgen", "recession"],
        avoidConflict: ["patchy", "inflammatory_only"],
      };
    case "female_hormonal_pattern":
      return {
        want: ["temple", "crown", "part", "diffuse", "androgen"],
        avoidConflict: [],
      };
    case "telogen_effluvium_acute":
    case "telogen_effluvium_chronic":
      return {
        want: ["diffuse", "part", "density", "mid_scalp"],
        avoidConflict: ["patchy_isolated"],
      };
    case "inflammatory_scalp_pattern":
      return {
        want: ["redness", "scale", "inflammatory", "patchy"],
        avoidConflict: [],
      };
    case "traction_mechanical_pattern":
      return {
        want: ["edge", "temple", "marginal", "traction"],
        avoidConflict: [],
      };
    case "nutritional_deficiency_pattern":
    case "thyroid_metabolic_pattern":
      return {
        want: ["diffuse", "density", "part"],
        avoidConflict: [],
      };
    case "mixed_pattern":
    case "unclear_pattern":
    default:
      return { want: [], avoidConflict: [] };
  }
}

function synthesisBlob(s: ScalpImageCaseSynthesis): string {
  return [
    ...s.visual_pattern_candidates,
    ...(s.missing_views ?? []),
    String(s.image_confidence),
    String(s.sufficient_for_pattern_review),
  ]
    .join(" ")
    .toLowerCase();
}

function triageUploadHints(triage: AdaptiveDerivedSummary | null): string[] {
  if (!triage) return [];
  const g = triage.upload_guidance;
  if (!Array.isArray(g)) return [];
  return g.filter((x): x is string => typeof x === "string");
}

/**
 * Compare adaptive triage with image case synthesis. Safe to call with null synthesis.
 */
export function fuseIntakeTriageWithScalpSynthesis(
  triage: AdaptiveDerivedSummary | null,
  synthesis: ScalpImageCaseSynthesis | null
): IntakeImageFusionResult {
  const notes: string[] = [];
  const suggested: string[] = [];

  if (!synthesis) {
    notes.push("No image synthesis available; run scalp image analysis or check uploads.");
    return {
      alignment: INTAKE_IMAGE_ALIGNMENT.INSUFFICIENT,
      supports_primary_pathway: "unclear",
      suggested_next_images: [...STANDARD_REQUESTED_VIEWS],
      clinician_notes: notes,
    };
  }

  if (!synthesis.sufficient_for_pattern_review || synthesis.image_confidence < 0.35) {
    notes.push("Image set may be insufficient for reliable pattern comparison with intake signals.");
    for (const v of synthesis.missing_views ?? []) {
      if (!suggested.includes(v)) suggested.push(v);
    }
  }

  const pathway = primaryPathwayFromTriage(triage);
  const expectations = pathwayVisualExpectations(pathway);
  const blob = synthesisBlob(synthesis);

  let matchScore = 0;
  for (const w of expectations.want) {
    if (w && blob.includes(w)) matchScore += 1;
  }
  for (const c of synthesis.visual_pattern_candidates) {
    const cc = c.toLowerCase();
    if (pathway && cc.includes(pathway.replace(/_/g, ""))) matchScore += 2;
  }

  const secondary = (triage?.secondary_pathways ?? [])
    .map((p) => normalizeToken(typeof p === "string" ? p : ""))
    .filter(Boolean);
  if (secondary.length > 0) {
    notes.push(`Secondary pathways present (${secondary.slice(0, 3).join(", ")}); interpret alignment cautiously.`);
  }

  let alignment: IntakeImageAlignment = INTAKE_IMAGE_ALIGNMENT.PARTIAL;
  let supports: IntakeImageFusionResult["supports_primary_pathway"] = "partial";

  if (!pathway || pathway === "unclear_pattern") {
    alignment = INTAKE_IMAGE_ALIGNMENT.PARTIAL;
    supports = "unclear";
    notes.push("Intake primary pathway unclear; use image synthesis as adjunct only.");
  } else if (matchScore >= 3 && synthesis.image_confidence >= 0.45) {
    alignment = INTAKE_IMAGE_ALIGNMENT.STRONG;
    supports = "yes";
  } else if (matchScore <= 0 && synthesis.image_confidence >= 0.4) {
    const conflict =
      (blob.includes("patchy") && pathway === "androgenic_pattern") ||
      (blob.includes("androgen") && pathway === "inflammatory_scalp_pattern");
    if (conflict) {
      alignment = INTAKE_IMAGE_ALIGNMENT.CONFLICTING;
      supports = "no";
      notes.push("Visual pattern cues diverge from the intake primary pathway; confirm clinically.");
    } else {
      alignment = INTAKE_IMAGE_ALIGNMENT.PARTIAL;
      supports = "partial";
      notes.push("Limited overlap between intake pathway and image-derived cues.");
    }
  } else {
    alignment = INTAKE_IMAGE_ALIGNMENT.PARTIAL;
    supports = "partial";
  }

  if (synthesis.missing_views?.length) {
    for (const v of synthesis.missing_views) {
      if (!suggested.includes(v)) suggested.push(v);
    }
  }

  const uploadHints = triageUploadHints(triage);
  for (const h of uploadHints) {
    const normalized = h.replace(/-/g, "_");
    if (STANDARD_REQUESTED_VIEWS.includes(normalized as (typeof STANDARD_REQUESTED_VIEWS)[number])) {
      if (!suggested.includes(normalized)) suggested.push(normalized);
    }
  }

  for (const v of STANDARD_REQUESTED_VIEWS) {
    if (!suggested.includes(v) && (synthesis.missing_views ?? []).includes(v)) {
      suggested.push(v);
    }
  }

  if (suggested.length === 0) {
    suggested.push(...STANDARD_REQUESTED_VIEWS.filter((v) => (synthesis.missing_views ?? []).includes(v)));
  }

  return {
    alignment,
    supports_primary_pathway: supports,
    suggested_next_images: suggested.length > 0 ? suggested : [...STANDARD_REQUESTED_VIEWS],
    clinician_notes: notes,
  };
}
