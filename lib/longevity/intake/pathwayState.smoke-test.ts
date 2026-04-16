import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

import { getPathwayStateFromQuestionnaire } from "./orchestrator";
import { INTAKE_QUESTION_BANK } from "./questionBank";

export type PathwayStateSmokeResult = { name: string; passed: boolean; message?: string };

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

export function runPathwayStateSmokeTests(): PathwayStateSmokeResult[] {
  const results: PathwayStateSmokeResult[] = [];

  results.push({
    name: "pathway state derives from adaptiveEngine answers",
    ...(() => {
      try {
        const r: LongevityQuestionnaireResponses = {
          aboutYou: { sexAtBirth: "female", dateOfBirth: "1990-01-01" },
          adaptiveEngine: {
            answers: {
              presentation_pattern: "acute_shedding",
              female_hormonal_context: "yes",
              lifestyle_load: ["major_stress"],
            },
          },
        };
        const s = getPathwayStateFromQuestionnaire(r);
        assert(typeof s.primary_pathway === "string" && s.primary_pathway.length > 0, "primary set");
        assert(Array.isArray(s.secondary_pathways), "secondary array");
        assert(s.pathway_confidence.length > 0, "scores");
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  results.push({
    name: "TRT timing stays on the timeline while non-TRT exposures keep adaptive timing follow-up",
    ...(() => {
      try {
        const timingQuestion = INTAKE_QUESTION_BANK.find(
          (question) => question.id === "exogenous_androgen_timing_vs_hair"
        );
        assert(timingQuestion?.visibleWhen, "timing question should define a visibility rule");
        const trtOnly = timingQuestion.visibleWhen?.({
          male_androgen_exposure_context: "yes",
          male_androgen_exposure_detail: ["trt"],
        });
        assert(
          trtOnly !== true,
          "TRT-only selection should not show adaptive timing follow-up"
        );
        const nonTrtExposure = timingQuestion.visibleWhen?.({
          male_androgen_exposure_context: "yes",
          male_androgen_exposure_detail: ["sarms_or_anabolics"],
        });
        assert(
          nonTrtExposure === true,
          "Non-TRT exposure should keep adaptive timing follow-up"
        );
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  return results;
}
