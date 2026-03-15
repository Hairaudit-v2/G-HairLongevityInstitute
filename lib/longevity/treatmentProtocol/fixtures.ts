/**
 * Deterministic fixture scenarios for protocol assessment.
 * Used to protect scoring refactors; no test framework required.
 * Run via: import { runProtocolFixtures } from "./fixtures"; runProtocolFixtures();
 */

import { assessTreatmentProtocol } from "./assessment";

export type ProtocolFixtureScenario = {
  id: string;
  label: string;
  input: {
    usedKeys: string[];
    adherenceItems: { key: string; status: string }[];
    hasPreviousIntake: boolean;
  };
};

const FIXTURE_SCENARIOS: ProtocolFixtureScenario[] = [
  {
    id: "supportive_only",
    label: "Supportive-only protocol (no core DHT or growth)",
    input: {
      usedKeys: ["saw_palmetto", "iron_supplement", "biotin"],
      adherenceItems: [
        { key: "saw_palmetto", status: "continued" },
        { key: "iron_supplement", status: "continued" },
        { key: "biotin", status: "continued" },
      ],
      hasPreviousIntake: true,
    },
  },
  {
    id: "strong_core",
    label: "Strong core protocol (DHT + growth)",
    input: {
      usedKeys: ["finasteride", "topical_minoxidil", "ketoconazole_shampoo"],
      adherenceItems: [
        { key: "finasteride", status: "continued" },
        { key: "topical_minoxidil", status: "continued" },
        { key: "ketoconazole_shampoo", status: "continued" },
      ],
      hasPreviousIntake: true,
    },
  },
  {
    id: "regenerative_without_foundation",
    label: "Regenerative without core foundation",
    input: {
      usedKeys: ["prp", "exosomes"],
      adherenceItems: [
        { key: "prp", status: "started" },
        { key: "exosomes", status: "started" },
      ],
      hasPreviousIntake: true,
    },
  },
  {
    id: "inconsistent_core",
    label: "Inconsistent core treatment",
    input: {
      usedKeys: ["finasteride", "topical_minoxidil"],
      adherenceItems: [
        { key: "finasteride", status: "inconsistent" },
        { key: "topical_minoxidil", status: "continued" },
      ],
      hasPreviousIntake: true,
    },
  },
  {
    id: "continued_core",
    label: "Continued core treatment (positive adherence)",
    input: {
      usedKeys: ["dutasteride", "oral_minoxidil"],
      adherenceItems: [
        { key: "dutasteride", status: "continued" },
        { key: "oral_minoxidil", status: "continued" },
      ],
      hasPreviousIntake: true,
    },
  },
  {
    id: "first_intake_uncertain",
    label: "First intake / uncertain continuity",
    input: {
      usedKeys: ["topical_minoxidil", "saw_palmetto"],
      adherenceItems: [
        { key: "topical_minoxidil", status: "uncertain" },
        { key: "saw_palmetto", status: "uncertain" },
      ],
      hasPreviousIntake: false,
    },
  },
  {
    id: "stopped_core",
    label: "Stopped core treatment (no replacement)",
    input: {
      usedKeys: ["iron_supplement"],
      adherenceItems: [
        { key: "finasteride", status: "stopped" },
        { key: "topical_minoxidil", status: "stopped" },
        { key: "iron_supplement", status: "continued" },
      ],
      hasPreviousIntake: true,
    },
  },
];

/**
 * Run all fixture scenarios and return assessments. Deterministic; no side effects.
 * Call from a script or future test runner to validate scoring behaviour.
 */
export function runProtocolFixtures(): Array<{
  scenarioId: string;
  label: string;
  assessment: ReturnType<typeof assessTreatmentProtocol>;
}> {
  return FIXTURE_SCENARIOS.map((s) => ({
    scenarioId: s.id,
    label: s.label,
    assessment: assessTreatmentProtocol({
      usedKeys: s.input.usedKeys,
      adherenceItems: s.input.adherenceItems,
      hasPreviousIntake: s.input.hasPreviousIntake,
    }),
  }));
}

export { FIXTURE_SCENARIOS };
