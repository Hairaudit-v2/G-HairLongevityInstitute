"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { EDITORIAL_EVENT } from "@/lib/analytics/editorialEvents";
import type { EditorialCtaType } from "@/lib/content/types";

const primaryClass =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn border border-[rgb(var(--gold))]/30 bg-[linear-gradient(180deg,rgba(198,167,94,0.95)_0%,rgba(176,147,82,0.98)_100%)] px-6 py-3 text-sm font-semibold text-[rgb(var(--text-primary))] shadow-[0_10px_30px_rgba(176,147,82,0.16)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(176,147,82,0.2)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]";

const secondaryClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-btn border border-[rgb(var(--medical))]/20 bg-white/90 px-6 py-3 text-sm font-semibold text-medical shadow-[0_6px_18px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-0.5 hover:bg-[rgb(var(--medical))]/5 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/35 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]";

function secondaryForCtaType(
  ctaType: EditorialCtaType,
  bookHref: string
): { node: ReactNode } {
  switch (ctaType) {
    case "book-consult":
    case "start-assessment":
      return {
        node: (
          <Link
            href={bookHref}
            className={secondaryClass}
            onClick={() =>
              track(EDITORIAL_EVENT.CTA_BOOK, {
                surface: "article_hero",
                href: bookHref,
                cta_type: ctaType,
              })
            }
          >
            Book consultation
          </Link>
        ),
      };
    case "compare-treatments":
      return {
        node: (
          <Link
            href="/treatments"
            className={secondaryClass}
            onClick={() =>
              track(EDITORIAL_EVENT.CTA_PRIMARY, {
                surface: "article_hero_secondary",
                href: "/treatments",
                cta_type: ctaType,
              })
            }
          >
            Treatment themes
          </Link>
        ),
      };
    case "see-hairaudit":
      return {
        node: (
          <a
            href="https://hairaudit.com"
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryClass}
            onClick={() =>
              track(EDITORIAL_EVENT.CTA_HAIRAUDIT, {
                surface: "article_hero",
                cta_type: ctaType,
              })
            }
          >
            Visit HairAudit
          </a>
        ),
      };
    case "read-more":
      return {
        node: (
          <Link
            href="/insights"
            className={secondaryClass}
            onClick={() =>
              track(EDITORIAL_EVENT.CTA_PRIMARY, {
                surface: "article_hero_secondary",
                href: "/insights",
                cta_type: ctaType,
              })
            }
          >
            Browse insights
          </Link>
        ),
      };
    default:
      return {
        node: (
          <Link
            href={bookHref}
            className={secondaryClass}
            onClick={() =>
              track(EDITORIAL_EVENT.CTA_BOOK, { surface: "article_hero", href: bookHref })
            }
          >
            Book consultation
          </Link>
        ),
      };
  }
}

export default function EditorialHeroCtas({
  assessmentHref,
  bookHref = "/book",
  ctaType = "start-assessment",
}: {
  assessmentHref: string;
  bookHref?: string;
  ctaType?: EditorialCtaType;
}) {
  const { node: secondary } = secondaryForCtaType(ctaType, bookHref);

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={assessmentHref}
        className={primaryClass}
        onClick={() =>
          track(EDITORIAL_EVENT.CTA_PRIMARY, {
            surface: "article_hero",
            href: assessmentHref,
            cta_type: ctaType,
          })
        }
      >
        Start My Hair Analysis
      </Link>
      {secondary}
    </div>
  );
}
