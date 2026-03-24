import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

import { withPresentation } from "./caseHelpers";
import type { SyntheticExpectedOutcome, SyntheticPatientCase } from "./types";

export function syntheticCase(
  id: string,
  label: string,
  presentation_pattern: string,
  responses: LongevityQuestionnaireResponses,
  expected: SyntheticExpectedOutcome,
  tags?: string[]
): SyntheticPatientCase {
  return {
    id,
    label,
    tags,
    responses: withPresentation(presentation_pattern, responses),
    expected,
  };
}
