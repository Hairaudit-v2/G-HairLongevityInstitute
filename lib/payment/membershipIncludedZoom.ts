import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfilePaymentRow } from "./profilePayment";

/** Included with active membership (commercially: two per calendar year; see portal copy). Tracked in data against the current Stripe-synced period anchor. */
export const MEMBERSHIP_INCLUDED_ONE_ON_ONE_ZOOM_SESSIONS_PER_PERIOD = 2;

export const MEMBERSHIP_INCLUDED_ZOOM_SESSION_MINUTES = 30;

export type MembershipZoomBalance = {
  /** Sessions included per commercial terms (two per calendar year in patient copy) */
  includedPerPeriod: number;
  used: number;
  remaining: number;
  sessionDurationMinutes: number;
  /** Clarifies per-period vs lifetime for patients and support */
  scopeLabel: string;
  /** Stripe period start anchor (ISO), or null if not yet synced */
  periodStart: string | null;
};

export function membershipBillingPeriodActive(row: ProfilePaymentRow): boolean {
  const s = row.membership_status;
  return s === "active" || s === "trialing";
}

/**
 * Count consumptions for the profile in the current membership period (matches Stripe current_period_start).
 */
export async function getMembershipIncludedZoomUsedForPeriod(
  supabase: SupabaseClient,
  profileId: string,
  membershipPeriodStartIso: string | null
): Promise<number> {
  if (!membershipPeriodStartIso) return 0;
  const { count, error } = await supabase
    .from("hli_membership_included_zoom_consumptions")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("membership_period_start", membershipPeriodStartIso);
  if (error) return 0;
  return count ?? 0;
}

export async function getMembershipZoomBalance(
  supabase: SupabaseClient,
  row: ProfilePaymentRow
): Promise<MembershipZoomBalance | null> {
  if (!membershipBillingPeriodActive(row)) return null;
  const periodStart = row.membership_zoom_usage_period_start ?? null;
  const used = await getMembershipIncludedZoomUsedForPeriod(supabase, row.id, periodStart);
  const included = MEMBERSHIP_INCLUDED_ONE_ON_ONE_ZOOM_SESSIONS_PER_PERIOD;
  return {
    includedPerPeriod: included,
    used,
    remaining: Math.max(0, included - used),
    sessionDurationMinutes: MEMBERSHIP_INCLUDED_ZOOM_SESSION_MINUTES,
    scopeLabel:
      "Not monthly and not a lifetime allowance — unused sessions do not roll over indefinitely.",
    periodStart,
  };
}
