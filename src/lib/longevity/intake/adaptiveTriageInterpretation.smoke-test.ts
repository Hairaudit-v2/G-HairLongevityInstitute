import type { AdaptiveAnswers } from "./adaptiveTypes";
import { evaluateAdaptiveIntake } from "./adaptiveTriageEngine";
import { TRIAGE_CONFIDENCE_REASON } from "./adaptiveTriageInterpretation";

type SmokeTestResult = { name: string; passed: boolean; message?: string };

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

export function runAdaptiveTriageInterpretationSmokeTests(): SmokeTestResult[] {
  const results: SmokeTestResult[] = [];

  results.push({
    name: "triage output includes confidence_level and confidence_reasons",
    ...(() => {
      try {
        const r = evaluateAdaptiveIntake({
          sex_at_birth: "female",
          chief_concern: "shedding",
          onset_timing: "6_weeks_to_3_months",
          pattern_distribution: ["diffuse_top"],
          recent_illness: true,
        });
        assert(typeof r.triage.confidence_level === "string", "confidence_level set");
        assert(Array.isArray(r.triage.confidence_reasons), "confidence_reasons array");
        assert(r.triage.confidence_reasons.length > 0, "at least one reason");
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  results.push({
    name: "high confidence — clear dominant acute TE pattern",
    ...(() => {
      try {
        const r = evaluateAdaptiveIntake({
          sex_at_birth: "female",
          chief_concern: "shedding",
          onset_timing: "less_than_6_weeks",
          pattern_distribution: ["diffuse_top", "diffuse_all_over"],
          recent_illness: true,
          covid_or_high_fever: true,
        });
        assert(r.triage.confidence_level === "high", `expected high, got ${r.triage.confidence_level}`);
        assert(
          r.triage.confidence_reasons.includes(TRIAGE_CONFIDENCE_REASON.CLEAR_DOMINANT_PATTERN),
          "expected clear dominant reason"
        );
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  results.push({
    name: "mixed primary — moderate or low with overlapping contributors",
    ...(() => {
      try {
        const r = evaluateAdaptiveIntake({
          chief_concern: "shedding",
          active_shedding_now: true,
          pattern_distribution: ["diffuse_top"],
          onset_timing: "6_to_12_months",
          scalp_symptoms: ["itch", "burning", "white_flakes"],
          poor_sleep_quality: true,
          high_stress_load: true,
          pattern_confidence: "mixed_or_unsure",
        });
        assert(r.triage.primary_pathway === "mixed_pattern", "mixed primary");
        assert(
          r.triage.confidence_reasons.includes(TRIAGE_CONFIDENCE_REASON.OVERLAPPING_CONTRIBUTORS),
          "overlapping contributors"
        );
        assert(
          r.triage.confidence_level === "low" || r.triage.confidence_level === "moderate",
          `expected low|moderate for mixed, got ${r.triage.confidence_level}`
        );
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  results.push({
    name: "uncertain pattern confidence — includes conflicting pattern indicators",
    ...(() => {
      try {
        const r = evaluateAdaptiveIntake({
          chief_concern: "shedding",
          active_shedding_now: true,
          pattern_distribution: ["diffuse_top"],
          onset_timing: "3_to_6_months",
          pattern_confidence: "mixed_or_unsure",
        });
        assert(
          r.triage.confidence_reasons.includes(TRIAGE_CONFIDENCE_REASON.CONFLICTING_PATTERN_INDICATORS),
          "conflicting pattern indicators"
        );
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  results.push({
    name: "narrow margin — overlapping contributors at moderate",
    ...(() => {
      try {
        const r = evaluateAdaptiveIntake({
          sex_at_birth: "female",
          chief_concern: "shedding",
          pattern_distribution: ["diffuse_top"],
          onset_timing: "3_to_6_months",
          recent_stress_event: true,
          postpartum_recent: true,
          active_shedding_now: true,
        });
        const concrete = r.pathwayScores.filter(
          (s) => s.pathwayId !== "mixed_pattern" && s.pathwayId !== "unclear_pattern"
        );
        const sorted = [...concrete].sort((a, b) => b.score - a.score);
        const gap =
          sorted.length >= 2 ? sorted[0]!.score - sorted[1]!.score : 999;
        assert(gap <= 2, `expected narrow model gap<=2 for this fixture, got ${gap}`);
        assert(r.triage.confidence_level === "moderate", `expected moderate, got ${r.triage.confidence_level}`);
        assert(
          r.triage.confidence_reasons.includes(TRIAGE_CONFIDENCE_REASON.OVERLAPPING_CONTRIBUTORS),
          "overlapping contributors for narrow margin"
        );
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  results.push({
    name: "unclear primary — low signal strength",
    ...(() => {
      try {
        const answers: AdaptiveAnswers = {
          chief_concern: "mixed_unsure",
          pattern_distribution: [],
        };
        const r = evaluateAdaptiveIntake(answers);
        assert(r.triage.primary_pathway === "unclear_pattern", "unclear primary");
        assert(r.triage.confidence_level === "low", `expected low, got ${r.triage.confidence_level}`);
        assert(
          r.triage.confidence_reasons.includes(TRIAGE_CONFIDENCE_REASON.LOW_SIGNAL_STRENGTH),
          "low signal strength"
        );
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  return results;
}
