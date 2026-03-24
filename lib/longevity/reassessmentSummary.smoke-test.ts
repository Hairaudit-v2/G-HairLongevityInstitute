import { LONGEVITY_DOC_TYPE } from "@/lib/longevity/documentTypes";
import { buildReassessmentSummary } from "@/lib/longevity/reassessmentSummary";

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

export function runReassessmentSummarySmokeTests(): SmokeResult[] {
  return [
    run("new upload received", () => {
      const output = buildReassessmentSummary({
        adaptive_triage: null,
        adaptive_rescore_comparison: null,
        documents: [
          {
            doc_type: LONGEVITY_DOC_TYPE.MEDICAL_LETTER,
            created_at: "2026-03-20T10:00:00.000Z",
          },
        ],
        review_outcome: "awaiting_patient_documents",
        first_review_note_at: "2026-03-19T10:00:00.000Z",
        intake_created_at: "2026-03-18T10:00:00.000Z",
        scalp_image_comparison: null,
      });
      assert(
        output.signals.some(
          (s) => s.id === "new_documents_received" && s.active
        ),
        "Expected new_documents_received signal to be active"
      );
    }),
    run("bloodwork document received", () => {
      const output = buildReassessmentSummary({
        adaptive_triage: null,
        adaptive_rescore_comparison: null,
        documents: [
          {
            doc_type: LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD,
            created_at: "2026-03-20T10:00:00.000Z",
          },
        ],
        review_outcome: "follow_up_recommended",
        first_review_note_at: "2026-03-19T10:00:00.000Z",
        intake_created_at: "2026-03-18T10:00:00.000Z",
        scalp_image_comparison: null,
      });
      assert(
        output.signals.some((s) => s.id === "bloodwork_received" && s.active),
        "Expected bloodwork_received signal to be active"
      );
      assert(output.ready_for_reassessment, "Expected case to be ready for reassessment");
    }),
    run("no-change fallback", () => {
      const output = buildReassessmentSummary({
        adaptive_triage: {
          upload_guidance: ["center_part"],
        },
        adaptive_rescore_comparison: null,
        documents: [],
        review_outcome: "awaiting_patient_documents",
        first_review_note_at: "2026-03-19T10:00:00.000Z",
        intake_created_at: "2026-03-18T10:00:00.000Z",
        scalp_image_comparison: null,
      });
      assert(!output.ready_for_reassessment, "Expected not ready when no new changes");
      assert(
        output.signals.some(
          (s) => s.id === "follow_up_still_incomplete" && s.active
        ),
        "Expected follow_up_still_incomplete signal to be active"
      );
    }),
    run("scalp intelligence signals optional", () => {
      const output = buildReassessmentSummary({
        adaptive_triage: null,
        adaptive_rescore_comparison: null,
        documents: [],
        review_outcome: "follow_up_recommended",
        first_review_note_at: "2026-03-19T10:00:00.000Z",
        intake_created_at: "2026-03-18T10:00:00.000Z",
        scalp_image_comparison: null,
        scalp_intelligence: {
          pending_scalp_analysis_after_anchor: true,
          new_scalp_metadata_usable: false,
          alignment_review_recommended: true,
        },
      });
      assert(
        output.signals.some(
          (s) => s.id === "new_scalp_ai_analysis_available" && s.active
        ),
        "new scalp AI analysis signal"
      );
      assert(
        output.signals.some(
          (s) => s.id === "intake_image_alignment_review_recommended" && s.active
        ),
        "alignment review signal"
      );
    }),
    run("uncertain-to-clearer progression", () => {
      const output = buildReassessmentSummary({
        adaptive_triage: null,
        adaptive_rescore_comparison: {
          stored_schema_version: "old",
          current_schema_version: "new",
          stored_primary_pathway: "mixed_pattern",
          current_primary_pathway: "androgenic_pattern",
          stored_secondary_pathways: ["postpartum_pattern"],
          current_secondary_pathways: [],
          stored_red_flags: ["rapid_patchy_loss"],
          current_red_flags: [],
          stored_clinician_attention_flags: ["possible_traction_pattern"],
          current_clinician_attention_flags: [],
          changed: true,
          changed_fields: ["clinician_attention_flags", "red_flags"],
          summary_note: "Changed",
        },
        documents: [],
        review_outcome: "follow_up_recommended",
        first_review_note_at: "2026-03-19T10:00:00.000Z",
        intake_created_at: "2026-03-18T10:00:00.000Z",
        scalp_image_comparison: null,
      });
      assert(
        output.signals.some(
          (s) => s.id === "original_uncertainty_reduced" && s.active
        ),
        "Expected uncertainty reduced signal to be active"
      );
    }),
  ];
}

