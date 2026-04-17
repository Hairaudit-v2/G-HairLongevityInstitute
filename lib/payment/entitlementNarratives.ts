/**
 * Shared plain-English lines for portal billing, API, and support — one source of tone.
 */

export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return iso;
  }
}

/** Staff / patient billing surface: one line per access state. */
export function plainEnglishBloodLetterAccess(args: {
  reason: "membership" | "one_time_unlock" | "legacy_grandfather" | "none";
  purchasedAt?: string | null;
  grandfatheredAt?: string | null;
}): string {
  switch (args.reason) {
    case "membership":
      return "Included via active membership.";
    case "one_time_unlock":
      return `One-time account unlock purchased on ${formatLongDate(args.purchasedAt)}. This is not a recurring charge for the letter — it stays on your account.`;
    case "legacy_grandfather":
      return `Legacy grandfathered access (recorded ${formatLongDate(args.grandfatheredAt)}). Continued access from before paid checkout.`;
    case "none":
      return "No active entitlement.";
    default:
      return "No active entitlement.";
  }
}

export function plainEnglishBloodReviewAccess(args: {
  reason: "membership" | "one_time_unlock" | "legacy_grandfather" | "none";
  purchasedAt?: string | null;
  grandfatheredAt?: string | null;
}): string {
  switch (args.reason) {
    case "membership":
      return "Included via active membership.";
    case "one_time_unlock":
      return `One-time account unlock purchased on ${formatLongDate(args.purchasedAt)}. Not a subscription — ongoing eligibility for this review pathway on your account.`;
    case "legacy_grandfather":
      return `Legacy grandfathered access (recorded ${formatLongDate(args.grandfatheredAt)}).`;
    case "none":
      return "No active entitlement.";
    default:
      return "No active entitlement.";
  }
}

export function plainEnglishTrichAccess(args: {
  paid: boolean;
  paidAt?: string | null;
  membershipIncludedZoom?: {
    used: number;
    includedPerPeriod: number;
    remaining: number;
    sessionMinutes: number;
    scopeLabel: string;
  } | null;
}): string {
  if (args.paid) {
    return `One-on-one trichologist appointment fee paid on ${formatLongDate(args.paidAt)}. Scheduling is arranged separately (1-hour session).`;
  }
  if (args.membershipIncludedZoom && args.membershipIncludedZoom.remaining > 0) {
    const z = args.membershipIncludedZoom;
    return `Your active membership includes ${z.includedPerPeriod} one-on-one Zoom sessions per ${z.scopeLabel} (${z.sessionMinutes} minutes each). You have ${z.remaining} remaining (${z.used} used this period). Schedule with the team — no separate booking fee until included sessions are used.`;
  }
  return "No paid one-on-one appointment on file. Members with no included sessions remaining may purchase a separate 1-hour appointment if offered on the booking page.";
}

/** Shorter staff-facing label (matches user examples). */
export function staffShortLabelBloodLetter(args: {
  reason: "membership" | "one_time_unlock" | "legacy_grandfather" | "none";
  purchasedAt?: string | null;
  grandfatheredAt?: string | null;
}): string {
  switch (args.reason) {
    case "membership":
      return "Included via active membership.";
    case "one_time_unlock":
      return `One-time unlock purchased on ${formatLongDate(args.purchasedAt)}.`;
    case "legacy_grandfather":
      return `Legacy grandfathered access (recorded ${formatLongDate(args.grandfatheredAt)}).`;
    case "none":
      return "No active entitlement.";
    default:
      return "No active entitlement.";
  }
}

export function staffShortLabelBloodReview(args: {
  reason: "membership" | "one_time_unlock" | "legacy_grandfather" | "none";
  purchasedAt?: string | null;
  grandfatheredAt?: string | null;
}): string {
  return staffShortLabelBloodLetter(args);
}
