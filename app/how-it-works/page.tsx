// app/how-it-works/page.tsx — Relocated from homepage: full process, turnaround, what happens after
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton } from "@/components/public/PublicCTA";
import { ExpandableDetailPanel } from "@/components/ExpandableDetail";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/how-it-works",
  title: "How hair analysis works — intake, review & your plan",
  metaDescription:
    "Guided intake, optional photos and blood uploads, senior trichologist review, and your written summary — typically within 48 hours. No referral required.",
  appendBrand: true,
});

const STEPS = [
  { step: 1, title: "Answer a few questions", body: "Short guided intake about your history, goals, and any medications or supplements." },
  { step: 2, title: "Upload photos (optional)", body: "Add hair photos and blood tests if you have them. You can also upload later." },
  { step: 3, title: "We triage your case", body: "Your case is prioritised and routed to a senior trichologist (30+ years experience)." },
  { step: 4, title: "Specialist review", body: "One expert interprets your biology and designs a clear strategy and roadmap." },
  { step: 5, title: "Receive your plan", body: "Your personalised summary and next steps — most cases are reviewed within 12–24 hours after complete submission." },
];

const AFTER_SUBMIT = [
  "Received and triaged",
  "Routed to specialist",
  "Review and interpretation",
  "Summary prepared",
  "Released to you in your portal",
];

export default function HowItWorksPage() {
  const startHref = isLongevityEnabled() ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-page">
      <PublicHeader showLongevityLinks={isLongevityEnabled()} ctaHref={startHref} ctaLabel="Start My Hair Analysis" theme="light" />

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 md:py-16">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">How it works</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-4xl">
            From first step to your personalised plan
          </h1>
          <p className="mt-4 max-w-2xl text-[rgb(var(--text-secondary))]" style={{ lineHeight: "var(--line-height-relaxed)" }}>
            No referral required. You complete a short intake, add any documents you have, and we deliver a clear interpretation and roadmap. Most cases are reviewed within 12–24 hours after complete submission.
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">The steps</h2>
          <ul className="mt-8 space-y-8">
            {STEPS.map((s) => (
              <li key={s.step} className="flex gap-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--gold))]/10 text-sm font-semibold text-[rgb(var(--gold))]">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-semibold text-[rgb(var(--text-primary))]">{s.title}</h3>
                  <p className="mt-1 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-[rgb(var(--border-soft))] bg-subtle py-12 md:py-16">
        <Container>
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">What happens after you submit</h2>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
            Typical turnaround: 12–24 hours from complete submission in most cases.
          </p>
          <ul className="mt-6 flex flex-wrap gap-4">
            {AFTER_SUBMIT.map((item, i) => (
              <li key={item} className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--gold))]/30 bg-card text-xs font-semibold text-[rgb(var(--gold))]">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <ExpandableDetailPanel variant="clinical" label="Clinical detail">
              <p className="mb-2 text-[rgb(var(--text-primary))]">For referrers and clinicians:</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-[rgb(var(--text-secondary))]">
                <li>Triage is done by our team; every case is reviewed by a senior trichologist.</li>
                <li>We use a structured biological framework (Follicle Intelligence™) for interpretation.</li>
                <li>Summary includes risk indices, written interpretation, and next-step recommendations — not raw results alone.</li>
                <li>Prescriptions are not issued; we recommend and the patient’s GP or a partnered prescriber issues where needed.</li>
              </ul>
            </ExpandableDetailPanel>
          </div>
        </Container>
      </section>

      <section className="border-t border-neutral-200 py-12">
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
