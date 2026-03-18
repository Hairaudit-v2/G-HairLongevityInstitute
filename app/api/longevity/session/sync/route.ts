import { NextRequest, NextResponse } from "next/server";
import { setLongevitySession } from "@/lib/longevityAuth";
import { getPortalUser, ensurePortalProfile } from "@/lib/longevity/portalAuth";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isAllowedRedirect(path: string | null | undefined): path is string {
  if (!path || typeof path !== "string") return false;
  return path.startsWith("/longevity/") || path.startsWith("/portal/");
}

/**
 * GET: Sync longevity session cookie for the current portal user.
 * Resolves profile from auth, sets hli_longevity_session cookie, then redirects.
 * Safe to call from redirect chains (auth callback, password login); cookies are modified in this Route Handler only.
 */
export async function GET(req: NextRequest) {
  const user = await getPortalUser();
  if (!user) {
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }

  const trichologist = await getTrichologistFromRequest();
  if (trichologist) {
    return NextResponse.redirect(new URL("/portal/trichologist/review", req.url));
  }

  const supabase = supabaseAdmin();
  const profileResult = await ensurePortalProfile(supabase, user);
  if (!profileResult.ok) {
    if (profileResult.reason === "no_email") {
      return NextResponse.redirect(new URL("/portal/login?error=no-email", req.url));
    }
    return NextResponse.redirect(new URL("/portal/login?error=profile", req.url));
  }

  await setLongevitySession(profileResult.profileId);

  const redirectTo = req.nextUrl.searchParams.get("redirect");
  const target = isAllowedRedirect(redirectTo) ? redirectTo : "/portal/dashboard";
  return NextResponse.redirect(new URL(target, req.url));
}
