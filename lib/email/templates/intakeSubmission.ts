import { buildHliEmailHtml, buildHliEmailText } from "../hliEmailLayout";
import type { EmailBodyContent } from "../types";

export const SUBJECT = "We've received your Hair Longevity submission";

export type IntakeSubmissionEmailParams = {
  firstName?: string | null;
  appBaseUrl?: string | null;
  submissionLabel?: string | null;
  supportEmail?: string | null;
  replyToEmail?: string | null;
  receivedItems: {
    imagesUploaded: boolean;
    bloodTestsUploaded: boolean;
    additionalDocumentsUploaded: boolean;
  };
  initialFeedback: {
    summary: string;
    observations: string[];
    imageReviewNote?: string | null;
    bloodReviewNote?: string | null;
    disclaimer?: string | null;
  };
};

function getPortalUrl(appBaseUrl?: string | null): string | null {
  const base = appBaseUrl?.trim().replace(/\/$/, "");
  if (!base) return null;
  return `${base}/portal`;
}

function getLogoUrl(appBaseUrl?: string | null): string | undefined {
  const base = appBaseUrl?.trim().replace(/\/$/, "");
  return base ? `${base}/brand/Print_Transparent.svg` : undefined;
}

function buildReceivedItems(params: IntakeSubmissionEmailParams): string[] {
  const items = [
    "Clinical questionnaire: received",
    params.receivedItems.imagesUploaded
      ? "Images: received and included in review"
      : "Images: not included in this submission",
    params.receivedItems.bloodTestsUploaded
      ? "Blood tests: received and included in review"
      : "Blood tests: not included in this submission",
  ];

  if (params.receivedItems.additionalDocumentsUploaded) {
    items.push("Supporting documents: received");
  }

  if (params.submissionLabel) {
    items.push(`Submitted: ${params.submissionLabel}`);
  }

  return items;
}

export function buildIntakeSubmissionEmail(
  params: IntakeSubmissionEmailParams
): { subject: string; html: string; text: string } {
  const greeting = params.firstName?.trim() ? `Dear ${params.firstName.trim()},` : "Hello,";
  const portalUrl = getPortalUrl(params.appBaseUrl);
  const observationBullets = params.initialFeedback.observations.filter(Boolean).slice(0, 3);
  const observationContext = [
    params.initialFeedback.imageReviewNote?.trim() || "",
    params.initialFeedback.bloodReviewNote?.trim() || "",
  ].filter(Boolean);

  const supportLine = params.replyToEmail?.trim() || params.supportEmail?.trim();
  const closingParagraphs = supportLine
    ? [
        `If you would like to add anything further or have a question in the meantime, you can reply to this email or contact us at ${supportLine}.`,
        "Thank you for placing your trust in Hair Longevity Institute.",
      ]
    : [
        "If you would like to add anything further or have a question in the meantime, you can reply to this email.",
        "Thank you for placing your trust in Hair Longevity Institute.",
      ];

  const content: EmailBodyContent = {
    header: {
      eyebrow: "Clinical Intake Acknowledgement",
      title: "Submission Received",
      logoUrl: getLogoUrl(params.appBaseUrl),
      logoAlt: "Hair Longevity Institute logo",
    },
    greeting,
    introParagraphs: [
      "Thank you for submitting your Hair Longevity Institute assessment. Your case has now been received and entered into our clinical review process.",
      "Our team will review your questionnaire together with any images, blood tests, and supporting documents provided, so your initial assessment can be considered in full context.",
    ],
    sections: [
      {
        heading: "What we received",
        bullets: buildReceivedItems(params),
      },
      {
        heading: "Early observations from your submission",
        paragraphs: [
          "Based on the information provided so far, there are a few early themes we will examine more closely during review.",
          params.initialFeedback.summary,
        ],
        bullets: observationBullets.length ? observationBullets : undefined,
      },
      {
        heading: "Review focus",
        paragraphs: [
          ...observationContext,
          "These are early indicators only, and the picture may become more specific once we have reviewed the full submission in detail.",
        ],
      },
      {
        heading: "What happens in the next 12–24 hours",
        bullets: [
          "We will review your questionnaire answers in more clinical detail.",
          "Any images provided will be assessed alongside your history and pattern description.",
          "Any blood tests or supporting documents provided will be reviewed in context with the rest of your submission.",
          "We will correlate all available information and contact you if anything further is required.",
          "Your initial report or next-step guidance will follow within 12–24 hours.",
        ],
      },
      {
        heading: "Important disclaimer",
        paragraphs: [
          params.initialFeedback.disclaimer?.trim() ||
            "This is not a final assessment. The interpretation may be refined once all submitted information has been reviewed in full.",
        ],
      },
    ],
    cta: portalUrl ? { text: "Access Your Portal", url: portalUrl } : undefined,
    closingParagraphs,
    signOff: "Hair Longevity Institute™ Clinical Team",
  };

  return {
    subject: SUBJECT,
    html: buildHliEmailHtml(content),
    text: buildHliEmailText(content),
  };
}
