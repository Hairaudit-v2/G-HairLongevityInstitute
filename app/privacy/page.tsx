// app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Hair Longevity Institute™",
  description: "How we collect, use, and protect your personal data.",
};

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-6">{children}</div>;
}

export default function PrivacyPage() {
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
              <Link href="/privacy" className="text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            </nav>
          </div>
        </Container>
      </header>

      <section className="py-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Last updated: {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="mt-10 space-y-8 text-base leading-relaxed text-white/80">
            <section>
              <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
              <p className="mt-3">
                Hair Longevity Institute (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy and is committed to
                protecting your personal data. This policy explains how we collect, use, store, and
                protect information when you use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">2. Information we collect</h2>
              <p className="mt-3">
                We may collect: name, email address, date of birth, country, health and hair-related
                information you provide in intakes, blood test results and photographs you upload,
                notes and communications, and usage data (e.g. how you use our website).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">3. How we use your information</h2>
              <p className="mt-3">
                We use your information to: deliver diagnostic reviews and consultations, communicate
                with you, improve our services, comply with legal obligations, and ensure the security
                of our systems. We do not sell your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">4. Data storage and security</h2>
              <p className="mt-3">
                Your data is stored securely. We use industry-standard measures to protect personal
                and health information. Uploaded files are stored in a secure cloud environment with
                access restricted to authorised personnel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">5. Your rights</h2>
              <p className="mt-3">
                Depending on your jurisdiction, you may have rights to access, correct, delete, or
                export your data, and to withdraw consent. Contact us at privacy@hairlongevityinstitute.com
                to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">6. Cookies and tracking</h2>
              <p className="mt-3">
                Our website may use essential cookies for functionality. We aim to minimise non-essential
                tracking. Please review your browser settings if you wish to restrict cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">7. Contact</h2>
              <p className="mt-3">
                For privacy-related questions: privacy@hairlongevityinstitute.com
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
              <Link href="/privacy" className="text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
}
