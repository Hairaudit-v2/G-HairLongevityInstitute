// app/page.tsx — Patient-first, light homepage (audited: redundant content relocated to /science, /how-it-works, /for-professionals)
import type { Metadata } from "next";
import Link from "next/link";
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
const WHAT_HAPPENS_NEXT = [
  "Create your secure account",
  "Complete your free intake",
  "Upload bloods or photos if available",
  "Receive your personalised review",
  "Upgrade only if you need added support",
] as const;

function HeroSection({ startHref: href }: { startHref: string }) {
  return (
    <section className="relative overflow-hidden bg-card">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(198,167,94,0.06),transparent_55%)]" aria-hidden />
      <Container>
        <div className="relative mx-auto max-w-3xl py-16 text-center sm:py-20 md:py-24">
          <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-5xl" style={{ lineHeight: 1.2 }}>
            Free, personalised hair analysis — no referral required
          </h1>
          <p className="mt-5 text-lg text-[rgb(var(--text-secondary))] sm:text-xl" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            Start with a complimentary clinical review after your intake. Blood tests and scalp photos can be added later. Optional paid support is available only after your initial review — if you choose it.
          </p>
          <p className="mt-4 text-sm text-[rgb(var(--text-muted))] sm:text-base" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            Free initial analysis · No referral · Bloods and photos when you are ready · Paid pathways optional
          </p>

          <div
            className="mx-auto mt-10 max-w-md rounded-card border border-[rgb(var(--border-soft))] bg-subtle/60 px-5 py-5 text-left shadow-soft sm:px-6"
            aria-labelledby="pricing-clarity-heading"
          >
            <h2 id="pricing-clarity-heading" className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--text-muted))]">
              How pricing works
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-[rgb(var(--text-primary))]">
              {HLI_PRICING_SUMMARY_LINES.map((line) => (
                <li key={line} className="leading-snug">
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-center">
              <Link
                href="/pricing"
                className="text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
              >
                Full pricing details
              </Link>
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <PrimaryButton href={href}>Start Free Hair Analysis</PrimaryButton>
            <a
              href="#how-it-works"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn border border-[rgb(var(--medical))]/25 bg-card px-6 py-3 text-sm font-semibold text-medical shadow-soft transition hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
            >
              How It Works
            </a>
          </div>
          <p className="mt-4 max-w-lg mx-auto">
            <Link
              href={href}
              className="text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
            >
              Create Secure Account to Start Free Analysis
            </Link>
          </p>

          <div className="mx-auto mt-10 max-w-lg rounded-card border border-[rgb(var(--border-soft))] bg-card px-5 py-6 text-left shadow-soft sm:px-6">
            <h2 className="text-center text-sm font-semibold tracking-wide text-[rgb(var(--text-primary))]">
              What happens next
            </h2>
            <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm text-[rgb(var(--text-secondary))] marker:font-medium marker:text-[rgb(var(--gold))]">
              {WHAT_HAPPENS_NEXT.map((step) => (
                <li key={step} className="leading-relaxed pl-1">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-8 text-sm text-[rgb(var(--text-muted))]">
            Most people receive their personalised review within 48 hours of a complete submission.
          </p>
        </div>
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
    description: "Clear interpretation and next steps, usually within 48 hours.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="how-it-works-heading">
      <Container>
        <h2 id="how-it-works-heading" className="text-center text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[rgb(var(--text-secondary))]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
          Three simple steps to your personalised plan.
        </p>
        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-card bg-[rgb(var(--gold))]/10 text-[rgb(var(--gold))]">
                {item.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[rgb(var(--text-primary))]">{item.title}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center">
          <ExpandableDetailPanel variant="clinical" label="Clinical detail">
            <p className="mb-3 text-neutral-700">Behind the three steps:</p>
            <ul className="space-y-2 text-sm">
              <li><strong className="text-neutral-800">Triage</strong> — Every case is prioritised and routed to a senior trichologist (30+ years experience).</li>
              <li><strong className="text-neutral-800">Review</strong> — One specialist interprets intake, bloods, and photos using our biological framework.</li>
              <li><strong className="text-neutral-800">Summary</strong> — Written diagnostic summary and next-step recommendations, typically within 48 hours of complete submission.</li>
            </ul>
          </ExpandableDetailPanel>
        </div>
        <p className="mt-8 text-center">
          <Link href="/how-it-works" className="text-sm font-medium text-[rgb(var(--gold))] hover:underline">
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
  { title: "Hormones", line: "Androgen sensitivity and hormone balance.", icon: "H" },
  { title: "Nutrients", line: "Iron, vitamins and minerals that support hair.", icon: "N" },
  { title: "Scalp health", line: "Inflammation and follicle environment.", icon: "S" },
  { title: "Genetics", line: "Pattern and progression context.", icon: "G" },
];

function WhatWeAnalyseSection() {
  return (
    <section id="what-we-analyse" className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="analyse-heading">
      <Container>
        <h2 id="analyse-heading" className="text-center text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
          What we analyse
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[rgb(var(--text-secondary))]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
          Key factors that influence your hair — in plain language.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_WE_ANALYSE.map((item) => (
            <div
              key={item.title}
              className="rounded-card border border-[rgb(var(--border-soft))] bg-subtle/50 p-6 shadow-soft transition hover:border-[rgb(var(--gold))]/20 hover:shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[rgb(var(--gold))]/10 text-sm font-semibold text-[rgb(var(--gold))]">
                {item.icon}
              </div>
              <h3 className="mt-4 font-semibold text-[rgb(var(--text-primary))]">{item.title}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{item.line}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center">
          <ExpandableDetailPanel variant="clinical">
            <ul className="space-y-2 text-sm">
              <li><strong className="text-neutral-800">DHT pathways</strong> — 5-alpha reductase, androgen receptor sensitivity, and how they affect the follicle.</li>
              <li><strong className="text-neutral-800">Thyroid markers</strong> — TSH, T3/T4, conversion; impact on growth cycle.</li>
              <li><strong className="text-neutral-800">Iron / ferritin thresholds</strong> — serum ferritin and iron studies in relation to hair shedding.</li>
              <li><strong className="text-neutral-800">Inflammatory markers</strong> — CRP, scalp environment, and chronic inflammation.</li>
            </ul>
          </ExpandableDetailPanel>
        </div>
        <p className="mt-8 text-center">
          <Link href="/science" className="text-sm font-medium text-[rgb(var(--gold))] hover:underline">
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
    <section id="results" className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="results-heading">
      <Container>
        <h2 id="results-heading" className="text-center text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
          Your results, in one place
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[rgb(var(--text-secondary))]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
          A clear snapshot and a path forward — usually within 48 hours.
        </p>
        <div className="mx-auto mt-12 max-w-xl">
          <ResultsPreviewCard />
          <div className="mt-6 flex justify-center">
            <ExpandableDetailPanel variant="clinical" label="What the score means">
              <p className="text-neutral-700">The Hair Risk Score and related indices (e.g. DHT Risk Index™, Follicle Stability Rating™) are derived from your biology and history. They are interpretive tools to guide strategy — not diagnostic labels. Your report includes written interpretation and next-step recommendations.</p>
            </ExpandableDetailPanel>
          </div>
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
    <section className="border-t border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="trust-heading">
      <Container>
        <h2 id="trust-heading" className="text-center text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
          Built on 30+ years of clinical experience
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="rounded-card border border-[rgb(var(--border-soft))] bg-subtle/50 p-6 text-center shadow-soft">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">{item.title}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <ExpandableDetailPanel variant="clinical" label="Methodology & scope">
            <p className="text-neutral-700">We use evidence-based biological reasoning and a structured framework (Follicle Intelligence™) for case interpretation. We do not prescribe; we interpret and recommend. Prescriptions require your local doctor or a partnered prescriber. For clinician training and surgical audit, see our ecosystem partners (IIOHR, HairAudit).</p>
          </ExpandableDetailPanel>
        </div>
        <p className="mt-8 text-center text-sm text-[rgb(var(--text-muted))]">
          <Link href="/for-professionals" className="font-medium text-medical hover:text-[rgb(var(--text-primary))]">
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
    <section className="border-t border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="final-cta-heading">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="final-cta-heading" className="text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
            Begin with a free hair analysis
          </h2>
          <p className="mt-5 text-[rgb(var(--text-secondary))]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            Create a secure account, complete your intake, and receive your personalised review. No referral required. Optional paid support is there if you need it after your first review.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <PrimaryButton href={href}>Start Free Hair Analysis</PrimaryButton>
            <Link
              href={href}
              className="text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-subtle))] rounded-sm"
            >
              Create Secure Account to Start Free Analysis
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
    <section id="faq" className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="faq-heading">
      <Container>
        <ConversionFaqList
          embedded
          variant="light"
          heading="Questions before you start"
          headingId="faq-heading"
        />
        <p className="mt-8 text-center text-sm text-[rgb(var(--text-muted))]">
          <Link href="/how-it-works" className="font-medium text-medical hover:text-[rgb(var(--text-primary))]">
            More on process and turnaround
          </Link>
          <span className="mx-2 text-[rgb(var(--text-muted))]/80" aria-hidden>
            ·
          </span>
          <Link href="/pricing" className="font-medium text-medical hover:text-[rgb(var(--text-primary))]">
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
        ctaLabel="Start Free Hair Analysis"
        theme="light"
      />

      <HeroSection startHref={href} />
      <HowItWorksSection />
      <GlobalHairIntelligenceNetworkBlock />
      <WhatWeAnalyseSection />
      <ResultsPreviewSection />
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
