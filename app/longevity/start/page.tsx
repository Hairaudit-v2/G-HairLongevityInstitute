import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isLongevityEnabled } from "@/lib/features";
import { LongevityStartFlow } from "@/components/longevity/LongevityStartFlow";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { getPortalUser, ensurePortalProfile } from "@/lib/longevity/portalAuth";
import { buildPortalLoginRedirectPath } from "@/lib/longevity/redirects";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ConversionFaqList } from "@/components/public/ConversionFaqList";
import { HLI_PRICING_SECURE_START_LINES } from "@/lib/content/hliPatientPricing";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const metadata: Metadata = buildPageMetadata({
  path: "/longevity/start",
  title: "Start your free hair analysis",
  metaDescription:
    "Free initial hair analysis. Create a secure account to save your intake and protect your information. Optional bloods and photos; paid support only if you need it later.",
  appendBrand: true,
});

const START_WITH_OPTIONS = [
  "Just your symptoms and history",
  "Blood test results if you already have them",
  "Scalp or hair photos if available",
  "Questions about next steps",
] as const;

function buildCurrentPath(searchParams: {
  resume?: string;
  intakeId?: string;
}): string {
  const params = new URLSearchParams();
  if (searchParams.resume) params.set("resume", searchParams.resume);
  if (searchParams.intakeId) params.set("intakeId", searchParams.intakeId);
  const query = params.toString();
  return query ? `/longevity/start?${query}` : "/longevity/start";
}

function isResumeRequest(searchParams: {
  resume?: string;
  intakeId?: string;
}): boolean {
  return Boolean(searchParams.resume || searchParams.intakeId);
}

export default async function LongevityStartPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string; intakeId?: string }>;
}) {
  if (!isLongevityEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Longevity intake</h1>
          <p className="mt-2 text-white/70">This feature is not currently available.</p>
          <Link href="/longevity" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
            Back
          </Link>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const currentPath = buildCurrentPath(params);
  const resumingAssessment = isResumeRequest(params);
  const user = await getPortalUser();

  if (!user) {
    const loginHref = buildPortalLoginRedirectPath(currentPath);
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
              Hair Longevity Institute™ — Secure start
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              {resumingAssessment ? "Sign in to continue your free analysis" : "Start your free hair analysis securely"}
            </h1>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-white/75">
              <p>
                <span className="text-white/90">Your initial hair analysis is free.</span>{" "}
                {resumingAssessment
                  ? "Your intake is saved in your secure portal — sign in to continue where you left off."
                  : "We ask you to create a secure account so we can save your progress, protect your health information, and deliver your review to the right place."}
              </p>
              <p>
                You can begin even if you do not yet have blood tests or photos — add them when you are ready.{" "}
                <span className="text-white/90">
                  Paid support is optional and only comes later, if you choose it.
                </span>
              </p>
            </div>

            <div
              className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-white/80"
              aria-labelledby="secure-start-pricing-heading"
            >
              <h2 id="secure-start-pricing-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                Pricing summary
              </h2>
              <ul className="mt-3 space-y-2 leading-snug">
                {HLI_PRICING_SECURE_START_LINES.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-white/80">
              <h2 className="text-sm font-semibold text-white/90">You can start with any of the following</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {START_WITH_OPTIONS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-white/65">
              No referral is required. There is no obligation to upgrade — begin with your free analysis and add paid options only if you need them.
            </p>

            <div className="mt-8">
              <ConversionFaqList
                embedded
                variant="dark"
                heading="Questions before you start"
                headingId="secure-start-faq-heading"
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href={loginHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-center text-sm font-semibold leading-snug text-[rgb(var(--bg))] sm:max-w-md"
              >
                {resumingAssessment ? "Sign in to continue your free analysis" : "Create Secure Account to Start Free Analysis"}
              </Link>
              <Link
                href="/longevity"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
              >
                Back
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/50">
              After you authenticate, you will return here automatically to {resumingAssessment ? "resume your intake" : "begin your intake"} in your secure portal session.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const trichologist = await getTrichologistFromRequest();
  if (trichologist) redirect("/portal/trichologist/review");

  const supabase = supabaseAdmin();
  const profileResult = await ensurePortalProfile(supabase, user);
  if (!profileResult.ok) {
    if (profileResult.reason === "no_email") {
      redirect("/portal/login?error=no-email");
    }
    redirect("/portal/login?error=profile");
  }

  const existingSession = await getLongevitySessionFromRequest();
  if (existingSession !== profileResult.profileId) {
    redirect(`/api/longevity/session/sync?redirect=${encodeURIComponent(currentPath)}`);
  }

  return <LongevityStartFlow portalEmail={user.email ?? null} />;
}
