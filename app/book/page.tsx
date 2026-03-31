// app/book/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { EcosystemCrossLinks } from "@/components/public/EcosystemCrossLinks";
import { Container, PrimaryButton } from "@/components/public/PublicCTA";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/book",
  title: "Book a hair specialist consultation (Zoom)",
  metaDescription:
    "45-minute consultation with a senior trichologist: blood interpretation context, personalised roadmap, and GP-appropriate guidance — not a substitute for local prescribing.",
  appendBrand: true,
});

export default function BookPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-[rgb(var(--bg-dark))] text-white">
      <PublicHeader showLongevityLinks={useLongevity} ctaHref={startHref} ctaLabel="Start My Hair Analysis" theme="dark" />

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

          <EcosystemCrossLinks
            currentSite="hli"
            showSurgeryLink={true}
            theme="dark"
            heading="Considering hair transplant surgery?"
            className="mt-14"
          />

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
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
