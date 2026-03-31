// app/membership/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/membership",
  title: "Hair Longevity membership — continuity & reassessment",
  metaDescription:
    "Ongoing optimisation with periodic reassessment and Hair Longevity Score™ tracking. Designed for continuity after your initial analysis.",
  appendBrand: true,
});

export default function MembershipPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-[rgb(var(--bg-dark))] text-white">
      <PublicHeader showLongevityLinks={useLongevity} ctaHref={startHref} ctaLabel="Start My Hair Analysis" theme="dark" />

      <section className="py-14 md:py-16">
        <Container>
          <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">
            HAIR LONGEVITY MEMBERSHIP
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Ongoing optimisation for long-term results
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            Membership is for clients who have completed an initial review or consultation and want
            ongoing support to optimise and track their hair longevity strategy over time.
          </p>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            <p className="text-2xl font-semibold text-[rgb(var(--gold))]">$49 / month</p>
            <ul className="mt-6 space-y-3 text-white/85">
              <li>• Ongoing optimisation support</li>
              <li>• 6‑month reassessments included</li>
              <li>• Hair Longevity Score™ tracking over time</li>
              <li>• Priority support for questions</li>
              <li>• Protocol adjustments as your biology changes</li>
            </ul>
            <p className="mt-6 text-sm text-white/65">
              Membership is available after an initial diagnostic review or specialist consultation.
              We recommend starting with a full assessment so we have baseline data to optimise from.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
              <SecondaryButton href="/book">Book specialist consultation</SecondaryButton>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              ← Back to home
            </Link>
          </div>
        </Container>
      </section>

      <PublicFooter />
    </main>
  );
}
