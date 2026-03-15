import {
  SCALP_IMAGE_QUALITY,
  SCALP_SEVERITY_ESTIMATE,
  SCALP_VISIBLE_FINDING,
} from "./scalpImageAnalysis";

export const SCALP_FINDING_CONFIDENCE = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
} as const;

export const SCALP_IMAGE_COMPARISON_STATUS = {
  PENDING_REVIEW: "pending_review",
  IMPROVED: "improved",
  STABLE: "stable",
  WORSENED: "worsened",
  UNCERTAIN: "uncertain",
  INSUFFICIENT_IMAGES: "insufficient_images",
} as const;

export const SCALP_VISUAL_LIKELIHOOD = {
  UNLIKELY: "unlikely",
  POSSIBLE: "possible",
  LIKELY: "likely",
  UNCERTAIN: "uncertain",
} as const;

export type ScalpFindingConfidence =
  (typeof SCALP_FINDING_CONFIDENCE)[keyof typeof SCALP_FINDING_CONFIDENCE];

export type ScalpImageComparisonStatus =
  (typeof SCALP_IMAGE_COMPARISON_STATUS)[keyof typeof SCALP_IMAGE_COMPARISON_STATUS];

export type ScalpVisualLikelihood =
  (typeof SCALP_VISUAL_LIKELIHOOD)[keyof typeof SCALP_VISUAL_LIKELIHOOD];

export type ConfirmedScalpImageFindings = {
  thinningDistribution: string[];
  severityBand:
    | (typeof SCALP_SEVERITY_ESTIMATE)[keyof typeof SCALP_SEVERITY_ESTIMATE]
    | null;
  visibleScaleLikelihood: ScalpVisualLikelihood | null;
  visibleRednessLikelihood: ScalpVisualLikelihood | null;
  imageQuality:
    | (typeof SCALP_IMAGE_QUALITY)[keyof typeof SCALP_IMAGE_QUALITY]
    | null;
  findingConfidence: ScalpFindingConfidence | null;
};

export type ScalpImageComparisonEngineResult = {
  comparisonStatus: ScalpImageComparisonStatus;
  canCompareConfirmed: boolean;
  comparisonLimitedByImageQuality: boolean;
  visualProgressSummary: string[];
  visualPersistentDrivers: string[];
  visualFollowUpConsiderations: string[];
  visualComparisonConfidence: ScalpFindingConfidence;
  progressionSignals: string[];
  patientVisualProgressSummary: string[];
};

const LIKELIHOOD_RANK: Record<ScalpVisualLikelihood, number> = {
  unlikely: 0,
  possible: 1,
  likely: 2,
  uncertain: -1,
};

const CONFIDENCE_RANK: Record<ScalpFindingConfidence, number> = {
  low: 0,
  moderate: 1,
  high: 2,
};

function pushUnique(target: string[], value: string) {
  if (!value || target.includes(value)) return;
  target.push(value);
}

function asSet(values: string[] | null | undefined): Set<string> {
  return new Set((values ?? []).filter(Boolean));
}

function confidenceFromRank(rank: number): ScalpFindingConfidence {
  if (rank >= 2) return SCALP_FINDING_CONFIDENCE.HIGH;
  if (rank <= 0) return SCALP_FINDING_CONFIDENCE.LOW;
  return SCALP_FINDING_CONFIDENCE.MODERATE;
}

function severityRank(
  severity:
    | (typeof SCALP_SEVERITY_ESTIMATE)[keyof typeof SCALP_SEVERITY_ESTIMATE]
    | null
    | undefined
): number | null {
  switch (severity) {
    case SCALP_SEVERITY_ESTIMATE.MINIMAL:
      return 1;
    case SCALP_SEVERITY_ESTIMATE.MILD:
      return 2;
    case SCALP_SEVERITY_ESTIMATE.MODERATE:
      return 3;
    case SCALP_SEVERITY_ESTIMATE.ADVANCED:
      return 4;
    default:
      return null;
  }
}

