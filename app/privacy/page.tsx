// app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/privacy",
  title: "Privacy policy",
  metaDescription: "How Hair Longevity Institute collects, uses, stores, and protects your personal and health-related data.",
  appendBrand: true,
});

export default function PrivacyPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-[rgb(var(--bg-page))]">
      <PublicHeader showLongevityLinks={useLongevity} ctaHref={startHref} ctaLabel="Start My Hair Analysis" theme="light" />

      <section className="py-12">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
            Last updated: {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="mt-10 space-y-8 text-base leading-relaxed text-[rgb(var(--text-secondary))]">
            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">1. Introduction</h2>
              <p className="mt-3">
                Hair Longevity Institute (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy and is committed to
                protecting your personal data. This policy explains how we collect, use, store, and
                protect information when you use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">2. Information we collect</h2>
              <p className="mt-3">
                We may collect: name, email address, date of birth, country, health and hair-related
                information you provide in intakes, blood test results and photographs you upload,
                notes and communications, and usage data (e.g. how you use our website).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">3. How we use your information</h2>
              <p className="mt-3">
                We use your information to: deliver diagnostic reviews and consultations, communicate
                with you, improve our services, comply with legal obligations, and ensure the security
                of our systems. We do not sell your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">4. Data storage and security</h2>
              <p className="mt-3">
                Your data is stored securely. We use industry-standard measures to protect personal
                and health information. Uploaded files are stored in a secure cloud environment with
                access restricted to authorised personnel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">5. Your rights</h2>
              <p className="mt-3">
                Depending on your jurisdiction, you may have rights to access, correct, delete, or
                export your data, and to withdraw consent. Contact us at privacy@hairlongevityinstitute.com
                to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">6. Cookies and tracking</h2>
              <p className="mt-3">
                Our website may use essential cookies for functionality. We aim to minimise non-essential
                tracking. Please review your browser settings if you wish to restrict cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">7. Contact</h2>
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
        </div>
      </section>

      <PublicFooter theme="light" />
    </main>
  );
}
