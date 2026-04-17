/**
 * Dev-only: GET returns example email HTML for preview.
 * ?type=assessment|submission|gp-letter|reminder|follow-up|welcome
 * Open in browser to verify layout and mobile rendering.
 */
import { NextResponse } from "next/server";
import { buildAssessmentCompleteEmail } from "@/lib/email/templates/assessmentComplete";
import { buildIntakeSubmissionEmail } from "@/lib/email/templates/intakeSubmission";
import { buildGpLetterEmail } from "@/lib/email/templates/gpLetter";
import { buildReminderEmail } from "@/lib/email/templates/reminder";
import { buildFollowUpEmail } from "@/lib/email/templates/followUp";
import { buildWelcomeEmail } from "@/lib/email/templates/welcome";

export const dynamic = "force-dynamic";

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

const EXAMPLES: Record<
  string,
  () => { subject: string; html: string; text: string }
> = {
  assessment: () =>
    buildAssessmentCompleteEmail({
      fullName: "Jane",
      portalUrl: "https://example.com/portal",
    }),
  submission: () =>
    buildIntakeSubmissionEmail({
      firstName: "Jane",
      appBaseUrl: "https://example.com",
      submissionLabel: "17 Apr 2026, 10:15 am UTC",
      supportEmail: "support@hairlongevityinstitute.com",
      receivedItems: {
        imagesUploaded: true,
        bloodTestsUploaded: false,
        additionalDocumentsUploaded: true,
      },
      initialFeedback: {
        summary:
          "Your answers already give us a useful early review focus. At this stage, your history may suggest a mix of shedding triggers and pattern-related thinning, but this still needs careful review.",
        observations: [
          "There are early signs that the timing of your shedding may be relevant, which can sometimes be associated with stress, illness, medication change, or other recent triggers.",
          "Your pattern and history may also suggest contributors that need closer hormonal or androgen-related review, but we will confirm that more carefully during full assessment.",
        ],
        imageReviewNote:
          "Your images will be weighed alongside your history. If a few extra angles or clearer photos would help, we will let you know.",
        bloodReviewNote:
          "If recent blood tests help clarify the picture, we will review those alongside your answers or let you know if anything further would be useful.",
        disclaimer:
          "These are early observations only. They are not a final diagnosis, and the interpretation may change after full review.",
      },
    }),
  "gp-letter": () =>
    buildGpLetterEmail({
      fullName: "Jane Smith",
      portalUrl: "https://example.com/portal",
    }),
  reminder: () =>
    buildReminderEmail({
      fullName: "Jane",
      intro:
        "This is a gentle reminder that your next hair longevity follow-up now looks due.",
      lines: [
        "A follow-up around late March would be a sensible time to check progress.",
      ],
      ctaText: "Access Your Portal",
      ctaUrl: "https://example.com/portal",
    }),
  "follow-up": () =>
    buildFollowUpEmail({
      fullName: "Jane",
      intro:
        "Your clinician has completed your assessment. Here are your recommended next steps.",
      steps: [
        "Review your summary in the portal.",
        "Share the GP support letter with your doctor if blood tests were suggested.",
        "Upload any new blood results or photos when ready.",
      ],
      portalUrl: "https://example.com/portal",
    }),
  welcome: () =>
    buildWelcomeEmail({
      fullName: "Jane",
      startUrl: "https://example.com/portal",
    }),
};

export async function GET(req: Request) {
  if (isProd()) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "assessment";
  const builder = EXAMPLES[type] ?? EXAMPLES.assessment;
  const { subject, html } = builder();

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Email-Subject": subject,
    },
  });
}
