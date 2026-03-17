// app/for-professionals/page.tsx — Relocated from homepage: clinicians, referral, ecosystem links
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { EcosystemCrossLinks } from "@/components/public/EcosystemCrossLinks";
import { Container, PrimaryButton } from "@/components/public/PublicCTA";

export const metadata: Metadata = {
  title: "For Professionals | Hair Longevity Institute™",
  description:
    "For trichologists, GPs, and dermatologists: hair loss biology, structured interpretation, treatment pathways, and ecosystem resources (IIOHR, HairAudit, Follicle Intelligence).",
};

const OFFERINGS = [
  { title: "Hair loss biology", desc: "Androgen sensitivity, thyroid, iron, inflammation, and follicle integrity." },
  { title: "Diagnosis", desc: "Structured case interpretation and risk indices from bloods, history, and goals." },
  { title: "Treatment pathways", desc: "Non-surgical options, optimisation, and when to consider onward referral." },
];

export default function ForProfessionalsPage() {
  const startHref = isLongevityEnabled() ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-page">
      <PublicHeader showLongevityLinks={isLongevityEnabled()} ctaHref={startHref} ctaLabel="Start My Hair Analysis" theme="light" />

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 md:py-16">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">For professionals</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-4xl">
            For clinicians who don&apos;t operate
          </h1>
          <p className="mt-4 max-w-2xl text-[rgb(var(--text-secondary))]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            Hair Longevity Institute supports trichologists, GPs, and dermatology practitioners in understanding hair loss biology, diagnosis, and treatment pathways. We focus on structured interpretation and strategy — not procedures — so you can give patients clear, evidence-based guidance.
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            {OFFERINGS.map((o) => (
              <div key={o.title} className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-6 shadow-soft">
                <h2 className="font-semibold text-[rgb(var(--text-primary))]">{o.title}</h2>
                <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-[rgb(var(--border-soft))] bg-subtle py-12 md:py-16">
        <Container>
          <p className="mb-4 text-sm text-[rgb(var(--text-secondary))]">
            When a patient&apos;s pathway may include surgical options, these connected resources support training, measurement, and analysis within the same ecosystem.
          </p>
          <EcosystemCrossLinks
            currentSite="hli"
            includeIIOHR={true}
            showSurgeryLink={true}
            theme="light"
            heading="If surgery becomes relevant"
          />
        </Container>
      </section>

      <section className="border-t border-[rgb(var(--border-soft))] py-12">
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
