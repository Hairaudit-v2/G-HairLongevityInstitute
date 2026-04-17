import type { SupabaseClient } from "@supabase/supabase-js";

export type EntitlementLedgerSourceKind =
  | "stripe_checkout"
  | "stripe_subscription"
  | "legacy_migration"
  | "admin";

export type EntitlementLedgerRow = {
  id: string;
  profile_id: string;
  recorded_at: string;
  source_kind: EntitlementLedgerSourceKind;
  offering: string | null;
  stripe_checkout_session_id: string | null;
  stripe_event_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_subscription_id: string | null;
  summary: string;
  metadata: Record<string, unknown>;
};

export async function insertEntitlementLedger(
  supabase: SupabaseClient,
  row: {
    profile_id: string;
    source_kind: EntitlementLedgerSourceKind;
    offering?: string | null;
    stripe_checkout_session_id?: string | null;
    stripe_event_id?: string | null;
    stripe_payment_intent_id?: string | null;
    stripe_subscription_id?: string | null;
    summary: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await supabase.from("hli_entitlement_ledger").insert({
    profile_id: row.profile_id,
    source_kind: row.source_kind,
    offering: row.offering ?? null,
    stripe_checkout_session_id: row.stripe_checkout_session_id ?? null,
    stripe_event_id: row.stripe_event_id ?? null,
    stripe_payment_intent_id: row.stripe_payment_intent_id ?? null,
    stripe_subscription_id: row.stripe_subscription_id ?? null,
    summary: row.summary,
    metadata: row.metadata ?? {},
  });
}

export async function listEntitlementLedgerForProfile(
  supabase: SupabaseClient,
  profileId: string,
  limit = 30
): Promise<EntitlementLedgerRow[]> {
  const { data, error } = await supabase
    .from("hli_entitlement_ledger")
    .select(
      "id, profile_id, recorded_at, source_kind, offering, stripe_checkout_session_id, stripe_event_id, stripe_payment_intent_id, stripe_subscription_id, summary, metadata"
    )
    .eq("profile_id", profileId)
    .order("recorded_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as EntitlementLedgerRow[];
}
