"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HLI_PATIENT_PRICING_TIERS,
  HLI_PRICING_PATIENT_NOTES,
} from "@/lib/content/hliPatientPricing";
import { HLI_OFFERING, type HliPaymentOffering } from "@/lib/payment/hliOffers";
import type { PurchaseEligibility } from "@/lib/payment/purchaseEligibility";
import { PaymentCheckoutButton } from "@/components/public/PaymentCheckoutButton";
import { PrimaryButton } from "@/components/public/PublicCTA";

type Theme = "light" | "dark";

const shell: Record<
  Theme,
  {
    section: string;
    card: string;
    title: string;
    price: string;
    body: string;
    best: string;
    bestLabel: string;
    notes: string;
  }
> = {
  light: {
    section: "text-[rgb(var(--text-primary))]",
    card: "rounded-card border border-[rgb(var(--border-soft))] bg-card p-6 shadow-soft",
    title: "text-lg font-semibold text-[rgb(var(--text-primary))]",
    price: "shrink-0 text-sm font-semibold tabular-nums text-[rgb(var(--gold))]",
    body: "mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]",
    best: "mt-3 text-sm leading-relaxed text-[rgb(var(--text-muted))]",
    bestLabel: "font-medium text-[rgb(var(--text-secondary))]",
    notes: "rounded-card border border-[rgb(var(--border-soft))] bg-subtle/50 p-6 text-sm leading-relaxed text-[rgb(var(--text-secondary))]",
  },
  dark: {
    section: "text-white",
    card: "rounded-3xl border border-white/10 bg-white/5 p-6 md:p-7",
    title: "text-lg font-semibold text-white",
    price: "shrink-0 text-sm font-semibold tabular-nums text-[rgb(var(--gold))]",
    body: "mt-3 text-sm leading-relaxed text-white/75",
    best: "mt-3 text-sm leading-relaxed text-white/60",
    bestLabel: "font-medium text-white/80",
    notes: "rounded-3xl border border-white/10 bg-black/20 p-6 text-sm leading-relaxed text-white/70",
  },
};

function tierCheckoutOffering(
  tierId: (typeof HLI_PATIENT_PRICING_TIERS)[number]["id"]
): HliPaymentOffering | null {
  switch (tierId) {
    case "blood-letter":
      return HLI_OFFERING.BLOOD_REQUEST_LETTER;
    case "blood-followup":
      return HLI_OFFERING.BLOOD_ANALYSIS_REVIEW;
    case "trich-appointment":
      return HLI_OFFERING.TRICHOLOGIST_APPOINTMENT;
    case "membership":
      return HLI_OFFERING.MEMBERSHIP;
    default:
      return null;
  }
}

function tierPayCtaLabel(tierId: (typeof HLI_PATIENT_PRICING_TIERS)[number]["id"]): string | null {
  switch (tierId) {
    case "blood-letter":
      return "Pay $10 for Blood Request Letter";
    case "blood-followup":
      return "Pay $10 for Blood Analysis Review";
    case "trich-appointment":
      return "Book One-on-One Appointment — $199";
    case "membership":
      return "Join Membership — $10/month";
    default:
      return null;
  }
}

type BillingApi = {
  ok: boolean;
  purchaseEligibility?: Record<HliPaymentOffering, PurchaseEligibility> | null;
};

export function HliPatientPricing({
  theme = "light",
  id = "patient-pricing",
  headingId = "patient-pricing-heading",
  intro,
  startHref = "/longevity/start",
}: {
  theme?: Theme;
  id?: string;
  headingId?: string;
  intro?: string;
  startHref?: string;
}) {
  const t = shell[theme];
  const [eligibility, setEligibility] = useState<BillingApi["purchaseEligibility"] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/longevity/billing", { credentials: "include" })
      .then((r) => r.json())
      .then((data: BillingApi) => {
        if (!cancelled && data.ok && data.purchaseEligibility) {
          setEligibility(data.purchaseEligibility);
        }
      })
      .catch(() => {
        if (!cancelled) setEligibility(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function tierEligibility(offering: HliPaymentOffering | null): PurchaseEligibility | null {
    if (!offering || !eligibility) return null;
    return eligibility[offering] ?? null;
  }

  return (
    <section id={id} className={t.section} aria-labelledby={headingId}>
      <div className="text-center">
        <h2 id={headingId} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Pricing
        </h2>
        {intro ? (
          <p
            className={
              theme === "light"
                ? "mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base"
                : "mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base"
            }
          >
            {intro}
          </p>
        ) : null}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {HLI_PATIENT_PRICING_TIERS.map((tier) => {
          const offering = tierCheckoutOffering(tier.id);
          const payLabel = tierPayCtaLabel(tier.id);
          const elig = offering ? tierEligibility(offering) : null;
          const blocked = elig && !elig.canPurchase;
          return (
            <article key={tier.id} className={t.card}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <h3 className={t.title}>{tier.title}</h3>
                <p className={t.price}>{tier.price}</p>
              </div>
              <p className={t.body}>{tier.body}</p>
              <p className={t.best}>
                <span className={t.bestLabel}>Best for:</span> {tier.bestFor}
              </p>
              <div className="mt-5">
                {tier.id === "free-initial" ? (
                  <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
                ) : offering && payLabel ? (
                  blocked ? (
                    <div className="space-y-2">
                      <p
                        className={
                          theme === "light"
                            ? "text-sm leading-relaxed text-[rgb(var(--text-secondary))]"
                            : "text-sm leading-relaxed text-white/70"
                        }
                      >
                        {elig?.patientMessage}
                      </p>
                      <Link
                        href="/portal/dashboard"
                        className={
                          theme === "light"
                            ? "inline-block text-sm font-medium text-[rgb(var(--medical))] underline-offset-2 hover:underline"
                            : "inline-block text-sm font-medium text-[rgb(var(--gold))] underline-offset-2 hover:underline"
                        }
                      >
                        View account &amp; billing in portal
                      </Link>
                    </div>
                  ) : (
                    <PaymentCheckoutButton offering={offering} theme={theme === "dark" ? "light" : "gold"}>
                      {payLabel}
                    </PaymentCheckoutButton>
                  )
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className={`mt-10 ${t.notes}`}>
        <p className={theme === "light" ? "font-medium text-[rgb(var(--text-primary))]" : "font-medium text-white"}>
          Good to know
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {HLI_PRICING_PATIENT_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
