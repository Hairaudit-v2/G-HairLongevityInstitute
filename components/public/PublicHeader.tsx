"use client";

import Link from "next/link";
import { useState } from "react";

const PRIMARY_CTA_HREF = "/start";
const PRIMARY_CTA_LABEL = "Start assessment";

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))] shadow-lg shadow-black/20 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))]"
    >
      {children}
    </Link>
  );
}

export default function PublicHeader({
  showLongevityLinks = false,
  ctaHref = PRIMARY_CTA_HREF,
  ctaLabel = PRIMARY_CTA_LABEL,
}: {
  showLongevityLinks?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "#how-it-works", label: "See how it works" },
    { href: "#who-its-for", label: "Who it's for" },
    { href: "#services", label: "Services" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgb(var(--bg))]/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex min-h-[76px] items-center justify-between gap-6 py-2 sm:min-h-[80px] sm:gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center py-1 pr-2 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))] rounded-lg sm:pr-3 md:py-1.5 md:pr-4"
            aria-label="Hair Longevity Institute — Home"
          >
            <img
              src="/brand/hli-logo.png"
              alt=""
              width={480}
              height={96}
              className="h-[3.5rem] w-auto object-contain object-left sm:h-[4.25rem] md:h-[5.25rem]"
              style={{ imageRendering: "auto" }}
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex md:gap-2" aria-label="Main">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              )
            )}
            {showLongevityLinks && (
              <Link
                href="/portal"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 transition hover:text-white/75"
                title="Returning patients"
              >
                Patient portal
              </Link>
            )}
            <div className="ml-2">
              <PrimaryButton href={ctaHref}>{ctaLabel}</PrimaryButton>
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <PrimaryButton href={ctaHref}>{ctaLabel}</PrimaryButton>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))]"
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
        className={`border-t border-white/10 bg-black/20 md:hidden ${mobileOpen ? "block" : "hidden"}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[48px] rounded-xl px-4 py-3 text-base font-medium text-white/85 hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[48px] rounded-xl px-4 py-3 text-base font-medium text-white/85 hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              )
            )}
            {showLongevityLinks && (
              <Link
                href="/portal"
                onClick={() => setMobileOpen(false)}
                className="min-h-[48px] rounded-xl px-4 py-3 text-sm font-medium text-white/55 hover:bg-white/5 hover:text-white/75"
                title="Returning patients"
              >
                Patient portal
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
