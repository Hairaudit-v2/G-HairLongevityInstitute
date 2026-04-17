// app/membership/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import { getHliPatientPricingTier } from "@/lib/content/hliPatientPricing";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/membership",
  title: "Membership — ongoing support",
  metaDescription:
    "Optional Hair Longevity Institute membership at $10/month: blood request letters, blood analysis reviews, and continuity of care. Start with a free initial analysis.",
  appendBrand: true,
});

export default function MembershipPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";
  const membership = getHliPatientPricingTier("membership");

  return (
    <main className="min-h-screen bg-[rgb(var(--bg-dark))] text-white">
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel="Start Free Hair Analysis"
        theme="dark"
      />

      <section className="py-14 md:py-16">
        <Container>
          <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">
            MEMBERSHIP
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Continuity of care, when you want it
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            Membership is optional. Many people begin with the free initial hair analysis and add paid support only if needed. If you want ongoing access to letters, blood reviews, and
            follow-up support, membership is designed for that continuity — without replacing your GP or prescribing doctor.
          </p>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="text-xl font-semibold text-white">{membership.title}</h2>
              <p className="text-2xl font-semibold text-[rgb(var(--gold))]">{membership.price}</p>
            </div>
            <p className="mt-4 text-white/80 leading-relaxed">{membership.body}</p>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              <span className="font-medium text-white/75">Best for:</span> {membership.bestFor}
            </p>
            <p className="mt-6 text-sm text-white/55 leading-relaxed">
              You do not need blood tests to begin. You do not need to book a consultation to start. HLI does not replace your GP or prescribing doctor.{" "}
              <Link href="/pricing" className="font-medium text-[rgb(var(--gold))] hover:underline">
                See full pricing
              </Link>
              .
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryButton href={startHref}>Start Free Hair Analysis</PrimaryButton>
              <SecondaryButton href="/pricing">View all pricing</SecondaryButton>
              <SecondaryButton href="/book">Book one-on-one consultation</SecondaryButton>
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
