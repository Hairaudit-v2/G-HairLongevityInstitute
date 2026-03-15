import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";

export default function LongevityPage() {
  if (!isLongevityEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))]">
        <PublicHeader showLongevityLinks={false} ctaHref="/start" ctaLabel="Start assessment" />
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-white">Longevity module</h1>
          <p className="mt-2 text-white/70">This feature is not currently available.</p>
          <Link href="/" className="mt-6 inline-block text-sm text-[rgb(var(--gold))] hover:underline">
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))]">
      <PublicHeader showLongevityLinks ctaHref="/longevity/start" ctaLabel="Start assessment" />

      <section className="relative overflow-hidden py-14 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,167,94,0.10),transparent_60%)]" />
        <Container>
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">
              HAIR LONGEVITY PATHWAY
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Your assessment, your portal, your continuity.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/75 md:text-lg">
              Start a new intake with guided questions and secure uploads. Track your care journey,
              view summaries, and return for follow-up reassessments — all in one place.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <PrimaryButton href="/longevity/start">Start new assessment</PrimaryButton>
              <SecondaryButton href="/portal">Open patient portal</SecondaryButton>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 bg-black/10 py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-white md:text-3xl">
              One pathway. Clear steps.
            </h2>
            <p className="mt-4 text-white/75">
              Complete your intake → upload bloods & photos → specialist review → receive your summary.
              Return anytime via the portal for follow-up and new assessments.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/75">
            <span>Assessment</span>
            <span className="text-white/40">→</span>
            <span>Uploads</span>
            <span className="text-white/40">→</span>
            <span>Triage</span>
            <span className="text-white/40">→</span>
            <span>Review</span>
            <span className="text-white/40">→</span>
            <span>Summary release</span>
            <span className="text-white/40">→</span>
            <span>Continuity care</span>
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <PrimaryButton href="/longevity/start">Start assessment</PrimaryButton>
            <SecondaryButton href="/portal">Patient portal</SecondaryButton>
          </div>
        </Container>
      </section>

      <PublicFooter />
    </main>
  );
}
