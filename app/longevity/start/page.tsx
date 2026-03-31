import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import { LongevityStartFlow } from "@/components/longevity/LongevityStartFlow";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/longevity/start",
  title: "Start Hair Longevity assessment intake",
  metaDescription:
    "Hair Longevity guided intake: structured questions, optional scalp photos and blood uploads, specialist review, and your personalised summary — typically within 48 hours.",
  appendBrand: true,
});

export default function LongevityStartPage() {
  if (!isLongevityEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Longevity intake</h1>
          <p className="mt-2 text-white/70">This feature is not currently available.</p>
          <Link href="/longevity" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
            Back
          </Link>
        </div>
      </main>
    );
  }

  return <LongevityStartFlow />;
}
