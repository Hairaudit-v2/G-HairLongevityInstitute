/**
 * Phase V: Deterministic fixture scenarios for analytics layer validation.
 * Longevity namespace only. Safe, deterministic, human-readable.
 *
 * These fixtures simulate analytics-ready outbox/event histories that would produce
 * specific derived reporting states. Use runAnalyticsFixtures() to validate
 * expected vs actual state computation.
 *
 * Future expansion: Add cohort analytics fixtures and FI benchmarking scenarios.
 */

import type { NormalizedLongevityEventEnvelope } from "./normalizedEvents";
import type { NormalizedLongevitySignal } from "./normalizedSignals";
import type { AdherenceContextResult } from "./adherenceContext";
import type { CaseComparisonResult } from "./caseComparison";
import { LONGEVITY_SIGNAL_KEY, LONGEVITY_EVENT_TYPE } from "./integrationContracts";
import { computeDerivedReportingStates } from "./derivedReportingStates";

/** Mock analytics record shape - mirrors what analytics consumption layer expects */
export type AnalyticsRecord = {
  event?: NormalizedLongevityEventEnvelope | null;
  signals?: NormalizedLongevitySignal[] | null;
  adherenceContext?: AdherenceContextResult | null;
  caseComparison?: CaseComparisonResult | null;
};

/** Deterministic fixture scenario definition */
export type AnalyticsFixtureScenario = {
  id: string;
  label: string;
  description: string;
  records: AnalyticsRecord[];
  expectedDerivedStates: {
    persistent_driver_pattern: boolean;
    high_follow_up_adherence: boolean;
    delayed_follow_up_pattern: boolean;
    repeat_reminder_required: boolean;
    visual_progression_without_marker_improvement: boolean;
    marker_improvement_without_visual_change: boolean;
  };
};

/**
 * Mock data builders for deterministic fixture scenarios.
 * Each builder creates analytics records that simulate real HLI outbox histories.
 */

function mockSignal(
  signalKey: keyof typeof LONGEVITY_SIGNAL_KEY,
  status: NormalizedLongevitySignal["status"] = "active",
  payload: Record<string, unknown> = {},
  intakeId = "intake-1"
): NormalizedLongevitySignal {
  return {
    signal_key: LONGEVITY_SIGNAL_KEY[signalKey],
    source_system: "hli_longevity",
    source_version: "1",
    generated_at: new Date().toISOString(),
    status,
    severity: "attention",
    entity_refs: {
      source_system: "hli_longevity",
      local_entity_type: "intake",
      local_entity_id: intakeId,
    },
    payload,
  };
}

function mockEvent(
  eventType: (typeof LONGEVITY_EVENT_TYPE)[keyof typeof LONGEVITY_EVENT_TYPE],
  intakeId = "intake-1"
): NormalizedLongevityEventEnvelope {
  return {
    event_type: eventType,
    source_system: "hli_longevity",
    source_version: "1",
    event_id: `event-${Math.random().toString(36).substr(2, 9)}`,
    occurred_at: new Date().toISOString(),
    entity_refs: {
      source_system: "hli_longevity",
      local_entity_type: "intake",
      local_entity_id: intakeId,
    },
    payload: {},
  };
}

function mockAdherenceContext(
  returned: boolean,
  daysToReturn: number | null = null,
  remindersSent: number = 0,
  repeatedOverdue: boolean = false
): AdherenceContextResult {
  return {
    returned_after_reminder: returned,
    days_to_return: daysToReturn,
    reminders_sent_count: remindersSent,
    repeated_overdue_pattern: repeatedOverdue,
    reminder_response_context: [],
    outcome_types: [],
  };
}

function mockCaseComparison(
  persistentDrivers: string[] = [],
  _visualProgressionSignals: string[] = [],
  markerImprovedAreas: string[] = []
): CaseComparisonResult {
  return {
    previousIntake: { id: "prev-1", created_at: new Date().toISOString(), review_outcome: null },
    improvedAreas: markerImprovedAreas,
    worsenedAreas: [],
    persistentDrivers,
    newConcerns: [],
    suggestedReviewFocus: [],
    treatmentResponse: null,
    scalpImageComparison: null,
    patientSummary: {
      whatHasImproved: [],
      stillNeedsFollowUp: [],
      nextStepMayBe: [],
    },
  };
}

