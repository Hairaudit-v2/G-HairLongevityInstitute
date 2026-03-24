/**
 * Pure merge helper for hli_longevity_documents.metadata.scalp_image (testable, no I/O).
 */

import type { ScalpPerDocumentMetadata } from "@/lib/longevity/scalpImageAnalysis";

export function mergeScalpImageIntoDocumentMetadata(
  existingMetadata: unknown,
  entry: ScalpPerDocumentMetadata,
  analysisVersion: string,
  analyzedAtIso: string
): Record<string, unknown> {
  const base =
    existingMetadata &&
    typeof existingMetadata === "object" &&
    !Array.isArray(existingMetadata)
      ? (existingMetadata as Record<string, unknown>)
      : {};
  return {
    ...base,
    scalp_image: {
      ...((base.scalp_image as Record<string, unknown> | undefined) ?? {}),
      detected_view: entry.detected_view,
      usability: entry.usability,
      quality_flags: entry.quality_flags,
      analyzed_at: analyzedAtIso,
      analysis_version: analysisVersion,
    },
  };
}
