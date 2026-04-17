// app/book/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import { getHliPatientPricingTier } from "@/lib/content/hliPatientPricing";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { EcosystemCrossLinks } from "@/components/public/EcosystemCrossLinks";
import { Container, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";
import { EntitlementAwareCheckoutButton } from "@/components/public/EntitlementAwareCheckoutButton";
import { HLI_OFFERING } from "@/lib/payment/hliOffers";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/book",
  title: "Optional one-on-one trichologist appointment",
  metaDescription:
    "Optional one-on-one trichologist appointment (1 hour, USD 120) for deeper discussion and case interpretation. Start with a free initial hair analysis first — booking is not required to begin.",
  appendBrand: true,
});

const BOOK_EMAIL = "book@hairlongevityinstitute.com";
const BOOK_MAILTO = `mailto:${BOOK_EMAIL}?subject=${encodeURIComponent("One-on-One Trichologist Appointment — booking request")}`;

const BEST_SUITED_FOR = [
  "Patients wanting deeper discussion.",
  "Patients wanting direct case interpretation.",
  "Patients wanting personalised review beyond the free initial analysis.",
] as const;

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";
  const consult = getHliPatientPricingTier("trich-appointment");
  const { welcome } = await searchParams;
  const showPaidWelcome = welcome === "appointment";

  return (
    <main className="min-h-screen bg-page">
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel="Start My Hair Analysis"
        theme="light"
      />

      <section className="py-14 md:py-16">
        <Container>
          {showPaidWelcome ? (
            <div
              className="mb-8 max-w-2xl rounded-2xl border border-emerald-400/25 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900"
              role="status"
            >
              <p className="font-medium text-emerald-900">Booking fee paid</p>
              <p className="mt-2 text-emerald-800">
                Your one-on-one appointment fee is on file. Email us to schedule your session — include your preferred
                times if helpful.
              </p>
            </div>
          ) : null}
          <div className="rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(245,240,235,0.94)_100%)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.08)] md:p-9">
            <p className="text-sm font-medium tracking-[0.18em] text-[rgb(var(--gold))]">
              OPTIONAL · PREMIUM CONSULTATION
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-5xl">
              One-on-one trichologist appointment
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[rgb(var(--text-secondary))] md:text-lg">
              A dedicated video consultation when you want more time and depth. This is not required to begin care at
              HLI — most people start with the free initial hair analysis and add a paid appointment only if it suits
              them.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
              <span className="font-medium text-[rgb(var(--text-primary))]">Membership note:</span> active members
              already receive two 30-minute one-on-one Zoom sessions per calendar year at no extra charge. This page is
              for the separate 1-hour extended appointment ($120 USD) when you want a full hour beyond those included
              visits.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[rgb(var(--medical))]/18 bg-white/88 p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--medical))]">
                  Best first step
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))]">
                  Start with the free analysis
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
                  If you want clarity before committing to a call, begin with the guided intake and complimentary
                  review. Most people can start there, then decide later whether extra one-to-one time would help.
                </p>
                <div className="mt-6">
                  <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[rgb(var(--gold))]/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,244,239,0.96)_100%)] p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">
                  When you want more depth
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))]">
                  Extended appointment
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
                  One-on-One Trichologist Appointment — <span className="font-semibold text-[rgb(var(--gold-dark))]">$120 USD</span>{" "}
                  <span className="text-[rgb(var(--text-muted))]">(1 hour)</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                  {consult.body} Prescriptions remain with your GP or appropriate prescriber — we focus on
                  interpretation, clarity, and a sensible path forward.
                </p>
                <div className="mt-6">
                  <EntitlementAwareCheckoutButton offering={HLI_OFFERING.TRICHOLOGIST_APPOINTMENT} theme="light">
                    Pay $120 USD — One-on-One Appointment (1 hour)
                  </EntitlementAwareCheckoutButton>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8">
              <div className="rounded-[1.5rem] border border-[rgb(var(--border-soft))] bg-white/90 p-7 shadow-soft md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">Best suited for</p>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
                  {BEST_SUITED_FOR.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-[rgb(var(--border-soft))] bg-white/90 p-7 shadow-soft md:p-8">
                <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">What&apos;s included</h2>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                    <span>Private video session with a senior trichologist (1 hour)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                    <span>Direct case interpretation in context — history, symptoms, and any labs or photos you share</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                    <span>Space for your questions and a clear, personalised discussion of next steps</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                    <span>GP-appropriate guidance where relevant — HLI does not replace your prescribing doctor</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(249,246,242,0.96)_100%)] p-7 shadow-soft md:p-8">
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Request a time</h2>
              <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                Send a booking request by email. Our team will reply with available times and anything we need from you
                ahead of the appointment (for example, recent blood results or photos if you have them).
              </p>
              <div className="mt-6 rounded-2xl border border-[rgb(var(--border-soft))] bg-white/90 p-6">
                <p className="text-sm text-[rgb(var(--text-primary))]">
                  <a
                    href={BOOK_MAILTO}
                    className="font-semibold text-[rgb(var(--gold-dark))] underline-offset-2 hover:underline"
                  >
                    {BOOK_EMAIL}
                  </a>
                </p>
                <p className="mt-3 text-sm text-[rgb(var(--text-muted))]">
                  We aim to respond within one business day with next steps.
                </p>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                Prefer to begin without a call?{" "}
                <Link href={startHref} className="font-medium text-medical underline-offset-2 hover:underline">
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
            theme="light"
            heading="Considering hair transplant surgery?"
            className="mt-14"
          />

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
            <SecondaryButton href="/pricing">View pricing</SecondaryButton>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-[rgb(var(--border-soft))] bg-white px-6 py-3 text-sm font-semibold text-[rgb(var(--text-primary))] transition hover:bg-subtle"
            >
              ← Back to home
            </Link>
          </div>
        </Container>
      </section>

      <PublicFooter theme="light" />
    </main>
  );
}
