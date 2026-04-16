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
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const metadata: Metadata = buildPageMetadata({
  path: "/longevity/start",
  title: "Start Hair Longevity assessment intake",
  metaDescription:
    "Hair Longevity guided intake: structured questions, optional scalp photos and blood uploads, specialist review, and your personalised summary — typically within 48 hours.",
  appendBrand: true,
});

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
              {resumingAssessment
                ? "Create your account or sign in to resume"
                : "Create your account or sign in to begin"}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/75">
              {resumingAssessment
                ? "Your saved assessment is held inside your secure portal account. Sign in to reopen it safely, continue where you left off, and keep your uploads and review linked to the correct patient record."
                : "Your Hair Longevity assessment now starts inside your secure portal account. This lets us save your progress properly, protect your uploads, and keep your review tied to the right patient record from the start."}
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-white/75">
              <p className="font-medium text-white/90">Before you begin, you will need to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>{resumingAssessment ? "Sign in to your patient account" : "Create your patient account or sign in"}</li>
                <li>Return here automatically after authentication</li>
                <li>{resumingAssessment ? "Resume your saved intake inside your secure portal session" : "Start a real intake draft inside your secure portal session"}</li>
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={loginHref}
                className="inline-flex rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))]"
              >
                {resumingAssessment ? "Sign in to resume" : "Create account or sign in"}
              </Link>
              <Link
                href="/longevity"
                className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
              >
                Back
              </Link>
            </div>
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
