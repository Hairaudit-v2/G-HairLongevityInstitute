import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, SecondaryButton } from "@/components/public/PublicCTA";
import { GuideLibraryAssessmentCTA } from "@/components/guides/GuideLibraryAssessmentCTA";
import { GuideRelatedGuides } from "@/components/guides/GuideRelatedGuides";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  MALE_PATTERN_GUIDE_PDF_DOWNLOAD_AS,
  MALE_PATTERN_GUIDE_PDF_HREF,
} from "@/lib/guides/hliGuidePdfs";

const MAIN_INSIGHT = "/insights/dht-and-androgenetic-alopecia";

const READ_SECTIONS: { href: string; label: string }[] = [
  { href: `${MAIN_INSIGHT}#pattern-recognition`, label: "What clinicians look for on the scalp" },
  { href: `${MAIN_INSIGHT}#dht-role`, label: "How DHT ties into pattern thinning" },
  { href: `${MAIN_INSIGHT}#labs`, label: "When blood tests help — and when they do not" },
  { href: `${MAIN_INSIGHT}#treatment-context`, label: "Treatment options (big picture)" },
  { href: `${MAIN_INSIGHT}#expectations`, label: "What results usually look like" },
];

const COVERS = [
  "What male pattern hair loss is — and how it differs from short-term shedding",
  "How DHT and genetics influence miniaturisation and progression",
  "Early signs, recession, crown thinning, and staging in plain language",
  "What can mimic pattern loss (overlap with shedding or scalp disease)",
  "What evidence-based strategies may help — and what is oversold online",
  "When structured assessment and examination matter most",
];

const RELATED = [
  {
    href: "/guides/hair-longevity",
    category: "Foundational Guide",
    title: "The Complete Guide to Hair Longevity",
    description: "Start with biology-first context before going deep on pattern loss.",
  },
  {
    href: "/guides/androgen-index",
    category: "Hormones & Hair",
    title: "Testosterone, DHT, TRT, Steroids, and Hair Loss Risk",
    description: "How androgen exposure and sensitivity intersect with thinning in men and women.",
  },
  {
    href: "/guides/postpartum-hair-loss",
    category: "Women's Hair Health",
    title: "The Truth About Postpartum Hair Loss",
    description: "For partners and clinicians — how postpartum shedding can sit alongside pattern questions.",
  },
];

const wrap = "mx-auto max-w-2xl";

export const metadata: Metadata = buildPageMetadata({
  path: "/guides/male-pattern-hair-loss",
  title: "Male pattern hair loss: causes, stages & evidence-based help",
  metaDescription:
    "A clinically grounded guide for men: how male pattern hair loss begins and progresses, DHT and genetics, early signs, staging, what helps, and when assessment matters — Hair Longevity Institute.",
  appendBrand: true,
});

export default function MalePatternHairLossGuidePage() {
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 sm:py-20" aria-labelledby="mp-guide-hero">
        <Container>
          <div className={`${wrap} text-center`}>
            <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">Men&apos;s Hair Health</p>
            <h1
              id="mp-guide-hero"
              className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-[2.25rem]"
              style={{ lineHeight: 1.2 }}
            >
              Male Pattern Hair Loss: Causes, Stages, and What Actually Helps
            </h1>
            <p className="mt-5 text-base text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
              This guide helps you understand how male pattern hair loss typically begins, how it progresses, which early
              signs matter, and which evidence-based strategies may actually help — without replacing examination by your
              clinician.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <SecondaryButton href={MAIN_INSIGHT}>Continue reading</SecondaryButton>
              <SecondaryButton href={MALE_PATTERN_GUIDE_PDF_HREF} download={MALE_PATTERN_GUIDE_PDF_DOWNLOAD_AS}>
                Download PDF
              </SecondaryButton>
            </div>
            <p className="mt-6 text-sm text-[rgb(var(--text-muted))] leading-relaxed">
              The web article is free to read on any device; the PDF is yours to keep offline.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="mp-why">
        <Container>
          <div className={wrap}>
            <h2 id="mp-why" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Why this guide matters
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Male pattern hair loss is common, but online advice is noisy. This resource offers a practical,
              medically grounded path through DHT-driven miniaturisation, early recession and crown thinning, realistic
              staging, treatment context, and when proper assessment — not guesswork — should shape your next steps.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="mp-covers">
        <Container>
          <div className={wrap}>
            <h2 id="mp-covers" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What this guide covers
            </h2>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              {COVERS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="mp-read">
        <Container>
          <div className={wrap}>
            <h2 id="mp-read" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Read online — jump to key sections
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Our patient editorial on pattern loss and DHT is structured so you can read start-to-finish or drop into the
              sections most relevant to you.
            </p>
            <ul className="mt-6 space-y-2">
              {READ_SECTIONS.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={MAIN_INSIGHT}
                  className="text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
                >
                  Open the full article from the top →
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="mp-who">
        <Container>
          <div className={wrap}>
            <h2 id="mp-who" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Best for readers who
            </h2>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              <li>Notice temple recession, crown thinning, or a wider part and want a clear mental model</li>
              <li>Want to separate pattern loss from telogen shedding or scalp inflammation</li>
              <li>Prefer evidence-based framing before choosing treatments with a prescriber</li>
              <li>Are considering HLI to understand pattern, labs, and next steps in one structured review</li>
            </ul>
          </div>
        </Container>
      </section>

      <GuideRelatedGuides items={RELATED} headingId="mp-related" />

      <GuideLibraryAssessmentCTA startHref={startHref} headingId="mp-assessment-cta" />

      <Container>
        <div className="py-10">
          <PublicFooter theme="light" />
        </div>
      </Container>
    </main>
  );
}
