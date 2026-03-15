"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createLongevitySupabaseBrowserClient } from "@/lib/longevity/supabaseBrowser";

/**
 * Handles Supabase Auth redirect after magic link (or OAuth) click.
 * Exchanges token/hash for session and redirects to portal dashboard.
 */
export default function PortalAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"exchanging" | "done" | "error">("exchanging");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const exchange = useCallback(async () => {
    try {
      const supabase = createLongevitySupabaseBrowserClient();

      const hashParams = typeof window !== "undefined" ? window.location.hash : "";
      const fragment = new URLSearchParams(hashParams.replace(/^#/, ""));
      const accessToken = fragment.get("access_token");
      const refreshToken = fragment.get("refresh_token");

      // Preserve redirect in URL so dashboard can send user there after setting longevity cookie.
      const redirectTo = searchParams.get("redirect");
      const allowedRedirect =
        redirectTo &&
        (redirectTo.startsWith("/longevity/") || redirectTo.startsWith("/portal/"));
      const destination = allowedRedirect ? `/portal/dashboard?redirect=${encodeURIComponent(redirectTo)}` : "/portal";

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setErrorMessage(error.message);
          setStatus("error");
          return;
        }
        setStatus("done");
        router.replace(destination);
        router.refresh();
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") ?? "magiclink";
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "magiclink" | "email",
        });
        if (error) {
          setErrorMessage(error.message);
          setStatus("error");
          return;
        }
        setStatus("done");
        router.replace(destination);
        router.refresh();
        return;
      }

      setErrorMessage("No session data in URL. Please try signing in again.");
      setStatus("error");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }, [router, searchParams]);

  useEffect(() => {
    exchange();
  }, [exchange]);

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white">
        <p>Signing you in…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-red-200">{errorMessage ?? "Sign-in failed."}</p>
        <a
          href="/portal/login"
          className="mt-4 inline-block text-sm text-[rgb(var(--gold))] hover:underline"
        >
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/80">
      <p>Completing sign-in…</p>
    </div>
  );
}
