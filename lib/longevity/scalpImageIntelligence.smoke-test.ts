import { mergeScalpImageIntoDocumentMetadata } from "@/lib/longevity/scalpImageDocumentMetadata";
import {
  extractCaseSynthesisFromRawPayload,
  extractPerImageEvidenceFromRawPayload,
  SCALP_EVIDENCE_LEVEL,
  SCALP_IMAGE_ANALYSIS_VERSION,
} from "@/lib/longevity/scalpImageAnalysis";
import type { ScalpPerDocumentMetadata } from "@/lib/longevity/scalpImageAnalysis";
import {
  fuseIntakeTriageWithScalpSynthesis,
  INTAKE_IMAGE_ALIGNMENT,
} from "@/lib/longevity/intakeImageFusion";
import type { ScalpImageCaseSynthesis } from "@/lib/longevity/scalpImageAnalysis";

type SmokeResult = {
  name: string;
  passed: boolean;
  message?: string;
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function run(name: string, fn: () => void): SmokeResult {
  try {
    fn();
    return { name, passed: true };
  } catch (error) {
    return {
      name,
      passed: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const sampleEntry: ScalpPerDocumentMetadata = {
  document_id: "00000000-0000-4000-8000-000000000001",
  detected_view: "crown",
  usability: "usable",
  quality_flags: ["blur"],
};

export function runScalpImageIntelligenceSmokeTests(): SmokeResult[] {
  return [
    run("mergeScalpImageIntoDocumentMetadata preserves unrelated keys", () => {
      const merged = mergeScalpImageIntoDocumentMetadata(
        { other_key: "keep", scalp_image: { prior: true } },
        sampleEntry,
        SCALP_IMAGE_ANALYSIS_VERSION,
        "2026-03-24T12:00:00.000Z"
      );
      assert(merged.other_key === "keep", "Expected unrelated key preserved");
      assert(
        (merged.scalp_image as Record<string, unknown>).prior === true,
        "Expected nested scalp_image merged"
      );
      assert(
        (merged.scalp_image as { detected_view: string }).detected_view === "crown",
        "Expected detected_view"
      );
      assert(
        (merged.scalp_image as { analysis_version: string }).analysis_version ===
          SCALP_IMAGE_ANALYSIS_VERSION,
        "Expected analysis_version"
      );
    }),
    run("extractCaseSynthesisFromRawPayload reads case_synthesis", () => {
      const raw = {
        version: "openai_scalp_draft_v2",
        case_synthesis: {
          sufficient_for_pattern_review: true,
          missing_views: ["temples"],
          image_confidence: 0.72,
          visual_pattern_candidates: ["androgenetic_pattern"],
        },
      };
      const s = extractCaseSynthesisFromRawPayload(raw);
      assert(s != null, "Expected synthesis");
      assert(s!.sufficient_for_pattern_review === true, "sufficient");
      assert(s!.missing_views.includes("temples"), "missing_views");
      assert(s!.image_confidence === 0.72, "confidence");
    }),
    run("extractCaseSynthesisFromRawPayload null when missing", () => {
      assert(extractCaseSynthesisFromRawPayload(null) === null, "null in");
      assert(extractCaseSynthesisFromRawPayload({}) === null, "empty");
    }),
    run("extractPerImageEvidenceFromRawPayload maps rows", () => {
      const raw = {
        current_image_analyses: [
          {
            document_id: "doc-1",
            evidence_features: {
              temple_recession: SCALP_EVIDENCE_LEVEL.POSSIBLE,
              crown_thinning: SCALP_EVIDENCE_LEVEL.NONE,
              part_widening: SCALP_EVIDENCE_LEVEL.NONE,
              diffuse_density: SCALP_EVIDENCE_LEVEL.NONE,
              edge_thinning: SCALP_EVIDENCE_LEVEL.NONE,
              redness_scale: SCALP_EVIDENCE_LEVEL.NONE,
              patchy_loss: SCALP_EVIDENCE_LEVEL.NONE,
            },
            evidence_confidence: 0.55,
            limitations: ["crown not visible"],
          },
        ],
      };
      const rows = extractPerImageEvidenceFromRawPayload(raw);
      assert(rows.length === 1, "one row");
      assert(rows[0].document_id === "doc-1", "id");
      assert(rows[0].limitations[0] === "crown not visible", "limitations");
    }),
    run("fusion: insufficient when no synthesis", () => {
      const r = fuseIntakeTriageWithScalpSynthesis(
        { primary_pathway: "androgenic_pattern" },
        null
      );
      assert(r.alignment === INTAKE_IMAGE_ALIGNMENT.INSUFFICIENT, "insufficient");
    }),
    run("fusion: strong when pathway matches blob", () => {
      const synthesis: ScalpImageCaseSynthesis = {
        sufficient_for_pattern_review: true,
        missing_views: ["temples", "crown", "frontal_hairline"],
        image_confidence: 0.72,
        visual_pattern_candidates: ["androgenetic_pattern"],
      };
      const r = fuseIntakeTriageWithScalpSynthesis(
        { primary_pathway: "androgenic_pattern" },
        synthesis
      );
      assert(r.alignment === INTAKE_IMAGE_ALIGNMENT.STRONG, "strong");
      assert(r.supports_primary_pathway === "yes", "supports");
    }),
    run("fusion: conflicting when patchy vs androgenic", () => {
      const synthesis: ScalpImageCaseSynthesis = {
        sufficient_for_pattern_review: true,
        missing_views: [],
        image_confidence: 0.72,
        visual_pattern_candidates: ["patchy_or_multifocal_loss"],
      };
      const r = fuseIntakeTriageWithScalpSynthesis(
        { primary_pathway: "androgenic_pattern" },
        synthesis
      );
      assert(r.alignment === INTAKE_IMAGE_ALIGNMENT.CONFLICTING, "conflicting");
    }),
    run("fusion: partial when match score below strong threshold", () => {
      const synthesis: ScalpImageCaseSynthesis = {
        sufficient_for_pattern_review: true,
        missing_views: [],
        image_confidence: 0.55,
        visual_pattern_candidates: ["androgenetic_pattern"],
      };
      const r = fuseIntakeTriageWithScalpSynthesis(
        { primary_pathway: "androgenic_pattern" },
        synthesis
      );
      assert(r.alignment === INTAKE_IMAGE_ALIGNMENT.PARTIAL, "partial");
    }),
  ];
}
