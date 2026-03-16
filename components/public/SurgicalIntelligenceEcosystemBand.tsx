"use client";

import Link from "next/link";

/**
 * SurgicalIntelligenceEcosystemBand — minimal footer band for use across
 * Hair Longevity Institute, HairAudit, Follicle Intelligence, and IIOHR.
 * Copy this component to each site and pass currentSite so the local link is same-tab.
 */

export type EcosystemPlatform =
  | "iiohr"
  | "hairaudit"
  | "follicleintelligence"
  | "hli";

const PLATFORMS: Array<{
  id: EcosystemPlatform;
  label: string;
  tag: string;
  href: string;
}> = [
  { id: "iiohr", label: "IIOHR", tag: "training", href: "https://iiohr.com" },
  {
    id: "hairaudit",
    label: "HairAudit",
    tag: "measurement",
    href: "https://hairaudit.com",
  },
  {
    id: "follicleintelligence",
    label: "Follicle Intelligence",
    tag: "analysis",
    href: "https://follicleintelligence.com",
  },
  {
    id: "hli",
    label: "Hair Longevity Institute",
    tag: "biology",
    href: "https://hairlongevityinstitute.com",
  },
];

export interface SurgicalIntelligenceEcosystemBandProps {
  /** Current site: use internal link (e.g. "/") for this platform when internalHref is set. */
  currentSite?: EcosystemPlatform;
  /** Same-tab href for current site (e.g. "/" for HLI home). Omit to always use external href. */
  currentSiteInternalHref?: string;
  className?: string;
}

export function SurgicalIntelligenceEcosystemBand({
  currentSite,
  currentSiteInternalHref,
  className = "",
}: SurgicalIntelligenceEcosystemBandProps) {
  return (
    <div
      className={`border-t border-white/[0.08] bg-black/20 py-4 sm:py-5 ${className}`}
      role="contentinfo"
      aria-label="Surgical Intelligence Ecosystem"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:gap-6 sm:px-6">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50 sm:text-xs">
          Part of the Surgical Intelligence Ecosystem™
        </span>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-white/55 sm:gap-8 sm:text-sm"
          aria-label="Ecosystem platforms"
        >
          {PLATFORMS.map((platform) => {
            const isCurrent = currentSite === platform.id;
            const useInternal =
              isCurrent && currentSiteInternalHref != null;
            const href = useInternal ? currentSiteInternalHref! : platform.href;

            if (useInternal) {
              return (
                <Link
                  key={platform.id}
                  href={href}
                  className="transition hover:text-white/80"
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {platform.label}
                  <span className="ml-1 text-white/40">— {platform.tag}</span>
                </Link>
              );
            }

            return (
              <a
                key={platform.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/80"
                aria-current={isCurrent ? "page" : undefined}
              >
                {platform.label}
                <span className="ml-1 text-white/40">— {platform.tag}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
