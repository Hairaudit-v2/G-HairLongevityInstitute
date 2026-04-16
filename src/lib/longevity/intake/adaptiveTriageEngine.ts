import { deriveAdaptiveFacts } from "./adaptiveFacts";
import { deriveTriageInterpretationConfidence } from "./adaptiveTriageInterpretation";
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

const SHELL_PATHWAY_IDS = new Set<PathwayId>(["mixed_pattern", "unclear_pattern"]);

/** When scores tie, prefer more specific contextual pathways over generic TE. */
function pathwayTiePriority(id: PathwayId, facts: Record<string, unknown>): number {
  if (facts.possible_postpartum_context && id === "postpartum_pattern") return 0;
  if (id === "medication_induced_pattern") return 1;
  if (id === "traction_mechanical_pattern") return 2;
  if (id === "inflammatory_scalp_pattern") return 3;
  if (id === "telogen_effluvium_acute" || id === "telogen_effluvium_chronic") return 5;
  if (id === "nutritional_deficiency_pattern") return 6;
  return 4;
}

/**
 * Calibrates primary/secondary pathways: widens secondaries when pattern fit is uncertain,
 * promotes mixed_pattern when scores cluster, and adds overlap secondaries for common co-patterns.
 */
function selectCalibratedPathways(
  pathwayScores: PathwayScore[],
  facts: Record<string, unknown>
): { primaryPathway: PathwayId; secondaryPathways: PathwayId[] } {
  const concreteSorted = pathwayScores
    .filter((s) => !SHELL_PATHWAY_IDS.has(s.pathwayId))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return pathwayTiePriority(a.pathwayId, facts) - pathwayTiePriority(b.pathwayId, facts);
    });

  const highestScore = concreteSorted[0]?.score ?? 0;
  if (concreteSorted.length === 0 || highestScore <= 0) {
    return { primaryPathway: "unclear_pattern", secondaryPathways: [] };
  }

  const top = concreteSorted[0]!;
  const second = concreteSorted[1];
  const gap = second ? top.score - second.score : 999;

  const uncertain = facts.pattern_confidence_uncertain === true;
  const secondaryFloor = uncertain ? Math.max(1, highestScore - 3) : Math.max(2, highestScore - 2);

  let primaryPathway: PathwayId = top.pathwayId;
  let secondaryPathways = concreteSorted
    .slice(1)
    .filter((e) => e.score >= secondaryFloor)
    .map((e) => e.pathwayId);

  const competitive = concreteSorted.filter((s) => s.score >= top.score - 2);
  if (uncertain && gap <= 2 && top.score >= 6 && competitive.length >= 2) {
    primaryPathway = "mixed_pattern";
    secondaryPathways = concreteSorted
      .filter((s) => s.score >= 3)
      .slice(0, 4)
      .map((s) => s.pathwayId);
  }

  /** Traction + diffuse TE: avoid brittle winner-take-all when mechanical and TE co-dominate. */
  if (
    facts.traction_diffuse_te_overlap === true &&
    primaryPathway !== "mixed_pattern" &&
    gap <= 2 &&
    top.score >= 5
  ) {
    const tr = pathwayScores.find((s) => s.pathwayId === "traction_mechanical_pattern");
    const teA = pathwayScores.find((s) => s.pathwayId === "telogen_effluvium_acute");
    const teC = pathwayScores.find((s) => s.pathwayId === "telogen_effluvium_chronic");
    const te = teA && teC ? (teA.score >= teC.score ? teA : teC) : teA ?? teC;
    if (tr && te && tr.score > 0 && te.score > 0) {
      const topTwo = new Set<PathwayId>([top.pathwayId, second?.pathwayId].filter(Boolean) as PathwayId[]);
      const hasTr = topTwo.has("traction_mechanical_pattern");
      const hasTe =
        topTwo.has("telogen_effluvium_acute") || topTwo.has("telogen_effluvium_chronic");
      if (hasTr && hasTe) {
        primaryPathway = "mixed_pattern";
        secondaryPathways = dedupeStrings<PathwayId>([
          "traction_mechanical_pattern",
          te.pathwayId,
        ]);
      }
    }
  }

  const appendSecondary = (id: PathwayId) => {
    if (id !== primaryPathway && !secondaryPathways.includes(id)) {
      secondaryPathways.push(id);
    }
  };

  if (
    facts.possible_postpartum_context &&
    facts.suspected_shedding &&
    primaryPathway === "postpartum_pattern"
  ) {
    const andr = pathwayScores.find((s) => s.pathwayId === "androgenic_pattern");
    if (andr && andr.score >= 3) appendSecondary("androgenic_pattern");
  }

  if (primaryPathway === "inflammatory_scalp_pattern" && facts.suspected_shedding) {
    const teA = pathwayScores.find((s) => s.pathwayId === "telogen_effluvium_acute");
    const teC = pathwayScores.find((s) => s.pathwayId === "telogen_effluvium_chronic");
    const te =
      teA && teC ? (teA.score >= teC.score ? teA : teC) : teA ?? teC;
    if (te && te.score >= 2) appendSecondary(te.pathwayId);
  }

  if (
    primaryPathway === "traction_mechanical_pattern" &&
    facts.suspected_shedding &&
    facts.has_diffuse_loss
  ) {
    const teA = pathwayScores.find((s) => s.pathwayId === "telogen_effluvium_acute");
    const teC = pathwayScores.find((s) => s.pathwayId === "telogen_effluvium_chronic");
    const te =
      teA && teC ? (teA.score >= teC.score ? teA : teC) : teA ?? teC;
    if (te && te.score >= 3) appendSecondary(te.pathwayId);
  }

  if (
    (primaryPathway === "telogen_effluvium_acute" ||
      primaryPathway === "telogen_effluvium_chronic") &&
    facts.breakage_predominant_without_diffuse_top
  ) {
    const tr = pathwayScores.find((s) => s.pathwayId === "traction_mechanical_pattern");
    if (tr && tr.score >= 2) appendSecondary("traction_mechanical_pattern");
  }

  secondaryPathways = dedupeStrings(secondaryPathways.filter((id) => id !== primaryPathway));

  return { primaryPathway, secondaryPathways };
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
  if (facts.possible_female_endocrine_context) drivers.push("female_endocrine_context");
  if (facts.possible_hyperandrogen_features) drivers.push("hyperandrogen_features");
  if (facts.hirsutism_supporting_signal) drivers.push("hirsutism_supporting_signal");
  if (facts.possible_heavy_menses) drivers.push("heavy_menstrual_loss");
  if (facts.sleep_stress_cluster) drivers.push("sleep_stress_load");
  if (facts.nutritional_risk_cluster) drivers.push("nutritional_risk");
  if (facts.possible_androgen_exposure) drivers.push("androgen_exposure");
  if (facts.mechanical_exposure_cluster) drivers.push("mechanical_traction_exposure");
  if (facts.recent_trigger_burden && Number(facts.recent_trigger_burden) > 0) drivers.push("recent_trigger_burden");
  if (facts.possible_stress_trigger_delay_overlap) drivers.push("stress_trigger_delay_overlap");
  if (facts.has_inflammatory_scalp_symptoms) drivers.push("scalp_inflammation");
  if (facts.possible_neutral_hormonal_context) drivers.push("self_reported_neutral_hormonal_context");
  if (facts.possible_pituitary_followup_prompt) drivers.push("pituitary_followup_prompt");

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

  const highestScore =
    pathwayScores.filter((s) => !SHELL_PATHWAY_IDS.has(s.pathwayId)).sort((a, b) => b.score - a.score)[0]?.score ?? 0;

  const calibrated =
    pathwayScores.some((s) => !SHELL_PATHWAY_IDS.has(s.pathwayId) && s.score > 0)
      ? selectCalibratedPathways(pathwayScores, facts)
      : { primaryPathway: "unclear_pattern" as PathwayId, secondaryPathways: [] as PathwayId[] };

  let primaryPathway = calibrated.primaryPathway;
  let secondaryPathways = calibrated.secondaryPathways;

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

  const interpretation = deriveTriageInterpretationConfidence(
    pathwayScores,
    facts,
    primaryPathway,
    secondaryPathways
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
    confidence_level: interpretation.confidence_level,
    confidence_reasons: interpretation.confidence_reasons,
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
