/**
 * POST /api/longevity/review/blood-request — Trichologist refinement of blood request (Phase D.1).
 * Update recommended_tests and/or reason for an existing blood request. Intake must be in review workspace.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { isValidBloodTestCodes, type BloodTestCode } from "@/lib/longevity/bloodRequestEligibility";
import { getBloodRequestByIntake, updateBloodRequest } from "@/lib/longevity/bloodRequests";
import { auditLongevityEvent } from "@/lib/longevity/documents";

export const dynamic = "force-dynamic";

const MAX_REASON_LENGTH = 1000;

export async function POST(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const trichologist = await getTrichologistFromRequest();
    if (!trichologist) {
      return NextResponse.json(
        { ok: false, error: "Trichologist authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const intake_id = typeof body.intake_id === "string" ? body.intake_id.trim() : null;
    const blood_request_id =
      typeof body.blood_request_id === "string" ? body.blood_request_id.trim() || null : null;
    const recommended_tests_raw = body.recommended_tests;
    let reason: string | null | undefined =
      typeof body.reason === "string"
        ? body.reason.trim().slice(0, MAX_REASON_LENGTH) || null
        : body.reason === null
          ? null
          : undefined;

    if (!intake_id) {
      return NextResponse.json(
        { ok: false, error: "intake_id is required." },
        { status: 400 }
      );
    }

    if (!isValidBloodTestCodes(recommended_tests_raw)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "recommended_tests must be an array of approved test codes only. Use BLOOD_TEST_CODES (e.g. ferritin, tsh, fbc).",
        },
        { status: 400 }
      );
    }
    const recommended_tests = recommended_tests_raw as BloodTestCode[];

    const supabase = supabaseAdmin();

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, review_status")
      .eq("id", intake_id)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    if (!REVIEW_STATUS_IN_QUEUE.includes(intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number])) {
      return NextResponse.json(
        { ok: false, error: "Intake is not in the review workspace." },
        { status: 400 }
      );
    }

    let bloodRequest: { id: string; intake_id: string } | null = null;
    if (blood_request_id) {
      const { data } = await supabase
        .from("hli_longevity_blood_requests")
        .select("id, intake_id")
        .eq("id", blood_request_id)
        .single();
      if (data?.intake_id === intake_id) bloodRequest = data as { id: string; intake_id: string };
    }
    if (!bloodRequest) {
      const br = await getBloodRequestByIntake(supabase, intake_id);
      if (br) bloodRequest = { id: br.id, intake_id: br.intake_id };
    }

    if (!bloodRequest) {
      return NextResponse.json(
        { ok: false, error: "Blood request not found or does not belong to this intake." },
        { status: 404 }
      );
    }
    const brId = bloodRequest.id;

    const updateResult = await updateBloodRequest(supabase, {
      blood_request_id: brId,
      recommended_tests,
      ...(reason !== undefined && { reason }),
    });
    if ("error" in updateResult) {
      return NextResponse.json({ ok: false, error: updateResult.error }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      event_type: "blood_request_updated",
      payload: {
        trichologist_id: trichologist.id,
        blood_request_id: brId,
        recommended_tests,
        reason_updated: reason !== undefined,
      },
      actor_type: "trichologist",
    });

    const updated = await getBloodRequestByIntake(supabase, intake_id);
    return NextResponse.json({
      ok: true,
      blood_request_id: brId,
      recommended_tests,
      reason: updated?.reason ?? null,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
