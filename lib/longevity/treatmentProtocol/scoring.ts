/**
 * Hair Longevity Treatment Protocol — weighted treatment scoring and domain coverage.
 * Deterministic weights; domain caps prevent one category dominating.
 */

import type { CoverageDomains, DomainCoverageLevel } from "./types";

/** Canonical treatment keys we score (subset of Phase U keys). */
const SCORED_KEYS = [
  "topical_minoxidil",
  "oral_minoxidil",
  "finasteride",
  "dutasteride",
  "spironolactone",
  "saw_palmetto",
  "prp",
  "exosomes",
  "microneedling",
  "led_laser_cap",
  "ketoconazole_shampoo",
  "iron_supplement",
  "vitamin_d",
  "zinc",
  "biotin",
  "other_topical",
  "other_systemic",
] as const;

/** Integer weight per treatment (deterministic protocol scoring). */
const TREATMENT_WEIGHTS = {
  finasteride: 18,
  dutasteride: 22,
  spironolactone: 16,
  saw_palmetto: 6,

  topical_minoxidil: 14,
  oral_minoxidil: 18,
  microneedling: 6,
  led_laser_cap: 5,

  prp: 8,
  exosomes: 10,

  ketoconazole_shampoo: 5,

  iron_supplement: 4,
  vitamin_d: 4,
  zinc: 3,
  biotin: 2,
} as const;

const TREATMENT_WEIGHTS_MAP: Record<string, number> = {
  ...TREATMENT_WEIGHTS,
  other_topical: 3,
  other_systemic: 3,
};

/** Domain contribution per treatment (which domain gets the points). */
const DOMAIN_MAP: Record<string, keyof CoverageDomains> = {
  finasteride: "dht_control",
  dutasteride: "dht_control",
  spironolactone: "dht_control",
  saw_palmetto: "dht_control",
  topical_minoxidil: "growth_stimulation",
  oral_minoxidil: "growth_stimulation",
  microneedling: "growth_stimulation",
  prp: "regenerative_support",
  exosomes: "regenerative_support",
  ketoconazole_shampoo: "inflammation_scalp_support",
  led_laser_cap: "inflammation_scalp_support",
  iron_supplement: "nutritional_support",
  vitamin_d: "nutritional_support",
  zinc: "nutritional_support",
  biotin: "nutritional_support",
  other_topical: "inflammation_scalp_support",
  other_systemic: "nutritional_support",
};

/** Per-domain caps so one category cannot overwhelm the whole score. Total of caps = 85 (base max before adherence ±15). */
const DOMAIN_CAPS: Record<keyof CoverageDomains, number> = {
  dht_control: 25,
  growth_stimulation: 25,
  regenerative_support: 15,
  inflammation_scalp_support: 10,
  nutritional_support: 10,
};

/** Strong coverage = at least 60% of that domain's cap. */
const STRONG_THRESHOLD_RATIO = 0.6;

export type RawDomainScores = Record<keyof CoverageDomains, number>;

/**
 * Compute raw weighted score per domain from used keys, capped per domain.
 */
export function computeRawDomainScores(usedKeys: string[]): RawDomainScores {
  const scores: RawDomainScores = {
    dht_control: 0,
    growth_stimulation: 0,
    regenerative_support: 0,
    inflammation_scalp_support: 0,
    nutritional_support: 0,
  };
  const set = new Set(usedKeys.map((k) => k.trim().toLowerCase().replace(/-/g, "_")));
  for (const key of set) {
    const weight = TREATMENT_WEIGHTS_MAP[key] ?? 2;
    const domain = DOMAIN_MAP[key];
    if (domain) {
      const cap = DOMAIN_CAPS[domain];
      const capped = Math.min(scores[domain] + weight, cap);
      scores[domain] = capped;
    }
  }
  return scores;
}

/**
 * Convert raw domain score to coverage level (uses domain cap for "strong" threshold).
 */
export function rawToCoverageLevel(raw: number, domainCap: number): DomainCoverageLevel {
  if (raw <= 0) return "none";
  if (raw >= domainCap * STRONG_THRESHOLD_RATIO) return "strong";
  return "partial";
}

/**
 * Compute coverage_domains from raw domain scores (per-domain strong threshold).
 */
export function computeCoverageDomains(raw: RawDomainScores): CoverageDomains {
  return {
    dht_control: rawToCoverageLevel(raw.dht_control, DOMAIN_CAPS.dht_control),
    growth_stimulation: rawToCoverageLevel(raw.growth_stimulation, DOMAIN_CAPS.growth_stimulation),
    regenerative_support: rawToCoverageLevel(raw.regenerative_support, DOMAIN_CAPS.regenerative_support),
    inflammation_scalp_support: rawToCoverageLevel(raw.inflammation_scalp_support, DOMAIN_CAPS.inflammation_scalp_support),
    nutritional_support: rawToCoverageLevel(raw.nutritional_support, DOMAIN_CAPS.nutritional_support),
  };
}

/** Base score max (sum of domain caps). Adherence ±15 applied in assessment; total max = 100. */
const BASE_SCORE_MAX = 85;

/**
 * Compute base protocol score 0–85 from raw domain scores (already capped per domain).
 * Adherence bonus/penalty ±15 is applied in assessment; final score capped 0–100.
 */
export function computeProtocolScore(raw: RawDomainScores): number {
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  return Math.round(Math.min(total, BASE_SCORE_MAX));
}

/**
 * Map protocol score to band.
 */
export function scoreToBand(score: number): "minimal" | "basic" | "moderate" | "strong" {
  if (score >= 60) return "strong";
  if (score >= 35) return "moderate";
  if (score >= 15) return "basic";
  return "minimal";
}
