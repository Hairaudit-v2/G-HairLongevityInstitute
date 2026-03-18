"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createLongevitySupabaseBrowserClient } from "@/lib/longevity/supabaseBrowser";

/** Supabase PKCE magic link uses type=email; we also accept magiclink. Map recovery/signup to email for verifyOtp. */
function toOtpType(type: string | null): "email" | "magiclink" {
  if (type === "magiclink" || type === "email") return type;
  if (type === "recovery" || type === "signup") return "email";
  return "email";
}

/**
 * Handles Supabase Auth redirect after magic link (PKCE) or OAuth (implicit hash).
 * PKCE flow: consume token_hash + type from URL and call verifyOtp().
 * Implicit flow (legacy): consume access_token + refresh_token from URL hash and setSession().
 */
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"exchanging" | "done" | "error">("exchanging");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const exchange = useCallback(async () => {
    try {
      const supabase = createLongevitySupabaseBrowserClient();

      // Read from actual URL so we don't rely on useSearchParams() on first paint (Next.js can be empty).
      const hashParams = typeof window !== "undefined" ? window.location.hash : "";
      const queryString = typeof window !== "undefined" ? window.location.search : "";
      const fragment = new URLSearchParams(hashParams.replace(/^#/, ""));
      const query = new URLSearchParams(queryString);

      const redirectTo = query.get("redirect") ?? searchParams.get("redirect");
      const allowedRedirect =
        redirectTo &&
        (redirectTo.startsWith("/longevity/") || redirectTo.startsWith("/portal/"));
      const finalRedirect = allowedRedirect ? redirectTo : "/portal/dashboard";
      const destination = `/api/longevity/session/sync?redirect=${encodeURIComponent(finalRedirect)}`;

      // 1) PKCE magic link: token_hash + type (Supabase docs). Prefer this so PKCE email flow works.
      const tokenHash = query.get("token_hash") ?? searchParams.get("token_hash");
      const typeParam = query.get("type") ?? searchParams.get("type");
      if (tokenHash) {
        const otpType = toOtpType(typeParam);
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });
        if (error) {
          setErrorMessage(error.message);
          setStatus("error");
          return;
        }
        setStatus("done");
        window.location.href = destination;
        return;
      }

      // 2) Implicit flow (hash): access_token + refresh_token — backward compatibility.
      const accessToken = fragment.get("access_token");
      const refreshToken = fragment.get("refresh_token");
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
        window.location.href = destination;
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

export default function PortalAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/80">
          <p>Completing sign-in…</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
