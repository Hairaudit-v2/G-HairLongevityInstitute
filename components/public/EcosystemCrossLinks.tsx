"use client";

/**
 * EcosystemCrossLinks — standardised cross-platform links.
 *
 * Rules:
 * - HLI: Links to HairAudit ONLY when discussing surgery; links to FI as analysis engine.
 * - HairAudit: Links to HLI for biology/treatment; links to FI for scoring engine.
 * - Follicle Intelligence: Positioned as the core engine powering both.
 *
 * Use consistent card layout; avoid random linking.
 */

export type EcosystemSite = "hli" | "hairaudit" | "follicleintelligence";

export interface EcosystemCrossLinksProps {
  /** Current platform (determines which links to show). */
  currentSite: EcosystemSite;
  /** HLI only: when true, include HairAudit card (surgery context). Default false. */
  showSurgeryLink?: boolean;
  /** When true (e.g. for-professionals page), include IIOHR as first card. Default false. */
  includeIIOHR?: boolean;
  /** "light" | "dark" for card styling. Default "light". */
  theme?: "light" | "dark";
  /** Optional section heading. */
  heading?: string;
  /** Optional id for the section. */
  id?: string;
  className?: string;
}

interface CardItem {
  id: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

const HLI_CARD: CardItem = {
  id: "hli",
  title: "Hair Longevity Institute",
  description: "Understand the biology behind hair loss and your treatment options before or alongside any procedure.",
  href: "https://hairlongevityinstitute.com",
  ctaLabel: "Explore Hair Longevity Institute",
};

const HAIRAUDIT_CARD: CardItem = {
  id: "hairaudit",
  title: "HairAudit",
  description: "When surgery is part of the picture — compare surgeons, outcomes, and clinic transparency with independent analysis.",
  href: "https://hairaudit.com",
  ctaLabel: "Explore HairAudit",
};

const FI_CARD: CardItem = {
  id: "follicleintelligence",
  title: "Follicle Intelligence",
  description: "The analysis engine powering biological interpretation and surgical outcome evaluation across the ecosystem.",
  href: "https://follicleintelligence.ai",
  ctaLabel: "Explore Follicle Intelligence",
};

const IIOHR_CARD: CardItem = {
  id: "iiohr",
  title: "IIOHR",
  description: "Education and certification for surgical standards and training.",
  href: "https://iiohr.com",
  ctaLabel: "Explore IIOHR",
};

function getCards(
  currentSite: EcosystemSite,
  showSurgeryLink: boolean,
  includeIIOHR: boolean
): CardItem[] {
  let cards: CardItem[] = [];
  switch (currentSite) {
    case "hli":
      if (includeIIOHR) cards = [IIOHR_CARD, HAIRAUDIT_CARD, FI_CARD];
      else if (showSurgeryLink) cards = [FI_CARD, HAIRAUDIT_CARD];
      else cards = [FI_CARD];
      break;
    case "hairaudit":
      cards = [HLI_CARD, FI_CARD];
      break;
    case "follicleintelligence":
      cards = [HLI_CARD, HAIRAUDIT_CARD];
      break;
    default:
      return [];
  }
  return cards;
}

export function EcosystemCrossLinks({
  currentSite,
  showSurgeryLink = false,
  includeIIOHR = false,
  theme = "light",
  heading = "Part of the Hair Intelligence ecosystem",
  id,
  className = "",
}: EcosystemCrossLinksProps) {
  const cards = getCards(currentSite, showSurgeryLink, includeIIOHR);
  if (cards.length === 0) return null;

  const isLight = theme === "light";
  const cardClass = isLight
    ? "rounded-card border border-[rgb(var(--border-soft))] bg-card p-6 shadow-soft transition hover:shadow-card"
    : "rounded-card border border-white/[0.08] bg-white/[0.04] p-6 transition hover:border-white/[0.12]";
  const titleClass = isLight ? "text-lg font-semibold text-[rgb(var(--text-primary))]" : "text-lg font-semibold text-white";
  const descClass = isLight ? "mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed" : "mt-2 text-sm text-white/70 leading-relaxed";
  const ctaClass = isLight
    ? "mt-4 inline-flex min-h-[44px] items-center justify-center rounded-btn border border-[rgb(var(--medical))]/25 bg-card px-5 py-2.5 text-sm font-semibold text-medical shadow-soft transition hover:bg-subtle"
    : "mt-4 inline-flex min-h-[44px] items-center justify-center rounded-btn border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10";
  const headingClass = isLight ? "text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]" : "text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]";

  return (
    <section id={id} className={className} aria-labelledby={id ? `${id}-heading` : undefined}>
      <h2 id={id ? `${id}-heading` : undefined} className={headingClass}>
        {heading}
      </h2>
      <div className={`mt-4 grid gap-4 ${cards.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {cards.map((card) => (
          <div key={card.id} className={cardClass}>
            <h3 className={titleClass}>{card.title}</h3>
            <p className={descClass}>{card.description}</p>
            <a
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaClass}
            >
              {card.ctaLabel}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
