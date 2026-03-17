import type { Metadata } from "next";

/**
 * Layout for /start (client component page). Provides unique metadata for the
 * assessment flow so search and social use action-oriented title and description.
 */
export const metadata: Metadata = {
  title: "Start My Hair Analysis | Hair Longevity Institute™",
  description:
    "Begin your guided intake: answer a few questions, optionally upload photos and bloods, and receive a personalised interpretation and next steps — usually within 48 hours.",
};

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