function qualityRank(
  quality:
    | (typeof SCALP_IMAGE_QUALITY)[keyof typeof SCALP_IMAGE_QUALITY]
    | null
    | undefined
): number {
  switch (quality) {
    case SCALP_IMAGE_QUALITY.USABLE:
      return 2;
    case SCALP_IMAGE_QUALITY.BORDERLINE:
      return 1;
    case SCALP_IMAGE_QUALITY.POOR:
      return 0;
    default:
      return 0;
  }
}

function hasConfirmedFindings(findings: ConfirmedScalpImageFindings | null | undefined) {
  if (!findings) return false;
  return (
    findings.thinningDistribution.length > 0 ||
    !!findings.severityBand ||
    !!findings.visibleScaleLikelihood ||
    !!findings.visibleRednessLikelihood ||
    !!findings.imageQuality ||
    !!findings.findingConfidence
  );
}

export function isImageQualityLimited(
  quality:
    | (typeof SCALP_IMAGE_QUALITY)[keyof typeof SCALP_IMAGE_QUALITY]
    | null
    | undefined
): boolean {
  return quality === SCALP_IMAGE_QUALITY.BORDERLINE;
}

export function isImageQualityInsufficient(
  quality:
    | (typeof SCALP_IMAGE_QUALITY)[keyof typeof SCALP_IMAGE_QUALITY]
    | null
    | undefined
): boolean {
  return !quality || quality === SCALP_IMAGE_QUALITY.POOR;
}

export function mapNumericConfidenceToBand(value: number | null | undefined): ScalpFindingConfidence {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return SCALP_FINDING_CONFIDENCE.LOW;
  }
  if (value >= 0.8) return SCALP_FINDING_CONFIDENCE.HIGH;
  if (value >= 0.6) return SCALP_FINDING_CONFIDENCE.MODERATE;
  return SCALP_FINDING_CONFIDENCE.LOW;
}

export function mapVisibleFindingsToLikelihoods(params: {
  visibleFindings: string[];
  imageQuality?: string | null;
}): Pick<
  ConfirmedScalpImageFindings,
  "visibleScaleLikelihood" | "visibleRednessLikelihood"
> {
  const findings = new Set((params.visibleFindings ?? []).filter(Boolean));
  const poorQuality = params.imageQuality === SCALP_IMAGE_QUALITY.POOR;

  const visibleScaleLikelihood = poorQuality
    ? SCALP_VISUAL_LIKELIHOOD.UNCERTAIN
    : findings.has(SCALP_VISIBLE_FINDING.POSSIBLE_SCALE)
      ? SCALP_VISUAL_LIKELIHOOD.POSSIBLE
      : SCALP_VISUAL_LIKELIHOOD.UNLIKELY;

  const rednessSignals = [
    findings.has(SCALP_VISIBLE_FINDING.POSSIBLE_REDNESS),
    findings.has(SCALP_VISIBLE_FINDING.POSSIBLE_INFLAMMATION),
  ].filter(Boolean).length;
  const visibleRednessLikelihood = poorQuality
    ? SCALP_VISUAL_LIKELIHOOD.UNCERTAIN
    : rednessSignals >= 2
      ? SCALP_VISUAL_LIKELIHOOD.LIKELY
      : rednessSignals === 1
        ? SCALP_VISUAL_LIKELIHOOD.POSSIBLE
        : SCALP_VISUAL_LIKELIHOOD.UNLIKELY;

  return {
    visibleScaleLikelihood,
    visibleRednessLikelihood,
  };
}

function compareLikelihood(
  current: ScalpVisualLikelihood | null,
  previous: ScalpVisualLikelihood | null
): "improved" | "worsened" | "stable" | "uncertain" | null {
  if (!current || !previous) return null;
  const currentRank = LIKELIHOOD_RANK[current];
  const previousRank = LIKELIHOOD_RANK[previous];
  if (currentRank < 0 || previousRank < 0) return "uncertain";
  if (currentRank < previousRank) return "improved";
  if (currentRank > previousRank) return "worsened";
  return "stable";
}

