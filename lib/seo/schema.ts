/**
 * JSON-LD structured data for Hair Longevity Institute.
 * Minimal, truthful schema only. No ratings, reviews, or unsupported claims.
 */

import { getSiteOrigin } from "@/lib/seo/site";

/** Canonical site name for schema. */
const SITE_NAME = "Hair Longevity Institute™";

/** One-line description for WebSite schema (truthful, no keyword stuffing). */
const WEBSITE_DESCRIPTION =
  "Biology-first hair loss analysis and treatment planning. Hormone mapping, blood interpretation, and personalised strategy — delivered globally.";

/** Base URL for absolute schema URLs. Mirrors sitemap/robots/layout logic. */
export function getBaseUrl(): string {
  return getSiteOrigin();
}

/** Logo path (relative). Used with base URL for absolute logo URL in schema. */
const LOGO_PATH = "/brand/hli-mark.png";

/**
 * Organization schema for Hair Longevity Institute.
 * sameAs omitted: ecosystem partners (HairAudit, Follicle Intelligence, IIOHR) are
 * separate entities; sameAs is for the same entity on other channels (e.g. social).
 */
export function getOrganizationSchema(baseUrl: string): Record<string, unknown> {
  const url = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: `${url.replace(/\/$/, "")}${LOGO_PATH}`,
  };
}

/**
 * WebSite schema with on-site editorial search (`/insights?q=`).
 */
export function getWebSiteSchema(baseUrl: string): Record<string, unknown> {
  const url = (baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`).replace(/\/$/, "");
  const searchTemplate = `${url}/insights?q={search_term_string}`;
  return {
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${url}/`,
    description: WEBSITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchTemplate,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type ArticleSchemaInput = {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  /** ISO 8601 date only or datetime for medical content signals */
  dateModifiedDisplay?: string;
  imageUrls?: string[];
  authorNames: string[];
};

export function getArticleJsonLd(input: ArticleSchemaInput): Record<string, unknown> {
  const origin = getBaseUrl().replace(/\/$/, "");
  const author = input.authorNames.map((name) => ({
    "@type": "Person",
    name,
  }));
  const obj: Record<string, unknown> = {
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: input.url,
    author,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${origin}${LOGO_PATH}`,
      },
    },
  };
  if (input.datePublished) obj.datePublished = input.datePublished;
  if (input.dateModified) obj.dateModified = input.dateModified;
  if (input.imageUrls?.length) {
    obj.image = input.imageUrls.map((u) => ({ "@type": "ImageObject", url: u }));
  }
  return obj;
}

export type FaqItem = { question: string; answer: string };

export function getFaqPageJsonLd(items: FaqItem[]): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function getBreadcrumbListJsonLd(
  baseUrl: string,
  items: BreadcrumbItem[]
): Record<string, unknown> {
  const origin = baseUrl.replace(/\/$/, "");
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${origin}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

/**
 * Combined @graph for a single script tag. Use on root layout for key public pages.
 */
export function getStructuredDataGraph(baseUrl: string): Record<string, unknown>[] {
  return [
    getOrganizationSchema(baseUrl),
    getWebSiteSchema(baseUrl),
  ];
}
