import {
  getArticleJsonLd,
  getBreadcrumbListJsonLd,
  getFaqPageJsonLd,
  getBaseUrl,
} from "@/lib/seo/schema";
import type { EditorialFaqItem } from "@/lib/content/types";
import type { BreadcrumbItem } from "@/lib/seo/schema";

type Props = {
  url: string;
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  authorNames: string[];
  imageUrls?: string[];
  faq?: EditorialFaqItem[];
  breadcrumbs: BreadcrumbItem[];
};

/**
 * Page-level JSON-LD: Article + optional FAQPage + BreadcrumbList in one @graph.
 */
export default function ArticleJsonLd({
  url,
  headline,
  description,
  datePublished,
  dateModified,
  authorNames,
  imageUrls,
  faq,
  breadcrumbs,
}: Props) {
  const base = getBaseUrl();
  const graph: Record<string, unknown>[] = [
    getArticleJsonLd({
      headline,
      description,
      url,
      datePublished,
      dateModified,
      authorNames,
      imageUrls,
    }),
    getBreadcrumbListJsonLd(base, breadcrumbs),
  ];
  if (faq?.length) {
    graph.push(
      getFaqPageJsonLd(
        faq.map((f) => ({ question: f.question, answer: f.answer }))
      )
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
