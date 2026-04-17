"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HliPaymentOffering } from "@/lib/payment/hliOffers";
import type { PurchaseEligibility } from "@/lib/payment/purchaseEligibility";
import { PaymentCheckoutButton } from "@/components/public/PaymentCheckoutButton";

type BillingApi = {
  ok: boolean;
  purchaseEligibility?: Record<HliPaymentOffering, PurchaseEligibility> | null;
};

/**
 * Pay button that hides duplicate purchases when /api/longevity/billing reports blocked eligibility.
 */
export function EntitlementAwareCheckoutButton({
  offering,
  theme = "gold",
  children,
}: {
  offering: HliPaymentOffering;
  theme?: "gold" | "light" | "soft";
  children: React.ReactNode;
}) {
  const [eligibility, setEligibility] = useState<PurchaseEligibility | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/longevity/billing", { credentials: "include" })
      .then((r) => r.json())
      .then((data: BillingApi) => {
        if (!cancelled && data.ok && data.purchaseEligibility) {
          setEligibility(data.purchaseEligibility[offering] ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setEligibility(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [offering]);

  if (loaded && eligibility && !eligibility.canPurchase) {
    const bodyClass =
      theme === "light"
        ? "text-sm leading-relaxed text-white/75"
        : "text-sm leading-relaxed text-[rgb(var(--text-secondary))]";
    const linkClass =
      theme === "light"
        ? "inline-block text-sm font-medium text-[rgb(var(--gold))] underline-offset-2 hover:underline"
        : "inline-block text-sm font-medium text-medical underline-offset-2 hover:underline";
    return (
      <div className="max-w-md space-y-2">
        <p className={bodyClass}>{eligibility.patientMessage}</p>
        <Link
          href="/portal/dashboard"
          className={linkClass}
        >
          View account &amp; billing in portal
        </Link>
      </div>
    );
  }

  return <PaymentCheckoutButton offering={offering} theme={theme}>{children}</PaymentCheckoutButton>;
}
