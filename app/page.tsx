// app/page.tsx — Patient-first, light homepage (audited: redundant content relocated to /science, /how-it-works, /for-professionals)
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton } from "@/components/public/PublicCTA";
import { GlobalHairIntelligenceSection } from "@/components/ecosystem/GlobalHairIntelligenceSection";
import { ExpandableDetailPanel } from "@/components/ExpandableDetail";
import { ResultsPreviewCard } from "@/components/public/ResultsPreviewCard";
import HomeFaqJsonLd from "@/components/editorial/HomeFaqJsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/",
  title: "Hair loss analysis & biology-first planning",
  metaDescription:
    "Personalised hair loss analysis backed by biology, not guesswork. Understand pattern, hormones, blood markers, and options — typically 48 hours to your plan.",
  appendBrand: true,
});

const startHref = () => (isLongevityEnabled() ? "/longevity/start" : "/start");

// —— 1. HERO ——
function HeroSection({ startHref: href }: { startHref: string }) {
  return (
    <section className="relative overflow-hidden bg-card">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(198,167,94,0.06),transparent_55%)]" aria-hidden />
      <Container>
        <div className="relative mx-auto max-w-3xl py-16 text-center sm:py-20 md:py-24">
          <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-5xl" style={{ lineHeight: 1.2 }}>
            Understand Your Hair Loss. Take Control Early.
          </h1>
          <p className="mt-5 text-lg text-[rgb(var(--text-secondary))] sm:text-xl" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            Personalised analysis backed by biology, not guesswork.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <PrimaryButton href={href}>Start My Hair Analysis</PrimaryButton>
            <a
              href="#how-it-works"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn border border-[rgb(var(--medical))]/25 bg-card px-6 py-3 text-sm font-semibold text-medical shadow-soft transition hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
            >
              How It Works
            </a>
          </div>
          <p className="mt-6 text-sm text-[rgb(var(--text-muted))]">
            No referral required · Typically 48 hours to your personalised plan
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
            Start your personalised hair analysis today
          </h2>
          <p className="mt-5 text-[rgb(var(--text-secondary))]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            No referral required. Clear results, usually within 48 hours.
          </p>
          <div className="mt-8">
            <PrimaryButton href={href}>Start My Hair Analysis</PrimaryButton>
          </div>
        </div>
      </Container>
    </section>
  );
}

// —— MINIMAL FAQ (full process on /how-it-works) ——
const FAQ_ITEMS = [
  { q: "What do I need to start?", a: "A few minutes for the questionnaire. You can add blood tests and hair photos if you have them — or upload later." },
  { q: "How long until I get my results?", a: "Most people get their personalised summary within 48 hours after we have your completed intake and any uploads." },
  { q: "Is this for men and women?", a: "Yes. We look at hormone balance, nutrients, scalp health, and pattern for all hair types and causes of loss." },
];

function FAQSection() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="faq-heading">
      <Container>
        <h2 id="faq-heading" className="text-center text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
          Common questions
        </h2>
        <div className="mx-auto mt-12 max-w-2xl space-y-3">
          {FAQ_ITEMS.map((faq) => (
            <details key={faq.q} className="group rounded-card border border-[rgb(var(--border-soft))] bg-card shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-[rgb(var(--text-primary))] [&::-webkit-details-marker]:hidden">
                {faq.q}
                <svg className="h-5 w-5 shrink-0 text-[rgb(var(--text-muted))] transition group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-[rgb(var(--border-soft))] px-5 pb-4 pt-2">
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-[rgb(var(--text-muted))]">
          <Link href="/how-it-works" className="font-medium text-medical hover:text-[rgb(var(--text-primary))]">
            More on process and turnaround →
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
      <HomeFaqJsonLd items={FAQ_ITEMS.map(({ q, a }) => ({ question: q, answer: a }))} />
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={href}
        ctaLabel="Start My Hair Analysis"
        theme="light"
      />

      <HeroSection startHref={href} />
      <HowItWorksSection />
      <GlobalHairIntelligenceNetworkBlock />
      <WhatWeAnalyseSection />
      <ResultsPreviewSection />
      <TrustSection />
      <FinalCTASection startHref={href} />
      <FAQSection />

      <Container>
        <PublicFooter theme="light" />
      </Container>
    </main>
  );
}
