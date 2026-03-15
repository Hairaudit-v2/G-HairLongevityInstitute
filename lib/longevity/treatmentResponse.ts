import type { LongevityQuestionnaireResponses } from "./schema";

export type TreatmentReportedResponse =
  | "improved"
  | "no_change"
  | "worsened"
  | "uncertain";

export type TreatmentChangeStatus = "started" | "stopped" | "continued";

export type TreatmentFamilyKey =
  | "minoxidil"
  | "finasteride_dutasteride"
  | "prp"
  | "exosomes"
  | "supplements"
  | "topical_scalp_therapies"
  | "spironolactone"
  | "androgen_related_therapies";

export type TreatmentResponseSnapshot = {
  activeTreatmentKeys: TreatmentFamilyKey[];
  reportedResponse: TreatmentReportedResponse | null;
};

export type TreatmentResponseItem = {
  key: TreatmentFamilyKey;
  label: string;
  status: TreatmentChangeStatus;
  response: TreatmentReportedResponse | null;
};

export type TreatmentResponseComparison = {
  items: TreatmentResponseItem[];
  startedTreatments: string[];
  stoppedTreatments: string[];
  continuedTreatments: string[];
  currentReportedResponse: TreatmentReportedResponse | null;
  previousReportedResponse: TreatmentReportedResponse | null;
  clinicianSummary: string[];
  patientImprovedSummary: string[];
  patientFollowUpSummary: string[];
};

const TREATMENT_FAMILY_REGISTRY: Array<{
  key: TreatmentFamilyKey;
  label: string;
  sourceKeys: string[];
}> = [
  {
    key: "minoxidil",
    label: "Minoxidil",
    sourceKeys: ["topical_minoxidil", "oral_minoxidil"],
  },
  {
    key: "finasteride_dutasteride",
    label: "Finasteride / dutasteride",
    sourceKeys: ["finasteride", "dutasteride"],
  },
  {
    key: "prp",
    label: "PRP",
    sourceKeys: ["prp"],
  },
  {
    key: "exosomes",
    label: "Exosomes",
    sourceKeys: ["exosomes"],
  },
  {
    key: "supplements",
    label: "Supplements",
    sourceKeys: [
      "saw_palmetto",
      "iron_supplement",
      "vitamin_d",
      "zinc",
      "biotin",
    ],
  },
  {
    key: "topical_scalp_therapies",
    label: "Topical / scalp therapies",
    sourceKeys: [
      "microneedling",
      "ketoconazole_shampoo",
      "led_or_laser_cap",
    ],
  },
  {
    key: "spironolactone",
    label: "Spironolactone",
    sourceKeys: ["spironolactone"],
  },
  {
    key: "androgen_related_therapies",
    label: "Androgen-related therapies",
    sourceKeys: [
      "testosterone_replacement_therapy",
      "anabolic_steroids_or_sarms",
    ],
  },
];

function pushUnique(target: string[], value: string) {
  if (!value || target.includes(value)) return;
  target.push(value);
}

function asSet(values: string[] | undefined): Set<string> {
  return new Set(
    (values ?? []).filter((value) => value && value.trim() !== "" && value !== "none")
  );
}

function responseLabel(response: TreatmentReportedResponse | null): string | null {
  switch (response) {
    case "improved":
      return "reported improvement";
    case "no_change":
      return "reported no clear change";
    case "worsened":
      return "reported worsening";
    case "uncertain":
      return "reported response is still uncertain";
    default:
      return null;
  }
}

export function getReportedTreatmentResponse(
  responses: LongevityQuestionnaireResponses
): TreatmentReportedResponse | null {
  const direct = responses.lifestyleTreatments?.treatmentResponse;
  if (
    direct === "improved" ||
    direct === "no_change" ||
    direct === "worsened" ||
    direct === "uncertain"
  ) {
    return direct;
  }

  const helpfulness = responses.lifestyleTreatments?.treatmentHelpfulness;
  if (helpfulness === "yes") return "improved";
  if (helpfulness === "no") return "worsened";
  if (helpfulness === "unsure") return "uncertain";
  return null;
}

