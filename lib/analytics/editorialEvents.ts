/**
 * Vercel Analytics custom events for public editorial and discovery.
 * Names are stable strings for downstream reporting.
 */

export const EDITORIAL_EVENT = {
  ARTICLE_VIEW: "editorial_article_view",
  SEARCH_SUBMIT: "editorial_search_submit",
  SEARCH_FILTER: "editorial_search_filter",
  CTA_PRIMARY: "editorial_cta_primary_assessment",
  CTA_BOOK: "editorial_cta_book_consultation",
  CTA_HAIRAUDIT: "editorial_cta_hairaudit",
  GLOSSARY_TERM_VIEW: "editorial_glossary_term_view",
} as const;

export type EditorialEventName = (typeof EDITORIAL_EVENT)[keyof typeof EDITORIAL_EVENT];
