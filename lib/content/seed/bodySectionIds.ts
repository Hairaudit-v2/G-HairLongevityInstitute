/**
 * H2 `id` values in each article body (`seed/bodies.tsx`), in document order.
 * Keep in sync when adding or renaming sections — `validateEditorialCorpus` compares to `toc`.
 */
export const EDITORIAL_BODY_SECTION_IDS: Record<string, readonly string[]> = {
  "what-blood-tests-matter-for-hair-loss": [
    "why-selective",
    "iron-and-blood-count",
    "thyroid",
    "inflammation-nutrition",
    "fitting-together",
    "not-medical-advice",
    "when-specialist",
  ],
  "ferritin-and-hair-loss": [
    "what-ferritin-is",
    "shedding-context",
    "targets-and-ranges",
    "with-thyroid",
    "supplements",
    "summary",
  ],
  "thyroid-hair-loss-explained": [
    "how-thyroid-affects-hair",
    "common-tests",
    "subclinical",
    "normal-tests-still-shedding",
    "iron-and-thyroid",
    "next-steps",
  ],
  "dht-and-androgenetic-alopecia": [
    "pattern-recognition",
    "dht-role",
    "not-only-men",
    "labs",
    "treatment-context",
    "expectations",
  ],
  "diffuse-thinning-in-women": [
    "patterns",
    "overlap",
    "labs-selective",
    "androgenetic",
    "procedural",
    "support",
  ],
  "prp-vs-exosomes": [
    "what-prp-is",
    "exosomes-claims",
    "evidence",
    "safety",
    "who-benefits",
    "before-procedure",
    "labs",
  ],
  "finasteride-vs-saw-palmetto": [
    "finasteride-mechanism",
    "women",
    "saw-palmetto",
    "not-substitute",
    "dht-context",
    "monitoring",
    "takeaway",
  ],
  "hli-vs-hairaudit": [
    "hli-focus",
    "hairaudit-focus",
    "overlap",
    "same-ecosystem",
    "reading",
    "when-hairaudit",
    "not-advice",
  ],
};
