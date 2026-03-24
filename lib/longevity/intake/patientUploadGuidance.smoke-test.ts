import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

import { getPatientUploadGuidance } from "./patientUploadGuidance";

export type PatientUploadGuidanceSmokeResult = { name: string; passed: boolean; message?: string };

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

export function runPatientUploadGuidanceSmokeTests(): PatientUploadGuidanceSmokeResult[] {
  const results: PatientUploadGuidanceSmokeResult[] = [];

  results.push({
    name: "empty responses yields safe defaults",
    ...(() => {
      try {
        const g = getPatientUploadGuidance(undefined);
        assert(g.photoHints.length > 0, "expected default photo hints from triage");
        assert(g.bloodHelperText.length > 20, "expected blood helper");
        assert(Array.isArray(g.documentHints), "document hints array");
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  results.push({
    name: "inflammatory pathway adds scalp-oriented photo hints",
    ...(() => {
      try {
        const r: LongevityQuestionnaireResponses = {
          aboutYou: { sexAtBirth: "male" },
          mainConcern: { primaryConcerns: ["scalp_irritation_or_inflammation"] },
          adaptiveEngine: {
            answers: {
              presentation_pattern: "scalp_symptoms",
              scalp_symptom_cluster: ["itch", "burning"],
            },
          },
        };
        const g = getPatientUploadGuidance(r);
        assert(
          g.photoHints.some((h) => h.toLowerCase().includes("close-up") || h.toLowerCase().includes("itchy")),
          "expected symptom-oriented hint"
        );
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  results.push({
    name: "medication signal highlights medication uploads",
    ...(() => {
      try {
        const r: LongevityQuestionnaireResponses = {
          adaptiveEngine: {
            answers: {
              presentation_pattern: "acute_shedding",
              medication_hormone_change_recent: "yes",
            },
          },
        };
        const g = getPatientUploadGuidance(r);
        assert(g.highlightMedicationUploads === true, "expected medication highlight");
        assert(g.documentHints.length >= 1, "expected document hint");
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  return results;
}
