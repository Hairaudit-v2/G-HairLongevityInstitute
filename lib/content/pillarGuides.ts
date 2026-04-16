import type { EditorialArticleMeta, EditorialGuideLink, EditorialPillarSlug } from "@/lib/content/types";

export type { EditorialPillarSlug } from "@/lib/content/types";

export const EDITORIAL_PILLAR_SLUGS: readonly EditorialPillarSlug[] = [
  "hair-longevity",
  "postpartum-hair-loss",
  "male-pattern-hair-loss",
  "androgen-index",
  "hair-loss-medications",
] as const;

export const PILLAR_GUIDE_HREF: Record<EditorialPillarSlug, string> = {
  "hair-longevity": "/guides/hair-longevity",
  "postpartum-hair-loss": "/guides/postpartum-hair-loss",
  "male-pattern-hair-loss": "/guides/male-pattern-hair-loss",
  "androgen-index": "/guides/androgen-index",
  "hair-loss-medications": "/guides/hair-loss-medications",
};

type PillarCopy = {
  /** Short label for cards (varied; not always the same “Pillar”). */
  cardLabelPrimary: string;
  cardLabelSecondary: string;
  guideTitle: string;
  /** One line under the top “Start with the full guide” link. */
  topBlurb: string;
  /** Card description when this pillar is primary in the bottom block. */
  bottomDescriptionPrimary: string;
  /** Card description when this pillar is secondary in the bottom block. */
  bottomDescriptionSecondary: string;
};

const PILLAR_COPY: Record<EditorialPillarSlug, PillarCopy> = {
  "hair-longevity": {
    cardLabelPrimary: "Master guide",
    cardLabelSecondary: "Big-picture guide",
    guideTitle: "The Complete Guide to Hair Longevity",
    topBlurb:
      "The broad HLI starting point for causes, diagnosis-first thinking, testing context, and how to choose a sensible next step.",
    bottomDescriptionPrimary:
      "Use the master guide when you want the full framework before narrowing into one hair-loss category.",
    bottomDescriptionSecondary:
      "Return here when you need the wider diagnosis-and-testing map around this article’s narrower topic.",
  },
  "postpartum-hair-loss": {
    cardLabelPrimary: "Postpartum pillar",
    cardLabelSecondary: "After pregnancy",
    guideTitle: "The Truth About Postpartum Hair Loss",
    topBlurb:
      "Timing, reassurance versus testing, recovery context, and when postpartum shedding may not be the whole story.",
    bottomDescriptionPrimary:
      "The dedicated postpartum pillar: what is normal, when to monitor, and when review or labs may help.",
    bottomDescriptionSecondary:
      "Use this if birth timing, breastfeeding recovery, or postpartum shedding is the core of your question.",
  },
  "male-pattern-hair-loss": {
    cardLabelPrimary: "Male pattern pillar",
    cardLabelSecondary: "Pattern progression",
    guideTitle: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    topBlurb:
      "Recession, crown thinning, staging, DHT context, and how evidence-based treatment conversations are usually framed.",
    bottomDescriptionPrimary:
      "The male-pattern pillar for classic AGA progression, scalp pattern thinking, and realistic next steps.",
    bottomDescriptionSecondary:
      "Helpful when temple, crown, or long-term pattern questions sit behind this article.",
  },
  "androgen-index": {
    cardLabelPrimary: "Androgen pillar",
    cardLabelSecondary: "Hormones & hair",
    guideTitle: "Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women",
    topBlurb:
      "Serum hormones versus follicular sensitivity, TRT and steroid exposure, and what labs can and cannot settle.",
    bottomDescriptionPrimary:
      "The hormone-and-hair pillar: DHT, testosterone, TRT, anabolic steroids, and androgen-sensitive thinning.",
    bottomDescriptionSecondary:
      "Use when androgen signalling, exposure history, or anti-androgen prescribing context matters.",
  },
  "hair-loss-medications": {
    cardLabelPrimary: "Treatment-options pillar",
    cardLabelSecondary: "Medications & procedures",
    guideTitle: "Hair Loss Medications in 2026",
    topBlurb:
      "A diagnosis-first map of medical therapy, supplements, off-label options, procedures, and emerging treatments.",
    bottomDescriptionPrimary:
      "The treatment-options pillar: compare categories and expectations without skipping diagnosis-first logic.",
    bottomDescriptionSecondary:
      "Helpful when your question is really about medicines, procedures, or how options stack together.",
  },
};

export function isEditorialPillarSlug(value: string): value is EditorialPillarSlug {
  return (EDITORIAL_PILLAR_SLUGS as readonly string[]).includes(value);
}

export function pillarGuideLink(
  pillar: EditorialPillarSlug,
  role: "primary" | "secondary"
): EditorialGuideLink {
  const copy = PILLAR_COPY[pillar];
  const href = PILLAR_GUIDE_HREF[pillar];
  return {
    href,
    label: role === "primary" ? copy.cardLabelPrimary : copy.cardLabelSecondary,
    title: copy.guideTitle,
    description: role === "primary" ? copy.bottomDescriptionPrimary : copy.bottomDescriptionSecondary,
  };
}

/** Bottom-of-article related guide cards: primary first, optional second pillar. */
export function guideLinksForArticle(meta: Pick<EditorialArticleMeta, "primaryPillar" | "secondaryPillar">): EditorialGuideLink[] {
  const out: EditorialGuideLink[] = [pillarGuideLink(meta.primaryPillar, "primary")];
  if (meta.secondaryPillar && meta.secondaryPillar !== meta.primaryPillar) {
    out.push(pillarGuideLink(meta.secondaryPillar, "secondary"));
  }
  return out;
}

export function pillarTopBlurb(pillar: EditorialPillarSlug): { href: string; guideTitle: string; blurb: string } {
  const copy = PILLAR_COPY[pillar];
  return {
    href: PILLAR_GUIDE_HREF[pillar],
    guideTitle: copy.guideTitle,
    blurb: copy.topBlurb,
  };
}
