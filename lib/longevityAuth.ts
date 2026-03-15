/**
 * Longevity module session/auth helpers (isolated lane).
 * Portal: authenticated users use Supabase Auth; this cookie is set when they open the portal
 * dashboard so /longevity/start and /api/longevity/* continue to work with profile_id.
 * Anonymous: cookie-only flow (no login) still works for /longevity/start and /longevity/dashboard.
 * Does not modify doctor or admin auth.
 */

import { cookies } from "next/headers";

const COOKIE_NAME = "hli_longevity_session";

/** Set longevity session (profile_id). Used by portal dashboard so intake flows see the same profile. */
export async function setLongevitySession(value: string): Promise<void> {
  const c = await cookies();
  c.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24h
    path: "/",
  });
}

/** Clear longevity session. */
export async function clearLongevitySession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

/**
 * Get longevity session identifier from request (cookie).
 * Returns null if missing or invalid (UUID format for future profile_id use).
 */
export async function getLongevitySessionFromRequest(): Promise<string | null> {
  const c = await cookies();
  const v = c.get(COOKIE_NAME)?.value;
  return v && /^[0-9a-f-]{36}$/i.test(v) ? v : null;
}
