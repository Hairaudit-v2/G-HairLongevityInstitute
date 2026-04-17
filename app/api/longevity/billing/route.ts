import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPortalUser } from "@/lib/longevity/portalAuth";
import { getBillingSnapshotForProfile } from "@/lib/payment/billingSnapshot";
import { getProfilePaymentRowByAuthUserId } from "@/lib/payment/profilePayment";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/longevity/billing — Billing + entitlement snapshot for portal UI and pricing gates.
 */
export async function GET() {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }

  const portalUser = await getPortalUser();
  const sessionProfileId = await getLongevitySessionFromRequest();
  const supabase = supabaseAdmin();

  if (portalUser) {
    const row = await getProfilePaymentRowByAuthUserId(supabase, portalUser.id);
    if (row) {
      if (sessionProfileId && sessionProfileId !== row.id) {
        return NextResponse.json(
          { ok: false, error: "Profile mismatch between login and session." },
          { status: 403 }
        );
      }
      const snapshot = await getBillingSnapshotForProfile(supabase, row.id);
      if (!snapshot) {
        return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });
      }
      return NextResponse.json({ ok: true, ...snapshot });
    }
  }

  if (sessionProfileId) {
    const snapshot = await getBillingSnapshotForProfile(supabase, sessionProfileId);
    if (snapshot) {
      return NextResponse.json({ ok: true, ...snapshot });
    }
  }

  return NextResponse.json({
    ok: true,
    profile: null,
    detailed: null,
    purchaseEligibility: null,
    ledger: [],
    stripeBillingPortalAvailable: false,
  });
}
