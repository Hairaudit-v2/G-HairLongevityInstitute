import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { HliPatientPricing } from "@/components/public/HliPatientPricing";
import { Container, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/pricing",
  title: "Pricing — free first, optional paid support",
  metaDescription:
    "Transparent Hair Longevity Institute pricing: free initial hair analysis; blood letter and review; one-on-one trichologist appointment; optional membership. No obligation to upgrade.",
  appendBrand: true,
});

export default function PricingPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-page">
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel="Start My Hair Analysis"
        theme="light"
      />

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 md:py-16">
        <Container>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
            Hair Longevity Institute™
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-center text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-[rgb(var(--text-secondary))]">
            Your first analysis is free. Everything else is optional — add only what you need, when you need it.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-16">
        <Container>
          <HliPatientPricing
            theme="light"
            id="pricing"
            headingId="pricing-details-heading"
            intro="Each tier is designed to stand alone or combine over time. There is no pressure to upgrade."
            startHref={startHref}
          />

          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
            <SecondaryButton href="/book">Book one-on-one consultation</SecondaryButton>
            <Link
              href="/membership"
              className="text-sm font-medium text-medical underline-offset-2 hover:underline"
            >
              Learn about membership
            </Link>
          </div>
        </Container>
      </section>

      <Container>
        <PublicFooter theme="light" />
      </Container>
    </main>
  );
}
