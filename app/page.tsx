// app/page.tsx — Patient-first, light homepage (audited: redundant content relocated to /science, /how-it-works, /for-professionals)
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton } from "@/components/public/PublicCTA";
import { HliGuidesResourceSection } from "@/components/public/HliGuidesResourceSection";
import { GlobalHairIntelligenceSection } from "@/components/ecosystem/GlobalHairIntelligenceSection";
import { ExpandableDetailPanel } from "@/components/ExpandableDetail";
import { ResultsPreviewCard } from "@/components/public/ResultsPreviewCard";
import HomeFaqJsonLd from "@/components/editorial/HomeFaqJsonLd";
import { ConversionFaqList } from "@/components/public/ConversionFaqList";
import { HLI_CONVERSION_FAQ_ITEMS } from "@/lib/content/hliConversionFaq";
import { HLI_PRICING_SUMMARY_LINES } from "@/lib/content/hliPatientPricing";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/",
  title: "Free hair analysis & biology-first planning",
  metaDescription:
    "Free initial hair analysis — no referral required. Personalised review backed by biology; add bloods or photos when you are ready. Optional paid support after your first review — typically 48 hours to your plan.",
  appendBrand: true,
});

const startHref = () => (isLongevityEnabled() ? "/longevity/start" : "/start");

// —— 1. HERO ——
const HERO_REASSURANCE_POINTS = [
  "Free initial analysis",
  "No referral required",
  "Bloods and photos can be added later",
] as const;

const HERO_TRUST_STRIP = [
  { label: "Turnaround", value: "Usually within 12–24 hours" },
  { label: "Approach", value: "Biology-first clinical review" },
  { label: "Next step", value: "Paid support only if you need it" },
] as const;

const WHAT_HAPPENS_NEXT = [
  "Create your secure account",
  "Complete your free intake",
  "Upload bloods or photos if available",
  "Receive your personalised review",
  "Upgrade only if you need added support",
] as const;

const RESULTS_VISUAL_POINTS = [
  { label: "Hair Risk Score", detail: "A cleaner snapshot of stability, risk context, and next-step priorities." },
  { label: "Written interpretation", detail: "Not just numbers: your report explains what matters and why." },
  { label: "Actionable plan", detail: "A grounded path forward to discuss with your GP or prescriber when needed." },
] as const;

const CONCERN_PATHWAYS = [
  {
    title: "Postpartum or sudden shedding",
    description: "A softer starting point for heavy shedding after pregnancy, illness, stress, or a major hormonal shift.",
    href: "/guides/postpartum-hair-loss",
  },
  {
    title: "Diffuse thinning or widening part",
    description: "Understand slower, harder-to-explain thinning patterns in women without losing the medical detail.",
    href: "/insights/diffuse-thinning-in-women",
  },
  {
    title: "Ferritin, thyroid, or hormones",
    description: "Explore blood-marker and hormone questions in plain language before you decide what to do next.",
    href: "/insights/what-blood-tests-matter-for-hair-loss",
  },
  {
    title: "Unsure what is driving it",
    description: "Browse the main causes of hair shedding and thinning, with clear links into deeper guides and insights.",
    href: "/hair-loss-causes",
  },
] as const;

const SURFACE_CARD =
  "rounded-[1.5rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(249,246,242,0.94)_100%)] shadow-soft";

const INTERACTIVE_SURFACE_CARD = `${SURFACE_CARD} motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none`;

const SECTION_HEADING_COPY =
  'mx-auto mt-4 max-w-xl text-center text-[rgb(var(--text-secondary))] sm:text-lg';

