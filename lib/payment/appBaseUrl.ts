/**
 * Canonical public base URL for Stripe success/cancel redirects and emails.
 */

export function getAppBaseUrl(): string {
  const fromEnv = process.env.HLI_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}
