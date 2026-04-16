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
      intro:
        "Start with how you describe what you see — then layer illness, stress, or pattern overlap. Not postpartum-owned; birth timing has its own pillar.",
      items: [
        {
          slug: "hair-shedding-vs-hair-breakage",
          note: "Follicle shedding versus shaft damage — the right lane before labs or products.",
        },
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
      title: "Postpartum hair changes: differentiation and next steps",
      intro:
        "The differentiation article is the main support read for ‘is this just postpartum shed?’ versus pattern thinning; reassurance versus testing sits alongside it.",
      items: [
        {
          slug: "postpartum-hair-loss-vs-female-pattern-thinning",
          note: "Primary read: expected telogen shed versus female-pattern thinning — overlap included.",
        },
        {
          slug: "postpartum-shedding-when-to-reassure-vs-when-to-test",
          note: "When watchful waiting fits versus when iron, thyroid, or other tests belong in the conversation.",
        },
      ],
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
      title: "Pattern, staging, and where mechanism fits",
      intro:
        "Hairline and crown articles carry progression and exam framing first; the DHT explainer is the mechanistic companion — not a substitute for staging on this pillar.",
      items: [
        {
          slug: "receding-hairline-vs-mature-hairline",
          note: "Maturation versus recession — exam and photos, not forum labels alone.",
        },
        {
          slug: "crown-thinning-why-it-can-be-harder-to-treat",
          note: "Vertex visibility and timelines — why the crown frustrates without duplicating full staging grids here.",
        },
        { slug: "dht-and-androgenetic-alopecia", note: "DHT and miniaturisation — read after pattern context from the guide." },
      ],
    },
  ],
  "androgen-index": [
    {
      title: "Prescribed anti-androgens (women) — specialist context",
      intro:
        "Female-pattern care sometimes overlaps this pillar; full DHT pathway detail and Norwood-style staging live with the male-pattern guide and DHT article so this block stays prescriber-safety focused.",
      items: [
        {
          slug: "oral-anti-androgens-in-women-specialist-led-context",
          note: "Specialist-led context — not a self-start checklist.",
        },
      ],
    },
    {
      title: "TRT, serum testosterone, and follicular sensitivity",
      intro:
        "Hormone exposure and lab-normal sensitivity — paired reads. For DHT mechanics and miniaturisation depth, follow from here to the DHT article via related links, not as a second full lecture on this page.",
      items: [
        { slug: "does-trt-cause-hair-loss-or-unmask-it", note: "Exposure and timing — conversation with your prescriber." },
        {
          slug: "normal-testosterone-and-androgen-sensitive-hair-loss",
          note: "Why ‘normal T’ and pattern thinning can coexist — labs versus follicle biology.",
        },
      ],
    },
  ],
  "hair-loss-medications": [
    {
      title: "Medicines, routes, and class comparisons",
      intro:
        "Mechanism and month-scale expectations live in the minoxidil deep-dive; route and 5-ARI conversations sit beside it without duplicating that timeline content.",
      items: [
        { slug: "minoxidil-mechanism-and-realistic-timelines", note: "Mechanism, shed phase, and timelines — start here for minoxidil." },
        {
          slug: "oral-minoxidil-vs-topical-minoxidil",
          note: "Route comparison — pairs with the explainer above.",
        },
        { slug: "finasteride-vs-saw-palmetto" },
        {
          slug: "dutasteride-for-hair-loss-when-it-enters-the-conversation",
          note: "When the name comes up — not interchangeable with finasteride without supervision.",
        },
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
