/**
 * Featured downloadable / landing-page guides for HLI marketing surfaces.
 * Order matters: first item is the foundational “start here” guide on the homepage.
 */
export type HliFeaturedGuide = {
  id: string;
  category: string;
  title: string;
  shortTitle?: string;
  description: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  audience?: "patients" | "clinicians" | "both";
  updatedAt?: string;
  /** Shown on the primary button when an action href resolves */
  ctaLabel: string;
  /** Guide landing page or direct PDF path under /public */
  href?: string;
  /** When set with href, passed to SecondaryButton for same-origin PDFs */
  downloadAs?: string;
  /** Optional second link when a landing page href and an alternate path both exist */
  readOnlineHref?: string;
  readOnlineLabel?: string;
};

/** Hub route for “view all” and future library expansion */
export const HLI_GUIDES_HUB_PATH = "/guides";

/** Unified CTA label across featured guides (homepage + hub). */
export const HLI_GUIDE_CTA_READ = "Read the Guide";

/** Homepage / hub featured set (display order). */
export const FEATURED_HLI_GUIDES: HliFeaturedGuide[] = [
  {
    id: "hair-longevity-foundational",
    category: "Foundational Guide",
    title: "The Complete Guide to Hair Longevity",
    description:
      "Understand how hair loss works, the most common causes of thinning and shedding, what early signs matter, which tests are worth considering, and what evidence-based options may actually help.",
    thumbnailSrc: "/homepage/guides/guide-hair-longevity.png",
    thumbnailAlt: "Editorial illustration for the Complete Guide to Hair Longevity.",
    ctaLabel: HLI_GUIDE_CTA_READ,
    href: "/guides/hair-longevity",
  },
  {
    id: "hair-loss-medications-in-2026",
    category: "Treatment Guide",
    title: "Hair Loss Medications in 2026",
    shortTitle: "Hair Loss Medications",
    description:
      "A pillar guide to what is available now, what is used off-label, what is natural, what is still in trials, and how to compare options without hype.",
    thumbnailSrc: "/homepage/guides/guide-medications%20.png",
    thumbnailAlt: "Editorial illustration for the Hair Loss Medications guide.",
    audience: "patients",
    updatedAt: "April 2026",
    ctaLabel: HLI_GUIDE_CTA_READ,
    href: "/guides/hair-loss-medications",
  },
  {
    id: "postpartum",
    category: "Women's Hair Health",
    title: "The Truth About Postpartum Hair Loss",
    description:
      "Understand why postpartum shedding happens, what is normal, when to investigate further, and how to support healthier regrowth.",
    thumbnailSrc: "/homepage/guides/guide-postpartum.png",
    thumbnailAlt: "Editorial illustration for the postpartum hair loss guide.",
    ctaLabel: HLI_GUIDE_CTA_READ,
    href: "/guides/postpartum-hair-loss",
  },
  {
    id: "male-pattern",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description:
      "Learn how male pattern hair loss progresses, what early signs to look for, and which evidence-based strategies may actually help.",
    thumbnailSrc: "/homepage/guides/guide-male-pattern.jpg",
    thumbnailAlt: "Editorial illustration for the male pattern hair loss guide.",
    ctaLabel: HLI_GUIDE_CTA_READ,
    href: "/guides/male-pattern-hair-loss",
  },
  {
    id: "androgen-biology",
    category: "Hormones & Hair",
    title: "Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women",
    description:
      "Explore how androgen biology, hormone exposure, and follicular sensitivity can shape hair-loss risk in both men and women.",
    thumbnailSrc: "/homepage/guides/guide-androgen.png",
    thumbnailAlt: "Editorial illustration for the androgen biology and hair guide.",
    ctaLabel: HLI_GUIDE_CTA_READ,
    href: "/guides/androgen-index",
  },
];
