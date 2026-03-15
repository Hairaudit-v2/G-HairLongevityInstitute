"use client";

import { useRouter } from "next/navigation";
import { createLongevitySupabaseBrowserClient } from "@/lib/longevity/supabaseBrowser";

export function PortalSignOut() {
  const router = useRouter();

  async function signOut() {
    try {
      const supabase = createLongevitySupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // continue to redirect
    }
    router.replace("/portal/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
    >
      Sign out
    </button>
  );
}
