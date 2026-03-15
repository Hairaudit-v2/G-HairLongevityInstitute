/**
 * Longevity Trichologist auth resolution (Phase A foundations).
 * Resolves Trichologist identity from Supabase Auth via hli_longevity_trichologists.
 * Isolated to longevity module; does not affect patient auth or HLI admin/doctor auth.
 * Use only for future Trichologist routes (e.g. /longevity/trichologist or /trichologist).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createLongevitySupabaseServerClient } from "./supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type TrichologistIdentity = {
  id: string;
  auth_user_id: string;
  display_name: string | null;
  email: string | null;
};

/**
 * Get the current Trichologist from the request (Supabase Auth cookie → hli_longevity_trichologists).
 * Returns null if not logged in, not a Trichologist, or Trichologist is inactive.
 * Does not affect or depend on patient session or admin auth.
 */
export async function getTrichologistFromRequest(): Promise<TrichologistIdentity | null> {
  const authClient = await createLongevitySupabaseServerClient();
  if (!authClient) return null;
  const { data: { user }, error } = await authClient.auth.getUser();
  if (error || !user) return null;

  const admin = supabaseAdmin();
  const { data: row, error: lookupErr } = await admin
    .from("hli_longevity_trichologists")
    .select("id, auth_user_id, display_name, email")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (lookupErr || !row) return null;
  return {
    id: row.id,
    auth_user_id: row.auth_user_id,
    display_name: row.display_name ?? null,
    email: row.email ?? null,
  };
}

/**
 * Resolve Trichologist by id (service-role only). Use when you have trichologist_id and need to
 * validate or load display_name. Returns null if not found or inactive.
 */
export async function getTrichologistById(
  supabase: SupabaseClient,
  trichologistId: string
): Promise<TrichologistIdentity | null> {
  const { data, error } = await supabase
    .from("hli_longevity_trichologists")
    .select("id, auth_user_id, display_name, email")
    .eq("id", trichologistId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    auth_user_id: data.auth_user_id,
    display_name: data.display_name ?? null,
    email: data.email ?? null,
  };
}
