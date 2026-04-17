import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton } from "@/components/public/PublicCTA";
import { isLongevityEnabled } from "@/lib/features";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/checkout/cancel",
  title: "Checkout cancelled",
  metaDescription: "You left the Hair Longevity Institute checkout. No charge was made.",
  appendBrand: true,
});

export default function CheckoutCancelPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-page">
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel="Start My Hair Analysis"
        theme="light"
      />

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 md:py-16">
        <Container>
          <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-3xl">
            Checkout cancelled
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[rgb(var(--text-secondary))]">
            No payment was processed. When you are ready, you can return to pricing or continue with your free hair analysis first.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryButton href="/pricing">View pricing</PrimaryButton>
            <Link
              href={startHref}
              className="inline-flex min-h-[44px] items-center justify-center rounded-btn border border-[rgb(var(--medical))]/30 px-6 py-3 text-sm font-semibold text-[rgb(var(--medical))]"
            >
              Start My Hair Analysis
            </Link>
          </div>
        </Container>
      </section>

      <Container>
        <PublicFooter theme="light" />
      </Container>
    </main>
  );
}
