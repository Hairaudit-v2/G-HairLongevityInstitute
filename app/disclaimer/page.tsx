// app/disclaimer/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Disclaimer | Hair Longevity Institute™",
  description: "Medical and service disclaimer. We provide interpretation and strategy, not medical advice or prescriptions.",
};

export default function DisclaimerPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-[rgb(var(--bg-page))]">
      <PublicHeader showLongevityLinks={useLongevity} ctaHref={startHref} ctaLabel="Start My Hair Analysis" theme="light" />

      <section className="py-12">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-4xl">
            Medical and Service Disclaimer
          </h1>
          <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
            Last updated: {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="mt-8 rounded-2xl border border-[rgb(var(--gold))]/30 bg-[rgb(var(--gold))]/5 p-6">
            <p className="text-base font-medium text-[rgb(var(--text-primary))]">
              Hair Longevity Institute does not provide medical advice, diagnosis, or treatment.
              We provide structured biological interpretation and hair strategy guidance for
              informational and educational purposes only.
            </p>
          </div>

          <div className="mt-10 space-y-8 text-base leading-relaxed text-[rgb(var(--text-secondary))]">
            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Not a substitute for medical care</h2>
              <p className="mt-3">
                Our services are not a replacement for consultation with a qualified physician or
                healthcare provider. Always seek the advice of your doctor or other qualified health
                professional with any questions about a medical condition, medication, or treatment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">No prescriptions</h2>
              <p className="mt-3">
                We do not prescribe medications. Where we recommend consideration of prescription
                treatments (e.g. finasteride, minoxidil), you must obtain such medications through
                your local doctor or a partnered prescriber who can assess your individual suitability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Interpretation and strategy</h2>
              <p className="mt-3">
                Our diagnostic reviews and consultations provide structured interpretation of blood
                tests, hair assessment, and personalised strategy guidance. Outcomes cannot be
                guaranteed. Hair loss is complex and influenced by many factors beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Use of information</h2>
              <p className="mt-3">
                You are responsible for how you use the information we provide. Any decisions you
                make regarding treatments, supplements, or lifestyle changes are made at your own
                discretion. We recommend discussing significant changes with your healthcare provider.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">International services</h2>
              <p className="mt-3">
                We serve clients globally. Regulations and standards may vary by jurisdiction. It is
                your responsibility to ensure that our services are permitted in your location and
                that you comply with local healthcare and regulatory requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Contact</h2>
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
        </div>
      </section>

      <PublicFooter theme="light" />
    </main>
  );
}
