// app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Terms of Service | Hair Longevity Institute™",
  description: "Terms governing use of Hair Longevity Institute services.",
};

export default function TermsPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen">
      <PublicHeader showLongevityLinks={useLongevity} ctaHref={startHref} ctaLabel="Start My Hair Analysis" />

      <section className="py-12">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
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
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
