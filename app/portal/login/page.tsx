"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { createLongevitySupabaseBrowserClient } from "@/lib/longevity/supabaseBrowser";

const GOLD = "rgb(198,167,94)";

function getRedirectUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/portal/auth/callback`;
}

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const sendMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address." });
      return;
    }
    setLoading(true);
    try {
      const supabase = createLongevitySupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: getRedirectUrl(),
          shouldCreateUser: true,
        },
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }
      setMessage({
        type: "success",
        text: "Check your email for a sign-in link. Click the link to open your dashboard.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }, [email]);

  const signInWithPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email.trim() || !password) {
      setMessage({ type: "error", text: "Email and password are required." });
      return;
    }
    setLoading(true);
    try {
      const supabase = createLongevitySupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }
      window.location.href = "/portal/dashboard";
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
        Hair Longevity Institute™ — Patient Portal
      </div>
      <h1 className="mt-2 text-2xl font-semibold text-white">Sign in</h1>
      <p className="mt-1 text-white/70">
        Use your email to access your intakes and documents.
      </p>

      {/* Magic link (primary) */}
      <form onSubmit={sendMagicLink} className="mt-6 space-y-4">
        <div>
          <label htmlFor="portal-email" className="block text-sm font-medium text-white/90">
            Email
          </label>
          <input
            id="portal-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--gold))]"
            placeholder="you@example.com"
          />
        </div>
        {message && (
          <div
            className={`rounded-xl px-3 py-2 text-sm ${
              message.type === "error"
                ? "border border-red-500/30 bg-red-500/10 text-red-200"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {message.text}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-[rgb(15,27,45)] disabled:opacity-50"
          style={{ backgroundColor: GOLD }}
        >
          {loading ? "Sending…" : "Send sign-in link"}
        </button>
      </form>

      {/* Password fallback */}
      <div className="mt-6 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="text-sm text-white/60 hover:text-white"
        >
          {showPassword ? "Hide password sign in" : "Sign in with password instead"}
        </button>
        {showPassword && (
          <form onSubmit={signInWithPassword} className="mt-4 space-y-4">
            <div>
              <label htmlFor="portal-password" className="block text-sm font-medium text-white/90">
                Password
              </label>
              <input
                id="portal-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--gold))]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 disabled:opacity-50"
            >
              Sign in with password
            </button>
          </form>
        )}
      </div>

      {/* Future OAuth placeholder */}
      <p className="mt-6 text-xs text-white/40">
        More sign-in options (e.g. Google) may be added later.
      </p>

      <p className="mt-4 text-sm text-white/50">
        You can also{" "}
        <Link href="/longevity/start" className="text-[rgb(var(--gold))] hover:underline">
          start an intake without an account
        </Link>
        ; your progress is tied to your email.
      </p>
      <Link href="/longevity" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
        ← Back to Longevity
      </Link>
    </div>
  );
}
