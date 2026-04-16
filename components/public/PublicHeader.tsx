"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const PRIMARY_CTA_HREF = "/start";
const PRIMARY_CTA_LABEL = "Start My Hair Analysis";

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--text-primary))] shadow-soft transition hover:opacity-92 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-white"
    >
      {children}
    </Link>
  );
}

export default function PublicHeader({
  showLongevityLinks = false,
  ctaHref = PRIMARY_CTA_HREF,
  ctaLabel = PRIMARY_CTA_LABEL,
  theme = "dark",
}: {
  showLongevityLinks?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  /** "light" for light backgrounds (e.g. homepage); "dark" default. */
  theme?: "light" | "dark";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLight = theme === "light";

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/insights", label: "Insights" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#what-we-analyse", label: "What we analyse" },
    { href: "#results", label: "Your results" },
    { href: "/#faq", label: "FAQ" },
  ];

  const linkClass = isLight
    ? "rounded-lg px-3 py-2.5 text-sm font-medium text-[rgb(var(--text-secondary))] transition hover:bg-subtle hover:text-[rgb(var(--text-primary))]"
    : "rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white";
  const linkClassMuted = isLight
    ? "rounded-lg px-3 py-2.5 text-sm font-medium text-[rgb(var(--text-muted))] transition hover:bg-subtle hover:text-[rgb(var(--text-secondary))]"
    : "rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 transition hover:text-white/75";
  const headerClass = isLight
    ? "sticky top-0 z-50 border-b border-[rgb(var(--border-soft))] bg-white/98 backdrop-blur-sm shadow-soft"
    : "sticky top-0 z-50 border-b border-white/10 bg-[rgb(var(--bg-dark))]/95 backdrop-blur-sm";
  const mobileNavClass = isLight
    ? "border-t border-[rgb(var(--border-soft))] bg-subtle/98 md:hidden"
    : "border-t border-white/10 bg-black/20 md:hidden";
  const mobileLinkClass = isLight
    ? "min-h-[48px] rounded-card px-4 py-3 text-base font-medium text-[rgb(var(--text-secondary))] hover:bg-white hover:text-[rgb(var(--text-primary))]"
    : "min-h-[48px] rounded-card px-4 py-3 text-base font-medium text-white/85 hover:bg-white/10 hover:text-white";
  const menuButtonClass = isLight
    ? "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn border border-[rgb(var(--border-soft))] bg-card text-[rgb(var(--text-secondary))] transition hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-white"
    : "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-dark))]";

  return (
    <header className={`${headerClass}`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex min-h-[76px] items-center justify-between gap-6 py-2 sm:min-h-[80px] sm:gap-8">
          <Link
            href="/"
            className={`flex shrink-0 items-center py-1 pr-2 rounded-lg sm:pr-3 md:py-1.5 md:pr-4 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] ${isLight ? "focus:ring-offset-2 focus:ring-offset-white" : "focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))]"}`}
            aria-label="Hair Longevity Institute — Home"
          >
            <Image
              src="/brand/hli-logo.png"
              alt="Hair Longevity Institute"
              width={480}
              height={96}
              className="h-[4.2rem] w-auto object-contain object-left sm:h-[5.1rem] md:h-[6.3rem]"
              priority
              sizes="(max-width: 640px) 4.2rem, (max-width: 768px) 5.1rem, 6.3rem"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex md:gap-2" aria-label="Main">
            {navLinks.map((link) =>
              link.href.startsWith("#") || link.href.startsWith("/#") ? (
                <a key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              )
            )}
            {showLongevityLinks && (
              <Link href="/portal" className={linkClassMuted} title="Returning patients">
                Patient Portal
              </Link>
            )}
            <Link href="/login/trichologist" className={linkClass} title="Trichologist review portal sign in">
              Trichologist Login
            </Link>
            <div className="ml-2">
              <PrimaryButton href={ctaHref}>{ctaLabel}</PrimaryButton>
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <PrimaryButton href={ctaHref}>{ctaLabel}</PrimaryButton>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className={`${menuButtonClass}`}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`${mobileNavClass} ${mobileOpen ? "block" : "hidden"}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) =>
              link.href.startsWith("#") || link.href.startsWith("/#") ? (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
                  {link.label}
                </Link>
              )
            )}
            {showLongevityLinks && (
              <Link href="/portal" onClick={() => setMobileOpen(false)} className={isLight ? "min-h-[48px] rounded-xl px-4 py-3 text-sm font-medium text-neutral-500 hover:bg-neutral-100" : "min-h-[48px] rounded-xl px-4 py-3 text-sm font-medium text-white/55 hover:bg-white/5 hover:text-white/75"} title="Returning patients">
                Patient Portal
              </Link>
            )}
            <Link href="/login/trichologist" onClick={() => setMobileOpen(false)} className={mobileLinkClass} title="Trichologist review portal sign in">
              Trichologist Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
