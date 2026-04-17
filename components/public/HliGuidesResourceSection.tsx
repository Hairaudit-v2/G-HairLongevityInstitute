import Link from "next/link";
import type { EditorialArticle } from "@/lib/content/types";
import { getArticleBySlug } from "@/lib/content";
import { HOMEPAGE_INSIGHT_PICK_SLUGS } from "@/lib/content/publicInsightPicks";
import { Container } from "@/components/public/PublicCTA";
import { HliGuideCard } from "@/components/public/HliGuideCard";
import { FEATURED_HLI_GUIDES, HLI_GUIDES_HUB_PATH } from "@/lib/guides/hliDownloadableGuides";

const SECTION_EYEBROW = "Evidence-based resources";
const SECTION_HEADLINE = "Start with Our Free Hair Loss Guides";
const SECTION_SUPPORTING =
  "Begin with HLI's foundational guide to hair longevity, then explore pillar guides on medications, postpartum shedding, male pattern hair loss, and androgen-related thinning.";
const SECTION_FOOTNOTE =
  "Clear, practical education grounded in hair and scalp science, with summary content, FAQs, and next-step links designed to support better decisions before problems progress.";

export function HliGuidesResourceSection() {
  const [foundational, ...followOn] = FEATURED_HLI_GUIDES;
  const insightPicks: EditorialArticle[] = HOMEPAGE_INSIGHT_PICK_SLUGS.map((slug) => getArticleBySlug(slug)).filter(
    (a): a is EditorialArticle => Boolean(a)
  );

  return (
    <section
      id="hair-guides"
      className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-subtle py-14 sm:py-20"
      aria-labelledby="hair-guides-heading"
    >
      <Container>
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium tracking-[0.12em] text-[rgb(var(--gold))]">{SECTION_EYEBROW}</p>
          <h2
            id="hair-guides-heading"
            className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl"
          >
            {SECTION_HEADLINE}
          </h2>
          <p
            className="mt-4 text-[rgb(var(--text-secondary))] sm:text-lg"
            style={{ lineHeight: "var(--line-height-relaxed)" }}
          >
            {SECTION_SUPPORTING}
          </p>
        </header>

        {foundational ? (
          <div className="mx-auto mt-12 max-w-5xl rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(245,240,235,0.72)_100%)] p-4 shadow-[0_18px_52px_rgba(0,0,0,0.06)] sm:p-5">
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

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-[rgb(var(--text-muted))]">
          {SECTION_FOOTNOTE}
        </p>
        <p className="mt-6 text-center">
          <Link
            href={HLI_GUIDES_HUB_PATH}
            className="text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
          >
            View all guides →
          </Link>
        </p>

        {insightPicks.length > 0 ? (
          <div className="mx-auto mt-12 max-w-2xl border-t border-[rgb(var(--border-soft))] pt-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
              From our insights library
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
              Short reads on focused questions — use the guides above for the full pillar view.
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
            <p className="mt-5">
              <Link
                href="/insights"
                className="text-sm font-medium text-[rgb(var(--text-muted))] underline-offset-2 hover:text-medical hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
              >
                Browse all insights →
              </Link>
            </p>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
