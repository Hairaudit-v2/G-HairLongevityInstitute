// app/book/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import { getHliPatientPricingTier } from "@/lib/content/hliPatientPricing";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { EcosystemCrossLinks } from "@/components/public/EcosystemCrossLinks";
import { Container, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/book",
  title: "Optional one-on-one trichologist appointment",
  metaDescription:
    "Optional $199 video consultation for deeper discussion and case interpretation. Start with a free initial hair analysis first — booking is not required to begin.",
  appendBrand: true,
});

const BOOK_EMAIL = "book@hairlongevityinstitute.com";
const BOOK_MAILTO = `mailto:${BOOK_EMAIL}?subject=${encodeURIComponent("One-on-One Trichologist Appointment — booking request")}`;

const BEST_SUITED_FOR = [
  "Patients wanting deeper discussion.",
  "Patients wanting direct case interpretation.",
  "Patients wanting personalised review beyond the free initial analysis.",
] as const;

export default function BookPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";
  const consult = getHliPatientPricingTier("trich-appointment");

  return (
    <main className="min-h-screen bg-[rgb(var(--bg-dark))] text-white">
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel="Start Free Hair Analysis"
        theme="dark"
      />

      <section className="py-14 md:py-16">
        <Container>
          <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">
            OPTIONAL · PREMIUM CONSULTATION
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
            One-on-one trichologist appointment
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            A dedicated video consultation when you want more time and depth. This is{" "}
            <span className="text-white/90">not</span> required to begin care at HLI — most people start with the free
            initial hair analysis and add a paid appointment only if it suits them.
          </p>

          <div className="mt-8 max-w-2xl rounded-2xl border border-[rgb(var(--gold))]/25 bg-[rgb(var(--gold))]/[0.07] px-5 py-4 md:px-6 md:py-5">
            <p className="text-sm font-medium leading-relaxed text-white md:text-base">
              Not ready to book?{" "}
              <span className="text-white/90">Start with the free initial hair analysis first.</span>
            </p>
            <div className="mt-4">
              <PrimaryButton href={startHref}>Start Free Hair Analysis</PrimaryButton>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Consultation fee</p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-white md:text-2xl">
              One-on-One Trichologist Appointment — <span className="text-[rgb(var(--gold))]">$199</span>
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
              {consult.body} Prescriptions remain with your GP or appropriate prescriber — we focus on interpretation,
              clarity, and a sensible path forward.
            </p>
          </div>

          <div className="mt-10 max-w-2xl">
            <h2 className="text-lg font-semibold text-white md:text-xl">Best suited for</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/80 md:text-base">
              {BEST_SUITED_FOR.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-[rgb(var(--gold))]" aria-hidden>
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 md:p-8">
              <h2 className="text-xl font-semibold text-white">What&apos;s included</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/75">
                <li className="flex gap-2">
                  <span className="text-[rgb(var(--gold))]" aria-hidden>
                    ·
                  </span>
                  <span>Private video session with a senior trichologist (typically 45 minutes)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[rgb(var(--gold))]" aria-hidden>
                    ·
                  </span>
                  <span>Direct case interpretation in context — history, symptoms, and any labs or photos you share</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[rgb(var(--gold))]" aria-hidden>
                    ·
                  </span>
                  <span>Space for your questions and a clear, personalised discussion of next steps</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[rgb(var(--gold))]" aria-hidden>
                    ·
                  </span>
                  <span>GP-appropriate guidance where relevant — HLI does not replace your prescribing doctor</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 md:p-8">
              <h2 className="text-xl font-semibold text-white">Request a time</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/75">
                Send a booking request by email. Our team will reply with available times and anything we need from you
                ahead of the appointment (for example, recent blood results or photos if you have them).
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
                <p className="text-sm text-white/80">
                  <a
                    href={BOOK_MAILTO}
                    className="font-semibold text-[rgb(var(--gold))] underline-offset-2 hover:underline"
                  >
                    {BOOK_EMAIL}
                  </a>
                </p>
                <p className="mt-3 text-sm text-white/60">
                  We aim to respond within one business day with next steps.
                </p>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-white/50">
                Prefer to begin without a call?{" "}
                <Link href={startHref} className="font-medium text-white/70 underline-offset-2 hover:text-white/90 hover:underline">
                  Start your free analysis first
                </Link>
                {" — "}
                you can book a consultation later if you wish.
              </p>
            </div>
          </div>

          <EcosystemCrossLinks
            currentSite="hli"
            showSurgeryLink={true}
            theme="dark"
            heading="Considering hair transplant surgery?"
            className="mt-14"
          />

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <PrimaryButton href={startHref}>Start Free Hair Analysis</PrimaryButton>
            <SecondaryButton href="/pricing">View pricing</SecondaryButton>
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
