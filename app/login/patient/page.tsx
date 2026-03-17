import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container } from "@/components/public/PublicCTA";
import { isLongevityEnabled } from "@/lib/features";

export const metadata: Metadata = {
  title: "Patient Login | Hair Longevity Institute™",
  description: "Sign in to your secure portal. View your care journey, uploads, progress, summary, and next steps.",
};

export default function PatientLoginPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))]">
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel="Start My Hair Analysis"
      />
      <section className="py-14 md:py-20">
        <Container>
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
              Patient portal
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Access your secure portal
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/75">
              Sign in to view your care journey, upload blood tests or scalp photos,
              check progress, and access your summary and next steps.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                View your secure portal, care timeline and summaries
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                Upload blood tests and scalp photos
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                Track progress and read your summary
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                See next steps and follow-up options
              </li>
            </ul>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs text-white/55">
                We send a secure sign-in link to your email — no password required.
                Your data is encrypted and used only for your care pathway.
              </p>
              <Link
                href="/portal/login"
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[rgb(var(--gold))] px-6 py-3.5 text-sm font-semibold text-[rgb(var(--bg))] shadow-lg shadow-black/20 transition hover:opacity-90"
              >
                Continue to sign in
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-white/60">
              New here?{" "}
              <Link href={startHref} className="font-medium text-[rgb(var(--gold))] hover:underline">
                Start My Hair Analysis
              </Link>
            </p>
            <p className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm text-white/50 hover:text-white/80"
              >
                ← Back to main site
              </Link>
            </p>
          </div>
        </Container>
      </section>
      <PublicFooter />
    </main>
  );
}
