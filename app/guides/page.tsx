import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container } from "@/components/public/PublicCTA";
import { HliGuideCard } from "@/components/public/HliGuideCard";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { EditorialArticle } from "@/lib/content/types";
import { getArticleBySlug } from "@/lib/content";
import { GUIDES_HUB_INSIGHT_PICK_SLUGS } from "@/lib/content/publicInsightPicks";
import { FEATURED_HLI_GUIDES } from "@/lib/guides/hliDownloadableGuides";
import { HUB_LABEL, HUB_PATH, type EditorialHubSlug } from "@/lib/content";

export const metadata: Metadata = buildPageMetadata({
  path: "/guides",
  title: "Hair loss guides & PDF downloads",
  metaDescription:
    "Downloadable PDFs and web guides on causes, treatments, postpartum shedding, male pattern loss, hormones, and more — Hair Longevity Institute.",
  appendBrand: true,
});

export default function GuidesHubPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";
  const [foundational, ...followOn] = FEATURED_HLI_GUIDES;
  const insightPicks: EditorialArticle[] = GUIDES_HUB_INSIGHT_PICK_SLUGS.map((slug) => getArticleBySlug(slug)).filter(
    (a): a is EditorialArticle => Boolean(a)
  );

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
          <div className="rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,240,235,0.92)_100%)] px-6 py-8 shadow-[0_18px_52px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
            <p className="text-sm font-medium tracking-[0.12em] text-[rgb(var(--gold))]">Hair Longevity Institute</p>
            <h1 id="guides-hub-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl">
              Hair loss guides
            </h1>
            <p className="mt-4 max-w-2xl text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
              Start with the foundational guide, then go deeper on medications, postpartum health, men&apos;s pattern loss,
              and hormones. Each guide now works as a pillar page with web summaries, FAQs, decision support, and PDF
              access where available.
            </p>
          </div>
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

          {insightPicks.length > 0 ? (
            <div className="mx-auto mt-10 max-w-2xl border-t border-[rgb(var(--border-soft))] pt-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
                Specific questions
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                Targeted insight articles that pair with the guides — not substitutes for the pillar pages above.
              </p>
              <ul className="mt-5 flex list-none flex-col gap-2.5 p-0 sm:mx-auto sm:inline-flex sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2">
                {insightPicks.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/insights/${a.slug}`}
                      className="text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="guides-to-insights">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="guides-to-insights" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Use the guides first, then branch into insights
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Guides give you the big picture. The insight hubs let you keep reading by cause, blood marker, or treatment
              question without leaving the core HLI information architecture.
            </p>
          </div>
          <ul className="mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(HUB_PATH) as EditorialHubSlug[]).map((slug) => (
              <li key={slug}>
                <Link
                  href={HUB_PATH[slug]}
                  className="flex h-full flex-col rounded-card border border-[rgb(var(--border-soft))] bg-subtle/50 p-5 shadow-soft transition hover:border-[rgb(var(--gold))]/25 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[rgb(var(--gold))]">Insights hub</span>
                  <span className="mt-2 text-sm font-semibold text-[rgb(var(--text-primary))]">{HUB_LABEL[slug]}</span>
                  <span className="mt-3 text-sm font-medium text-medical">Browse hub →</span>
                </Link>
              </li>
            ))}
          </ul>
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
