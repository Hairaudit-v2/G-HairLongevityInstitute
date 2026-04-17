import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import {
  Container,
  PrimaryButton,
  SecondaryButton,
  UtilityLink,
} from "@/components/public/PublicCTA";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/longevity",
  title: "Hair Longevity care journey — assessment to follow-up",
  metaDescription:
    "Structured pathway: guided assessment, secure uploads, specialist review, and your written summary — with continuity so you can return for follow-up when needed.",
  appendBrand: true,
});

const PATHWAY_STEPS = [
  "Assessment",
  "Uploads",
  "Triage",
  "Specialist review",
  "Summary release",
  "Continuity care",
] as const;

export default function LongevityPage() {
  if (!isLongevityEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))]">
        <PublicHeader
          showLongevityLinks={false}
          ctaHref="/start"
          ctaLabel="Start My Hair Analysis"
        />
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-white">
            Longevity module
          </h1>
          <p className="mt-2 text-white/70">
            This feature is not currently available.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-[rgb(var(--gold))] hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))]">
      <PublicHeader
        showLongevityLinks
        ctaHref="/longevity/start"
        ctaLabel="Start My Hair Analysis"
      />

      {/* Hero — product front door */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <div className="absolute -top-[30%] left-1/2 h-[70%] w-[100%] -translate-x-1/2 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(198,167,94,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent" />
        </div>
        <Container>
          <div className="relative py-14 sm:py-20 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
                Hair Longevity Institute platform
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.1]">
                The official front door to your care journey
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl">
                A structured patient platform: guided assessment, secure uploads,
                specialist review, and your summary — with continuity built in so
                you can return for follow-up anytime.
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-white/65" role="doc-subtitle">
                One place. One journey. Full visibility.
              </p>
              <p className="mt-5 text-xs font-medium uppercase tracking-[0.08em] text-white/45" aria-hidden>
                No referral required · Usually within 12–24 hours
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
                <PrimaryButton href="/longevity/start">
                  Start My Hair Analysis
                </PrimaryButton>
                <SecondaryButton href="/#how-it-works">
                  See how it works
                </SecondaryButton>
                <UtilityLink href="/portal">Patient portal</UtilityLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* What this platform is */}
      <section className="border-t border-white/[0.06] bg-black/10 py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              What this platform is
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              Not a one-off form or a generic quiz. Hair Longevity Institute is a
              full care pathway: you complete a guided intake, upload bloods and
              photos, your case is reviewed by a senior trichologist, and you
              receive a structured summary and roadmap. Most cases are reviewed
              within 12–24 hours after complete submission. Your data and timeline live in one place, and you can
              return for reassessments and follow-up whenever you need to.
            </p>
          </div>
        </Container>
      </section>

      {/* Who it's for */}
      <section className="border-t border-white/[0.06] py-12 md:py-16">
        <Container>
          <h2 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Who it's for
          </h2>
          <ul className="mx-auto mt-8 max-w-xl space-y-4 sm:mt-10">
            {[
              "You're new to hair loss and want a clear picture before deciding next steps.",
              "You've already tried treatment and want structured interpretation, not more guesswork.",
              "You want one place for your assessments, uploads, and summaries — with follow-up over time.",
              "You're on TRT or managing hormones and want DHT and androgen risk mapped properly.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white/80 sm:px-5 sm:py-4 sm:text-base"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/60"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* The six-step pathway */}
      <section className="border-t border-white/[0.06] bg-black/10 py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              The six-step pathway
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Every journey follows the same clear sequence — from first
              assessment to ongoing continuity.
            </p>
          </div>
          <div className="mt-10">
            <div className="flex flex-col gap-3 sm:mt-12 md:flex-row md:flex-wrap md:justify-center md:gap-2">
              {PATHWAY_STEPS.map((label, i) => (
                <div
                  key={label}
                  className="flex items-center gap-3 md:flex-col md:gap-2 md:px-2"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--gold))]/30 bg-[rgb(var(--bg))] text-xs font-semibold text-[rgb(var(--gold))]"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-white/85 md:text-center md:text-xs lg:text-sm">
                    {label}
                  </span>
                  {i < PATHWAY_STEPS.length - 1 && (
                    <div
                      className="hidden h-px w-4 flex-shrink-0 bg-white/15 md:block md:h-4 md:w-px md:flex-shrink-0 md:self-center"
                      aria-hidden
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-white/60 sm:mt-10">
              Assessment → Uploads → Triage → Specialist review → Summary
              release → Continuity care
            </p>
          </div>
        </Container>
      </section>

      {/* What happens next + New vs Returning */}
      <section className="border-t border-white/[0.06] py-12 md:py-16">
        <Container>
          <h2 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            What happens next
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-white/75">
            Choose your path below. New to the platform? Start your first
            assessment. Already have an account? Open your patient portal.
          </p>

          <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8">
            {/* New user — primary path */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">
                New here
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Start your first assessment
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Complete the guided intake, upload your bloods and photos, and
                submit. Your case is reviewed by a specialist; typically within
                12–24 hours, depending on completeness and case complexity.
              </p>
              <div className="mt-6">
                <PrimaryButton href="/longevity/start">
                  Start My Hair Analysis
                </PrimaryButton>
              </div>
            </div>

            {/* Returning user — portal */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Returning
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Open your patient portal
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Sign in to see your care journey, upload new documents, start a
                follow-up assessment, or view your summary.
              </p>
              <div className="mt-6">
                <SecondaryButton href="/portal">
                  Patient portal
                </SecondaryButton>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-center sm:mt-10">
            <UtilityLink href="/#how-it-works">See how it works</UtilityLink>
            <span className="text-white/30" aria-hidden>
              ·
            </span>
            <UtilityLink href="/">Back to home</UtilityLink>
          </div>
        </Container>
      </section>

      <PublicFooter />
    </main>
  );
}
