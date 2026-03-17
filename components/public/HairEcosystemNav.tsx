"use client";

import Link from "next/link";

/**
 * HairEcosystemNav — slim ecosystem bar for Hair Longevity Institute, HairAudit, and Follicle Intelligence.
 * Place above or below the main header. Pass currentSite so the active platform is subtly highlighted.
 * On the current site, pass currentSiteInternalHref (e.g. "/") to use same-tab navigation for the current platform link.
 */

export type EcosystemSite = "hli" | "hairaudit" | "follicleintelligence";

const PLATFORMS: Array<{
  id: EcosystemSite;
  label: string;
  href: string;
}> = [
  { id: "hli", label: "Hair Longevity Institute", href: "https://hairlongevityinstitute.com" },
  { id: "hairaudit", label: "HairAudit", href: "https://hairaudit.com" },
  {
    id: "follicleintelligence",
    label: "Follicle Intelligence",
    href: "https://follicleintelligence.com",
  },
];

export interface HairEcosystemNavProps {
  /** Which site is rendering this bar; that link gets active state and same-tab behavior when currentSiteInternalHref is set. */
  currentSite?: EcosystemSite;
  /** When set, the current platform link uses this href (same tab) instead of the absolute URL. e.g. "/" for the site home. */
  currentSiteInternalHref?: string;
  /** Optional className for the outer nav wrapper. */
  className?: string;
}

export function HairEcosystemNav({
  currentSite,
  currentSiteInternalHref,
  className = "",
}: HairEcosystemNavProps) {
  return (
    <nav
      className={`border-b border-[rgb(var(--border-soft))] bg-card/80 backdrop-blur-sm ${className}`}
      aria-label="Hair Intelligence Ecosystem"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 sm:py-3">
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.18em] text-[rgb(var(--text-muted))] sm:text-xs">
          Part of the Hair Intelligence Ecosystem
        </span>
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <div className="flex overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <ul className="flex items-center gap-1 sm:gap-3">
              {PLATFORMS.map((platform) => {
                const isCurrent = currentSite === platform.id;
                const useInternalHref =
                  isCurrent && currentSiteInternalHref != null;
                const linkClass =
                  "whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-medium transition sm:px-3 sm:py-2 sm:text-xs " +
                  (isCurrent
                    ? "text-[rgb(var(--text-primary))] underline decoration-[rgb(var(--gold))]/50 underline-offset-2 decoration-2"
                    : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--medical))]");

                if (useInternalHref) {
                  return (
                    <li key={platform.id}>
                      <Link
                        href={currentSiteInternalHref}
                        className={linkClass}
                        aria-current="page"
                      >
                        {platform.label}
                      </Link>
                    </li>
                  );
                }

                if (isCurrent) {
                  return (
                    <li key={platform.id}>
                      <a
                        href={platform.href}
                        className={linkClass}
                        aria-current="page"
                      >
                        {platform.label}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={platform.id}>
                    <a
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {platform.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
