import Link from "next/link";
import Image from "next/image";
import { isLongevityEnabled, isLongevityPortalEnabled } from "@/lib/features";
import { SurgicalIntelligenceEcosystemBand } from "@/components/public/SurgicalIntelligenceEcosystemBand";

export default function PublicFooter({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const showPortalLogin = isLongevityPortalEnabled();
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";
  const isLight = theme === "light";

  const footerClass = isLight
    ? "border-t border-[rgb(var(--border-soft))] bg-subtle/90"
    : "border-t border-white/10 bg-black/10";
  const headingClass = isLight
    ? "text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]"
    : "text-xs font-semibold uppercase tracking-wider text-white/50";
  const linkClass = isLight
    ? "font-medium text-[rgb(var(--text-secondary))] transition hover:text-[rgb(var(--text-primary))]"
    : "font-medium text-white/75 transition hover:text-white/90";
  const captionClass = isLight ? "mt-0.5 text-xs text-[rgb(var(--text-muted))]" : "mt-0.5 text-xs text-white/50";
  const legalLinkClass = isLight ? "text-[rgb(var(--text-muted))] transition hover:text-[rgb(var(--text-primary))]" : "text-white/55 transition hover:text-white/80";
  const copyrightClass = isLight ? "text-sm text-[rgb(var(--text-muted))]" : "text-sm text-white/55";

  return (
    <footer className={footerClass}>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <Image
              src="/brand/hli-mark.png"
              alt="Hair Longevity Institute"
              width={64}
              height={64}
              className="h-[4.2rem] w-[4.2rem] shrink-0 object-contain opacity-95 sm:h-[4.8rem] sm:w-[4.8rem]"
              sizes="4.8rem"
            />
            <span className={copyrightClass}>
              © {new Date().getFullYear()} Hair Longevity Institute™
            </span>
          </div>
          <div>
            <h3 className={headingClass}>Explore</h3>
            <nav className="mt-3 flex flex-col gap-2 text-sm" aria-label="Explore">
              <Link href="/about" className={linkClass}>About</Link>
              <Link href="/how-it-works" className={linkClass}>How it works</Link>
              <Link href="/science" className={linkClass}>Science</Link>
              <Link href="/for-professionals" className={linkClass}>For professionals</Link>
              <Link href="/membership" className={linkClass}>Membership</Link>
              <Link href="/book" className={linkClass}>Book consultation</Link>
              <Link href={startHref} className={linkClass}>Start My Hair Analysis</Link>
            </nav>
          </div>
          <div>
            <h3 className={headingClass}>Hair Intelligence Network</h3>
            <nav className="mt-3 flex flex-col gap-3 text-sm" aria-label="Hair Intelligence Network">
              <div>
                <Link href="/" className={linkClass}>
                  Hair Longevity Institute
                </Link>
                <p className={captionClass}>
                  Understand biology and treatment options before or alongside any procedure
                </p>
              </div>
              <div>
                <a href="https://hairaudit.com" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  HairAudit
                </a>
                <p className={captionClass}>
                  Surgical audit and transparency — when surgery is part of the picture
                </p>
              </div>
              <div>
                <a href="https://follicleintelligence.ai" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Follicle Intelligence
                </a>
                <p className={captionClass}>
                  The analysis engine powering HLI and HairAudit
                </p>
              </div>
            </nav>
          </div>
          {showPortalLogin && (
            <div>
              <h3 className={headingClass}>Portal access</h3>
              <nav className="mt-3 flex flex-col gap-2 text-sm" aria-label="Portal access">
                <Link href="/login/patient" className={legalLinkClass}>Patient Login</Link>
                <Link href="/login/trichologist" className={legalLinkClass}>Trichologist Login</Link>
              </nav>
            </div>
          )}
          <div>
            <h3 className={headingClass}>Legal</h3>
            <nav className="mt-3 flex flex-wrap gap-6 text-sm" aria-label="Legal">
              <Link href="/privacy" className={legalLinkClass}>Privacy</Link>
              <Link href="/terms" className={legalLinkClass}>Terms</Link>
              <Link href="/disclaimer" className={legalLinkClass}>Disclaimer</Link>
            </nav>
          </div>
        </div>
      </div>
      <SurgicalIntelligenceEcosystemBand
        currentSite="hli"
        currentSiteInternalHref="/"
      />
    </footer>
  );
}
