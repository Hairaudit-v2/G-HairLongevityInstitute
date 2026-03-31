/**
 * Editorial programme notes for the first HLI seed corpus (v1).
 * Keep in sync with `relatedSlugs` on each record in `articlesData.tsx`.
 */

/** Recommended go-live order (dependencies and topical flow). */
export const EDITORIAL_PUBLISH_ORDER_V1 = [
  "what-blood-tests-matter-for-hair-loss",
  "ferritin-and-hair-loss",
  "thyroid-hair-loss-explained",
  "dht-and-androgenetic-alopecia",
  "diffuse-thinning-in-women",
  "finasteride-vs-saw-palmetto",
  "prp-vs-exosomes",
  "hli-vs-hairaudit",
] as const;

/**
 * Curated related graph (each article should list 3–5 of these in `relatedSlugs`).
 * Symmetric suggestions for editors; the site uses per-article `relatedSlugs` as source of truth.
 */
export const EDITORIAL_RELATED_MAP_V1: Record<string, readonly string[]> = {
  "what-blood-tests-matter-for-hair-loss": [
    "ferritin-and-hair-loss",
    "thyroid-hair-loss-explained",
    "diffuse-thinning-in-women",
    "dht-and-androgenetic-alopecia",
  ],
  "ferritin-and-hair-loss": [
    "what-blood-tests-matter-for-hair-loss",
    "thyroid-hair-loss-explained",
    "diffuse-thinning-in-women",
    "dht-and-androgenetic-alopecia",
  ],
  "thyroid-hair-loss-explained": [
    "what-blood-tests-matter-for-hair-loss",
    "ferritin-and-hair-loss",
    "diffuse-thinning-in-women",
    "dht-and-androgenetic-alopecia",
  ],
  "dht-and-androgenetic-alopecia": [
    "diffuse-thinning-in-women",
    "finasteride-vs-saw-palmetto",
    "thyroid-hair-loss-explained",
    "what-blood-tests-matter-for-hair-loss",
  ],
  "diffuse-thinning-in-women": [
    "dht-and-androgenetic-alopecia",
    "ferritin-and-hair-loss",
    "thyroid-hair-loss-explained",
    "finasteride-vs-saw-palmetto",
  ],
  "prp-vs-exosomes": [
    "finasteride-vs-saw-palmetto",
    "what-blood-tests-matter-for-hair-loss",
    "hli-vs-hairaudit",
    "diffuse-thinning-in-women",
  ],
  "finasteride-vs-saw-palmetto": [
    "dht-and-androgenetic-alopecia",
    "prp-vs-exosomes",
    "diffuse-thinning-in-women",
    "what-blood-tests-matter-for-hair-loss",
  ],
  "hli-vs-hairaudit": [
    "what-blood-tests-matter-for-hair-loss",
    "prp-vs-exosomes",
    "finasteride-vs-saw-palmetto",
    "dht-and-androgenetic-alopecia",
  ],
};

/** Suggested articles 9–15 to close common gaps after the seed set. */
export const EDITORIAL_CONTENT_GAPS_9_15 = [
  "postpartum-shedding-when-to-reassure-when-to-test",
  "telogen-effluvium-after-illness-or-stress",
  "minoxidil-mechanism-and-realistic-timelines",
  "scalp-inflammation-and-shedding-seborrheic-context",
  "vitamin-d-b12-folate-hair-loss-what-labs-mean",
  "post-transplant-shock-loss-and-expectations",
  "oral-antiandrogens-in-women-prescribing-context",
] as const;
