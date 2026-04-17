import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfilePaymentRow } from "./profilePayment";
import { getProfilePaymentRow } from "./profilePayment";
import { computeHliEntitlementsDetailed } from "./entitlements";
import { getPurchaseEligibility } from "./purchaseEligibility";
import { HLI_OFFERING, type HliPaymentOffering } from "./hliOffers";
import { listEntitlementLedgerForProfile } from "./entitlementLedger";

const OFFERINGS: readonly HliPaymentOffering[] = [
  HLI_OFFERING.BLOOD_REQUEST_LETTER,
  HLI_OFFERING.BLOOD_ANALYSIS_REVIEW,
  HLI_OFFERING.TRICHOLOGIST_APPOINTMENT,
  HLI_OFFERING.MEMBERSHIP,
];

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

  const detailed = computeHliEntitlementsDetailed(profile);
  const purchaseEligibility = {
    [HLI_OFFERING.BLOOD_REQUEST_LETTER]: getPurchaseEligibility(HLI_OFFERING.BLOOD_REQUEST_LETTER, profile),
    [HLI_OFFERING.BLOOD_ANALYSIS_REVIEW]: getPurchaseEligibility(HLI_OFFERING.BLOOD_ANALYSIS_REVIEW, profile),
    [HLI_OFFERING.TRICHOLOGIST_APPOINTMENT]: getPurchaseEligibility(
      HLI_OFFERING.TRICHOLOGIST_APPOINTMENT,
      profile
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
