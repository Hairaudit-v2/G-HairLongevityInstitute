/**
 * Longevity questionnaire schema v1 (versioned).
 * Payload shape is structured by section. Do not flatten.
 */

export const QUESTIONNAIRE_SCHEMA_VERSION = "v1";

export type SexAtBirth = "female" | "male" | "intersex" | "prefer_not_to_say";

export type AboutYou = {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  dateOfBirth?: string;
  sexAtBirth?: SexAtBirth;
  country?: string;
  stateRegion?: string;
  city?: string;
  postcode?: string;
  gp?: {
    name?: string;
    clinic?: string;
    email?: string;
    phone?: string;
  };
  consents?: {
    healthData?: boolean;
    aiAssist?: boolean;
    documentGeneration?: boolean;
  };
};

export type MainConcern = {
  primaryConcerns?: string[];
  firstNoticed?:
    | "less_than_3_months"
    | "three_to_six_months"
    | "six_to_twelve_months"
    | "one_to_two_years"
    | "more_than_two_years"
    | "unsure";
  onsetPattern?: "sudden" | "gradual" | "fluctuating" | "unsure";
  affectedAreas?: string[];
  symptoms?: string[];
  freeText?: string;
};

export type TimelineTriggers = {
  triggers?: string[];
  pastYearEvents?: string[];
  sheddingTrend?: "stable" | "improved" | "worsened" | "comes_and_goes";
};

export type MedicalHistory = {
  diagnoses?: string[];
  currentSymptoms?: string[];
  familyHistory?: string[];
  priorBloodTests?: "last_3_months" | "older_than_3_months" | "no" | "unsure";
  wantsToUploadBloodsNow?: boolean | null;
};

export type FemaleHistory = {
  cycles?: "regular" | "irregular" | "not_occurring" | "prefer_not_to_say";
  features?: string[];
  lifeStage?: string[];
};

export type MaleHistory = {
  therapies?: string[];
  associatedChanges?: string[];
};

export type LifestyleTreatments = {
  dietPattern?: string[];
  enoughProtein?: "yes" | "no" | "unsure";
  stressScore?: number;
  sleepQuality?: "good" | "average" | "poor";
  currentTreatments?: string[];
  treatmentHelpfulness?: "yes" | "no" | "unsure";
  treatmentResponse?: "improved" | "no_change" | "worsened" | "uncertain";
  medicationsSupplementsFreeText?: string;
};

export type UploadsNextSteps = {
  availableUploads?: string[];
  currentBloodStatus?:
    | "uploading_now"
    | "upload_later"
    | "not_done"
    | "unsure";
};

export type LongevityQuestionnaireResponses = {
  aboutYou?: AboutYou;
  mainConcern?: MainConcern;
  timelineTriggers?: TimelineTriggers;
  medicalHistory?: MedicalHistory;
  femaleHistory?: FemaleHistory;
  maleHistory?: MaleHistory;
  lifestyleTreatments?: LifestyleTreatments;
  uploadsNextSteps?: UploadsNextSteps;
};
