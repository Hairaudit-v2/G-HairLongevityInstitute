"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buildPortalAuthCallbackUrl } from "@/lib/longevity/authCallback";
import { getSafePostAuthRedirect } from "@/lib/longevity/redirects";
import { createLongevitySupabaseBrowserClient } from "@/lib/longevity/supabaseBrowser";

const GOLD = "rgb(198,167,94)";

/** Google "G" logo for sign-in button (inline SVG, no icon dependency). */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const RESEND_COOLDOWN_SECONDS = 60;
const MAGIC_LINK_EXPIRY_MINUTES = 10;

const NO_EMAIL_MESSAGE =
  "We could not create your profile because your sign-in provider did not provide an email address. Please sign in using an email-based login.";

const SESSION_EXPIRED_MESSAGE = "Your session expired. Please sign in to continue.";

function PortalLoginContent() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const afterLoginRedirect = redirectParam ? getSafePostAuthRedirect(redirectParam) : null;
  const showNoEmailMessage = errorParam === "no-email";
  const showSessionExpiredMessage = errorParam === "session-expired";
  const resumingAssessment =
    afterLoginRedirect?.startsWith("/longevity/intake/") ||
    afterLoginRedirect?.startsWith("/longevity/start?resume=") ||
    afterLoginRedirect?.startsWith("/longevity/start?intakeId=");
  const startingAssessment =
    !!afterLoginRedirect?.startsWith("/longevity/start") && !resumingAssessment;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const [resendCooldownUntil, setResendCooldownUntil] = useState(0);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    setMessage(null);
    setGoogleLoading(true);
    try {
      const supabase = createLongevitySupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildPortalAuthCallbackUrl(afterLoginRedirect),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      }
      // On success Supabase redirects to Google, so we don't reset loading
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
      setGoogleLoading(false);
    }
  }, [afterLoginRedirect]);

  const requestMagicLink = useCallback(
    async (emailToUse: string) => {
      const supabase = createLongevitySupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: emailToUse.trim().toLowerCase(),
        options: {
          emailRedirectTo: buildPortalAuthCallbackUrl(afterLoginRedirect),
          shouldCreateUser: true,
        },
      });
      return { error };
    },
    [afterLoginRedirect]
  );

  useEffect(() => {
    if (resendCooldownUntil <= 0) {
      setResendCooldownSeconds(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((resendCooldownUntil - Date.now()) / 1000));
      setResendCooldownSeconds(remaining);
      if (remaining <= 0) setResendCooldownUntil(0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendCooldownUntil]);

  const sendMagicLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      const emailTrimmed = email.trim();
      if (!emailTrimmed) {
        setMessage({ type: "error", text: "Please enter your email address." });
        return;
      }
      setLoading(true);
      try {
        const { error } = await requestMagicLink(emailTrimmed);
        if (error) {
          setMessage({ type: "error", text: error.message });
          setLoading(false);
          return;
        }
        setLinkSentTo(emailTrimmed.toLowerCase());
        setResendCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
        setMessage(null);
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    },
    [email, requestMagicLink]
  );

  const resendMagicLink = useCallback(async () => {
    if (!linkSentTo || resendCooldownSeconds > 0) return;
    setMessage(null);
    setResendLoading(true);
    try {
      const { error } = await requestMagicLink(linkSentTo);
      if (error) {
        setMessage({ type: "error", text: error.message });
        setResendLoading(false);
        return;
      }
      setResendCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setResendLoading(false);
    }
  }, [linkSentTo, resendCooldownSeconds, requestMagicLink]);

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
        // Sync route sets longevity cookie (Route Handler), then redirects.
        const redirectTo = getSafePostAuthRedirect(afterLoginRedirect);
        window.location.href = `/api/longevity/session/sync?redirect=${encodeURIComponent(redirectTo)}`;
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

  const signUpWithPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      const emailTrimmed = email.trim();
      if (!emailTrimmed) {
        setMessage({ type: "error", text: "Please enter your email address." });
        return;
      }
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
        const { data, error } = await supabase.auth.signUp({
          email: emailTrimmed.toLowerCase(),
          password,
          options: {
            emailRedirectTo: buildPortalAuthCallbackUrl(afterLoginRedirect),
          },
        });
        if (error) {
          setMessage({ type: "error", text: error.message });
          setLoading(false);
          return;
        }
        if (data.session) {
          const redirectTo = getSafePostAuthRedirect(afterLoginRedirect);
          window.location.href = `/api/longevity/session/sync?redirect=${encodeURIComponent(redirectTo)}`;
          return;
        }
        setSignUpSuccess(true);
        setMessage({
          type: "success",
          text: "Check your email to confirm your account. Then you can sign in with your password.",
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
    [email, password, confirmPassword, afterLoginRedirect]
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
        Hair Longevity Institute™ — Patient Portal
      </div>
      <h1 className="mt-2 text-2xl font-semibold text-white">
        {startingAssessment ? "Create your account or sign in" : "Sign in"}
      </h1>
      <p className="mt-1 text-white/70">
        {resumingAssessment
          ? "Please sign in to resume your assessment."
          : startingAssessment
            ? "A secure portal account is required before your assessment can begin. Once you sign in, you will return straight to the intake."
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
      {startingAssessment && (
        <div className="mt-4 rounded-xl border border-[rgb(var(--gold))]/30 bg-[rgb(var(--gold))]/10 px-3 py-2.5 text-sm text-white/85">
          Your assessment draft will only be created after authentication. Nothing starts before you
          sign in.
        </div>
      )}

      {/* Magic link sent: show feedback and resend */}
      {linkSentTo ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <p className="font-medium">We&apos;ve sent a secure login link to your email.</p>
            <p className="mt-1 text-emerald-200/90">The link expires in {MAGIC_LINK_EXPIRY_MINUTES} minutes.</p>
            <p className="mt-2 text-emerald-200/80">If you don&apos;t see the email, check your spam folder.</p>
          </div>
          {message && message.type === "error" && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {message.text}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={resendMagicLink}
              disabled={resendLoading || resendCooldownSeconds > 0}
              className="inline-flex rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading
                ? "Sending…"
                : resendCooldownSeconds > 0
                  ? `Resend link (in ${resendCooldownSeconds}s)`
                  : "Resend link"}
            </button>
          </div>
          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="text-sm text-white/60 hover:text-white"
            >
              {showPassword ? "Hide password sign in" : "Or sign in with password"}
            </button>
            {showPassword && (
              <form onSubmit={signInWithPassword} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="portal-password-sent" className="block text-sm font-medium text-white/90">
                    Password
                  </label>
                  <input
                    id="portal-password-sent"
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
        </div>
      ) : (
        <>
          {/* Sign in with Google */}
          <div className="mt-6">
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={googleLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                "Redirecting…"
              ) : (
                <>
                  <GoogleIcon className="h-5 w-5" />
                  Sign in with Google
                </>
              )}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="flex-1 border-t border-white/10" />
            <span className="text-xs text-white/50">or continue with email</span>
            <span className="flex-1 border-t border-white/10" />
          </div>

          {/* Magic link (primary) form */}
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

          {/* Password alternative */}
          <div className="mt-6 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="text-sm text-white/60 hover:text-white"
            >
              {showPassword ? "Hide password sign in" : "Or sign in with password"}
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

          {/* Create account with email and password */}
          <div className="mt-6 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => {
                setShowSignUp((s) => !s);
                setMessage(null);
                if (!showSignUp) setSignUpSuccess(false);
              }}
              className="text-sm text-white/60 hover:text-white"
            >
              {showSignUp ? "Hide create account" : "Create account with email and password"}
            </button>
            {showSignUp && (
              <form onSubmit={signUpWithPassword} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="portal-signup-email" className="block text-sm font-medium text-white/90">
                    Email
                  </label>
                  <input
                    id="portal-signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--gold))]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="portal-signup-password" className="block text-sm font-medium text-white/90">
                    Password
                  </label>
                  <input
                    id="portal-signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--gold))]"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label htmlFor="portal-signup-confirm" className="block text-sm font-medium text-white/90">
                    Confirm password
                  </label>
                  <input
                    id="portal-signup-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[rgb(var(--gold))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--gold))]"
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
                  className="inline-flex w-full justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 disabled:opacity-50"
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>
            )}
          </div>
        </>
      )}

      <p className="mt-6 text-sm text-white/50">
        Secure patient assessments now require a portal account before the intake begins.
      </p>
      <Link href="/longevity" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
        ← Back to Longevity
      </Link>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
            Hair Longevity Institute™ — Patient Portal
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Sign in</h1>
          <p className="mt-4 text-white/50">Loading…</p>
        </div>
      }
    >
      <PortalLoginContent />
    </Suspense>
  );
}