export function compareConfirmedScalpImageFindings(params: {
  current: ConfirmedScalpImageFindings | null;
  previous: ConfirmedScalpImageFindings | null;
}): ScalpImageComparisonEngineResult {
  const progressSummary: string[] = [];
  const persistentDrivers: string[] = [];
  const followUpConsiderations: string[] = [];
  const patientVisualProgressSummary: string[] = [];
  const progressionSignals: string[] = [];

  const current = params.current;
  const previous = params.previous;
  const currentHasConfirmed = hasConfirmedFindings(current);
  const previousHasConfirmed = hasConfirmedFindings(previous);

  if (!currentHasConfirmed) {
    pushUnique(
      followUpConsiderations,
      "Current confirmed scalp-image findings are not complete enough to support a meaningful comparison yet."
    );
    pushUnique(progressionSignals, "current_visual_baseline_incomplete");
    return {
      comparisonStatus: SCALP_IMAGE_COMPARISON_STATUS.PENDING_REVIEW,
      canCompareConfirmed: false,
      comparisonLimitedByImageQuality: false,
      visualProgressSummary: progressSummary,
      visualPersistentDrivers: persistentDrivers,
      visualFollowUpConsiderations: followUpConsiderations,
      visualComparisonConfidence: SCALP_FINDING_CONFIDENCE.LOW,
      progressionSignals,
      patientVisualProgressSummary,
    };
  }

  const currentQualityLimited = isImageQualityLimited(current?.imageQuality);
  const previousQualityLimited = isImageQualityLimited(previous?.imageQuality);
  const currentQualityInsufficient = isImageQualityInsufficient(current?.imageQuality);
  const previousQualityInsufficient = isImageQualityInsufficient(previous?.imageQuality);
  const comparisonLimitedByImageQuality =
    currentQualityLimited ||
    previousQualityLimited ||
    currentQualityInsufficient ||
    previousQualityInsufficient;

  if (!previousHasConfirmed) {
    pushUnique(
      followUpConsiderations,
      "A previous confirmed scalp-image finding set is not available, so this intake is being stored as the visual baseline for future comparison."
    );
    pushUnique(progressionSignals, "visual_baseline_only");
    if (currentQualityLimited || currentQualityInsufficient) {
      pushUnique(
        followUpConsiderations,
        "Current photo quality limits how confidently this baseline can be used for future comparison."
      );
      pushUnique(progressionSignals, "comparison_limited_by_image_quality");
    }
    return {
      comparisonStatus: currentQualityInsufficient
        ? SCALP_IMAGE_COMPARISON_STATUS.INSUFFICIENT_IMAGES
        : SCALP_IMAGE_COMPARISON_STATUS.PENDING_REVIEW,
      canCompareConfirmed: false,
      comparisonLimitedByImageQuality,
      visualProgressSummary: progressSummary,
      visualPersistentDrivers: persistentDrivers,
      visualFollowUpConsiderations: followUpConsiderations,
      visualComparisonConfidence: current?.findingConfidence ?? SCALP_FINDING_CONFIDENCE.LOW,
      progressionSignals,
      patientVisualProgressSummary,
    };
  }

  if (currentQualityInsufficient || previousQualityInsufficient) {
    pushUnique(
      progressSummary,
      "Comparison limited by image quality; one or both confirmed photo sets were not suitable for a meaningful interval comparison."
    );
    pushUnique(
      followUpConsiderations,
      "Repeat scalp photos with clearer lighting, angle consistency, and scalp coverage before drawing a stronger visual progression conclusion."
    );
    pushUnique(
      patientVisualProgressSummary,
      "Your clinician noted that the photo comparison was limited by image quality."
    );
    pushUnique(progressionSignals, "comparison_limited_by_image_quality");
    return {
      comparisonStatus: SCALP_IMAGE_COMPARISON_STATUS.INSUFFICIENT_IMAGES,
      canCompareConfirmed: false,
      comparisonLimitedByImageQuality: true,
      visualProgressSummary: progressSummary,
      visualPersistentDrivers: persistentDrivers,
      visualFollowUpConsiderations: followUpConsiderations,
      visualComparisonConfidence: SCALP_FINDING_CONFIDENCE.LOW,
      progressionSignals,
      patientVisualProgressSummary,
    };
  }

  let confidenceRank = Math.min(
    qualityRank(current?.imageQuality),
    qualityRank(previous?.imageQuality),
    current?.findingConfidence ? CONFIDENCE_RANK[current.findingConfidence] : 0,
    previous?.findingConfidence ? CONFIDENCE_RANK[previous.findingConfidence] : 0
  );

  const severityDelta =
    (severityRank(current?.severityBand) ?? 0) -
    (severityRank(previous?.severityBand) ?? 0);
  if (severityDelta < 0) {
    pushUnique(
      progressSummary,
      "Confirmed scalp-photo findings suggest a lower visible severity band than on the previous confirmed review."
    );
    pushUnique(progressionSignals, "visual_improvement_likely");
  } else if (severityDelta > 0) {
    pushUnique(
      progressSummary,
      "Confirmed scalp-photo findings suggest a higher visible severity band than on the previous confirmed review."
    );
    pushUnique(progressionSignals, "visual_progression_likely");
  }

  const currentDistribution = asSet(current?.thinningDistribution);
  const previousDistribution = asSet(previous?.thinningDistribution);
  const newlyInvolvedRegions = [...currentDistribution].filter(
    (region) => !previousDistribution.has(region)
  );
  const noLongerProminentRegions = [...previousDistribution].filter(
    (region) => !currentDistribution.has(region)
  );
  const overlappingRegions = [...currentDistribution].filter((region) =>
    previousDistribution.has(region)
  );

  if (newlyInvolvedRegions.length > 0) {
    pushUnique(
      progressSummary,
      `Visible thinning appears more apparent across: ${newlyInvolvedRegions
        .join(", ")
        .replace(/_/g, " ")}.`
    );
    pushUnique(progressionSignals, "thinning_distribution_expanded");
  }
  if (noLongerProminentRegions.length > 0) {
    pushUnique(
      progressSummary,
      `Visible thinning appears less apparent across: ${noLongerProminentRegions
        .join(", ")
        .replace(/_/g, " ")}.`
    );
    pushUnique(progressionSignals, "thinning_distribution_reduced");
  }
  if (
    overlappingRegions.length > 0 &&
    newlyInvolvedRegions.length === 0 &&
    noLongerProminentRegions.length === 0
  ) {
    pushUnique(
      persistentDrivers,
      `Visible thinning distribution remains similar across the confirmed photo sets (${overlappingRegions
        .join(", ")
        .replace(/_/g, " ")}).`
    );
    pushUnique(progressionSignals, "visual_stability_likely");
  }

  const scaleChange = compareLikelihood(
    current?.visibleScaleLikelihood ?? null,
    previous?.visibleScaleLikelihood ?? null
  );
  if (scaleChange === "improved") {
    pushUnique(
      progressSummary,
      "Visible scale appears less prominent than on the previous confirmed photo set."
    );
    pushUnique(progressionSignals, "visible_scale_less_prominent");
  } else if (scaleChange === "worsened") {
    pushUnique(
      progressSummary,
      "Visible scale appears more prominent than on the previous confirmed photo set."
    );
    pushUnique(progressionSignals, "visible_scale_more_prominent");
  } else if (
    scaleChange === "stable" &&
    current?.visibleScaleLikelihood &&
    current.visibleScaleLikelihood !== SCALP_VISUAL_LIKELIHOOD.UNLIKELY &&
    current.visibleScaleLikelihood !== SCALP_VISUAL_LIKELIHOOD.UNCERTAIN
  ) {
    pushUnique(
      persistentDrivers,
      "Visible scale remains a persistent feature across the confirmed photo sets."
    );
    pushUnique(progressionSignals, "persistent_visible_scale");
  }

  const rednessChange = compareLikelihood(
    current?.visibleRednessLikelihood ?? null,
    previous?.visibleRednessLikelihood ?? null
  );
  if (rednessChange === "improved") {
    pushUnique(
      progressSummary,
      "Visible redness or inflammatory features appear less prominent than on the previous confirmed photo set."
    );
    pushUnique(progressionSignals, "visible_redness_less_prominent");
  } else if (rednessChange === "worsened") {
    pushUnique(
      progressSummary,
      "Visible redness or inflammatory features appear more prominent than on the previous confirmed photo set."
    );
    pushUnique(progressionSignals, "visible_redness_more_prominent");
  } else if (
    rednessChange === "stable" &&
    current?.visibleRednessLikelihood &&
    current.visibleRednessLikelihood !== SCALP_VISUAL_LIKELIHOOD.UNLIKELY &&
    current.visibleRednessLikelihood !== SCALP_VISUAL_LIKELIHOOD.UNCERTAIN
  ) {
    pushUnique(
      persistentDrivers,
      "Visible redness or inflammatory features remain present across the confirmed photo sets."
    );
    pushUnique(progressionSignals, "persistent_visible_redness");
  }

  if (currentQualityLimited || previousQualityLimited) {
    confidenceRank = Math.min(confidenceRank, 1);
    pushUnique(
      followUpConsiderations,
      "Comparison is directionally useful but limited by borderline image quality; interpret subtle change with caution."
    );
    pushUnique(progressionSignals, "comparison_limited_by_image_quality");
  }

  const improvedSignals = progressionSignals.filter((signal) =>
    [
      "visual_improvement_likely",
      "thinning_distribution_reduced",
      "visible_scale_less_prominent",
      "visible_redness_less_prominent",
    ].includes(signal)
  ).length;
  const worsenedSignals = progressionSignals.filter((signal) =>
    [
      "visual_progression_likely",
      "thinning_distribution_expanded",
      "visible_scale_more_prominent",
      "visible_redness_more_prominent",
    ].includes(signal)
  ).length;

  let comparisonStatus: ScalpImageComparisonStatus;
  if (improvedSignals > 0 && worsenedSignals === 0) {
    comparisonStatus = SCALP_IMAGE_COMPARISON_STATUS.IMPROVED;
    pushUnique(
      patientVisualProgressSummary,
      "Your clinician noted some visual improvement when comparing your confirmed scalp photos over time."
    );
  } else if (worsenedSignals > 0 && improvedSignals === 0) {
    comparisonStatus = SCALP_IMAGE_COMPARISON_STATUS.WORSENED;
    pushUnique(
      patientVisualProgressSummary,
      "Your clinician noted some visual changes over time that may benefit from follow-up."
    );
  } else if (improvedSignals === 0 && worsenedSignals === 0) {
    comparisonStatus = SCALP_IMAGE_COMPARISON_STATUS.STABLE;
    pushUnique(
      progressSummary,
      "Confirmed scalp-photo findings appear broadly stable versus the previous confirmed review."
    );
    pushUnique(
      patientVisualProgressSummary,
      "Your clinician noted that your confirmed scalp photos look broadly stable over time."
    );
  } else {
    comparisonStatus = SCALP_IMAGE_COMPARISON_STATUS.UNCERTAIN;
    confidenceRank = Math.min(confidenceRank, 1);
    pushUnique(
      progressSummary,
      "Some visible features moved in different directions, so the overall comparison remains uncertain."
    );
    pushUnique(
      followUpConsiderations,
      "Because different visual features changed in different directions, repeat photo review at follow-up may help confirm the interval pattern."
    );
    pushUnique(
      patientVisualProgressSummary,
      "Your clinician noted that the photo comparison shows mixed changes and may need follow-up."
    );
    pushUnique(progressionSignals, "mixed_visual_change");
  }

  if (
    persistentDrivers.length > 0 ||
    comparisonStatus === SCALP_IMAGE_COMPARISON_STATUS.WORSENED
  ) {
    pushUnique(
      followUpConsiderations,
      "Consider repeat scalp photos at follow-up to confirm whether the visible pattern persists or changes further."
    );
  }

  return {
    comparisonStatus,
    canCompareConfirmed: true,
    comparisonLimitedByImageQuality,
    visualProgressSummary: progressSummary,
    visualPersistentDrivers: persistentDrivers,
    visualFollowUpConsiderations: followUpConsiderations,
    visualComparisonConfidence: confidenceFromRank(confidenceRank),
    progressionSignals,
    patientVisualProgressSummary,
  };
}
