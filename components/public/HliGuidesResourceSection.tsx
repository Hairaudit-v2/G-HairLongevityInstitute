import Link from "next/link";
import { Container } from "@/components/public/PublicCTA";
import { HliGuideCard } from "@/components/public/HliGuideCard";
import { FEATURED_HLI_GUIDES, HLI_GUIDES_HUB_PATH } from "@/lib/guides/hliDownloadableGuides";

const SECTION_EYEBROW = "Evidence-based resources";
const SECTION_HEADLINE = "Start with Our Free Hair Loss Guides";
const SECTION_SUPPORTING =
  "Begin with HLI's foundational guide to hair longevity, then explore more specific resources on postpartum shedding, male pattern hair loss, and androgen-related thinning.";
const SECTION_FOOTNOTE =
  "Clear, practical education grounded in hair and scalp science — designed to support better decisions before problems progress.";

export function HliGuidesResourceSection() {
  const [foundational, ...followOn] = FEATURED_HLI_GUIDES;

  return (
    <section
      id="hair-guides"
      className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16"
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
          <div className="mx-auto mt-12 max-w-4xl">
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
      </Container>
    </section>
  );
}