/** Deterministic fixture scenarios for derived reporting states */
export const ANALYTICS_FIXTURE_SCENARIOS: AnalyticsFixtureScenario[] = [
  {
    id: "persistent_iron_driver",
    label: "Persistent iron driver across 3 intakes",
    description: "Iron risk signal present in all 3 consecutive intakes, indicating persistent pattern",
    records: [
      {
        signals: [
          mockSignal("IRON_RISK_ACTIVE", "active", { evidence: ["questionnaire_possible_iron_risk"] }, "intake-1"),
        ],
      },
      {
        signals: [
          mockSignal("IRON_RISK_ACTIVE", "active", { evidence: ["clinical_driver_iron_oxygen_delivery"] }, "intake-2"),
        ],
        caseComparison: mockCaseComparison(["Iron / oxygen delivery"]),
      },
      {
        signals: [
          mockSignal("IRON_RISK_ACTIVE", "active", { evidence: ["clinical_driver_iron_oxygen_delivery"] }, "intake-3"),
        ],
        caseComparison: mockCaseComparison(["Iron / oxygen delivery"]),
      },
    ],
    expectedDerivedStates: {
      persistent_driver_pattern: true,
      high_follow_up_adherence: false,
      delayed_follow_up_pattern: false,
      repeat_reminder_required: false,
      visual_progression_without_marker_improvement: false,
      marker_improvement_without_visual_change: false,
    },
  },
  {
    id: "marker_improvement_no_visual_change",
    label: "Marker improvement without visual change",
    description: "Blood markers show improvement but scalp images remain stable",
    records: [
      {
        signals: [
          mockSignal("MARKER_IMPROVING", "improving", { improved_areas: ["Iron levels normalized"] }),
        ],
        caseComparison: mockCaseComparison([], [], ["Iron levels normalized"]),
      },
    ],
    expectedDerivedStates: {
      persistent_driver_pattern: false,
      high_follow_up_adherence: false,
      delayed_follow_up_pattern: false,
      repeat_reminder_required: false,
      visual_progression_without_marker_improvement: false,
      marker_improvement_without_visual_change: true,
    },
  },
  {
    id: "visual_progression_no_marker_improvement",
    label: "Visual progression without marker improvement",
    description: "Scalp images show worsening but markers remain stable",
    records: [
      {
        signals: [
          mockSignal("VISUAL_CHANGE_DETECTED", "active", {
            comparison_status: "worsened",
            progression_signals: ["thinning_distribution_expanded"],
          }),
        ],
        caseComparison: mockCaseComparison([], ["thinning_distribution_expanded"], []),
      },
    ],
    expectedDerivedStates: {
      persistent_driver_pattern: false,
      high_follow_up_adherence: false,
      delayed_follow_up_pattern: false,
      repeat_reminder_required: false,
      visual_progression_without_marker_improvement: true,
      marker_improvement_without_visual_change: false,
    },
  },
  {
    id: "repeat_reminder_required",
    label: "Repeat reminder required",
    description: "Multiple reminders sent but no follow-up response",
    records: [
      {
        adherenceContext: mockAdherenceContext(false, null, 2, false),
      },
    ],
    expectedDerivedStates: {
      persistent_driver_pattern: false,
      high_follow_up_adherence: false,
      delayed_follow_up_pattern: false,
      repeat_reminder_required: true,
      visual_progression_without_marker_improvement: false,
      marker_improvement_without_visual_change: false,
    },
  },
  {
    id: "high_follow_up_adherence",
    label: "High follow-up adherence",
    description: "Prompt response to reminder with no overdue patterns",
    records: [
      {
        event: mockEvent(LONGEVITY_EVENT_TYPE.FOLLOW_UP_COMPLETED_AFTER_REMINDER),
        adherenceContext: mockAdherenceContext(true, 7, 1, false),
      },
    ],
    expectedDerivedStates: {
      persistent_driver_pattern: false,
      high_follow_up_adherence: true,
      delayed_follow_up_pattern: false,
      repeat_reminder_required: false,
      visual_progression_without_marker_improvement: false,
      marker_improvement_without_visual_change: false,
    },
  },
  {
    id: "delayed_follow_up_pattern",
    label: "Delayed follow-up pattern",
    description: "Response after reminders with repeated overdue behavior",
    records: [
      {
        adherenceContext: mockAdherenceContext(true, 25, 2, true),
      },
    ],
    expectedDerivedStates: {
      persistent_driver_pattern: false,
      high_follow_up_adherence: false,
      delayed_follow_up_pattern: true,
      repeat_reminder_required: false,
      visual_progression_without_marker_improvement: false,
      marker_improvement_without_visual_change: false,
    },
  },
  {
    id: "treatment_continuity_improvement",
    label: "Treatment continuity with eventual improvement",
    description: "Consistent treatment adherence leading to marker and visual improvements",
    records: [
      {
        signals: [
          mockSignal("TREATMENT_ADHERENCE_SUMMARY", "active", {
            items: [
              { key: "dutasteride", label: "Dutasteride", state: "continued" },
              { key: "topical_minoxidil", label: "Topical Minoxidil", state: "continued" },
            ],
          }),
          mockSignal("MARKER_IMPROVING", "improving", { improved_areas: ["DHT markers reduced"] }),
          mockSignal("VISUAL_CHANGE_DETECTED", "improving", {
            comparison_status: "improved",
            progression_signals: ["thinning_distribution_reduced"],
          }),
        ],
        caseComparison: mockCaseComparison([], ["thinning_distribution_reduced"], ["DHT markers reduced"]),
        adherenceContext: mockAdherenceContext(true, 10, 0, false),
      },
    ],
    expectedDerivedStates: {
      persistent_driver_pattern: false,
      high_follow_up_adherence: true,
      delayed_follow_up_pattern: false,
      repeat_reminder_required: false,
      visual_progression_without_marker_improvement: false,
      marker_improvement_without_visual_change: false,
    },
  },
  {
    id: "treatment_stopped_worsening",
    label: "Treatment stopped followed by worsening",
    description: "Treatment discontinued leading to marker and visual deterioration",
    records: [
      {
        signals: [
          mockSignal("TREATMENT_ADHERENCE_SUMMARY", "active", {
            items: [
              { key: "finasteride", label: "Finasteride", state: "stopped" },
              { key: "topical_minoxidil", label: "Topical Minoxidil", state: "stopped" },
            ],
          }),
          mockSignal("VISUAL_CHANGE_DETECTED", "active", {
            comparison_status: "worsened",
            progression_signals: ["thinning_distribution_expanded"],
          }),
        ],
        caseComparison: mockCaseComparison(["DHT imbalance"], ["thinning_distribution_expanded"], []),
        adherenceContext: mockAdherenceContext(false, null, 3, true),
      },
    ],
    expectedDerivedStates: {
      persistent_driver_pattern: true,
      high_follow_up_adherence: false,
      delayed_follow_up_pattern: true,
      repeat_reminder_required: true,
      visual_progression_without_marker_improvement: true,
      marker_improvement_without_visual_change: false,
    },
  },
];

