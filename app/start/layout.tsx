import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * Layout for /start (client component page). Provides unique metadata for the
 * assessment flow so search and social use action-oriented title and description.
 */
export const metadata: Metadata = buildPageMetadata({
  path: "/start",
  title: "Start your guided hair analysis intake",
  metaDescription:
    "Begin your guided intake: answer focused questions, optionally upload photos and blood results, and receive a personalised interpretation with next steps — usually within 48 hours.",
  appendBrand: true,
});

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
