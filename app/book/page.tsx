// app/book/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton } from "@/components/public/PublicCTA";

export const metadata: Metadata = {
  title: "Book Specialist Consultation | Hair Longevity Institute™",
  description: "45-minute Zoom consultation with a senior trichologist. Full blood interpretation, personalised roadmap, and GP guidance.",
};

export default function BookPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen">
      <PublicHeader showLongevityLinks={useLongevity} ctaHref={startHref} ctaLabel="Start assessment" />

      <section className="py-14 md:py-16">
        <Container>
          <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">
            SPECIALIST CONSULTATION
          </p>
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

          {/* Considering surgery — bridge to HairAudit */}
          <section className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white">
              Considering hair transplant surgery?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              HLI helps you understand why hair loss is happening and how to optimise your biology.
              When surgery becomes relevant, HairAudit helps you evaluate surgeons, outcomes, and
              surgical standards with independent analysis and transparency.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              HairAudit provides structured evaluation of hair transplant procedures. If you are
              exploring or have had a transplant, you can use HairAudit to understand procedural
              outcomes and reporting standards.
            </p>
            <a
              href="https://hairaudit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              Explore HairAudit
            </a>
          </section>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <PrimaryButton href={startHref}>Start with diagnostic review first</PrimaryButton>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              ← Back to home
            </Link>
          </div>
        </Container>
      </section>

      <PublicFooter />
    </main>
  );
}
