"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { EDITORIAL_EVENT } from "@/lib/analytics/editorialEvents";

function trackCta(event: string, props: Record<string, string>) {
  track(event, props);
}

type Props = {
  assessmentHref: string;
  bookHref?: string;
};

export default function NextStepBlocks({ assessmentHref, bookHref = "/book" }: Props) {
  return (
    <section className="space-y-6" aria-labelledby="next-steps-heading">
      <h2 id="next-steps-heading" className="text-lg font-semibold text-[rgb(var(--text-primary))]">
        Next steps
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Read more on HLI</h3>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
            Explore hubs on causes, blood markers, and treatment planning — written for patients and clinicians who want
            biology-first context.
          </p>
          <ul className="mt-3 space-y-2 text-sm font-medium text-medical">
            <li>
              <Link href="/insights" className="hover:underline">
                All insights →
              </Link>
            </li>
            <li>
              <Link href="/blood-markers" className="hover:underline">
                Blood markers hub →
              </Link>
            </li>
            <li>
              <Link href="/hair-loss-causes" className="hover:underline">
                Hair loss causes hub →
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">When to consider blood tests</h3>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
            If shedding is new, severe, or accompanied by systemic symptoms, structured blood review may be appropriate.
            HLI can help interpret results you already have or suggest what to discuss with your GP.
          </p>
          <p className="mt-3">
            <Link
              href={assessmentHref}
              className="inline-flex min-h-[44px] items-center justify-center rounded-btn bg-[rgb(var(--gold))] px-5 py-2.5 text-sm font-semibold text-[rgb(var(--text-primary))] shadow-soft hover:opacity-92"
              onClick={() =>
                trackCta(EDITORIAL_EVENT.CTA_PRIMARY, { surface: "next_step_bloods", href: assessmentHref })
              }
            >
              Start My Hair Analysis
            </Link>
          </p>
        </div>
        <div className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">When to book a specialist consult</h3>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
            Rapid progression, scarring signs, pain, or uncertainty after initial tests are reasons many people choose a
            dedicated consultation for sequencing and clarity.
          </p>
          <p className="mt-3">
            <Link
              href={bookHref}
              className="text-sm font-semibold text-medical underline-offset-2 hover:underline"
              onClick={() => trackCta(EDITORIAL_EVENT.CTA_BOOK, { surface: "next_step_consult", href: bookHref })}
            >
              Book consultation →
            </Link>
          </p>
        </div>
        <div className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft">
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">When HairAudit is the better destination</h3>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
            If your primary question is surgical transparency, audit, or procedural due diligence, HairAudit focuses on
            that pathway within the Hair Intelligence ecosystem.
          </p>
          <p className="mt-3">
            <a
              href="https://hairaudit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-medical underline-offset-2 hover:underline"
              onClick={() => trackCta(EDITORIAL_EVENT.CTA_HAIRAUDIT, { surface: "next_step_hairaudit" })}
            >
              Visit HairAudit →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
