"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createLongevitySupabaseBrowserClient } from "@/lib/longevity/supabaseBrowser";

const GOLD = "rgb(198,167,94)";

/** Build callback URL for magic link; optional redirect param is preserved so auth callback can send user there after login. */
function getRedirectUrl(redirectPath?: string | null): string {
  if (typeof window === "undefined") return "";
  const base = `${window.location.origin}/portal/auth/callback`;
  if (redirectPath && redirectPath.startsWith("/")) {
    return `${base}?redirect=${encodeURIComponent(redirectPath)}`;
  }
  return base;
}

/** Allowed post-login redirect paths (same-origin only). */
function isAllowedRedirect(path: string | null): path is string {
  if (!path || typeof path !== "string") return false;
  return path.startsWith("/longevity/") || path.startsWith("/portal/");
}

const NO_EMAIL_MESSAGE =
  "We could not create your profile because your sign-in provider did not provide an email address. Please sign in using an email-based login.";

const SESSION_EXPIRED_MESSAGE = "Your session expired. Please sign in to continue.";

export default function PortalLoginPage() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const afterLoginRedirect = isAllowedRedirect(redirectParam) ? redirectParam : null;
  const showNoEmailMessage = errorParam === "no-email";
  const showSessionExpiredMessage = errorParam === "session-expired";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const sendMagicLink = useCallback(
    async (e: React.FormEvent) => {
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
            emailRedirectTo: getRedirectUrl(afterLoginRedirect),
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
    },
    [email, afterLoginRedirect]
  );

  const signInWithPassword = useCallback(
    async (e: React.FormEvent) => {
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
        // Send via dashboard when resuming so longevity cookie is set, then dashboard redirects.
        const dest = afterLoginRedirect
          ? `/portal/dashboard?redirect=${encodeURIComponent(afterLoginRedirect)}`
          : "/portal/dashboard";
        window.location.href = dest;
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    },
    [email, password, afterLoginRedirect]
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
        Hair Longevity Institute™ — Patient Portal
      </div>
      <h1 className="mt-2 text-2xl font-semibold text-white">Sign in</h1>
      <p className="mt-1 text-white/70">
        {afterLoginRedirect?.startsWith("/longevity/intake/")
          ? "Please sign in to resume your assessment."
          : "Use your email to access your intakes and documents."}
      </p>

      {showNoEmailMessage && (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
          {NO_EMAIL_MESSAGE}
        </div>
      )}
      {showSessionExpiredMessage && (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
          {SESSION_EXPIRED_MESSAGE}
        </div>
      )}

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
