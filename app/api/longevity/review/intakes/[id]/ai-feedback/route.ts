/**
 * POST /api/longevity/review/intakes/[id]/ai-feedback — Append-only clinician feedback on AI outputs.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS, REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import {
  insertClinicianAiFeedback,
  parseClinicianAiFeedbackBody,
} from "@/lib/longevity/clinicianAiFeedback";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Longevity API is disabled." },
      { status: 404 }
    );
  }
  try {
    const trichologist = await getTrichologistFromRequest();
    if (!trichologist) {
      return NextResponse.json(
        { ok: false, error: "Trichologist authentication required." },
        { status: 401 }
      );
    }

    const { id: intake_id } = await params;
    if (!intake_id) {
      return NextResponse.json(
        { ok: false, error: "Missing intake id." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = parseClinicianAiFeedbackBody(
      body && typeof body === "object" ? (body as Record<string, unknown>) : {}
    );

    const supabase = supabaseAdmin();
    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, review_status")
      .eq("id", intake_id)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }

    const inQueue = REVIEW_STATUS_IN_QUEUE.includes(
      intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number]
    );
    const isReleased = intake.review_status === REVIEW_STATUS.REVIEW_COMPLETE;
    if (!inQueue && !isReleased) {
      return NextResponse.json(
        { ok: false, error: "Intake is not available for review." },
        { status: 403 }
      );
    }

    const result = await insertClinicianAiFeedback(supabase, {
      intake_id,
      profile_id: intake.profile_id,
      trichologist_id: trichologist.id,
      adaptive_triage_usefulness: parsed.adaptive_triage_usefulness,
      scalp_image_intelligence_usefulness: parsed.scalp_image_intelligence_usefulness,
      intake_image_fusion_usefulness: parsed.intake_image_fusion_usefulness,
      note: parsed.note,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      event_type: "clinician_ai_feedback_submitted",
      payload: {
        trichologist_id: trichologist.id,
        feedback_id: result.id,
        has_adaptive_rating: parsed.adaptive_triage_usefulness != null,
        has_scalp_rating: parsed.scalp_image_intelligence_usefulness != null,
        has_fusion_rating: parsed.intake_image_fusion_usefulness != null,
        has_note: parsed.note != null,
      },
      actor_type: "trichologist",
    });

    return NextResponse.json({
      ok: true,
      feedback: {
        id: result.id,
        created_at: result.created_at,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
