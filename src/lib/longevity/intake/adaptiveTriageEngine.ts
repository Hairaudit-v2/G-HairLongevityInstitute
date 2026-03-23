import { deriveAdaptiveFacts } from "./adaptiveFacts";
import { ADAPTIVE_PATHWAY_DEFINITIONS } from "./adaptivePathwayDefinitions";
import { ADAPTIVE_QUESTION_BANK } from "./adaptiveQuestionBank";
import { matchesAll, dedupeStrings } from "./adaptiveRuleHelpers";
import type {
  AdaptiveAnswers,
  AdaptiveEngineResult,
  AdaptiveQuestion,
  AdaptiveTriageOutput,
  BloodworkConsiderationId,
  ClinicianAttentionFlag,
  PathwayDefinition,
  PathwayId,
  PathwayScore,
  RedFlag,
  UploadGuideId,
} from "./adaptiveTypes";
import { HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION } from "./adaptiveTypes";

function scorePathway(pathway: PathwayDefinition, facts: Record<string, unknown>): PathwayScore | null {
  if (!matchesAll(pathway.entryCriteria, facts)) return null;

  let score = 0;
  const reasons: string[] = [];

  for (const rule of pathway.scoringRules ?? []) {
    if (matchesAll(rule.when, facts)) {
      score += rule.score;
      if (rule.reason) reasons.push(rule.reason);
    }
  }

  return {
    pathwayId: pathway.id,
    score,
    reasons,
  };
}

function normalizeConfidence(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Number((score / maxScore).toFixed(2));
}

function deriveRedFlags(facts: Record<string, unknown>): RedFlag[] {
  const redFlags: RedFlag[] = [];

  if (facts.has_inflammatory_scalp_symptoms && (facts.scalp_symptoms as string[] | undefined)?.includes("pain")) {
    redFlags.push("painful_inflamed_scalp");
  }

  if ((facts.scalp_symptoms as string[] | undefined)?.includes("pustules") || (facts.scalp_symptoms as string[] | undefined)?.includes("crusting")) {
    redFlags.push("pustules_or_crusting");
  }

  if (facts.chief_concern === "patchy_loss" && facts.progression_speed === "rapidly_worsening") {
    redFlags.push("rapid_patchy_loss");
  }

  return redFlags;
}

function deriveClinicianAttentionFlags(
  facts: Record<string, unknown>,
  primary: PathwayId,
  secondary: PathwayId[],
  redFlags: RedFlag[],
): ClinicianAttentionFlag[] {
  const flags: ClinicianAttentionFlag[] = [];

  if (facts.possible_hyperandrogen_features || facts.known_pcos) {
    flags.push("possible_pcos_signal");
  }
  if (facts.possible_heavy_menses && facts.low_iron_history) {
    flags.push("heavy_period_related_iron_risk");
  }
  if (facts.possible_androgen_exposure) {
    flags.push("possible_exogenous_androgen_acceleration");
  }
  if (facts.possible_postpartum_context) {
    flags.push("possible_postpartum_shedding");
  }
  if (primary === "telogen_effluvium_chronic" || secondary.includes("telogen_effluvium_chronic")) {
    flags.push("possible_chronic_te");
  }
  if (primary === "inflammatory_scalp_pattern" || secondary.includes("inflammatory_scalp_pattern")) {
    flags.push("possible_inflammatory_scalp_disease");
  }
  if (primary === "traction_mechanical_pattern" || secondary.includes("traction_mechanical_pattern")) {
    flags.push("possible_traction_pattern");
  }
  if (redFlags.length > 0) {
    flags.push("possible_scarring_red_flag");
  }
  if (secondary.length > 0) {
    flags.push("mixed_pattern_needs_clinician_review");
  }

  return dedupeStrings(flags);
}

function derivePossibleDrivers(facts: Record<string, unknown>): string[] {
  const drivers: string[] = [];

  if (facts.possible_cycle_irregularity) drivers.push("cycle_irregularity");
  if (facts.possible_hyperandrogen_features) drivers.push("hyperandrogen_features");
  if (facts.possible_heavy_menses) drivers.push("heavy_menstrual_loss");
  if (facts.sleep_stress_cluster) drivers.push("sleep_stress_load");
  if (facts.nutritional_risk_cluster) drivers.push("nutritional_risk");
  if (facts.possible_androgen_exposure) drivers.push("androgen_exposure");
  if (facts.mechanical_exposure_cluster) drivers.push("mechanical_traction_exposure");
  if (facts.recent_trigger_burden && Number(facts.recent_trigger_burden) > 0) drivers.push("recent_trigger_burden");
  if (facts.has_inflammatory_scalp_symptoms) drivers.push("scalp_inflammation");
  if (facts.possible_neutral_hormonal_context) drivers.push("self_reported_neutral_hormonal_context");

  return dedupeStrings(drivers);
}

function deriveLikelyPattern(primary: PathwayId, facts: Record<string, unknown>): string {
  switch (primary) {
    case "female_hormonal_pattern":
      return "central_thinning_with_possible_hormonal_contributors";
    case "androgenic_pattern":
      return facts.has_temple_pattern
        ? "patterned_recession_or_top_thinning"
        : "patterned_androgenic_distribution";
    case "telogen_effluvium_acute":
      return "acute_diffuse_shedding_pattern";
    case "telogen_effluvium_chronic":
      return "persistent_diffuse_shedding_pattern";
    case "inflammatory_scalp_pattern":
      return "scalp_symptom_dominant_pattern";
    case "traction_mechanical_pattern":
      return "traction_or_breakage_pattern";
    case "postpartum_pattern":
      return "postpartum_diffuse_shedding_pattern";
    case "nutritional_deficiency_pattern":
      return "diffuse_thinning_with_possible_deficiency_contributors";
    default:
      return "mixed_or_unclear_pattern";
  }
}

