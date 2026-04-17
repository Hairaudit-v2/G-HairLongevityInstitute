"use client";

import { useState } from "react";
import type { HliPaymentOffering } from "@/lib/payment/hliOffers";

/**
 * Starts Stripe Checkout (logged-in portal users). Redirects to sign-in if needed.
 */
export function PaymentCheckoutButton({
  offering,
  children,
  className = "",
  theme = "gold",
}: {
  offering: HliPaymentOffering;
  children: React.ReactNode;
  className?: string;
  /** gold: primary on light pages; light: primary on dark sections; soft: low-pressure premium secondary */
  theme?: "gold" | "light" | "soft";
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base =
    theme === "light"
      ? "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/50 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-dark))] disabled:opacity-60"
      : theme === "soft"
        ? "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn border border-[rgb(var(--gold))]/20 bg-white/92 px-6 py-3 text-sm font-semibold text-[rgb(var(--gold-dark))] shadow-[0_10px_26px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgb(var(--gold))]/35 hover:bg-[rgb(var(--gold))]/[0.06] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] disabled:opacity-60"
      : "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--text-primary))] shadow-soft transition hover:opacity-92 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] disabled:opacity-60";

  const onClick = async () => {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ offering }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string; code?: string };
      if (!res.ok) {
        if (res.status === 401 && data?.code === "auth_required") {
          const here = `${window.location.pathname}${window.location.search}`;
          window.location.href = `/portal/login?redirect=${encodeURIComponent(here)}`;
          return;
        }
        if (res.status === 409) {
          setError(data?.error ?? "This purchase is not available for your account right now.");
          return;
        }
        setError(data?.error ?? "Checkout could not start.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Checkout URL was not returned.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-2">
      <button type="button" onClick={onClick} disabled={pending} className={`${base} ${className}`}>
        {pending ? "Redirecting…" : children}
      </button>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
