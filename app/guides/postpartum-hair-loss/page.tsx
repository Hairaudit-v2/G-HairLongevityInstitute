import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import { GuideLibraryAssessmentCTA } from "@/components/guides/GuideLibraryAssessmentCTA";
import { GuideRelatedGuides } from "@/components/guides/GuideRelatedGuides";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, SecondaryButton } from "@/components/public/PublicCTA";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  POSTPARTUM_GUIDE_PDF_DOWNLOAD_AS,
  POSTPARTUM_GUIDE_PDF_HREF,
} from "@/lib/guides/postpartumGuidePdf";

const MAIN_INSIGHT = "/insights/postpartum-shedding-when-to-reassure-vs-when-to-test";

const READ_SECTIONS: { href: string; label: string }[] = [
  { href: `${MAIN_INSIGHT}#normal-postpartum-shedding`, label: "Why postpartum shedding happens" },
  { href: `${MAIN_INSIGHT}#when-reassurance-fits`, label: "What is usually normal vs when to watch closely" },
  { href: `${MAIN_INSIGHT}#red-flags-testing`, label: "When deeper investigation may be appropriate" },
  { href: `${MAIN_INSIGHT}#overlap-thyroid-iron`, label: "Thyroid, ferritin, recovery strain, and overlap factors" },
  { href: `${MAIN_INSIGHT}#hair-cycle-timelines`, label: "How recovery timelines often unfold" },
  { href: `${MAIN_INSIGHT}#partner-with-clinician`, label: "Practical next steps and when to seek help" },
];

const COVERS = [
  "How postpartum hair shedding happens after hormonal transition following birth",
  "What is usually normal, and which patterns or symptoms deserve closer attention",
  "The role of hormones, thyroid function, ferritin status, stress load, and family history",
  "How expected recovery timelines vary from person to person",
  "When postpartum shedding may overlap with or reveal female pattern thinning",
  "Supportive, evidence-based next steps — and when clinical review adds value",
];

const RELATED = [
  {
    href: "/guides/hair-longevity",
    category: "Foundational Guide",
    title: "The Complete Guide to Hair Longevity",
    description: "Broad biology-first context before narrowing into postpartum shedding and recovery.",
  },
  {
    href: "/guides/male-pattern-hair-loss",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description: "A parallel guide for pattern-driven thinning, progression, and evidence-based treatment framing.",
  },
  {
    href: "/guides/androgen-index",
    category: "Hormones & Hair",
    title: "Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women",
    description: "How hormones, follicular sensitivity, and androgen biology fit into broader hair-loss assessment.",
  },
];

const wrap = "mx-auto max-w-2xl";

export const metadata: Metadata = buildPageMetadata({
  path: "/guides/postpartum-hair-loss",
  title: "The Truth About Postpartum Hair Loss",
  metaDescription:
    "A clinically grounded guide to postpartum hair loss: why shedding happens, what is normal, recovery timelines, when thyroid or iron may matter, and when further assessment is worth considering.",
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 sm:py-20" aria-labelledby="pp-guide-hero">
        <Container>
          <div className={`${wrap} text-center`}>
            <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">Women&apos;s Hair Health</p>
            <h1
              id="pp-guide-hero"
              className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-[2.25rem]"
              style={{ lineHeight: 1.2 }}
            >
              The Truth About Postpartum Hair Loss
            </h1>
            <p className="mt-5 text-base text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
              A clinically grounded guide to understanding postpartum shedding, recovery timelines, hormonal and genetic
              influences, when further assessment matters, and how to support healthier regrowth.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <SecondaryButton href={MAIN_INSIGHT}>Continue reading</SecondaryButton>
              <SecondaryButton href={POSTPARTUM_GUIDE_PDF_HREF} download={POSTPARTUM_GUIDE_PDF_DOWNLOAD_AS}>
                Download PDF
              </SecondaryButton>
            </div>
            <p className="mt-6 text-sm text-[rgb(var(--text-muted))] leading-relaxed">
              Read online from the top or keep the PDF for offline reference during recovery.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="pp-why">
        <Container>
          <div className={wrap}>
            <h2 id="pp-why" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Why this guide matters
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Postpartum shedding is common, but the experience can still feel alarming. This guide offers calm,
              medically grounded context on what usually happens after birth, what recovery often looks like, how thyroid,
              ferritin, genetics, and stress can change the picture, and when reassurance should give way to deeper
              review.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="pp-covers">
        <Container>
          <div className={wrap}>
            <h2 id="pp-covers" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="pp-read">
        <Container>
          <div className={wrap}>
            <h2 id="pp-read" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Read online — guided entry points
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The full article can be read start-to-finish or section-by-section, depending on whether you want a quick
              check-in or a deeper understanding of recovery and overlap factors.
            </p>
            <ul className="mt-6 space-y-2">
              {READ_SECTIONS.map((section) => (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    className="rounded-sm text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={MAIN_INSIGHT}
                  className="rounded-sm text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
                >
                  Open the full article from the top →
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="pp-who">
        <Container>
          <div className={wrap}>
            <h2 id="pp-who" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Who this guide is for
            </h2>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              <li>Women moving through postpartum recovery who want a clearer picture of what shedding usually means</li>
              <li>Women with prolonged shedding who are unsure whether timing still fits a normal recovery window</li>
              <li>Women with a family history of female pattern thinning who want to understand possible overlap</li>
              <li>Anyone trying to work out whether their current shedding reflects normal recovery or something more persistent</li>
            </ul>
          </div>
        </Container>
      </section>

      <GuideRelatedGuides items={RELATED} headingId="pp-related" />

      <GuideLibraryAssessmentCTA startHref={startHref} headingId="pp-assessment-cta" />

      <Container>
        <div className="py-10">
          <PublicFooter theme="light" />
        </div>
      </Container>
    </main>
  );
}
