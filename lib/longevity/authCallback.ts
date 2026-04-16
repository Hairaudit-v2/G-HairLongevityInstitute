const PORTAL_AUTH_CALLBACK_PATH = "/portal/auth/callback";
const LOCAL_FALLBACK_ORIGIN = "http://localhost:3000";

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

/**
 * Resolve the host used for Supabase auth callbacks.
 *
 * Priority:
 * 1. Explicit public env overrides for canonical deployments
 * 2. Current browser origin (works for production, preview, and local)
 * 3. Localhost fallback for non-browser local development safety
 */
export function getPortalAuthCallbackBase(): string {
  const envOrigin =
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_VERCEL_URL);

  if (envOrigin) {
    return `${envOrigin}${PORTAL_AUTH_CALLBACK_PATH}`;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${PORTAL_AUTH_CALLBACK_PATH}`;
  }

  return `${LOCAL_FALLBACK_ORIGIN}${PORTAL_AUTH_CALLBACK_PATH}`;
}

export function buildPortalAuthCallbackUrl(redirectPath?: string | null): string {
  const base = getPortalAuthCallbackBase();
  if (redirectPath && redirectPath.startsWith("/")) {
    return `${base}?redirect=${encodeURIComponent(redirectPath)}`;
  }
  return base;
}
