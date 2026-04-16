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
  ANDROGEN_GUIDE_PDF_DOWNLOAD_AS,
  ANDROGEN_GUIDE_PDF_HREF,
} from "@/lib/guides/hliGuidePdfs";

const DHT_INSIGHT = "/insights/dht-and-androgenetic-alopecia";
const FIN_INSIGHT = "/insights/finasteride-vs-saw-palmetto";
const ORAL_WOMEN_INSIGHT = "/insights/oral-anti-androgens-in-women-specialist-led-context";

const READ_SECTIONS: { href: string; label: string }[] = [
  { href: `${DHT_INSIGHT}#dht-role`, label: "Testosterone vs DHT — how DHT ties into pattern thinning" },
  { href: `${DHT_INSIGHT}#pattern-recognition`, label: "What clinicians look for (follicular sensitivity context)" },
  { href: `${DHT_INSIGHT}#labs`, label: "What blood tests can and cannot tell you" },
  { href: `${FIN_INSIGHT}#finasteride-mechanism`, label: "Finasteride: what it does at a high level" },
  { href: `${FIN_INSIGHT}#dht-context`, label: "DHT refresher in a treatment context" },
  { href: `${ORAL_WOMEN_INSIGHT}#relation-pattern-hair-loss`, label: "Women: anti-androgen prescribing and pattern loss" },
];

const COVERS = [
  "Testosterone vs DHT — and why follicular sensitivity often matters more than a single lab number",
  "TRT, supraphysiologic androgen exposure, and how pressure on hair follicles is framed clinically",
  "Anabolic steroid cycles and androgenic load — what patients often ask about",
  "Women and androgen-sensitive thinning — overlap with pattern loss and when specialist review matters",
  "What blood tests may (and may not) add when androgens are in the story",
  "Evidence-based options when androgens are part of the picture — always prescriber-led",
];

const RELATED = [
  {
    href: "/guides/hair-longevity",
    category: "Foundational Guide",
    title: "The Complete Guide to Hair Longevity",
    description: "Broad biology-first context before narrowing on hormones.",
  },
  {
    href: "/guides/male-pattern-hair-loss",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description: "Pattern progression, staging, and treatment framing for men.",
  },
  {
    href: "/guides/postpartum-hair-loss",
    category: "Women's Hair Health",
    title: "The Truth About Postpartum Hair Loss",
    description: "Hormonal transition and shedding — how it sits apart from androgen-driven pattern loss.",
  },
];

const wrap = "mx-auto max-w-2xl";

export const metadata: Metadata = buildPageMetadata({
  path: "/guides/androgen-index",
  title: "Testosterone, DHT, TRT, steroids & hair loss risk",
  metaDescription:
    "Clinically grounded guide: testosterone vs DHT, follicular sensitivity, TRT and steroid exposure, women and androgen-related thinning, labs, and evidence-based next steps — Hair Longevity Institute.",
  appendBrand: true,
});

export default function AndrogenIndexGuidePage() {
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 sm:py-20" aria-labelledby="ag-guide-hero">
        <Container>
          <div className={`${wrap} text-center`}>
            <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">Hormones & Hair</p>
            <h1
              id="ag-guide-hero"
              className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-[2.25rem]"
              style={{ lineHeight: 1.2 }}
            >
              Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women
            </h1>
            <p className="mt-5 text-base text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
              This guide helps you understand how androgen biology, DHT conversion, TRT, steroid exposure, follicular
              sensitivity, and female androgen-sensitive thinning intersect in real-world hair loss — without replacing
              your endocrinologist, dermatologist, or trichology-led assessment.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <SecondaryButton href={DHT_INSIGHT}>Continue reading</SecondaryButton>
              <SecondaryButton href={ANDROGEN_GUIDE_PDF_HREF} download={ANDROGEN_GUIDE_PDF_DOWNLOAD_AS}>
                Download PDF
              </SecondaryButton>
            </div>
            <p className="mt-6 text-sm text-[rgb(var(--text-muted))] leading-relaxed">
              Start with the DHT overview, then use the section links below; download the PDF for offline reading.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="ag-why">
        <Container>
          <div className={wrap}>
            <h2 id="ag-why" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Why this guide matters
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Androgens are easy to misunderstand. Total testosterone alone rarely tells the whole hair story. This
              resource offers a calm, clinically grounded tour of DHT, follicular sensitivity, TRT and steroid-related
              risk, sex-specific differences, and what labs can and cannot clarify — so you can ask better questions and
              avoid both panic and false reassurance.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="ag-covers">
        <Container>
          <div className={wrap}>
            <h2 id="ag-covers" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="ag-read">
        <Container>
          <div className={wrap}>
            <h2 id="ag-read" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Read online — guided entry points
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              These links jump into vetted HLI editorials that map to this guide&apos;s themes. Read in any order; each
              article stands on its own.
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
                  href={DHT_INSIGHT}
                  className="text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
                >
                  Open the main DHT & pattern overview from the top →
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="ag-who">
        <Container>
          <div className={wrap}>
            <h2 id="ag-who" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Best for readers who
            </h2>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              <li>Are on or considering TRT and want a hair-specific framing alongside endocrine care</li>
              <li>Have used or are curious about anabolic steroids and androgenic pressure on hair</li>
              <li>Are women noticing widening part or crown thinning and wonder how androgens fit the picture</li>
              <li>Want to understand why “check my testosterone” rarely settles a hair diagnosis alone</li>
              <li>Prefer to align supplement chatter with evidence before talking to a prescriber</li>
            </ul>
          </div>
        </Container>
      </section>

      <GuideRelatedGuides items={RELATED} headingId="ag-related" />

      <GuideLibraryAssessmentCTA startHref={startHref} headingId="ag-assessment-cta" />

      <Container>
        <div className="py-10">
          <PublicFooter theme="light" />
        </div>
      </Container>
    </main>
  );
}
