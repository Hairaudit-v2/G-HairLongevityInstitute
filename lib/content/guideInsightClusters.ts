import type { EditorialPillarSlug } from "@/lib/content/types";

export type GuideInsightClusterItem = {
  slug: string;
  /** Optional line under the title — use for hierarchy (“Companion read”, “Labs overlap”, etc.). */
  note?: string;
};

export type GuideInsightClusterGroup = {
  title: string;
  intro?: string;
  items: GuideInsightClusterItem[];
};

/**
 * Curated insight groupings for public guide pages. Articles appear under their *primary* pillar
 * in the automated index; these groups add structure without duplicating every article on every guide.
 */
export const GUIDE_INSIGHT_CLUSTERS: Record<EditorialPillarSlug, GuideInsightClusterGroup[]> = {
  "hair-longevity": [
    {
      title: "Diagnosis, labs, and what to ask first",
      intro: "Testing helps when it matches your story — these articles sit under the master guide’s diagnosis-first lane.",
      items: [
        { slug: "what-blood-tests-matter-for-hair-loss" },
        { slug: "ferritin-and-hair-loss", note: "Iron storage in context — not a solo answer." },
        { slug: "thyroid-hair-loss-explained" },
        { slug: "vitamin-d-b12-folate-what-labs-may-mean-for-hair", note: "Micronutrients when deficiency is plausible." },
      ],
    },
    {
      title: "Shedding, stress recovery, and mixed pictures",
      items: [
        { slug: "telogen-effluvium-after-illness-or-stress" },
        { slug: "diffuse-thinning-in-women", note: "How clinicians separate overlapping causes." },
        { slug: "scalp-inflammation-and-shedding", note: "When the scalp exam comes before product roulette." },
      ],
    },
    {
      title: "HLI in the wider ecosystem",
      items: [{ slug: "hli-vs-hairaudit", note: "Where medical hair support starts versus transplant-focused review." }],
    },
  ],
  "postpartum-hair-loss": [
    {
      title: "Postpartum shedding and next steps",
      intro: "The postpartum insight pairs with this pillar page; labs below are common overlap topics.",
      items: [{ slug: "postpartum-shedding-when-to-reassure-vs-when-to-test" }],
    },
    {
      title: "When iron or thyroid are part of the conversation",
      intro: "These articles live under the master guide for diagnosis context — linked here when recovery or testing overlaps.",
      items: [
        { slug: "ferritin-and-hair-loss", note: "Often discussed after blood loss or low intake in recovery." },
        { slug: "thyroid-hair-loss-explained", note: "Postpartum thyroid change can sit alongside shedding." },
      ],
    },
  ],
  "male-pattern-hair-loss": [
    {
      title: "Pattern thinning, DHT, and staging",
      intro: "The male-pattern pillar expands recession, crown thinning, and realistic treatment framing beyond a single article.",
      items: [{ slug: "dht-and-androgenetic-alopecia", note: "Mechanism and pattern recognition — companion to this guide." }],
    },
  ],
  "androgen-index": [
    {
      title: "Androgens, prescribing, and sensitivity",
      intro:
        "Oral anti-androgens in women is the featured insight here. DHT mechanism and pattern staging are linked from the guide sections above; the DHT explainer article stays primary to the male-pattern pillar.",
      items: [
        {
          slug: "oral-anti-androgens-in-women-specialist-led-context",
          note: "Specialist-led context — not a self-start checklist.",
        },
      ],
    },
  ],
  "hair-loss-medications": [
    {
      title: "Medicines, comparisons, and timelines",
      items: [
        { slug: "finasteride-vs-saw-palmetto" },
        { slug: "minoxidil-mechanism-and-realistic-timelines" },
      ],
    },
    {
      title: "Procedures, recovery, and escalation",
      items: [
        { slug: "prp-vs-exosomes", note: "Questions to ask before paying for injections." },
        { slug: "post-transplant-shock-loss-and-expectations", note: "Aftercare and expectations — not a substitute for your surgeon." },
      ],
    },
  ],
};
