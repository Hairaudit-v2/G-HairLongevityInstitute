import { getBreadcrumbListJsonLd, getFaqPageJsonLd, getBaseUrl } from "@/lib/seo/schema";

type FaqItem = { question: string; answer: string };

type Props = {
  /** Canonical public path, e.g. `/guides/hair-longevity` */
  guidePath: string;
  /** Short label for the last breadcrumb position (visible topic, not full meta title). */
  lastBreadcrumbName: string;
  faqItems: FaqItem[];
};

/**
 * Guide pillar pages: BreadcrumbList + FAQPage in one `@graph` (matches insight Article JSON-LD pattern).
 */
export default function GuidePageJsonLd({ guidePath, lastBreadcrumbName, faqItems }: Props) {
  const base = getBaseUrl();
  const graph: Record<string, unknown>[] = [
    getBreadcrumbListJsonLd(base, [
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: lastBreadcrumbName, path: guidePath.startsWith("/") ? guidePath : `/${guidePath}` },
    ]),
  ];
  if (faqItems.length) {
    graph.push(getFaqPageJsonLd(faqItems));
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
