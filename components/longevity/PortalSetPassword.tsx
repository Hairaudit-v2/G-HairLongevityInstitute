"use client";

import { useCallback, useState } from "react";
import { createLongevitySupabaseBrowserClient } from "@/lib/longevity/supabaseBrowser";

/**
 * Lets a logged-in patient set or change their password (Supabase updateUser).
 * Shown on the portal dashboard so users who signed in with magic link or Google can add a password for next time.
 */
export function PortalSetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      if (!password || password.length < 8) {
        setMessage({ type: "error", text: "Password must be at least 8 characters." });
        return;
      }
      if (password !== confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match." });
        return;
      }
      setLoading(true);
      try {
        const supabase = createLongevitySupabaseBrowserClient();
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setMessage({ type: "error", text: error.message });
          setLoading(false);
          return;
        }
        setMessage({ type: "success", text: "Password saved. You can use it to sign in next time." });
        setPassword("");
        setConfirmPassword("");
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    },
    [password, confirmPassword]
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between text-left text-sm font-medium text-white/90 hover:text-white"
      >
        <span>{expanded ? "Hide" : "Set or change password"}</span>
        <span className="text-white/50" aria-hidden>
          {expanded ? "−" : "+"}
        </span>
      </button>
      {expanded && (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <p className="text-xs text-white/60">
            Add a password to sign in with email and password next time, or change your existing password.
          </p>
          <div>
            <label htmlFor="portal-set-password-new" className="block text-sm font-medium text-white/90">
              New password
            </label>
            <input
              id="portal-set-password-new"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--gold))]"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label htmlFor="portal-set-password-confirm" className="block text-sm font-medium text-white/90">
              Confirm password
            </label>
            <input
              id="portal-set-password-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--gold))]"
              placeholder="••••••••"
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
            className="inline-flex rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save password"}
          </button>
        </form>
      )}
    </div>
  );
}
