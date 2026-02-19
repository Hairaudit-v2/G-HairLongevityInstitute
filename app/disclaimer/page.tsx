// app/disclaimer/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer | Hair Longevity Institute™",
  description: "Medical and service disclaimer. We provide interpretation and strategy, not medical advice or prescriptions.",
};

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-6">{children}</div>;
}

export default function DisclaimerPage() {
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
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/disclaimer" className="text-white">Disclaimer</Link>
            </nav>
          </div>
        </Container>
      </header>

      <section className="py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Medical and Service Disclaimer
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Last updated: {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="mt-8 rounded-2xl border border-[rgb(var(--gold))]/30 bg-[rgb(var(--gold))]/5 p-6">
            <p className="text-base font-medium text-white/95">
              Hair Longevity Institute does not provide medical advice, diagnosis, or treatment.
              We provide structured biological interpretation and hair strategy guidance for
              informational and educational purposes only.
            </p>
          </div>

          <div className="mt-10 space-y-8 text-base leading-relaxed text-white/80">
            <section>
              <h2 className="text-xl font-semibold text-white">Not a substitute for medical care</h2>
              <p className="mt-3">
                Our services are not a replacement for consultation with a qualified physician or
                healthcare provider. Always seek the advice of your doctor or other qualified health
                professional with any questions about a medical condition, medication, or treatment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">No prescriptions</h2>
              <p className="mt-3">
                We do not prescribe medications. Where we recommend consideration of prescription
                treatments (e.g. finasteride, minoxidil), you must obtain such medications through
                your local doctor or a partnered prescriber who can assess your individual suitability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">Interpretation and strategy</h2>
              <p className="mt-3">
                Our diagnostic reviews and consultations provide structured interpretation of blood
                tests, hair assessment, and personalised strategy guidance. Outcomes cannot be
                guaranteed. Hair loss is complex and influenced by many factors beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">Use of information</h2>
              <p className="mt-3">
                You are responsible for how you use the information we provide. Any decisions you
                make regarding treatments, supplements, or lifestyle changes are made at your own
                discretion. We recommend discussing significant changes with your healthcare provider.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">International services</h2>
              <p className="mt-3">
                We serve clients globally. Regulations and standards may vary by jurisdiction. It is
                your responsibility to ensure that our services are permitted in your location and
                that you comply with local healthcare and regulatory requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <p className="mt-3">
                For questions about this disclaimer: hello@hairlongevityinstitute.com
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
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/disclaimer" className="text-white">Disclaimer</Link>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
}
