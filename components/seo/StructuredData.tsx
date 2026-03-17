import { getBaseUrl, getStructuredDataGraph } from "@/lib/seo/schema";

/**
 * Renders JSON-LD structured data (Organization + WebSite) in a single script tag.
 * Server component; safe for root layout. No hydration — static script content.
 */
export default function StructuredData() {
  const baseUrl = getBaseUrl();
  const graph = getStructuredDataGraph(baseUrl);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };
  const jsonString = JSON.stringify(jsonLd);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
