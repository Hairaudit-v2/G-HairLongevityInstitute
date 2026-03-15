import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container } from "@/components/public/PublicCTA";
import { isLongevityEnabled } from "@/lib/features";

export const metadata: Metadata = {
  title: "Trichologist Login | Hair Longevity Institute™",
  description: "Portal access for the review team. View assigned cases, intake review workspace, and manage follow-up and summary release.",
};

export default function TrichologistLoginPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))]">
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel="Start assessment"
      />
      <section className="py-14 md:py-20">
        <Container>
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
              Trichologist portal
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Review team access
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/75">
              Sign in to access the intake review workspace, view assigned cases,
              and manage follow-up and summary release.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                View assigned cases and review queue
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                Access intake review workspace
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                Blood markers and scalp assessment
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/70" aria-hidden />
                Manage follow-up and summary release
              </li>
            </ul>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs text-white/55">
                Access is restricted to authorised team members. We send a secure
                sign-in link to your work email.
              </p>
              <Link
                href="/portal/login"
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[rgb(var(--gold))] px-6 py-3.5 text-sm font-semibold text-[rgb(var(--bg))] shadow-lg shadow-black/20 transition hover:opacity-90"
              >
                Continue to sign in
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-white/60">
              Patient?{" "}
              <Link href="/login/patient" className="font-medium text-[rgb(var(--gold))] hover:underline">
                Patient login
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
