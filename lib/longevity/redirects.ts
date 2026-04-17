export const DEFAULT_POST_AUTH_REDIRECT = "/portal/dashboard";

export type PortalLoginError = "session-expired" | "no-email" | "profile";

export function isAllowedPostAuthRedirect(path: string | null | undefined): path is string {
  if (!path || typeof path !== "string") return false;
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  const pathname = path.split("?")[0]?.split("#")[0] ?? "";
  if (pathname.startsWith("/longevity/") || pathname.startsWith("/portal/") || pathname.startsWith("/checkout/")) {
    return true;
  }
  return (
    pathname === "/pricing" ||
    pathname === "/membership" ||
    pathname === "/book" ||
    pathname === "/"
  );
}

export function getSafePostAuthRedirect(
  path: string | null | undefined,
  fallback = DEFAULT_POST_AUTH_REDIRECT
): string {
  return isAllowedPostAuthRedirect(path) ? path : fallback;
}

export function buildPortalLoginRedirectPath(
  redirectPath: string | null | undefined,
  options?: { error?: PortalLoginError }
): string {
  const params = new URLSearchParams();
  const safeRedirect = isAllowedPostAuthRedirect(redirectPath) ? redirectPath : null;
  if (options?.error) params.set("error", options.error);
  if (safeRedirect) params.set("redirect", safeRedirect);
  const query = params.toString();
  return query ? `/portal/login?${query}` : "/portal/login";
}

export function buildAuthRequiredJson(
  redirectPath: string | null | undefined,
  message: string,
  options?: { error?: PortalLoginError }
): {
  ok: false;
  requiresAuth: true;
  redirectTo: string;
  message: string;
} {
  return {
    ok: false,
    requiresAuth: true,
    redirectTo: buildPortalLoginRedirectPath(redirectPath, options),
    message,
  };
}
