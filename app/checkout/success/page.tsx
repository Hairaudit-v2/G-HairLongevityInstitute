import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isStripeConfigured } from "@/lib/payment/stripeServer";
import { getStripe } from "@/lib/payment/stripeServer";
import { getPostCheckoutRedirectPath } from "@/lib/payment/checkoutSuccessRedirect";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton } from "@/components/public/PublicCTA";
import { isLongevityEnabled } from "@/lib/features";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/checkout/success",
  title: "Payment successful",
  metaDescription: "Your Hair Longevity Institute checkout completed successfully.",
  appendBrand: true,
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  let postCheckoutPath: string | null = null;
  if (session_id && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.status === "complete") {
        const offering =
          typeof session.metadata?.offering === "string" ? session.metadata.offering : null;
        postCheckoutPath = getPostCheckoutRedirectPath(offering);
      }
    } catch {
      // Session retrieve failed — show fallback UI below.
    }
  }
  if (postCheckoutPath) {
    redirect(postCheckoutPath);
  }

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
            Checkout update
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[rgb(var(--text-secondary))]">
            Thank you. If you completed a payment, your account will update in a few seconds. Open your patient portal
            to continue — or return to pricing if you need to try again.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryButton href="/portal">Open patient portal</PrimaryButton>
            <Link
              href="/pricing"
              className="inline-flex min-h-[44px] items-center justify-center rounded-btn border border-[rgb(var(--medical))]/30 px-6 py-3 text-sm font-semibold text-[rgb(var(--medical))]"
            >
              Back to pricing
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
