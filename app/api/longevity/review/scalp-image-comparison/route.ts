import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import {
  SCALP_IMAGE_COMPARISON_STATUS,
  getScalpImageComparisonSummaryForIntake,
  upsertScalpImageComparison,
  type ScalpImageComparisonStatus,
} from "@/lib/longevity/scalpImageComparisons";

const ALLOWED_COMPARISON_STATUSES = Object.values(
  SCALP_IMAGE_COMPARISON_STATUS
);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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

    const body = await req.json().catch(() => ({}));
    const intake_id =
      typeof body.intake_id === "string" ? body.intake_id.trim() : null;
    const comparison_status =
      typeof body.comparison_status === "string"
        ? body.comparison_status.trim()
        : null;
    const compared_regions = Array.isArray(body.compared_regions)
      ? body.compared_regions
          .filter((value: unknown): value is string => typeof value === "string")
          .map((value: string) => value.trim())
          .filter(Boolean)
      : [];
    const clinician_summary =
      typeof body.clinician_summary === "string"
        ? body.clinician_summary.trim()
        : "";

    if (!intake_id) {
      return NextResponse.json(
        { ok: false, error: "intake_id is required." },
        { status: 400 }
      );
    }
    if (
      !comparison_status ||
      !ALLOWED_COMPARISON_STATUSES.includes(
        comparison_status as ScalpImageComparisonStatus
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: `comparison_status must be one of: ${ALLOWED_COMPARISON_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, review_status")
      .eq("id", intake_id)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json(
        { ok: false, error: "Intake not found." },
        { status: 404 }
      );
    }
    if (
      !REVIEW_STATUS_IN_QUEUE.includes(
        intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number]
      )
    ) {
      return NextResponse.json(
        { ok: false, error: "Intake is not in the review queue." },
        { status: 403 }
      );
    }

    const result = await upsertScalpImageComparison(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      trichologist_id: trichologist.id,
      comparison_status: comparison_status as ScalpImageComparisonStatus,
      compared_regions,
      clinician_summary: clinician_summary || null,
    });
    if ("error" in result) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      event_type: "scalp_image_comparison_saved",
      payload: {
        trichologist_id: trichologist.id,
        comparison_status,
        compared_regions,
      },
      actor_type: "trichologist",
    });

    const summary = await getScalpImageComparisonSummaryForIntake(
      supabase,
      intake.profile_id,
      intake_id
    );

    return NextResponse.json({ ok: true, comparison: summary });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