/**
 * Compute derived reporting states from fixture records.
 * Reuses derivedReportingStates (single source of truth); no duplicate rule logic.
 */
function computeDerivedStatesFromRecords(records: AnalyticsRecord[]) {
  const signals = records.flatMap((r) => r.signals ?? []) as { signal_key: string; payload: Record<string, unknown> }[];
  const adherenceContexts = records.map((r) => r.adherenceContext).filter(Boolean) as AdherenceContextResult[];
  const caseComparisons = (records.map((r) => r.caseComparison).filter(Boolean) as CaseComparisonResult[]).map((c) => ({
    persistentDrivers: c.persistentDrivers,
    improvedAreas: c.improvedAreas,
  }));
  return computeDerivedReportingStates({ signals, adherenceContexts, caseComparisons });
}

/**
 * Run all fixture scenarios and return validation results.
 * Deterministic; no side effects. Use for development validation.
 */
export function runAnalyticsFixtures(): Array<{
  scenarioId: string;
  label: string;
  expected: AnalyticsFixtureScenario["expectedDerivedStates"];
  actual: AnalyticsFixtureScenario["expectedDerivedStates"];
  passed: boolean;
  mismatches: string[];
}> {
  return ANALYTICS_FIXTURE_SCENARIOS.map((scenario) => {
    const actual = computeDerivedStatesFromRecords(scenario.records);
    const mismatches: string[] = [];

    for (const [key, expectedValue] of Object.entries(scenario.expectedDerivedStates)) {
      const actualValue = actual[key as keyof typeof actual];
      if (expectedValue !== actualValue) {
        mismatches.push(`${key}: expected ${expectedValue}, got ${actualValue}`);
      }
    }

    return {
      scenarioId: scenario.id,
      label: scenario.label,
      expected: scenario.expectedDerivedStates,
      actual,
      passed: mismatches.length === 0,
      mismatches,
    };
  });
}