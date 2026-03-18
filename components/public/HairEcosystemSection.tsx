"use client";

/**
 * HairEcosystemSection — reusable across Hair Longevity Institute, HairAudit, and Follicle Intelligence.
 * Explains the relationship between the three platforms. Use the `site` prop for context-specific intro text.
 * Use `currentPlatform` to highlight the card for the platform where the section is rendered.
 */

export type EcosystemSite = "hli" | "hairaudit" | "follicleintelligence";

const DEFAULT_INTRO =
  "Hair restoration decisions involve biology, treatment optimisation, and surgical outcomes. The Hair Intelligence ecosystem brings together three platforms to support clarity at every step.";

const INTRO_BY_SITE: Record<EcosystemSite, string> = {
  hli: "Hair Longevity Institute is part of the Hair Intelligence ecosystem. Hair restoration decisions involve biology, treatment optimisation, and surgical outcomes — we focus on the biology and treatment strategy side, while our sister platforms address surgical transparency and the analysis engine that powers both.",
  hairaudit:
    "HairAudit is part of the Hair Intelligence ecosystem. Hair restoration decisions involve biology, treatment optimisation, and surgical outcomes — we focus on independent analysis of hair transplant procedures and surgical transparency, alongside platforms for biological optimisation and the shared analysis engine.",
  follicleintelligence:
    "Follicle Intelligence powers the Hair Intelligence ecosystem. Hair restoration decisions involve biology, treatment optimisation, and surgical outcomes — we provide the analysis engine that supports biological interpretation, treatment roadmaps, and surgical outcome evaluation across the ecosystem.",
};

const BENEFIT_STATEMENT =
  "Together, these platforms help patients understand hair biology, evaluate surgical options, and make more informed decisions with greater transparency.";

const CONTEXTUAL_HELPER_BY_SITE: Record<EcosystemSite, string> = {
  hli: "Considering surgery later? HairAudit helps patients compare transplant quality, outcomes, and clinic transparency.",
  hairaudit:
    "Not sure whether surgery is the right next step? Hair Longevity Institute helps patients understand the biology behind hair loss first.",
  follicleintelligence:
    "This engine powers both biological interpretation and surgical outcome analysis across the ecosystem.",
};

const CARDS: Array<{
  platformId: EcosystemSite;
  title: string;
  description: string;
  bullets: readonly string[];
  teaser?: string;
  buttonLabel: string;
  href: string;
}> = [
  {
    platformId: "hli",
    title: "Hair Longevity Institute",
    description:
      "Biology-first platform analysing hair loss causes and developing treatment strategies.",
    bullets: [
      "biological hair loss interpretation",
      "treatment roadmap development",
      "hormonal and scalp health mapping",
      "personalised longevity strategies",
      "specialist trichologist review",
    ],
    buttonLabel: "Explore Hair Longevity Institute",
    href: "https://hairlongevityinstitute.com",
  },
  {
    platformId: "hairaudit",
    title: "HairAudit",
    description:
      "Independent platform analysing hair transplant procedures and surgical outcomes.",
    bullets: [
      "surgeon performance analysis",
      "donor extraction quality evaluation",
      "implantation design assessment",
      "graft survival consistency",
      "clinic transparency metrics",
    ],
    teaser:
      "HairAudit is being built to help patients explore surgeons by location, cost ranges, donor extraction quality, implantation quality, repair work, and other meaningful surgical categories.",
    buttonLabel: "Explore HairAudit",
    href: "https://hairaudit.com",
  },
  {
    platformId: "follicleintelligence",
    title: "Follicle Intelligence",
    description: "Analysis engine powering the ecosystem.",
    bullets: [
      "biological pattern analysis",
      "surgical outcome intelligence",
      "treatment response tracking",
      "global case data aggregation",
      "AI-assisted clinical interpretation",
    ],
    buttonLabel: "Explore Follicle Intelligence",
    href: "https://follicleintelligence.ai",
  },
] as const;

export interface HairEcosystemSectionProps {
  /** Site context for intro paragraph variation. Omit for generic intro. */
  site?: EcosystemSite;
  /** Override intro paragraph entirely. Takes precedence over `site`. */
  introParagraph?: string;
  /** Highlight the card for this platform (stronger border, brighter bg, "Current platform" badge). */
  currentPlatform?: EcosystemSite;
  /** When false, do not show the contextual helper line (e.g. when already shown as pre-section copy above). Default true. */
  showContextualHelper?: boolean;
  /** Optional className for the section wrapper. */
  className?: string;
  /** Optional id for anchor links (e.g. full-ecosystem). */
  id?: string;
}

export function HairEcosystemSection({
  site,
  introParagraph,
  currentPlatform,
  showContextualHelper = true,
  className = "",
  id,
}: HairEcosystemSectionProps) {
  const intro =
    introParagraph ?? (site ? INTRO_BY_SITE[site] : DEFAULT_INTRO);
  const contextualHelper =
    showContextualHelper && site ? CONTEXTUAL_HELPER_BY_SITE[site] : null;

  return (
    <section
      id={id}
      className={`border-t border-white/[0.08] bg-[rgb(var(--bg-dark))] py-16 sm:py-20 md:py-24 ${className}`}
      aria-labelledby="ecosystem-heading"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
            Connected platforms
          </p>
          <h2
            id="ecosystem-heading"
            className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl"
          >
            The Hair Intelligence Ecosystem
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-white/75 sm:text-base">
            {intro}
          </p>
          <p className="mt-4 text-sm font-medium text-white/80 sm:text-base">
            {BENEFIT_STATEMENT}
          </p>
          {contextualHelper && (
            <p className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center text-sm text-white/65 sm:px-5">
              {contextualHelper}
            </p>
          )}
        </header>

        <div className="mt-12 grid gap-6 sm:mt-14 md:grid-cols-3 md:gap-6 lg:mt-16 lg:gap-8">
          {CARDS.map((card) => {
            const isCurrent = currentPlatform === card.platformId;
            return (
              <div
                key={card.title}
                className={`relative flex flex-col rounded-2xl border p-6 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.04)_inset] transition hover:border-white/[0.12] sm:p-7 ${
                  isCurrent
                    ? "border-[rgb(var(--gold))]/25 bg-white/[0.06]"
                    : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                {isCurrent && (
                  <span
                    className="absolute right-4 top-4 rounded-md border border-[rgb(var(--gold))]/20 bg-[rgb(var(--gold))]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--gold))]/90"
                    aria-hidden
                  >
                    Current platform
                  </span>
                )}
                <h3
                  className={`text-lg font-semibold tracking-tight text-white sm:text-xl ${isCurrent ? "pr-28" : ""}`}
                >
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {card.description}
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-xs text-white/65 sm:text-sm">
                  {card.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 before:mt-1.5 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-[rgb(var(--gold))]/50 before:content-['']"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
                {card.teaser && (
                  <p className="mt-4 text-[11px] leading-relaxed text-white/50 sm:text-xs">
                    {card.teaser}
                  </p>
                )}
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  {card.buttonLabel}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
