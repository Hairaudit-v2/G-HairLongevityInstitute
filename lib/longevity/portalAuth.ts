/**
 * Longevity portal: resolve profile from Supabase Auth.
 * One profile per auth user; link by auth_user_id. Match by email when linking existing profile.
 * All code under longevity namespace; no changes to HLI report/referral flows.
 *
 * Anonymous-to-authenticated handoff: When a user who previously used the cookie-only flow
 * (e.g. started an intake without an account) later signs in with the same email, ensurePortalProfile
 * finds the unlinked profile by email (onlyUnlinked: true) and links it. The same profile—and thus
 * the same intakes and documents—is then used. The portal dashboard sets the longevity session
 * cookie so /longevity/start and /api/longevity/* see the same profile_id.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeEmail } from "./email";
import { createLongevitySupabaseServerClient } from "./supabaseServer";

export type PortalUser = {
  id: string;
  email?: string | null;
};

/**
 * Get the current Supabase Auth user from cookies (portal only).
 * Returns null if not logged in or env not configured.
 */
export async function getPortalUser(): Promise<PortalUser | null> {
  const supabase = await createLongevitySupabaseServerClient();
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? null };
}

/**
 * Get longevity profile for the given auth user id (service-role or admin).
 * Returns profile row or null.
 */
export async function getProfileByAuthUserId(
  supabase: SupabaseClient,
  authUserId: string
): Promise<{ id: string; email: string; full_name: string | null; auth_user_id: string | null } | null> {
  const { data, error } = await supabase
    .from("hli_longevity_profiles")
    .select("id, email, full_name, auth_user_id")
    .eq("auth_user_id", authUserId)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as { id: string; email: string; full_name: string | null; auth_user_id: string | null };
}

/**
 * Find profile by email (for linking when user first logs in with same email).
 * Case-insensitive so cookie-created profiles match auth email regardless of casing.
 * When onlyUnlinked is true, returns only profiles not yet bound to an auth user (avoids stealing another account's profile).
 */
export async function getProfileByEmail(
  supabase: SupabaseClient,
  email: string,
  options?: { onlyUnlinked?: boolean }
): Promise<{ id: string; email: string; full_name: string | null; auth_user_id: string | null } | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  let query = supabase
    .from("hli_longevity_profiles")
    .select("id, email, full_name, auth_user_id")
    .ilike("email", normalized)
    .order("created_at", { ascending: true })
    .limit(1);
  if (options?.onlyUnlinked) {
    query = query.is("auth_user_id", null);
  }
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as { id: string; email: string; full_name: string | null; auth_user_id: string | null };
}

/**
 * Link an existing profile to an auth user (idempotent).
 * Fails if another profile is already linked to this auth user.
 */
export async function linkProfileToAuthUser(
  supabase: SupabaseClient,
  profileId: string,
  authUserId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await getProfileByAuthUserId(supabase, authUserId);
  if (existing && existing.id !== profileId) {
    return { ok: false, error: "Another profile is already linked to this account." };
  }
  if (existing?.id === profileId) return { ok: true };
  const { error } = await supabase
    .from("hli_longevity_profiles")
    .update({ auth_user_id: authUserId, updated_at: new Date().toISOString() })
    .eq("id", profileId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type EnsurePortalProfileResult =
  | { ok: true; profileId: string }
  | { ok: false; reason: "no_email" }
  | { ok: false; reason: "error" };

/**
 * Ensure the current portal user has a longevity profile: by auth_user_id, or by email (then link).
 * Creates a new profile only if none exists for this auth user or email.
 * No duplicate profile in normal flow: (1) if auth_user_id already linked, return that profile;
 * (2) else if an unlinked profile matches email, link it and return; (3) only then insert one new row.
 * Future clinician (Trichologist) workflows can assume one profile per portal user and stable
 * profile_id for that patient's intakes and documents.
 * Returns a result so the caller can distinguish "no email" (sign-in provider did not provide email) from other failures.
 */
export async function ensurePortalProfile(
  supabaseAdmin: SupabaseClient,
  authUser: PortalUser
): Promise<EnsurePortalProfileResult> {
  let profile = await getProfileByAuthUserId(supabaseAdmin, authUser.id);
  if (profile) return { ok: true, profileId: profile.id };

  const email = normalizeEmail(authUser.email ?? "");
  if (!email) return { ok: false, reason: "no_email" };

  profile = await getProfileByEmail(supabaseAdmin, email, { onlyUnlinked: true });
  if (profile) {
    const link = await linkProfileToAuthUser(supabaseAdmin, profile.id, authUser.id);
    return link.ok ? { ok: true, profileId: profile.id } : { ok: false, reason: "error" };
  }

  const { data: created, error } = await supabaseAdmin
    .from("hli_longevity_profiles")
    .insert({
      email,
      full_name: null,
      auth_user_id: authUser.id,
    })
    .select("id")
    .single();
  if (error || !created?.id) return { ok: false, reason: "error" };
  return { ok: true, profileId: created.id };
}
