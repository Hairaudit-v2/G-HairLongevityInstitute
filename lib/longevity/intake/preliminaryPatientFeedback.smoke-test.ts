import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

import { getPreliminaryPatientFeedback } from "./preliminaryPatientFeedback";

export type PreliminaryPatientFeedbackSmokeResult = {
  name: string;
  passed: boolean;
  message?: string;
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function run(name: string, execute: () => void): PreliminaryPatientFeedbackSmokeResult {
  try {
    execute();
    return { name, passed: true };
  } catch (error) {
    return {
      name,
      passed: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export function runPreliminaryPatientFeedbackSmokeTests(): PreliminaryPatientFeedbackSmokeResult[] {
  return [
    run("supports hormonal and thyroid early review", () => {
      const responses: LongevityQuestionnaireResponses = {
        aboutYou: { sexAtBirth: "female" },
        mainConcern: {
          primaryConcerns: ["diffuse_thinning", "increased_shedding"],
          onsetPattern: "sudden",
        },
        timelineTriggers: {
          triggers: ["childbirth_postpartum"],
        },
        medicalHistory: {
          currentSymptoms: ["fatigue", "cold_intolerance"],
          priorBloodTests: "no",
        },
        femaleHistory: {
          cycles: "irregular",
          cycleChangeAroundHairChange: "yes",
          lifeStage: ["postpartum"],
        },
      };
      const feedback = getPreliminaryPatientFeedback(responses);
      assert(
        feedback.cards.some((card) => card.id === "hormonal_review"),
        "expected hormonal review card"
      );
      assert(
        feedback.disclaimer.toLowerCase().includes("not a confirmed diagnosis"),
        "expected safe disclaimer"
      );
      const hormonalCard = feedback.cards.find((card) => card.id === "hormonal_review");
      assert(
        hormonalCard?.body.toLowerCase().includes("female endocrine"),
        "expected stronger endocrine wording"
      );
    }),
    run("supports androgen and scalp review", () => {
      const responses: LongevityQuestionnaireResponses = {
        aboutYou: { sexAtBirth: "male" },
        mainConcern: {
          primaryConcerns: ["frontal_hairline_recession", "crown_thinning"],
          affectedAreas: ["frontal_hairline", "crown"],
          symptoms: ["itch", "flaking"],
        },
        medicalHistory: {
          familyHistory: ["male_pattern_hair_loss"],
          diagnoses: ["seborrhoeic_dermatitis"],
          priorBloodTests: "older_than_3_months",
        },
      };
      const feedback = getPreliminaryPatientFeedback(responses);
      assert(
        feedback.cards.some((card) => card.id === "androgen_review"),
        "expected androgen review card"
      );
      assert(
        feedback.cards.some((card) => card.id === "scalp_review"),
        "expected scalp review card"
      );
      assert(feedback.cards.length >= 3, "expected structured review cards");
    }),
    run("supports delayed stress-trigger nuance and direct follow-up wording", () => {
      const responses: LongevityQuestionnaireResponses = {
        aboutYou: { sexAtBirth: "female" },
        mainConcern: {
          primaryConcerns: ["diffuse_thinning", "increased_shedding"],
        },
        medicalHistory: {
          priorBloodTests: "no",
        },
        femaleHistory: {
          cycles: "not_occurring",
          cycleChangeAroundHairChange: "yes",
          newWorseningHyperandrogenFeatures: "yes",
          features: ["missed_periods"],
        },
        adaptiveEngine: {
          answers: {
            presentation_pattern: "diffuse_thinning",
            female_hormonal_context: "yes",
            acute_trigger_window: "yes",
            lifestyle_load: ["major_stress"],
            stress_shedding_delay_pattern: "yes",
            postpartum_recent_gate: "no",
            hormonal_contraception_change_gate: "no",
            pituitary_red_flag_followup: "yes",
          },
        },
      };
      const feedback = getPreliminaryPatientFeedback(responses);
      assert(
        feedback.cards.some((card) => card.id === "trigger_review"),
        "expected trigger review card"
      );
      assert(
        feedback.cards.some((card) => card.id === "pituitary_followup"),
        "expected pituitary follow-up card"
      );
      const triggerCard = feedback.cards.find((card) => card.id === "trigger_review");
      assert(
        triggerCard?.body.toLowerCase().includes("few months"),
        "expected delayed trigger nuance wording"
      );
      const followupCard = feedback.cards.find((card) => card.id === "pituitary_followup");
      assert(
        followupCard?.body.toLowerCase().includes("milky nipple discharge"),
        "expected direct clinician follow-up wording"
      );
    }),
  ];
}
