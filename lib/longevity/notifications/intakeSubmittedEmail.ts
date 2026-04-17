import type { SupabaseClient } from "@supabase/supabase-js";

import { HLI_BRAND } from "@/lib/hliBranding";
import { LONGEVITY_DOC_TYPE } from "@/lib/longevity/documentTypes";
import { getPreliminaryPatientFeedback } from "@/lib/longevity/intake/preliminaryPatientFeedback";
import {
  getLongevityReminderEmailAdapter,
  isValidReminderEmail,
  type SendReminderEmailResult,
} from "@/lib/longevity/reminderEmail";
import { getAppBaseUrl } from "@/lib/payment/appBaseUrl";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import { buildIntakeSubmissionEmail } from "@/lib/email/templates/intakeSubmission";

type SendIntakeSubmittedParams = {
  supabase: SupabaseClient;
  intakeId: string;
  profileId: string;
  submittedAt?: string;
};

function getFirstName(fullName: string | null | undefined, responses: LongevityQuestionnaireResponses): string | undefined {
  const questionnaireFirstName = responses.aboutYou?.firstName?.trim();
  if (questionnaireFirstName) return questionnaireFirstName;
  const profileFirstName = fullName?.trim().split(/\s+/)[0];
  return profileFirstName || undefined;
}

function formatSubmissionLabel(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(parsed);
}

function buildObservationParagraphs(responses: LongevityQuestionnaireResponses): {
  summary: string;
  observations: string[];
  bloodReviewNote: string;
  imageReviewNote: string;
  disclaimer: string;
} {
  const feedback = getPreliminaryPatientFeedback(responses);
  const observations = feedback.cards.slice(0, 2).map((card) => card.body);
  const needsBloodContext =
    feedback.cards.some((card) =>
      ["hormonal_review", "thyroid_review", "iron_nutrition_review", "bloodwork_followup"].includes(
        card.id
      )
    ) || responses.medicalHistory?.priorBloodTests !== "last_3_months";

  return {
    summary: feedback.summary,
    observations,
    bloodReviewNote: needsBloodContext
      ? "If recent blood tests help clarify the picture, we will review those alongside your answers or let you know if anything further would be useful."
      : "If you have recent blood tests available, they can still be added later to strengthen the review.",
    imageReviewNote:
      "Your images will be weighed alongside your history. If a few extra angles or clearer photos would help, we will let you know.",
    disclaimer:
      feedback.disclaimer ||
      "These are early observations only. They are not a final diagnosis, and the interpretation may change after full review.",
  };
}

export async function sendLongevityIntakeSubmittedEmail(
  params: SendIntakeSubmittedParams
): Promise<SendReminderEmailResult> {
  const adapter = getLongevityReminderEmailAdapter();
  if (!adapter) {
    return {
      ok: false,
      error: "Email delivery not configured (LONGEVITY_EMAIL_PROVIDER)",
      provider: "none",
    };
  }

  const [{ data: profile }, { data: questionnaire }, { data: documents }] = await Promise.all([
    params.supabase
      .from("hli_longevity_profiles")
      .select("email, full_name")
      .eq("id", params.profileId)
      .maybeSingle(),
    params.supabase
      .from("hli_longevity_questionnaires")
      .select("responses")
      .eq("intake_id", params.intakeId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    params.supabase
      .from("hli_longevity_documents")
      .select("doc_type")
      .eq("intake_id", params.intakeId),
  ]);

  const responses = (questionnaire?.responses ?? {}) as LongevityQuestionnaireResponses;
  const to = profile?.email?.trim() || responses.aboutYou?.email?.trim() || "";
  if (!isValidReminderEmail(to)) {
    return {
      ok: false,
      error: "Invalid or missing recipient email",
      provider: adapter.name,
    };
  }

  const docTypes = new Set((documents ?? []).map((doc) => doc.doc_type));
  const observations = buildObservationParagraphs(responses);
  const { subject, html, text } = buildIntakeSubmissionEmail({
    firstName: getFirstName(profile?.full_name, responses),
    appBaseUrl: getAppBaseUrl(),
    submissionLabel: formatSubmissionLabel(params.submittedAt),
    supportEmail: HLI_BRAND.email,
    replyToEmail: process.env.LONGEVITY_EMAIL_REPLY_TO?.trim() || undefined,
    receivedItems: {
      imagesUploaded: docTypes.has(LONGEVITY_DOC_TYPE.SCALP_PHOTO),
      bloodTestsUploaded: docTypes.has(LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD),
      additionalDocumentsUploaded:
        docTypes.has(LONGEVITY_DOC_TYPE.MEDICAL_LETTER) ||
        docTypes.has(LONGEVITY_DOC_TYPE.PRESCRIPTIONS) ||
        docTypes.has(LONGEVITY_DOC_TYPE.OTHER),
    },
    initialFeedback: observations,
  });

  return adapter.send({
    to,
    subject,
    bodyText: text,
    html,
    replyTo: process.env.LONGEVITY_EMAIL_REPLY_TO?.trim() || undefined,
  });
}
