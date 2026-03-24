import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

/**
 * Single source of truth for presentation pattern in the live intake:
 * `adaptiveEngine.answers.presentation_pattern` (legacy persisted drafts may still have
 * `adaptiveIntake.presentationPattern` only — read that as fallback).
 */
export function getCanonicalPresentationPattern(
  responses: LongevityQuestionnaireResponses | undefined | null
): string | undefined {
  const r = responses ?? {};
  const fromEngine =
    r.adaptiveEngine?.answers?.presentation_pattern ??
    r.adaptiveEngine?.adaptive_answers?.presentation_pattern;
  if (typeof fromEngine === "string" && fromEngine.trim().length > 0) {
    return fromEngine.trim().toLowerCase();
  }
  const legacy = r.adaptiveIntake?.presentationPattern;
  if (typeof legacy === "string" && legacy.trim().length > 0) {
    return legacy.trim().toLowerCase();
  }
  return undefined;
}