function deriveConfidenceSummary(primary: PathwayId, secondary: PathwayId[]): string {
  const baseMap: Record<PathwayId, string> = {
    androgenic_pattern: "Pattern suggests an androgenic-style distribution.",
    telogen_effluvium_acute: "Pattern suggests recent diffuse shedding with possible trigger-related contributors.",
    telogen_effluvium_chronic: "Pattern suggests ongoing diffuse shedding with possible chronic contributors.",
    female_hormonal_pattern: "Pattern suggests female-pattern thinning with possible hormonal contributors.",
    male_androgen_exposure_pattern: "Pattern suggests hair loss may be influenced by androgen exposure.",
    nutritional_deficiency_pattern: "Pattern suggests possible nutritional contributors to diffuse hair change.",
    inflammatory_scalp_pattern: "Pattern suggests scalp inflammation may be contributing.",
    traction_mechanical_pattern: "Pattern suggests mechanical tension or breakage may be contributing.",
    medication_induced_pattern: "Pattern suggests medication or hormone changes may be relevant.",
    postpartum_pattern: "Pattern suggests postpartum shedding may be contributing.",
    thyroid_metabolic_pattern: "Pattern suggests a possible systemic or metabolic contributor.",
    mixed_pattern: "Pattern appears mixed and benefits from clinician review.",
    unclear_pattern: "Pattern is not yet clearly defined and benefits from clinician review.",
  };

  const first = baseMap[primary];
  if (secondary.length === 0) return first;

  return `${first} There may also be overlapping contributing factors for clinician review.`;
}

function getVisibleQuestions(answers: AdaptiveAnswers): AdaptiveQuestion[] {
  const facts = deriveAdaptiveFacts(answers);
  return ADAPTIVE_QUESTION_BANK.filter((question) => matchesAll(question.showWhen, facts));
}

export function evaluateAdaptiveIntake(answers: AdaptiveAnswers): AdaptiveEngineResult {
  const facts = deriveAdaptiveFacts(answers);

  const pathwayScores = ADAPTIVE_PATHWAY_DEFINITIONS
    .map((pathway) => scorePathway(pathway, facts))
    .filter((x): x is PathwayScore => Boolean(x))
    .sort((a, b) => b.score - a.score);

  const highestScore = pathwayScores[0]?.score ?? 0;

  let primaryPathway: PathwayId = "unclear_pattern";
  let secondaryPathways: PathwayId[] = [];

  if (pathwayScores.length > 0 && highestScore > 0) {
    primaryPathway = pathwayScores[0].pathwayId;
    secondaryPathways = pathwayScores
      .slice(1)
      .filter((entry) => entry.score >= Math.max(2, highestScore - 2))
      .map((entry) => entry.pathwayId);
  }

  const redFlags = deriveRedFlags(facts);

  const activePathwayIds = dedupeStrings<PathwayId>([
    primaryPathway,
    ...secondaryPathways,
  ]);

  const activePathways = ADAPTIVE_PATHWAY_DEFINITIONS.filter((p) =>
    activePathwayIds.includes(p.id),
  );

  const bloodworkConsiderations = dedupeStrings<BloodworkConsiderationId>(
    activePathways.flatMap((p) => p.bloodworkConsiderations ?? []),
  );

  const uploadGuidance = dedupeStrings<UploadGuideId>(
    activePathways.flatMap((p) => p.uploadGuidance ?? []),
  );

  const clinicianAttentionFlags = deriveClinicianAttentionFlags(
    facts,
    primaryPathway,
    secondaryPathways,
    redFlags,
  );

  const pathwayConfidence = pathwayScores.reduce<Partial<Record<PathwayId, number>>>(
    (acc, item) => {
      acc[item.pathwayId] = normalizeConfidence(item.score, highestScore || 1);
      return acc;
    },
    {},
  );

  const triage: AdaptiveTriageOutput = {
    schema_version: HLI_ADAPTIVE_INTAKE_SCHEMA_VERSION,
    primary_pathway: primaryPathway,
    secondary_pathways: secondaryPathways,
    pathway_confidence: pathwayConfidence,
    likely_pattern: deriveLikelyPattern(primaryPathway, facts),
    possible_drivers: derivePossibleDrivers(facts),
    red_flags: redFlags,
    bloodwork_considerations: bloodworkConsiderations,
    document_requests: [
      "clear scalp photographs in natural light",
      ...(bloodworkConsiderations.length > 0 ? ["recent blood tests if available"] : []),
    ],
    upload_guidance: uploadGuidance,
    clinician_attention_flags: clinicianAttentionFlags,
    confidence_summary: deriveConfidenceSummary(primaryPathway, secondaryPathways),
  };

  const visibleQuestions = getVisibleQuestions(answers);

  return {
    facts,
    pathwayScores,
    visibleQuestionIds: visibleQuestions.map((q) => q.id),
    triage,
  };
}

export function getAdaptiveQuestionBank(): AdaptiveQuestion[] {
  return ADAPTIVE_QUESTION_BANK;
}
