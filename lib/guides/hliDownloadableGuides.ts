import {
  HAIR_LOSS_MEDICATIONS_IN_2026_GUIDE_PDF_DOWNLOAD_AS,
  HAIR_LOSS_MEDICATIONS_IN_2026_GUIDE_PDF_HREF,
} from "@/lib/guides/hliGuidePdfs";

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
    ctaLabel: HLI_GUIDE_CTA_READ,
    href: "/guides/hair-longevity",
  },
  {
    id: "hair-loss-medications-in-2026",
    category: "Patient Guide",
    title: "Hair Loss Medications in 2026",
    shortTitle: "Hair Loss Medications",
    description:
      "A complete patient guide to what is available now, what is used off-label, what is natural, and what is still in trials.",
    audience: "patients",
    updatedAt: "April 2026",
    ctaLabel: HLI_GUIDE_CTA_READ,
    href: HAIR_LOSS_MEDICATIONS_IN_2026_GUIDE_PDF_HREF,
    downloadAs: HAIR_LOSS_MEDICATIONS_IN_2026_GUIDE_PDF_DOWNLOAD_AS,
  },
  {
    id: "postpartum",
    category: "Women's Hair Health",
    title: "The Truth About Postpartum Hair Loss",
    description:
      "Understand why postpartum shedding happens, what is normal, when to investigate further, and how to support healthier regrowth.",
    ctaLabel: HLI_GUIDE_CTA_READ,
    href: "/guides/postpartum-hair-loss",
  },
  {
    id: "male-pattern",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description:
      "Learn how male pattern hair loss progresses, what early signs to look for, and which evidence-based strategies may actually help.",
    ctaLabel: HLI_GUIDE_CTA_READ,
    href: "/guides/male-pattern-hair-loss",
  },
  {
    id: "androgen-biology",
    category: "Hormones & Hair",
    title: "Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women",
    description:
      "Explore how androgen biology, hormone exposure, and follicular sensitivity can shape hair-loss risk in both men and women.",
    ctaLabel: HLI_GUIDE_CTA_READ,
    href: "/guides/androgen-index",
  },
];
