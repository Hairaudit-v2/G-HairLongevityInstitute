/**
 * Hair Longevity Treatment Protocol — rule-based gaps and strengths.
 * Deterministic, clinician-safe. No AI.
 */

import type { CoverageDomains } from "./types";
import type { RawDomainScores } from "./scoring";

const CORE_DHT_KEYS = new Set(["finasteride", "dutasteride", "spironolactone"]);
const GROWTH_KEYS = new Set(["topical_minoxidil", "oral_minoxidil", "microneedling"]);
const REGENERATIVE_KEYS = new Set(["prp", "exosomes"]);

export type GapsStrengthsInput = {
  usedKeys: string[];
  adherenceItems: { key: string; status: string }[];
  rawScores: RawDomainScores;
  coverage: CoverageDomains;
  hasPreviousIntake: boolean;
};

function hasKey(usedKeys: string[], key: string): boolean {
  const n = key.toLowerCase().replace(/-/g, "_");
  return usedKeys.some((k) => k.toLowerCase().replace(/-/g, "_") === n);
}

function hasAnyKey(usedKeys: string[], keys: Set<string>): boolean {
  return usedKeys.some((k) => keys.has(k.toLowerCase().replace(/-/g, "_")));
}

function statusOf(adherenceItems: { key: string; status: string }[], key: string): string | undefined {
  const n = key.toLowerCase().replace(/-/g, "_");
  return adherenceItems.find((i) => i.key.toLowerCase().replace(/-/g, "_") === n)?.status;
}

/**
 * Compute protocol gaps from used keys, adherence, and domain coverage.
 */
export function computeGaps(input: GapsStrengthsInput): string[] {
  const { usedKeys, adherenceItems, rawScores, coverage, hasPreviousIntake } = input;
  const gaps: string[] = [];
  const set = new Set(usedKeys.map((k) => k.toLowerCase().replace(/-/g, "_")));

  const hasDht = hasAnyKey(usedKeys, CORE_DHT_KEYS) || rawScores.dht_control > 0;
  const hasGrowth = hasAnyKey(usedKeys, GROWTH_KEYS) || rawScores.growth_stimulation > 0;
  const hasRegen = hasAnyKey(usedKeys, REGENERATIVE_KEYS) || rawScores.regenerative_support > 0;

  if (!hasDht && !hasGrowth && set.size > 0) {
    gaps.push("supportive_only_protocol");
  }
  if (!hasDht && coverage.dht_control === "none") {
    gaps.push("no_core_dht_modulation_listed");
  }
  if (!hasGrowth && coverage.growth_stimulation === "none") {
    gaps.push("no_growth_stimulation_listed");
  }
  if (hasRegen && !hasDht && !hasGrowth) {
    gaps.push("regenerative_without_core_foundation");
  }

  const coreKeys = [...CORE_DHT_KEYS, "topical_minoxidil", "oral_minoxidil"];
  for (const key of coreKeys) {
    const status = statusOf(adherenceItems, key);
    if (status === "inconsistent") {
      gaps.push("core_treatment_inconsistent");
      break;
    }
    if (hasPreviousIntake && status === "stopped") {
      gaps.push("stopped_core_treatment_without_replacement");
      break;
    }
  }

  return [...new Set(gaps)];
}

/**
 * Compute protocol strengths from used keys and domain coverage.
 */
export function computeStrengths(input: GapsStrengthsInput): string[] {
  const { usedKeys, rawScores, coverage } = input;
  const strengths: string[] = [];
  const set = new Set(usedKeys.map((k) => k.toLowerCase().replace(/-/g, "_")));

  if (coverage.dht_control !== "none" || hasAnyKey(usedKeys, CORE_DHT_KEYS)) {
    strengths.push("core_dht_control_present");
  }
  if (coverage.growth_stimulation !== "none" || hasAnyKey(usedKeys, GROWTH_KEYS)) {
    strengths.push("growth_stimulation_present");
  }
  if (
    (coverage.dht_control !== "none" || hasAnyKey(usedKeys, CORE_DHT_KEYS)) &&
    (coverage.growth_stimulation !== "none" || hasAnyKey(usedKeys, GROWTH_KEYS))
  ) {
    strengths.push("combined_core_protocol_present");
  }
  if (coverage.regenerative_support !== "none" || hasAnyKey(usedKeys, REGENERATIVE_KEYS)) {
    strengths.push("regenerative_support_present");
  }

  const continuedCore = usedKeys.some((k) => {
    const status = statusOf(input.adherenceItems, k);
    return (CORE_DHT_KEYS.has(k) || GROWTH_KEYS.has(k)) && status === "continued";
  });
  if (continuedCore) {
    strengths.push("good_core_continuity");
  }

  const domainCount = [
    rawScores.dht_control > 0,
    rawScores.growth_stimulation > 0,
    rawScores.regenerative_support > 0,
    rawScores.inflammation_scalp_support > 0,
    rawScores.nutritional_support > 0,
  ].filter(Boolean).length;
  if (domainCount >= 2) {
    strengths.push("multidomain_protocol_present");
  }

  return [...new Set(strengths)];
}
