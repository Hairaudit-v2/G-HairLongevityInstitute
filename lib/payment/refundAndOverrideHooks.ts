/**
 * Future operational hooks: staff overrides and refund-driven entitlement review.
 *
 * Current behavior: no automatic entitlement changes here — this module documents the
 * intended extension points and keeps patterns compatible with `hli_entitlement_ledger`.
 *
 * When implementing:
 * - Add new `source_kind` values via Supabase migration (check constraint on ledger).
 * - Append ledger rows with `summary` + `metadata` (Stripe refund id, ticket id, actor).
 * - Optionally call `computeHliEntitlementsDetailed` after profile patch to verify gates.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** Planned ledger sources (requires DB migration before insert). */
export type FutureLedgerSourceKind = "refund_review" | "staff_override" | "stripe_charge_refunded";

export type RefundReviewEnqueueParams = {
  profileId: string;
  stripeRefundId?: string;
  stripeChargeId?: string;
  /** Reason for support audit */
  note: string;
};

/**
 * Placeholder: enqueue manual entitlement review after a Stripe refund.
 * Implement with: ledger insert + optional profile column clears + internal alert.
 */
export async function enqueueEntitlementReviewAfterRefund(
  _supabase: SupabaseClient,
  _params: RefundReviewEnqueueParams
): Promise<{ ok: true } | { ok: false; error: string }> {
  return { ok: true };
}

/**
 * Placeholder: apply a staff override to entitlements (e.g. comped access).
 * Implement with: ledger row `source_kind: staff_override` + profile patch + audit event.
 */
export async function applyStaffEntitlementOverridePlaceholder(
  _supabase: SupabaseClient,
  _params: {
    profileId: string;
    feature: "blood_request_letter" | "blood_analysis_review" | "trichologist_appointment";
    action: "grant" | "revoke";
    actorEmail: string;
    note: string;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  return { ok: true };
}
