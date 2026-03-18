/**
 * Dev-only: GET returns example email HTML for preview.
 * ?type=assessment|gp-letter|reminder|follow-up|welcome
 * Open in browser to verify layout and mobile rendering.
 */
import { NextResponse } from "next/server";
import { buildAssessmentCompleteEmail } from "@/lib/email/templates/assessmentComplete";
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
