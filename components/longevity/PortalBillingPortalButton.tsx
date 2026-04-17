"use client";

import { useState } from "react";

export function PortalBillingPortalButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/stripe/billing-portal", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok) {
        setError(data?.error ?? "Could not open billing portal.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Billing portal link was not returned.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
      >
        {pending ? "Opening…" : "Manage membership billing"}
      </button>
      {error ? (
        <p className="text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
