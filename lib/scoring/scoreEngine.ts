export const DOMAINS = [
  "androgen_exposure",
  "inflammatory_load",
  "thyroid_metabolic",
  "nutrient_sufficiency",
  "stress_regulation",
] as const;

export type DomainId = (typeof DOMAINS)[number];

export type DomainScores = Record<DomainId, number>;

export type RiskTier = "low" | "moderate" | "elevated" | "high";

export type ScoringResult = {
  domain_scores: DomainScores;
  overall_score: number;
  risk_tier: RiskTier;
  explainability: Record<DomainId, string[]>;
};

const DOMAIN_LABELS: Record<DomainId, string> = {
  androgen_exposure: "Androgen Exposure",
  inflammatory_load: "Inflammatory Load",
  thyroid_metabolic: "Thyroid & Metabolic",
  nutrient_sufficiency: "Nutrient Sufficiency",
  stress_regulation: "Stress Regulation",
};

export function getDomainLabel(d: DomainId): string {
  return DOMAIN_LABELS[d];
}

const DEFAULT_WEIGHTS: Record<DomainId, number> = {
  androgen_exposure: 0.25,
  inflammatory_load: 0.2,
  thyroid_metabolic: 0.25,
  nutrient_sufficiency: 0.15,
  stress_regulation: 0.15,
};

function tierFromOverall(score: number): RiskTier {
  if (score <= 3) return "low";
  if (score <= 5) return "moderate";
  if (score <= 7) return "elevated";
  return "high";
}

export type BloodMarkersInput = Array<{
  name: string;
  value: number;
  flag?: "low" | "normal" | "high" | "critical";
  unit?: string;
}>;

export type ImageSignalsInput = Array<{
  scalp_visibility_proxy: number;
  redness_proxy: number;
  flaking_proxy: number;
  blur_score: number;
  lighting_score: number;
}>;

export function computeScores(params: {
  bloodMarkers?: BloodMarkersInput;
  imageSignals?: ImageSignalsInput;
  selections?: Record<string, unknown>;
  dryRun?: boolean;
}): ScoringResult {
  const { bloodMarkers = [], imageSignals = [], selections = {}, dryRun } = params;

  if (dryRun) {
    const zeros: DomainScores = {} as DomainScores;
    for (const d of DOMAINS) zeros[d] = 0;
    return {
      domain_scores: zeros,
      overall_score: 0,
      risk_tier: "low",
      explainability: Object.fromEntries(DOMAINS.map((d) => [d, ["[DRY RUN]"]])) as Record<DomainId, string[]>,
    };
  }

  const scores: Partial<DomainScores> = {};
  const explainability: Partial<Record<DomainId, string[]>> = {};

  // Androgen: Testosterone, DHT, Free T — flags drive score
  const androMarkers = bloodMarkers.filter((m) =>
    /testosterone|dht|free t|shbg/i.test(m.name)
  );
  let androScore = 5;
  const androDrivers: string[] = [];
  for (const m of androMarkers) {
    if (m.flag === "high") {
      androScore += 1.5;
      androDrivers.push(`${m.name} elevated`);
    } else if (m.flag === "low") androScore -= 0.5;
  }
  scores.androgen_exposure = Math.max(0, Math.min(10, androScore));
  explainability.androgen_exposure = androDrivers.length ? androDrivers : ["No androgen markers or within range"];

  // Inflammatory: CRP, ESR, redness/flaking proxies
  const inflamMarkers = bloodMarkers.filter((m) => /crp|esr|hscrp/i.test(m.name));
  const avgRedness = imageSignals.length
    ? imageSignals.reduce((a, i) => a + i.redness_proxy, 0) / imageSignals.length
    : 0;
  const avgFlaking = imageSignals.length
    ? imageSignals.reduce((a, i) => a + i.flaking_proxy, 0) / imageSignals.length
    : 0;
  let inflamScore = 4 + avgRedness * 3 + avgFlaking * 2;
  const inflamDrivers: string[] = [];
  for (const m of inflamMarkers) {
    if (m.flag === "high") {
      inflamScore += 2;
      inflamDrivers.push(`${m.name} elevated`);
    }
  }
  if (avgRedness > 0.5) inflamDrivers.push("Image redness proxy elevated");
  if (avgFlaking > 0.4) inflamDrivers.push("Image flaking proxy elevated");
  scores.inflammatory_load = Math.max(0, Math.min(10, inflamScore));
  explainability.inflammatory_load = inflamDrivers.length ? inflamDrivers : ["No notable inflammatory signals"];

  // Thyroid & Metabolic: TSH, T3, T4, ferritin
  const thyroidMarkers = bloodMarkers.filter((m) =>
    /tsh|t3|t4|ferritin|iron/i.test(m.name)
  );
  let thyroidScore = 5;
  const thyroidDrivers: string[] = [];
  for (const m of thyroidMarkers) {
    if (m.flag === "low" && /ferritin|iron|t3|t4/i.test(m.name)) {
      thyroidScore += 1.5;
      thyroidDrivers.push(`${m.name} low`);
    } else if (m.flag === "high" && /tsh/i.test(m.name)) {
      thyroidScore += 1;
      thyroidDrivers.push(`${m.name} elevated`);
    }
  }
  scores.thyroid_metabolic = Math.max(0, Math.min(10, thyroidScore));
  explainability.thyroid_metabolic = thyroidDrivers.length ? thyroidDrivers : ["No thyroid/metabolic markers or within range"];

  // Nutrient: D, B12, zinc, folate, ferritin
  const nutrientMarkers = bloodMarkers.filter((m) =>
    /vitamin d|b12|zinc|folate|ferritin/i.test(m.name)
  );
  let nutrientScore = 6;
  const nutrientDrivers: string[] = [];
  for (const m of nutrientMarkers) {
    if (m.flag === "low") {
      nutrientScore -= 1.5;
      nutrientDrivers.push(`${m.name} low`);
    }
  }
  scores.nutrient_sufficiency = Math.max(0, Math.min(10, nutrientScore));
  explainability.nutrient_sufficiency = nutrientDrivers.length ? nutrientDrivers : ["No nutrient markers or within range"];

  // Stress: Cortisol, prolactin; scalp visibility as proxy
  const stressMarkers = bloodMarkers.filter((m) => /cortisol|prolactin/i.test(m.name));
  const avgVisibility = imageSignals.length
    ? imageSignals.reduce((a, i) => a + i.scalp_visibility_proxy, 0) / imageSignals.length
    : 0.5;
  let stressScore = 4 + avgVisibility * 2;
  const stressDrivers: string[] = [];
  for (const m of stressMarkers) {
    if (m.flag === "high") {
      stressScore += 1.5;
      stressDrivers.push(`${m.name} elevated`);
    }
  }
  if (avgVisibility > 0.7) stressDrivers.push("Scalp visibility proxy elevated");
  scores.stress_regulation = Math.max(0, Math.min(10, stressScore));
  explainability.stress_regulation = stressDrivers.length ? stressDrivers : ["No notable stress markers"];

  const domainScores = scores as DomainScores;
  const overall =
    Object.entries(DEFAULT_WEIGHTS).reduce(
      (s, [k, w]) => s + (domainScores[k as DomainId] ?? 5) * w,
      0
    ) / Object.values(DEFAULT_WEIGHTS).reduce((a, b) => a + b, 0);

  return {
    domain_scores: domainScores,
    overall_score: Math.round(overall * 10) / 10,
    risk_tier: tierFromOverall(overall),
    explainability: explainability as Record<DomainId, string[]>,
  };
}
