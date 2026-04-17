import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfilePaymentRow } from "./profilePayment";
import { getProfilePaymentRow } from "./profilePayment";
import { computeHliEntitlementsDetailed } from "./entitlements";
import { getPurchaseEligibility } from "./purchaseEligibility";
import { HLI_OFFERING, type HliPaymentOffering } from "./hliOffers";
import { listEntitlementLedgerForProfile } from "./entitlementLedger";
import { getMembershipZoomBalance, membershipBillingPeriodActive } from "./membershipIncludedZoom";

export type BillingSnapshot = {
  profile: ProfilePaymentRow;
  detailed: ReturnType<typeof computeHliEntitlementsDetailed>;
  purchaseEligibility: Record<HliPaymentOffering, ReturnType<typeof getPurchaseEligibility>>;
  ledger: Awaited<ReturnType<typeof listEntitlementLedgerForProfile>>;
  stripeBillingPortalAvailable: boolean;
};

export async function getBillingSnapshotForProfile(
  supabase: SupabaseClient,
  profileId: string
): Promise<BillingSnapshot | null> {
  const profile = await getProfilePaymentRow(supabase, profileId);
  if (!profile) return null;

  const membershipZoom = await getMembershipZoomBalance(supabase, profile);
  const detailed = computeHliEntitlementsDetailed(profile, membershipZoom ?? undefined);
  const trichCtx = membershipBillingPeriodActive(profile)
    ? { membershipIncludedZoomUsed: membershipZoom?.used ?? 0 }
    : undefined;
  const purchaseEligibility = {
    [HLI_OFFERING.BLOOD_REQUEST_LETTER]: getPurchaseEligibility(HLI_OFFERING.BLOOD_REQUEST_LETTER, profile),
    [HLI_OFFERING.BLOOD_ANALYSIS_REVIEW]: getPurchaseEligibility(HLI_OFFERING.BLOOD_ANALYSIS_REVIEW, profile),
    [HLI_OFFERING.TRICHOLOGIST_APPOINTMENT]: getPurchaseEligibility(
      HLI_OFFERING.TRICHOLOGIST_APPOINTMENT,
      profile,
      trichCtx
    ),
    [HLI_OFFERING.MEMBERSHIP]: getPurchaseEligibility(HLI_OFFERING.MEMBERSHIP, profile),
  };
  const ledger = await listEntitlementLedgerForProfile(supabase, profileId, 25);

  return {
    profile,
    detailed,
    purchaseEligibility,
    ledger,
    stripeBillingPortalAvailable: Boolean(profile.stripe_customer_id?.trim()),
  };
}
