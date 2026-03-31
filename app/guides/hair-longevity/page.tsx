import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  HAIR_LONGEVITY_GUIDE_PDF_DOWNLOAD_AS,
  HAIR_LONGEVITY_GUIDE_PDF_HREF,
} from "@/lib/guides/hliGuidePdfs";

const READ_PATHS = [
  {
    href: "/science",
    title: "Science & biology",
    line: "How we think about pattern, shedding, hormones, and scalp context.",
  },
  {
    href: "/how-it-works",
    title: "How HLI works",
    line: "Intake, review, and what you receive — typically within 48 hours.",
  },
  {
    href: "/insights",
    title: "Patient guides",
    line: "Deeper articles on tests, treatments, and common hair-loss questions.",
  },
] as const;

export const metadata: Metadata = buildPageMetadata({
  path: "/guides/hair-longevity",
  title: "The Complete Guide to Hair Longevity",
  metaDescription:
    "A foundational overview: how hair loss works, common causes, early signs, tests worth discussing, and evidence-based options — from the Hair Longevity Institute.",
  appendBrand: true,
});

export default function HairLongevityFoundationalGuidePage() {
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 sm:py-20" aria-labelledby="foundational-guide-heading">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">Foundational Guide</p>
            <h1
              id="foundational-guide-heading"
              className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-[2.25rem]"
              style={{ lineHeight: 1.2 }}
            >
              The Complete Guide to Hair Longevity
            </h1>
            <p className="mt-5 text-base text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
              Understand how hair loss works, the most common causes of thinning and shedding, what early signs matter,
              which tests are worth considering, and what evidence-based options may actually help. Download the full guide
              as a PDF, or use the paths below as a web curriculum.
            </p>
            <div className="mt-10 flex justify-center">
              <SecondaryButton href={HAIR_LONGEVITY_GUIDE_PDF_HREF} download={HAIR_LONGEVITY_GUIDE_PDF_DOWNLOAD_AS}>
                Read the Guide
              </SecondaryButton>
            </div>
          </div>

          <ul className="mx-auto mt-14 grid max-w-4xl list-none gap-4 p-0 sm:grid-cols-3 sm:gap-5">
            {READ_PATHS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col rounded-card border border-[rgb(var(--border-soft))] bg-subtle/50 p-5 shadow-soft transition hover:border-[rgb(var(--gold))]/25 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
                >
                  <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{item.title}</span>
                  <span className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">{item.line}</span>
                  <span className="mt-3 text-sm font-medium text-medical">Read →</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-[rgb(var(--text-muted))]">
            For topic-specific downloads, see{" "}
            <Link href="/guides" className="font-medium text-medical underline-offset-2 hover:underline">
              all guides
            </Link>
            .
          </p>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="foundational-next-heading">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2 id="foundational-next-heading" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Ready for a personalised plan?
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
