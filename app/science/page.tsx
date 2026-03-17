// app/science/page.tsx — Relocated from homepage: deeper science, domains, methodology; progressive disclosure
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton } from "@/components/public/PublicCTA";
import { ExpandableDetailPanel } from "@/components/ExpandableDetail";

export const metadata: Metadata = {
  title: "The Science | Hair Longevity Institute™",
  description:
    "How we analyse hair loss: hormones, nutrients, scalp health, thyroid, inflammation, and follicle integrity. Biology-first, evidence-based.",
};

const DOMAINS: Array<{
  title: string;
  items: string[];
  clinicalDetail: React.ReactNode;
}> = [
  {
    title: "Hormones",
    items: ["Androgen sensitivity", "DHT risk", "Hormone balance", "Age-triggered receptor sensitivity"],
    clinicalDetail: (
      <ul className="list-inside list-disc space-y-1 text-[rgb(var(--text-secondary))]">
        <li>DHT pathways and 5-alpha reductase activity</li>
        <li>Androgen receptor sensitivity and distribution</li>
        <li>Testosterone / free testosterone context</li>
        <li>TRT and exogenous androgen impact on follicle</li>
      </ul>
    ),
  },
  {
    title: "Nutrients",
    items: ["Iron sufficiency", "Vitamins and minerals", "Nutrient optimisation"],
    clinicalDetail: (
      <ul className="list-inside list-disc space-y-1 text-[rgb(var(--text-secondary))]">
        <li>Serum ferritin thresholds (e.g. relevance for shedding)</li>
        <li>Iron studies and TIBC</li>
        <li>B12, folate, vitamin D in growth context</li>
        <li>Zinc and other cofactors</li>
      </ul>
    ),
  },
  {
    title: "Thyroid & metabolism",
    items: ["Thyroid conversion", "Metabolic function"],
    clinicalDetail: (
      <ul className="list-inside list-disc space-y-1 text-[rgb(var(--text-secondary))]">
        <li>TSH, fT3, fT4 and conversion ratios</li>
        <li>Reverse T3 where relevant</li>
        <li>Metabolic markers and insulin sensitivity</li>
      </ul>
    ),
  },
  {
    title: "Inflammation & stress",
    items: ["Inflammatory markers", "Cortisol load", "Scalp environment"],
    clinicalDetail: (
      <ul className="list-inside list-disc space-y-1 text-[rgb(var(--text-secondary))]">
        <li>CRP, ESR and chronic inflammation</li>
        <li>Cortisol and HPA axis load</li>
        <li>Scalp microbiome and inflammatory drivers</li>
      </ul>
    ),
  },
  {
    title: "Follicle integrity",
    items: ["Pattern stability", "Medication interactions", "Genetic predisposition"],
    clinicalDetail: (
      <ul className="list-inside list-disc space-y-1 text-[rgb(var(--text-secondary))]">
        <li>Pattern progression and stability indices</li>
        <li>Medication-induced shedding and receptor effects</li>
        <li>Family history and genetic context (interpretive, not diagnostic)</li>
      </ul>
    ),
  },
];

export default function SciencePage() {
  const startHref = isLongevityEnabled() ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-page">
      <PublicHeader showLongevityLinks={isLongevityEnabled()} ctaHref={startHref} ctaLabel="Start My Hair Analysis" theme="light" />

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 md:py-16">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">The science</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-4xl">
            What we analyse — in detail
          </h1>
          <p className="mt-4 max-w-2xl text-[rgb(var(--text-secondary))]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            Hair loss is rarely caused by one factor. We map the main biological domains that influence long-term follicle health so your strategy is based on evidence, not guesswork.
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {DOMAINS.map((d) => (
              <div key={d.title} className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{d.title}</h2>
                <ul className="mt-3 space-y-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                  {d.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--gold))]" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <ExpandableDetailPanel variant="clinical" label="Clinical detail" className="mt-4">
                  {d.clinicalDetail}
                </ExpandableDetailPanel>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-[rgb(var(--text-muted))]">
            This framework is used for structured case interpretation and personalised roadmaps. We do not diagnose or prescribe; we interpret and recommend. Prescriptions, where needed, require your local doctor or a partnered prescriber.
          </p>
        </Container>
      </section>

      <section className="border-t border-[rgb(var(--border-soft))] bg-subtle py-12">
        <Container>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
            <Link href="/" className="text-sm font-medium text-medical hover:text-[rgb(var(--text-primary))]">
              ← Back to home
            </Link>
          </div>
        </Container>
      </section>

      <PublicFooter theme="light" />
    </main>
  );
}
