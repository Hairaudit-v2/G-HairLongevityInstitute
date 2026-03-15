/**
 * Email normalization for longevity profile operations.
 * Guarantees one profile per email address regardless of casing.
 * Use before any profile lookup or creation that uses email.
 */

/**
 * Normalize email for storage and lookup: trim and lowercase.
 * Returns empty string for null/undefined/whitespace-only input.
 */
export function normalizeEmail(email: string): string {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}
