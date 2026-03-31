import { getFaqPageJsonLd } from "@/lib/seo/schema";

type Item = { question: string; answer: string };

/** FAQPage JSON-LD when visible FAQ content exists on the homepage. */
export default function HomeFaqJsonLd({ items }: { items: Item[] }) {
  if (!items.length) return null;
  const faq = getFaqPageJsonLd(items);
  const jsonLd = {
    "@context": "https://schema.org",
    ...faq,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
