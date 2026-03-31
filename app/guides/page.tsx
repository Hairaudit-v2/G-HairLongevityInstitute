import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container } from "@/components/public/PublicCTA";
import { HliGuideCard } from "@/components/public/HliGuideCard";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { FEATURED_HLI_GUIDES } from "@/lib/guides/hliDownloadableGuides";

export const metadata: Metadata = buildPageMetadata({
  path: "/guides",
  title: "Free hair loss guides",
  metaDescription:
    "Foundational hair longevity guide plus focused resources: postpartum shedding, men's pattern loss, hormones and hair — from the Hair Longevity Institute.",
  appendBrand: true,
});

export default function GuidesHubPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";
  const [foundational, ...followOn] = FEATURED_HLI_GUIDES;

  return (
    <main className="min-h-screen bg-page">
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel="Start My Hair Analysis"
        theme="light"
      />

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="guides-hub-heading">
        <Container>
          <p className="text-sm font-medium tracking-[0.12em] text-[rgb(var(--gold))]">Hair Longevity Institute</p>
          <h1 id="guides-hub-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl">
            Hair loss guides
          </h1>
          <p className="mt-4 max-w-2xl text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            Start with the foundational guide, then go deeper on postpartum health, men&apos;s pattern loss, and hormones.
            Downloadable PDFs are listed on each guide page where available.
          </p>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-label="Featured guides">
        <Container>
          {foundational ? (
            <div className="mx-auto max-w-4xl">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
                Start here
              </p>
              <HliGuideCard guide={foundational} prominent />
            </div>
          ) : null}

          <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {followOn.map((guide) => (
              <li key={guide.id}>
                <HliGuideCard guide={guide} />
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center">
            <Link href="/insights" className="text-sm font-medium text-medical underline-offset-2 hover:underline">
              Browse all insight articles →
            </Link>
          </p>
        </Container>
      </section>

      <Container>
        <div className="py-10">
          <PublicFooter theme="light" />
        </div>
      </Container>
    </main>
  );
}
