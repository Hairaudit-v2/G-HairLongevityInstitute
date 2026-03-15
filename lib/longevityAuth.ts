/**
 * Longevity module session/auth helpers (isolated lane).
 * Reuses cookie/session pattern only; does not modify doctor or admin auth.
 * TODO: Replace with Supabase Auth or dedicated longevity session when wired.
 */

import { cookies } from "next/headers";

const COOKIE_NAME = "hli_longevity_session";

/** Placeholder: set longevity session (e.g. profile_id or token). Not used in Phase 1. */
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
