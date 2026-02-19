// app/membership/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hair Longevity Membership | Hair Longevity Institute™",
  description: "Ongoing optimisation, 6-month reassessments, and Hair Longevity Score™ tracking. $249/month.",
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

export default function MembershipPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10 bg-black/10">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              <img src="/brand/hli-logo.png" alt="Hair Longevity Institute" width={220} height={44} className="h-11 w-auto" />
            </Link>
            <nav className="flex items-center gap-4 text-sm text-white/75">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/start" className="hover:text-white">Start Review</Link>
              <Link href="/book" className="hover:text-white">Book Consultation</Link>
            </nav>
          </div>
        </Container>
      </header>

      <section className="py-16">
        <Container>
          <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
            HAIR LONGEVITY MEMBERSHIP
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Ongoing optimisation for long-term results
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            Membership is for clients who have completed an initial review or consultation and want
            ongoing support to optimise and track their hair longevity strategy over time.
          </p>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="text-2xl font-semibold text-[rgb(var(--gold))]">$249 / month</div>
            <ul className="mt-6 space-y-3 text-white/85">
              <li>• Ongoing optimisation support</li>
              <li>• 6‑month reassessments included</li>
              <li>• Hair Longevity Score™ tracking over time</li>
              <li>• Priority support for questions</li>
              <li>• Protocol adjustments as your biology changes</li>
            </ul>
            <p className="mt-6 text-sm text-white/65">
              Membership is available after an initial diagnostic review or specialist consultation.
              We recommend starting with a full assessment so we have baseline data to optimise from.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/start">Start with Diagnostic Review</PrimaryButton>
              <PrimaryButton href="/book">Book Specialist Consultation</PrimaryButton>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
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
