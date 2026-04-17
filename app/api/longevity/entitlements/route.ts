import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPortalUser } from "@/lib/longevity/portalAuth";
import { getProfilePaymentRow, getProfilePaymentRowByAuthUserId } from "@/lib/payment/profilePayment";
import { computeHliEntitlements, computeHliEntitlementsDetailed } from "@/lib/payment/entitlements";
import { getMembershipZoomBalance } from "@/lib/payment/membershipIncludedZoom";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/longevity/entitlements — Effective paid-feature flags for the current portal session / profile.
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
      const membershipZoom = await getMembershipZoomBalance(supabase, row);
      return NextResponse.json({
        ok: true,
        profile_id: row.id,
        entitlements: computeHliEntitlements(row, membershipZoom ?? undefined),
        detailed: computeHliEntitlementsDetailed(row, membershipZoom ?? undefined),
        raw: {
          membership_status: row.membership_status,
          membership_current_period_end: row.membership_current_period_end,
          membership_zoom_usage_period_start: row.membership_zoom_usage_period_start,
        },
      });
    }
  }

  if (sessionProfileId) {
    const row = await getProfilePaymentRow(supabase, sessionProfileId);
    if (row) {
      const membershipZoom = await getMembershipZoomBalance(supabase, row);
      return NextResponse.json({
        ok: true,
        profile_id: row.id,
        entitlements: computeHliEntitlements(row, membershipZoom ?? undefined),
        detailed: computeHliEntitlementsDetailed(row, membershipZoom ?? undefined),
        raw: {
          membership_status: row.membership_status,
          membership_current_period_end: row.membership_current_period_end,
          membership_zoom_usage_period_start: row.membership_zoom_usage_period_start,
        },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    profile_id: null,
    entitlements: null,
    detailed: null,
  });
}
