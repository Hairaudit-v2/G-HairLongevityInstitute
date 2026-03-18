/**
 * Feature flags for Hair Longevity Institute modules.
 * All longevity flags default to false unless explicitly enabled via env.
 * Do not use these to change existing report, scoring, referral, or intake behavior.
 */

function envFlag(key: string): boolean {
  const v = process.env[key]?.trim();
  if (v === undefined || v === "") return false;
  if (v === "1") return true;
  const lower = v.toLowerCase();
  return lower === "true" || lower === "yes";
}

/** Enable longevity module UI and entry points (e.g. /longevity, /longevity/start). */
export function isLongevityEnabled(): boolean {
  return envFlag("HLI_ENABLE_LONGEVITY");
}

/** Enable longevity API routes (e.g. /api/longevity/health, /api/longevity/intakes). */
export function isLongevityApiEnabled(): boolean {
  return envFlag("HLI_ENABLE_LONGEVITY_API");
}

/** Enable blood request letter generation and longevity letter workflows. */
export function isLongevityLettersEnabled(): boolean {
  return envFlag("HLI_ENABLE_LONGEVITY_LETTERS");
}

/** Enable longevity patient portal (login, /portal dashboard). Same as longevity; auth requires NEXT_PUBLIC_SUPABASE_ANON_KEY. */
export function isLongevityPortalEnabled(): boolean {
  return envFlag("HLI_ENABLE_LONGEVITY");
}
