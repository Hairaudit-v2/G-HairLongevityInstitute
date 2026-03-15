import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";

function LongevityHeader({
  showLongevityLinks = false,
  ctaHref = "/start",
  ctaLabel = "Start assessment",
}: {
  showLongevityLinks?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgb(var(--bg))]/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex min-h-[64px] items-center justify-between gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))]"
          >
            <img
              src="/brand/hli-logo.png"
              alt="Hair Longevity Institute"
              width={220}
              height={44}
              className="h-10 w-auto sm:h-11"
            />
          </Link>
          <nav className="flex items-center gap-2" aria-label="Main">
            {showLongevityLinks && (
              <Link
                href="/portal"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
              >
                Patient portal
              </Link>
            )}
            <Link
              href={ctaHref}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))] shadow-lg shadow-black/20 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))]"
            >
              {ctaLabel}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function LongevityFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/10">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <img
              src="/brand/hli-mark.png"
              alt="Hair Longevity Institute"
              width={28}
              height={28}
              className="h-7 w-7 opacity-90"
            />
            <span className="text-sm text-white/55">
              © {new Date().getFullYear()} Hair Longevity Institute™
            </span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm" aria-label="Legal">
            <Link href="/privacy" className="text-white/55 transition hover:text-white/80">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/55 transition hover:text-white/80">
              Terms
            </Link>
            <Link href="/disclaimer" className="text-white/55 transition hover:text-white/80">
              Disclaimer
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>;
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))] shadow-lg shadow-black/20 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))]"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))]"
    >
      {children}
    </Link>
  );
}

export default function LongevityPage() {
  if (!isLongevityEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))]">
        <LongevityHeader showLongevityLinks={false} ctaHref="/start" ctaLabel="Start assessment" />
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
      <LongevityHeader showLongevityLinks ctaHref="/longevity/start" ctaLabel="Start assessment" />

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

      <LongevityFooter />
    </main>
  );
}
