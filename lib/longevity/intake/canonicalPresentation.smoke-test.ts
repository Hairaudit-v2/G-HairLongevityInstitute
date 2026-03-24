import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

import { getCanonicalPresentationPattern } from "./canonicalPresentation";

export type CanonicalPresentationSmokeResult = { name: string; passed: boolean; message?: string };

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

export function runCanonicalPresentationSmokeTests(): CanonicalPresentationSmokeResult[] {
  const results: CanonicalPresentationSmokeResult[] = [];

  results.push({
    name: "engine presentation wins over legacy adaptiveIntake",
    ...(() => {
      try {
        const r: LongevityQuestionnaireResponses = {
          adaptiveEngine: { answers: { presentation_pattern: "crown_loss" } },
          adaptiveIntake: { presentationPattern: "acute_shedding" },
        };
        assert(getCanonicalPresentationPattern(r) === "crown_loss", "expected engine value");
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  results.push({
    name: "legacy-only draft still resolves",
    ...(() => {
      try {
        const r: LongevityQuestionnaireResponses = {
          adaptiveIntake: { presentationPattern: "mixed_or_unsure" },
        };
        assert(getCanonicalPresentationPattern(r) === "mixed_or_unsure", "expected legacy");
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  return results;
}