function HeroSection({ startHref: href }: { startHref: string }) {
  return (
    <section className="relative overflow-hidden bg-card">
      <Container>
        <div className="relative py-8 sm:py-12 md:py-14">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[rgb(var(--bg-dark))] shadow-[0_28px_80px_rgba(12,18,28,0.22)]">
            <Image
              src="/homepage/hli-hero-editorial-portrait.svg"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover object-right"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,18,29,0.995)_0%,rgba(10,18,29,0.985)_24%,rgba(10,18,29,0.95)_44%,rgba(10,18,29,0.82)_60%,rgba(10,18,29,0.52)_78%,rgba(10,18,29,0.22)_100%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_82%_76%_at_18%_0%,rgba(198,167,94,0.14),transparent_48%),radial-gradient(ellipse_70%_60%_at_78%_20%,rgba(255,255,255,0.05),transparent_55%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-full max-w-[52rem] bg-[linear-gradient(180deg,rgba(7,13,22,0.18)_0%,rgba(7,13,22,0.04)_100%)]"
              aria-hidden
            />
            <div className="relative grid gap-6 p-6 sm:gap-8 sm:p-8 md:p-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.86fr)] lg:items-center lg:p-12">
              <div className="max-w-3xl lg:pr-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgb(var(--gold))]">
                  Biology-first hair support
                </p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
                  Free, personalised hair analysis — no referral required
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-white/92 sm:mt-5 sm:text-[1.3rem]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
                  Start with a complimentary clinical review after your intake. Blood tests and scalp photos can be added later. Optional paid support is available only after your initial review, if you choose it.
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/78 sm:text-base">
                  Read first, start a guided analysis, bring blood results into context, and add an appointment only if it helps.
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
                  {HERO_REASSURANCE_POINTS.map((item) => (
                    <span
                      key={item}
                      className="inline-flex min-h-[44px] items-center rounded-full border border-white/16 bg-white/12 px-4 py-2 text-sm font-medium text-white/94 shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-col items-start gap-3 sm:mt-9">
                  <PrimaryButton href={href} className="w-full sm:w-auto">
                    Start My Hair Analysis
                  </PrimaryButton>
                  <p className="flex flex-col gap-2 text-sm leading-relaxed text-white/78 sm:flex-row sm:flex-wrap sm:items-center sm:gap-0">
                    Prefer to read first?{" "}
                    <a
                      href="#how-it-works"
                      className="inline-flex min-h-[44px] items-center font-medium text-[rgb(var(--gold))] underline-offset-2 transition hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/35 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-dark))] rounded-sm"
                    >
                      See how it works
                    </a>
                    <span className="mx-2 text-white/36" aria-hidden>
                      ·
                    </span>
                    <Link
                      href="/guides"
                      className="inline-flex min-h-[44px] items-center font-medium text-white/90 underline-offset-2 transition hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/35 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-dark))] rounded-sm"
                    >
                      Browse guides
                    </Link>
                  </p>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {HERO_TRUST_STRIP.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.25rem] border border-white/14 bg-black/18 px-4 py-4 shadow-[0_18px_34px_rgba(0,0,0,0.14)]"
                    >
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-white/92">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.9rem] border border-white/14 bg-[linear-gradient(180deg,rgba(17,27,40,0.94)_0%,rgba(17,27,40,0.88)_100%)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--gold))]">
                  A calmer place to start
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  What happens next
                </h2>
                <p className="mt-3 text-sm text-white/88 sm:text-base" style={{ lineHeight: "var(--line-height-relaxed)" }}>
                  You do not need to organise everything before you begin. Start with the basics and add more detail only when it helps.
                </p>
                <ol className="mt-5 space-y-3 sm:mt-6">
                  {WHAT_HAPPENS_NEXT.map((step, index) => (
                    <li key={step} className="flex gap-3 rounded-[1.15rem] border border-white/12 bg-black/18 px-4 py-3.5 text-sm text-white/92">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--gold))]/22 text-xs font-semibold text-[rgb(var(--gold))]">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 rounded-[1.15rem] border border-white/12 bg-white/10 px-4 py-4">
                  <p className="text-sm leading-relaxed text-white/84">
                    You can begin with only the basics, then add blood results or photos later if they help clarify the picture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ConcernPathwaysSection() {
  return (
    <section className="border-t border-[rgb(var(--border-soft))] bg-subtle py-14 sm:py-16" aria-labelledby="concern-pathways-heading">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium tracking-[0.14em] text-[rgb(var(--gold))]">Common starting points</p>
          <h2 id="concern-pathways-heading" className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
            Start from the concern that feels most familiar
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            Many people arrive feeling overwhelmed by postpartum shedding, diffuse thinning, ferritin questions, thyroid shifts, or stress-linked hair changes. These guided pathways help you begin in a more human way without losing clinical depth.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 sm:gap-5 sm:grid-cols-2">
          {CONCERN_PATHWAYS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${INTERACTIVE_SURFACE_CARD} group flex h-full flex-col rounded-[1.6rem] p-5 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[rgb(var(--gold))]/25 motion-safe:hover:shadow-card focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/35 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-subtle))] active:scale-[0.995] sm:p-6`}
              >
                <span className="inline-flex w-fit rounded-full bg-[rgb(var(--gold))]/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold-dark))]">
                  Guided reading path
                </span>
                <span className="mt-3 text-lg font-semibold text-[rgb(var(--text-primary))] group-hover:text-medical">
                  {item.title}
                </span>
                <span className="mt-3 flex-1 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                  {item.description}
                </span>
                <span className="mt-5 text-sm font-semibold text-medical">Open path →</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// —— 2. HOW IT WORKS (3 steps; full process on /how-it-works) ——
const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Answer a few questions",
    description: "Short guided intake about your history and goals.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Upload photos (optional)",
    description: "Add hair photos and blood tests if you have them.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Receive your personalised plan",
    description: "Clear interpretation and next steps. Most cases are reviewed within 12–24 hours after complete submission.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-card py-14 sm:py-16" aria-labelledby="how-it-works-heading">
      <Container>
        <h2 id="how-it-works-heading" className="text-center text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
          How it works
        </h2>
        <p className={SECTION_HEADING_COPY} style={{ lineHeight: "var(--line-height-relaxed)" }}>
          Three simple steps to your personalised plan.
        </p>
        <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className={`${SURFACE_CARD} flex flex-col items-center px-5 py-6 text-center sm:py-7`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(var(--gold))]/12 text-[rgb(var(--gold-dark))]">
                {item.icon}
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">
                Step {item.step}
              </p>
              <h3 className="mt-5 text-lg font-semibold text-[rgb(var(--text-primary))]">{item.title}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center">
          <ExpandableDetailPanel variant="clinical" label="Clinical detail">
            <p className="mb-3 text-[rgb(var(--text-secondary))]">Behind the three steps:</p>
            <ul className="space-y-2 text-sm">
              <li><strong className="text-[rgb(var(--text-primary))]">Triage</strong> — Every case is prioritised and routed to a senior trichologist (30+ years experience).</li>
              <li><strong className="text-[rgb(var(--text-primary))]">Review</strong> — One specialist interprets intake, bloods, and photos using our biological framework.</li>
              <li><strong className="text-[rgb(var(--text-primary))]">Summary</strong> — Written diagnostic summary and next-step recommendations, typically within 12–24 hours, depending on completeness and case complexity.</li>
            </ul>
          </ExpandableDetailPanel>
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-[rgb(var(--gold))] underline-offset-2 transition hover:text-[rgb(var(--gold-dark))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/35 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
          >
            Full process and turnaround →
          </Link>
        </p>
      </Container>
    </section>
  );
}

// —— 3. GLOBAL HAIR INTELLIGENCE NETWORK (shared section, one per page) ——
function GlobalHairIntelligenceNetworkBlock() {
  return (
    <GlobalHairIntelligenceSection
      variant="hli"
      heading="Global Hair Intelligence Network"
      description="A connected system for biology, treatment, and surgical transparency."
      size="hero"
      theme="light"
    />
  );
}

// —— 4. WHAT WE ANALYSE ——
const WHAT_WE_ANALYSE = [
  {
    title: "Hormones",
    line: "Androgen sensitivity and hormone balance.",
    accent: "Hormone mapping",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v18m6-12c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6z" />
      </svg>
    ),
  },
  {
    title: "Nutrients",
    line: "Iron, vitamins and minerals that support hair.",
    accent: "Blood context",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.5 6.75h3m-7.5 4.5h12m-9 4.5h6M7.5 3.75h9A2.25 2.25 0 0118.75 6v12A2.25 2.25 0 0116.5 20.25h-9A2.25 2.25 0 015.25 18V6A2.25 2.25 0 017.5 3.75z" />
      </svg>
    ),
  },
  {
    title: "Scalp health",
    line: "Inflammation and follicle environment.",
    accent: "Scalp environment",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.5c3.866 0 7 2.91 7 6.5S15.866 17.5 12 17.5 5 14.59 5 11s3.134-6.5 7-6.5zm0 0v13.5m-3.5 0h7" />
      </svg>
    ),
  },
  {
    title: "Genetics",
    line: "Pattern and progression context.",
    accent: "Risk profile",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 4.5c0 1.657 1.343 3 3 3s3-1.343 3-3m-6 15c0-1.657 1.343-3 3-3s3 1.343 3 3M9 7.5c0 1.657 1.343 3 3 3s3 1.343 3 3-1.343 3-3 3-3 1.343-3 3" />
      </svg>
    ),
  },
];

function WhatWeAnalyseSection() {
  return (
    <section id="what-we-analyse" className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-card py-14 sm:py-16" aria-labelledby="analyse-heading">
      <Container>
        <h2 id="analyse-heading" className="text-center text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
          What we analyse
        </h2>
        <p className={SECTION_HEADING_COPY} style={{ lineHeight: "var(--line-height-relaxed)" }}>
          Key factors that influence your hair — in plain language.
        </p>
        <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_WE_ANALYSE.map((item) => (
            <div
              key={item.title}
              className={`${INTERACTIVE_SURFACE_CARD} relative overflow-hidden p-5 motion-safe:hover:border-[rgb(var(--gold))]/20 motion-safe:hover:shadow-card sm:p-6`}
            >
              <div
                className="pointer-events-none absolute right-4 top-4 h-20 w-20 rounded-full border border-[rgb(var(--gold))]/10 bg-[radial-gradient(circle_at_center,rgba(198,167,94,0.14),rgba(198,167,94,0.02)_55%,transparent_72%)]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute right-8 top-8 h-10 w-10 rounded-full border border-[rgb(var(--gold))]/12"
                aria-hidden
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-[rgb(var(--gold))]/14 bg-[linear-gradient(180deg,rgba(198,167,94,0.16)_0%,rgba(198,167,94,0.06)_100%)] text-[rgb(var(--gold-dark))] shadow-[0_14px_28px_rgba(198,167,94,0.08)]">
                  {item.icon}
                </div>
                <span className="inline-flex rounded-full border border-[rgb(var(--border-soft))] bg-white/90 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
                  {item.accent}
                </span>
              </div>
              <h3 className="relative mt-5 font-semibold text-[rgb(var(--text-primary))]">{item.title}</h3>
              <p className="relative mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{item.line}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center">
          <ExpandableDetailPanel variant="clinical">
            <ul className="space-y-2 text-sm">
              <li><strong className="text-[rgb(var(--text-primary))]">DHT pathways</strong> — 5-alpha reductase, androgen receptor sensitivity, and how they affect the follicle.</li>
              <li><strong className="text-[rgb(var(--text-primary))]">Thyroid markers</strong> — TSH, T3/T4, conversion; impact on growth cycle.</li>
              <li><strong className="text-[rgb(var(--text-primary))]">Iron / ferritin thresholds</strong> — serum ferritin and iron studies in relation to hair shedding.</li>
              <li><strong className="text-[rgb(var(--text-primary))]">Inflammatory markers</strong> — CRP, scalp environment, and chronic inflammation.</li>
            </ul>
          </ExpandableDetailPanel>
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/science"
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-[rgb(var(--gold))] underline-offset-2 transition hover:text-[rgb(var(--gold-dark))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/35 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
          >
            Explore our science →
          </Link>
        </p>
      </Container>
    </section>
  );
}

// —— 5. RESULTS PREVIEW (show value before signup; mock data, easily replaceable with real) ——
function ResultsPreviewSection() {
  return (
    <section id="results" className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-subtle py-14 sm:py-16" aria-labelledby="results-heading">
      <Container>
        <h2 id="results-heading" className="text-center text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
          Your results, in one place
        </h2>
        <p className={SECTION_HEADING_COPY} style={{ lineHeight: "var(--line-height-relaxed)" }}>
          A clear snapshot and a path forward. Most cases are reviewed within 12–24 hours after complete submission.
        </p>
        <div className="mx-auto mt-10 grid max-w-6xl gap-8 sm:mt-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <div className="rounded-[1.85rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(242,236,229,0.94)_100%)] p-6 shadow-[0_18px_52px_rgba(0,0,0,0.07)] sm:p-7">
            <div className="overflow-hidden rounded-[1.45rem] border border-[rgb(var(--border-soft))] bg-[rgb(var(--bg-dark))] shadow-[0_16px_34px_rgba(8,16,28,0.18)]">
              <Image
                src="/homepage/hli-results-report-visual.svg"
                alt="Illustrated preview of an HLI report and analysis dashboard."
                width={1200}
                height={900}
                className="h-auto w-full contrast-110 saturate-[1.03]"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>
            <div className="mt-6 space-y-3">
              {RESULTS_VISUAL_POINTS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.1rem] border border-[rgb(var(--border-soft))] bg-white/96 px-4 py-3.5"
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold-dark))]">
                    {item.label}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto w-full max-w-xl">
            <ResultsPreviewCard />
            <div className="mt-6 flex justify-center">
              <ExpandableDetailPanel variant="clinical" label="What the score means">
                <p className="text-[rgb(var(--text-secondary))]">The Hair Risk Score and related indices (e.g. DHT Risk Index™, Follicle Stability Rating™) are derived from your biology and history. They are interpretive tools to guide strategy — not diagnostic labels. Your report includes written interpretation and next-step recommendations.</p>
              </ExpandableDetailPanel>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function PricingClaritySection() {
  return (
    <section className="border-t border-[rgb(var(--border-soft))] bg-card py-14 sm:py-16" aria-labelledby="pricing-clarity-heading">
      <Container>
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,240,235,0.92)_100%)] p-5 shadow-[0_20px_54px_rgba(0,0,0,0.06)] sm:p-8">
          <p className="text-sm font-medium tracking-[0.14em] text-[rgb(var(--gold))]">Pricing clarity</p>
          <h2 id="pricing-clarity-heading" className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl">
            How pricing works
          </h2>
          <p className="mt-4 text-[rgb(var(--text-secondary))]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            Keep the first step simple. Your initial analysis is free, and any paid pathway is optional only after your first review.
          </p>
          <ul className="mt-6 space-y-3">
            {HLI_PRICING_SUMMARY_LINES.map((line) => (
              <li
                key={line}
                className="flex gap-3 rounded-[1.15rem] border border-[rgb(var(--border-soft))]/80 bg-white/80 px-4 py-3.5 text-sm leading-relaxed text-[rgb(var(--text-secondary))]"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[rgb(var(--gold))]/60" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link
              href="/pricing"
              className="text-sm font-semibold text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
            >
              Full pricing details
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}

// —— 6. TRUST (merged, concise) ——
const TRUST_ITEMS = [
  { title: "Clinical expertise", detail: "30+ years international trichology and hair restoration." },
  { title: "Evidence-based", detail: "Biology-first mapping and clear strategy." },
  { title: "Global standards", detail: "Protocols and training used worldwide." },
];

function TrustSection() {
  return (
    <section className="border-t border-[rgb(var(--border-soft))] bg-card py-14 sm:py-16" aria-labelledby="trust-heading">
      <Container>
        <h2 id="trust-heading" className="text-center text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
          Built on 30+ years of clinical experience
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
          Calm presentation matters when hair changes feel personal. The experience is designed to feel guided and reassuring, while the interpretation stays medically serious and evidence-aware.
        </p>
        <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-3">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className={`${SURFACE_CARD} p-5 text-center sm:p-6`}>
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{item.title}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <ExpandableDetailPanel variant="clinical" label="Methodology & scope">
            <p className="text-[rgb(var(--text-secondary))]">We use evidence-based biological reasoning and a structured framework (Follicle Intelligence™) for case interpretation. We do not prescribe; we interpret and recommend. Prescriptions require your local doctor or a partnered prescriber. For clinician training and surgical audit, see our ecosystem partners (IIOHR, HairAudit).</p>
          </ExpandableDetailPanel>
        </div>
        <p className="mt-8 text-center text-sm text-[rgb(var(--text-muted))]">
          <Link
            href="/for-professionals"
            className="inline-flex min-h-[44px] items-center font-medium text-medical underline-offset-2 transition hover:text-[rgb(var(--text-primary))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/35 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
          >
            For clinicians and referrers →
          </Link>
        </p>
      </Container>
    </section>
  );
}

// —— 7. FINAL CTA (single primary CTA) ——
function FinalCTASection({ startHref: href }: { startHref: string }) {
  return (
    <section className="border-t border-[rgb(var(--border-soft))] bg-subtle py-14 sm:py-16" aria-labelledby="final-cta-heading">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="final-cta-heading" className="text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
            Begin with a free hair analysis
          </h2>
          <p className="mt-5 text-[rgb(var(--text-secondary))]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            Create a secure account, complete your intake, and receive your personalised review. Most cases are reviewed within 12–24 hours after complete submission. No referral required. Optional paid support is there if you need it after your first review.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <PrimaryButton href={href} className="w-full sm:w-auto">
              Start My Hair Analysis
            </PrimaryButton>
            <Link
              href={href}
              className="inline-flex min-h-[44px] items-center text-sm font-medium text-medical underline-offset-2 transition hover:text-[rgb(var(--text-primary))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-subtle))] rounded-sm"
            >
              Create Secure Account to Start Your Analysis
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

// —— CONVERSION FAQ ——
function FAQSection() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-subtle py-14 sm:py-16" aria-labelledby="faq-heading">
      <Container>
        <ConversionFaqList
          embedded
          variant="light"
          heading="Questions before you start"
          headingId="faq-heading"
        />
        <p className="mt-8 text-center text-sm text-[rgb(var(--text-muted))]">
          <Link
            href="/how-it-works"
            className="inline-flex min-h-[44px] items-center font-medium text-medical underline-offset-2 transition hover:text-[rgb(var(--text-primary))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/35 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-subtle))] rounded-sm"
          >
            More on process and turnaround
          </Link>
          <span className="mx-2 text-[rgb(var(--text-muted))]/80" aria-hidden>
            ·
          </span>
          <Link
            href="/pricing"
            className="inline-flex min-h-[44px] items-center font-medium text-medical underline-offset-2 transition hover:text-[rgb(var(--text-primary))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/35 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-subtle))] rounded-sm"
          >
            Pricing
          </Link>
        </p>
      </Container>
    </section>
  );
}

// —— PAGE ——
export default function Page() {
  const useLongevity = isLongevityEnabled();
  const href = startHref();

  return (
    <main className="min-h-screen bg-page">
      <HomeFaqJsonLd
        items={HLI_CONVERSION_FAQ_ITEMS.map(({ q, a }) => ({ question: q, answer: a }))}
      />
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={href}
        ctaLabel="Start My Hair Analysis"
        theme="light"
      />

      <HeroSection startHref={href} />
      <ConcernPathwaysSection />
      <HowItWorksSection />
      <GlobalHairIntelligenceNetworkBlock />
      <WhatWeAnalyseSection />
      <ResultsPreviewSection />
      <PricingClaritySection />
      <TrustSection />
      <HliGuidesResourceSection />
      <FinalCTASection startHref={href} />
      <FAQSection />

      <Container>
        <PublicFooter theme="light" />
      </Container>
    </main>
  );
}
