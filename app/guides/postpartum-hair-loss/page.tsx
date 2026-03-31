import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  POSTPARTUM_GUIDE_PDF_DOWNLOAD_AS,
  POSTPARTUM_GUIDE_PDF_HREF,
} from "@/lib/guides/postpartumGuidePdf";

const INSIGHT_SLUG = "postpartum-shedding-when-to-reassure-vs-when-to-test";

export const metadata: Metadata = buildPageMetadata({
  path: "/guides/postpartum-hair-loss",
  title: "Free guide: postpartum hair shedding",
  metaDescription:
    "Understand postpartum hair shedding: why it happens, what is usually normal, when to seek clinical review, and evidence-based steps toward regrowth.",
  appendBrand: true,
});

export default function PostpartumHairLossGuidePage() {
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 sm:py-20" aria-labelledby="guide-hero-heading">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">Free clinical guide</p>
            <h1 id="guide-hero-heading" className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-[2.25rem]" style={{ lineHeight: 1.2 }}>
              Postpartum hair shedding: what&apos;s normal, and when to look deeper
            </h1>
            <p className="mt-5 text-base text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
              Learn why many women shed more after birth, how timing usually unfolds, when watchful waiting is reasonable
              versus when to discuss testing with your clinician, and practical, evidence-informed steps to support
              healthier regrowth.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <SecondaryButton href={POSTPARTUM_GUIDE_PDF_HREF} download={POSTPARTUM_GUIDE_PDF_DOWNLOAD_AS}>
                Read the Guide
              </SecondaryButton>
            </div>
            <p className="mt-5 text-center text-sm text-[rgb(var(--text-muted))]">
              <Link
                href={`/insights/${INSIGHT_SLUG}`}
                className="font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
              >
                Prefer to read online? Open the web article
              </Link>
            </p>
            <p className="mt-4 text-sm text-[rgb(var(--text-muted))] leading-relaxed">
              Evidence-based guidance grounded in hair and scalp science.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="guide-next-heading">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2 id="guide-next-heading" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Want a personalised read on your hair?
            </h2>
            <p className="mt-3 text-sm text-[rgb(var(--text-secondary))] leading-relaxed sm:text-base">
              Structured intake, optional photos and labs, and specialist interpretation — typically within 48 hours.
            </p>
            <div className="mt-8">
              <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
            </div>
          </div>
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
