"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type TrichologistListItem = {
  id: string;
  email: string | null;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
};

export function TrichologistProvisioningClient({
  initialList,
}: {
  initialList: TrichologistListItem[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string; initial_password?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/longevity/trichologists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), full_name: fullName.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Request failed.");
        return;
      }
      setSuccess({
        message: data.message ?? "Trichologist added.",
        initial_password: data.initial_password,
      });
      setEmail("");
      setFullName("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-medium text-white">Existing trichologists</h2>
        {initialList.length === 0 ? (
          <p className="mt-2 text-sm text-white/60">None yet. Add the first via the form below (or use the setup script for the very first one).</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {initialList.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-white">{t.display_name || t.email || "—"}</span>
                  {t.display_name && t.email && (
                    <span className="ml-2 text-white/60">{t.email}</span>
                  )}
                  {!t.display_name && t.email && (
                    <span className="ml-2 text-white/60">{t.email}</span>
                  )}
                </div>
                <span
                  className={
                    t.is_active
                      ? "rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200"
                      : "rounded bg-white/10 px-2 py-0.5 text-xs text-white/60"
                  }
                >
                  {t.is_active ? "Active" : "Inactive"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">Add trichologist</h2>
        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <div>
            <label htmlFor="trich-email" className="block text-sm text-white/70">
              Email (required)
            </label>
            <input
              id="trich-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--gold))]"
              placeholder="colleague@example.com"
            />
          </div>
          <div>
            <label htmlFor="trich-name" className="block text-sm text-white/70">
              Full name (optional)
            </label>
            <input
              id="trich-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--gold))]"
              placeholder="Dr Jane Smith"
            />
          </div>
          {error && (
            <p className="text-sm text-red-300">{error}</p>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              <p>{success.message}</p>
              {success.initial_password && (
                <p className="mt-2 font-mono text-xs">
                  One-time password: <strong>{success.initial_password}</strong>
                  <br />
                  <span className="text-white/70">Share securely; they can change it after first sign-in at /portal/login.</span>
                </p>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[rgb(var(--gold))] px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add trichologist"}
          </button>
        </form>
      </section>
    </div>
  );
}