export function buildTreatmentResponseSnapshot(
  responses: LongevityQuestionnaireResponses
): TreatmentResponseSnapshot {
  const selected = new Set<string>([
    ...asSet(responses.lifestyleTreatments?.currentTreatments),
    ...asSet(responses.maleHistory?.therapies),
  ]);

  const activeTreatmentKeys = TREATMENT_FAMILY_REGISTRY.filter((family) =>
    family.sourceKeys.some((key) => selected.has(key))
  ).map((family) => family.key);

  return {
    activeTreatmentKeys,
    reportedResponse: getReportedTreatmentResponse(responses),
  };
}

export function compareTreatmentResponses(
  current: TreatmentResponseSnapshot,
  previous: TreatmentResponseSnapshot
): TreatmentResponseComparison | null {
  const currentSet = new Set(current.activeTreatmentKeys);
  const previousSet = new Set(previous.activeTreatmentKeys);
  const items: TreatmentResponseItem[] = [];
  const startedTreatments: string[] = [];
  const stoppedTreatments: string[] = [];
  const continuedTreatments: string[] = [];
  const clinicianSummary: string[] = [];
  const patientImprovedSummary: string[] = [];
  const patientFollowUpSummary: string[] = [];

  for (const family of TREATMENT_FAMILY_REGISTRY) {
    const isCurrent = currentSet.has(family.key);
    const isPrevious = previousSet.has(family.key);
    if (!isCurrent && !isPrevious) continue;

    let status: TreatmentChangeStatus;
    if (isCurrent && isPrevious) status = "continued";
    else if (isCurrent) status = "started";
    else status = "stopped";

    items.push({
      key: family.key,
      label: family.label,
      status,
      response: isCurrent ? current.reportedResponse : previous.reportedResponse,
    });

    if (status === "started") pushUnique(startedTreatments, family.label);
    if (status === "stopped") pushUnique(stoppedTreatments, family.label);
    if (status === "continued") pushUnique(continuedTreatments, family.label);
  }

  if (startedTreatments.length > 0) {
    clinicianSummary.push(
      `Treatment started since previous intake: ${startedTreatments.join(", ")}.`
    );
    patientFollowUpSummary.push(
      `Your current plan now includes: ${startedTreatments.join(", ")}.`
    );
  }
  if (stoppedTreatments.length > 0) {
    clinicianSummary.push(
      `Treatment stopped since previous intake: ${stoppedTreatments.join(", ")}.`
    );
  }
  if (continuedTreatments.length > 0) {
    clinicianSummary.push(
      `Treatment continued since previous intake: ${continuedTreatments.join(", ")}.`
    );
  }

  const currentResponseLabel = responseLabel(current.reportedResponse);
  if (currentResponseLabel) {
    clinicianSummary.push(`Current treatment response: ${currentResponseLabel}.`);
    if (current.reportedResponse === "improved") {
      patientImprovedSummary.push("You reported some improvement with your current treatment plan.");
    } else if (current.reportedResponse === "no_change") {
      patientFollowUpSummary.push("You reported no major change yet with your current treatment plan.");
    } else if (current.reportedResponse === "worsened") {
      patientFollowUpSummary.push("Your clinician may review how your current treatment plan is working for you.");
    } else if (current.reportedResponse === "uncertain") {
      patientFollowUpSummary.push("It is still early or uncertain how your current treatment plan is affecting progress.");
    }
  }

  if (items.length === 0 && !current.reportedResponse && !previous.reportedResponse) {
    return null;
  }

  return {
    items,
    startedTreatments,
    stoppedTreatments,
    continuedTreatments,
    currentReportedResponse: current.reportedResponse,
    previousReportedResponse: previous.reportedResponse,
    clinicianSummary,
    patientImprovedSummary,
    patientFollowUpSummary,
  };
}
