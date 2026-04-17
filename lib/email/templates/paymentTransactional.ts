/**
 * Transactional emails after Stripe payment events (patient-facing).
 * Subjects and bodies stay calm, explicit about unlocks and next steps.
 */

import { buildHliEmailHtml, buildHliEmailText } from "../hliEmailLayout";
import type { EmailBodyContent } from "../types";
import { getAppBaseUrl } from "@/lib/payment/appBaseUrl";

export const SUBJECT_ONE_TIME_PURCHASE = "We received your payment — here is what is unlocked";
export const SUBJECT_MEMBERSHIP_STARTED = "Your HLI membership is active";
export const SUBJECT_MEMBERSHIP_CANCELLED = "Your HLI membership has ended";
export const SUBJECT_TRICH_BOOKING_FEE = "Trichologist booking fee received";

function portalUrl(): string {
  return `${getAppBaseUrl().replace(/\/$/, "")}/portal/dashboard`;
}

function bookUrl(): string {
  return `${getAppBaseUrl().replace(/\/$/, "")}/book`;
}

export function buildOneTimePurchaseEmail(params: {
  /** blood_request_letter | blood_analysis_review | trichologist_appointment */
  offering: string;
  patientFirstName?: string | null;
}): { subject: string; html: string; text: string } {
  const greeting = params.patientFirstName?.trim()
    ? `Dear ${params.patientFirstName.trim()},`
    : "Hello,";

  let heading = "Your payment is confirmed";
  let bullets: string[] = [];
  let nextStep = "Open your patient portal to continue.";

  if (params.offering === "blood_request_letter") {
    heading = "Blood request letter — account unlock";
    bullets = [
      "This was a one-time purchase that unlocks blood request letter access on your account (not a monthly charge for this feature).",
      "When you are ready, generate your letter from your blood request in the portal.",
    ];
    nextStep = "Go to your portal → find your blood request → use Generate letter when appropriate.";
  } else if (params.offering === "blood_analysis_review") {
    heading = "Follow-up blood analysis review — account unlock";
    bullets = [
      "This was a one-time purchase that unlocks follow-up blood analysis review eligibility on your account (not a subscription).",
      "Upload your results in the portal when available so your clinician can review them in context.",
    ];
    nextStep = "Open your portal and add any new blood result documents to your case.";
  }

  const content: EmailBodyContent = {
    greeting,
    introParagraphs: [heading],
    sections: [{ bullets }],
    cta: { text: "Open patient portal", url: portalUrl() },
    closingParagraphs: [nextStep],
    signOff: "Hair Longevity Institute™",
  };

  return {
    subject: SUBJECT_ONE_TIME_PURCHASE,
    html: buildHliEmailHtml(content),
    text: buildHliEmailText(content),
  };
}

export function buildMembershipStartedEmail(params: {
  patientFirstName?: string | null;
  currentPeriodEnd?: string | null;
}): { subject: string; html: string; text: string } {
  const greeting = params.patientFirstName?.trim()
    ? `Dear ${params.patientFirstName.trim()},`
    : "Hello,";

  const period =
    params.currentPeriodEnd != null
      ? ` Your current billing period runs until ${new Date(params.currentPeriodEnd).toLocaleDateString(undefined, { dateStyle: "long" })}.`
      : "";

  const content: EmailBodyContent = {
    greeting,
    introParagraphs: [
      `Thank you — your membership is now active.${period}`,
      "While your subscription is active, it includes blood request letters, follow-up blood analysis reviews, ongoing support, and two one-on-one Zoom sessions per calendar year (30 minutes each). You can cancel any time from the billing portal (linked below).",
    ],
    sections: [
      {
        heading: "What to do next",
        bullets: [
          "Sign in to your patient portal for letters, uploads, and updates.",
          "Use Manage billing in the portal if you need to update your card or cancel renewal.",
        ],
      },
    ],
    cta: { text: "Go to patient portal", url: portalUrl() },
    closingParagraphs: ["We are glad you are continuing your care with us."],
    signOff: "Hair Longevity Institute™",
  };

  return {
    subject: SUBJECT_MEMBERSHIP_STARTED,
    html: buildHliEmailHtml(content),
    text: buildHliEmailText(content),
  };
}

export function buildMembershipCancelledEmail(params: {
  patientFirstName?: string | null;
}): { subject: string; html: string; text: string } {
  const greeting = params.patientFirstName?.trim()
    ? `Dear ${params.patientFirstName.trim()},`
    : "Hello,";

  const content: EmailBodyContent = {
    greeting,
    introParagraphs: [
      "Your HLI membership has ended or been cancelled. You no longer have membership-based access to included letters, blood analysis reviews, ongoing support, or the two included 30-minute Zoom sessions per calendar year.",
      "Any one-time unlocks you purchased separately on your account remain as recorded in your portal.",
    ],
    cta: { text: "Open patient portal", url: portalUrl() },
    closingParagraphs: ["You can rejoin membership from our pricing page whenever it suits you."],
    signOff: "Hair Longevity Institute™",
  };

  return {
    subject: SUBJECT_MEMBERSHIP_CANCELLED,
    html: buildHliEmailHtml(content),
    text: buildHliEmailText(content),
  };
}

export function buildTrichBookingFeeEmail(params: {
  patientFirstName?: string | null;
}): { subject: string; html: string; text: string } {
  const greeting = params.patientFirstName?.trim()
    ? `Dear ${params.patientFirstName.trim()},`
    : "Hello,";

  const content: EmailBodyContent = {
    greeting,
    introParagraphs: [
      "We have received your one-on-one trichologist appointment fee (1-hour session, USD 120).",
      "This fee covers scheduling your session; our team will contact you about times, or you can reach out using the booking page.",
    ],
    cta: { text: "Booking information", url: bookUrl() },
    closingParagraphs: ["If you have questions before your appointment, reply to this email or use the contact details in the footer."],
    signOff: "Hair Longevity Institute™",
  };

  return {
    subject: SUBJECT_TRICH_BOOKING_FEE,
    html: buildHliEmailHtml(content),
    text: buildHliEmailText(content),
  };
}
