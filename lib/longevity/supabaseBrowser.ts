/**
 * Longevity portal: Supabase browser client for auth (login/signup).
 * Isolated to longevity module. Used only in portal login UI.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createLongevitySupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY for portal auth.");
  }
  return createBrowserClient(url, anonKey);
}
