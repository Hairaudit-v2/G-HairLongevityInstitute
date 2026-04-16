/**
 * Curated insight slugs for public discovery surfaces. Keep lists short; copy uses article titles from the corpus.
 * Not every article needs a slot here — the full library on /insights remains the backstop.
 */

export const HOMEPAGE_INSIGHT_PICK_SLUGS = [
  "hair-shedding-vs-hair-breakage",
  "does-trt-cause-hair-loss-or-unmask-it",
  "postpartum-hair-loss-vs-female-pattern-thinning",
] as const;

/** Complements pillar guides without competing with them — specific questions, not broad primers. */
export const GUIDES_HUB_INSIGHT_PICK_SLUGS = [
  "receding-hairline-vs-mature-hairline",
  "oral-minoxidil-vs-topical-minoxidil",
  "normal-testosterone-and-androgen-sensitive-hair-loss",
] as const;

/** Default /insights “Suggested first reads” order (plain /insights only). */
export const INSIGHTS_FEATURED_SLUGS: readonly string[] = [
  "hair-shedding-vs-hair-breakage",
  "receding-hairline-vs-mature-hairline",
  "postpartum-hair-loss-vs-female-pattern-thinning",
  "oral-minoxidil-vs-topical-minoxidil",
  "what-blood-tests-matter-for-hair-loss",
  "telogen-effluvium-after-illness-or-stress",
];
