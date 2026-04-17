import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { insertEntitlementLedger } from "@/lib/payment/entitlementLedger";
import { getProfilePaymentRow } from "@/lib/payment/profilePayment";
import {
  getMembershipIncludedZoomUsedForPeriod,
  MEMBERSHIP_INCLUDED_ONE_ON_ONE_ZOOM_SESSIONS_PER_PERIOD,
  membershipBillingPeriodActive,
} from "@/lib/payment/membershipIncludedZoom";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST — Record use of one membership-included 30-minute Zoom session (trichologist-authenticated).
 */
export async function POST(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }

  const trich = await getTrichologistFromRequest();
  if (!trich) {
    return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
  }

  let body: { profileId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const profileId = typeof body.profileId === "string" ? body.profileId.trim() : "";
  if (!profileId) {
    return NextResponse.json({ ok: false, error: "profileId is required." }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const profile = await getProfilePaymentRow(supabase, profileId);
  if (!profile) {
    return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });
  }
  if (!membershipBillingPeriodActive(profile)) {
    return NextResponse.json({ ok: false, error: "Membership is not active for this profile." }, { status: 409 });
  }
  const periodStart = profile.membership_zoom_usage_period_start;
  if (!periodStart) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Membership billing data is not synced yet. Wait for the next sync or contact support. Included Zoom sessions are per calendar year while membership is active.",
      },
      { status: 409 }
    );
  }

  const used = await getMembershipIncludedZoomUsedForPeriod(supabase, profileId, periodStart);
  if (used >= MEMBERSHIP_INCLUDED_ONE_ON_ONE_ZOOM_SESSIONS_PER_PERIOD) {
    return NextResponse.json(
      {
        ok: false,
        error: "No remaining included Zoom sessions under the current allowance (two per calendar year while membership is active).",
      },
      { status: 409 }
    );
  }

  const { error: insErr } = await supabase.from("hli_membership_included_zoom_consumptions").insert({
    profile_id: profileId,
    membership_period_start: periodStart,
    metadata: { recorded_by_trichologist_id: trich.id },
  });
  if (insErr) {
    return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
  }

  const nextUsed = used + 1;
  await insertEntitlementLedger(supabase, {
    profile_id: profileId,
    source_kind: "entitlement_usage",
    offering: "membership_included_zoom_session",
    summary: `Included membership one-on-one Zoom session consumed (${nextUsed} of ${MEMBERSHIP_INCLUDED_ONE_ON_ONE_ZOOM_SESSIONS_PER_PERIOD}; patient terms: per calendar year).`,
    metadata: {
      kind: "membership_included_zoom_consumption",
      trichologist_id: trich.id,
      membership_period_start: periodStart,
    },
  });

  return NextResponse.json({
    ok: true,
    used: nextUsed,
    remaining: Math.max(0, MEMBERSHIP_INCLUDED_ONE_ON_ONE_ZOOM_SESSIONS_PER_PERIOD - nextUsed),
  });
}
