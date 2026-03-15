/**
 * Longevity portal: Supabase server client for auth (cookie-based session).
 * Isolated to longevity module. Uses anon key so auth.getUser() reflects the logged-in user.
 * For DB writes use supabaseAdmin() from @/lib/supabaseAdmin.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type LongevitySupabaseServerClient = Awaited<ReturnType<typeof createLongevitySupabaseServerClient>>;

export async function createLongevitySupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return null;
  }
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options ?? {})
          );
        } catch {
          // Ignored when called from Server Component read context
        }
      },
    },
  });
}
