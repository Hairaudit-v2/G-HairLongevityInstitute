// app/book/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book Specialist Consultation | Hair Longevity Institute™",
  description: "45-minute Zoom consultation with a senior trichologist. Full blood interpretation, personalised roadmap, and GP guidance.",
};

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl px-6">{children}</div>;
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))] shadow-lg shadow-black/20 transition hover:opacity-90"
    >
      {children}
    </Link>
  );
}

export default function BookPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10 bg-black/10">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              <img src="/brand/hli-logo.png" alt="Hair Longevity Institute" width={220} height={44} className="h-11 w-auto" />
            </Link>
            <nav className="flex items-center gap-4 text-sm text-white/75">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link href="/start" className="hover:text-white">
                Start Review
              </Link>
            </nav>
          </div>
        </Container>
      </header>

      <section className="py-16">
        <Container>
          <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
            SPECIALIST CONSULTATION
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Book a Specialist Strategy Consultation
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            A 45-minute Zoom session with a senior trichologist (30+ years experience). Full interpretation
            of your bloods, hair photos, and history — plus a personalised roadmap, protocol plan, and GP
            guidance where needed.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <div className="text-xl font-semibold text-white">What&apos;s included</div>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                <li>• Full interpretation of blood tests & hair assessment</li>
                <li>• 45-minute video consultation</li>
                <li>• Personalised protocol plan</li>
                <li>• Regenerative & timing advice</li>
                <li>• GP guidance letter (if needed)</li>
              </ul>
              <div className="mt-6 text-2xl font-semibold text-[rgb(var(--gold))]">
                From $199
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <div className="text-xl font-semibold text-white">Book your slot</div>
              <p className="mt-3 text-sm text-white/70">
                Use the calendar below to select a time that works for you. You&apos;ll receive a confirmation
                email with your Zoom link.
              </p>
              <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-black/10 p-8 text-center">
                <p className="text-sm text-white/60">
                  {/* Placeholder for Calendly, Acuity, or similar integration */}
                  <a
                    href="mailto:book@hairlongevityinstitute.com?subject=Book%20Specialist%20Consultation"
                    className="font-semibold text-[rgb(var(--gold))] hover:underline"
                  >
                    Email us to book
                  </a>{" "}
                — we&apos;ll respond within 24 hours with available slots.
                </p>
                <p className="mt-4 text-xs text-white/50">
                  Or integrate Calendly / Acuity here when ready.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <PrimaryButton href="/start">Start with Diagnostic Review first</PrimaryButton>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              ← Back to home
            </Link>
          </div>
        </Container>
      </section>

      <footer className="mt-16 border-t border-white/10 py-8">
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 text-xs text-white/55 md:flex-row">
            <div className="flex items-center gap-3">
              <img src="/brand/hli-mark.png" alt="Hair Longevity Institute mark" width={28} height={28} />
              <div>© {new Date().getFullYear()} Hair Longevity Institute™</div>
            </div>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
}
