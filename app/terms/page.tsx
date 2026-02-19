// app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Hair Longevity Institute™",
  description: "Terms governing use of Hair Longevity Institute services.",
};

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-6">{children}</div>;
}

export default function TermsPage() {
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
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-white">Terms</Link>
              <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            </nav>
          </div>
        </Container>
      </header>

      <section className="py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Last updated: {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="mt-10 space-y-8 text-base leading-relaxed text-white/80">
            <section>
              <h2 className="text-xl font-semibold text-white">1. Agreement</h2>
              <p className="mt-3">
                By using our website and services, you agree to these Terms of Service. If you do not
                agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">2. Nature of our services</h2>
              <p className="mt-3">
                Hair Longevity Institute provides structured biological interpretation, hair assessment,
                and strategy guidance. We do not prescribe medication. Prescriptions, where required,
                must be obtained through your local doctor or a partnered prescriber.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">3. Eligibility</h2>
              <p className="mt-3">
                You must be at least 18 years of age to use our services. By submitting an intake, you
                confirm that the information you provide is accurate to the best of your knowledge.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">4. Fees and payment</h2>
              <p className="mt-3">
                Fees for diagnostic reviews, consultations, and membership are as stated on our website.
                Payment terms and refund policies are communicated at the time of purchase or booking.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">5. Intellectual property</h2>
              <p className="mt-3">
                Our content, trademarks, and materials (including Follicle Intelligence™, Hair Longevity
                Score™, and related outputs) remain our property. You may not reproduce or use them
                without our written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">6. Limitation of liability</h2>
              <p className="mt-3">
                Our services are for informational and strategic purposes. We do not provide medical
                advice, diagnosis, or treatment. You are responsible for decisions made based on our
                outputs and for consulting your doctor regarding medications or medical care.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">7. Changes</h2>
              <p className="mt-3">
                We may update these terms from time to time. Continued use of our services after
                changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">8. Contact</h2>
              <p className="mt-3">
                For questions about these terms: hello@hairlongevityinstitute.com
              </p>
            </section>
          </div>

          <div className="mt-12">
            <Link
              href="/"
              className="text-sm text-[rgb(var(--gold))] hover:underline"
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
              <Link href="/terms" className="text-white">Terms</Link>
              <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
}
