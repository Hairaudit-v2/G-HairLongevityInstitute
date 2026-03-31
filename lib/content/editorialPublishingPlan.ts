/**
 * Editorial programme notes for the HLI corpus (v1).
 * Keep in sync with `relatedSlugs` on each record in `articlesData.tsx`.
 */

/** Recommended go-live order (dependencies and topical flow). */
export const EDITORIAL_PUBLISH_ORDER_V1 = [
  "what-blood-tests-matter-for-hair-loss",
  "ferritin-and-hair-loss",
  "thyroid-hair-loss-explained",
  "telogen-effluvium-after-illness-or-stress",
  "postpartum-shedding-when-to-reassure-vs-when-to-test",
  "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
  "scalp-inflammation-and-shedding",
  "diffuse-thinning-in-women",
  "dht-and-androgenetic-alopecia",
  "minoxidil-mechanism-and-realistic-timelines",
  "finasteride-vs-saw-palmetto",
  "oral-anti-androgens-in-women-specialist-led-context",
  "prp-vs-exosomes",
  "post-transplant-shock-loss-and-expectations",
  "hli-vs-hairaudit",
] as const;

/**
 * Curated related graph suggestions (per-article `relatedSlugs` in articlesData is source of truth).
 */
export const EDITORIAL_RELATED_MAP_V1: Record<string, readonly string[]> = {
  "what-blood-tests-matter-for-hair-loss": [
    "ferritin-and-hair-loss",
    "thyroid-hair-loss-explained",
    "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
    "telogen-effluvium-after-illness-or-stress",
  ],
  "ferritin-and-hair-loss": [
    "what-blood-tests-matter-for-hair-loss",
    "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
    "postpartum-shedding-when-to-reassure-vs-when-to-test",
    "telogen-effluvium-after-illness-or-stress",
  ],
  "thyroid-hair-loss-explained": [
    "what-blood-tests-matter-for-hair-loss",
    "ferritin-and-hair-loss",
    "postpartum-shedding-when-to-reassure-vs-when-to-test",
    "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
  ],
  "telogen-effluvium-after-illness-or-stress": [
    "postpartum-shedding-when-to-reassure-vs-when-to-test",
    "what-blood-tests-matter-for-hair-loss",
    "scalp-inflammation-and-shedding",
    "diffuse-thinning-in-women",
  ],
  "postpartum-shedding-when-to-reassure-vs-when-to-test": [
    "telogen-effluvium-after-illness-or-stress",
    "ferritin-and-hair-loss",
    "thyroid-hair-loss-explained",
    "diffuse-thinning-in-women",
  ],
  "vitamin-d-b12-folate-what-labs-may-mean-for-hair": [
    "what-blood-tests-matter-for-hair-loss",
    "ferritin-and-hair-loss",
    "thyroid-hair-loss-explained",
    "telogen-effluvium-after-illness-or-stress",
  ],
  "scalp-inflammation-and-shedding": [
    "telogen-effluvium-after-illness-or-stress",
    "diffuse-thinning-in-women",
    "what-blood-tests-matter-for-hair-loss",
    "minoxidil-mechanism-and-realistic-timelines",
  ],
  "diffuse-thinning-in-women": [
    "dht-and-androgenetic-alopecia",
    "postpartum-shedding-when-to-reassure-vs-when-to-test",
    "scalp-inflammation-and-shedding",
    "telogen-effluvium-after-illness-or-stress",
  ],
  "dht-and-androgenetic-alopecia": [
    "diffuse-thinning-in-women",
    "finasteride-vs-saw-palmetto",
    "minoxidil-mechanism-and-realistic-timelines",
    "telogen-effluvium-after-illness-or-stress",
  ],
  "minoxidil-mechanism-and-realistic-timelines": [
    "finasteride-vs-saw-palmetto",
    "dht-and-androgenetic-alopecia",
    "scalp-inflammation-and-shedding",
    "telogen-effluvium-after-illness-or-stress",
  ],
  "finasteride-vs-saw-palmetto": [
    "dht-and-androgenetic-alopecia",
    "minoxidil-mechanism-and-realistic-timelines",
    "oral-anti-androgens-in-women-specialist-led-context",
    "what-blood-tests-matter-for-hair-loss",
  ],
  "oral-anti-androgens-in-women-specialist-led-context": [
    "diffuse-thinning-in-women",
    "dht-and-androgenetic-alopecia",
    "minoxidil-mechanism-and-realistic-timelines",
    "finasteride-vs-saw-palmetto",
  ],
  "prp-vs-exosomes": [
    "finasteride-vs-saw-palmetto",
    "post-transplant-shock-loss-and-expectations",
    "hli-vs-hairaudit",
    "minoxidil-mechanism-and-realistic-timelines",
  ],
  "post-transplant-shock-loss-and-expectations": [
    "prp-vs-exosomes",
    "hli-vs-hairaudit",
    "what-blood-tests-matter-for-hair-loss",
    "minoxidil-mechanism-and-realistic-timelines",
  ],
  "hli-vs-hairaudit": [
    "what-blood-tests-matter-for-hair-loss",
    "post-transplant-shock-loss-and-expectations",
    "prp-vs-exosomes",
    "scalp-inflammation-and-shedding",
  ],
};

/** Next-wave topic ideas after the 15-article v1 corpus. */
export const EDITORIAL_CONTENT_GAPS_NEXT_WAVE = [
  "hair-loss-assessment-roadmap",
  "crown-thinning-vs-temple-recession-patterns",
  "chronic-telogen-effluvium-when-shedding-persists",
  "autoimmune-alopecia-overview-referral-context",
] as const;
