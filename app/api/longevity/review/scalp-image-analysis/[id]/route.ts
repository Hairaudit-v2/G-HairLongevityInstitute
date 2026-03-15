import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import {
  dismissScalpImageAnalysisDraft,
  getScalpImageAnalysisDraftById,
  markScalpImageAnalysisDraftApplied,
} from "@/lib/longevity/scalpImageAnalysisDrafts";
import { upsertScalpImageComparison } from "@/lib/longevity/scalpImageComparisons";
import {
  mapNumericConfidenceToBand,
  mapVisibleFindingsToLikelihoods,
} from "@/lib/longevity/scalpImageComparison";
import type { ConfirmedScalpImageFindings } from "@/lib/longevity/scalpImageComparison";

export const dynamic = "force-dynamic";

function mapComparisonDirectionToStatus(direction: string) {
  if (
    direction === "improved" ||
    direction === "stable" ||
    direction === "worsened" ||
    direction === "uncertain" ||
    direction === "insufficient_images"
  ) {
    return direction;
  }
  return "uncertain";
}

export async function PATCH(
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Draft id is required." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action.trim() : "";
    if (action !== "apply" && action !== "dismiss") {
      return NextResponse.json(
        { ok: false, error: "action must be 'apply' or 'dismiss'." },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const draft = await getScalpImageAnalysisDraftById(supabase, id);
    if (!draft) {
      return NextResponse.json(
        { ok: false, error: "Draft not found." },
        { status: 404 }
      );
    }
    if (draft.status !== "draft") {
      return NextResponse.json(
        { ok: false, error: "Draft has already been reviewed." },
        { status: 400 }
      );
    }

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, review_status")
      .eq("id", draft.intake_id)
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

    if (action === "dismiss") {
      const result = await dismissScalpImageAnalysisDraft(supabase, draft.id);
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
      }
      await auditLongevityEvent(supabase, {
        profile_id: intake.profile_id,
        intake_id: draft.intake_id,
        event_type: "scalp_image_analysis_draft_dismissed",
        payload: { trichologist_id: trichologist.id, draft_id: draft.id },
        actor_type: "trichologist",
      });
      return NextResponse.json({ ok: true });
    }

    const comparison = await upsertScalpImageComparison(supabase, {
      profile_id: intake.profile_id,
      intake_id: draft.intake_id,
      trichologist_id: trichologist.id,
      comparison_status: mapComparisonDirectionToStatus(draft.comparison_direction),
      compared_regions: draft.thinning_distribution,
      clinician_summary: draft.draft_summary,
      current_findings: {
        thinningDistribution: draft.thinning_distribution,
        severityBand:
          draft.severity_estimate as ConfirmedScalpImageFindings["severityBand"],
        ...mapVisibleFindingsToLikelihoods({
          visibleFindings: draft.visible_findings,
          imageQuality: draft.image_quality,
        }),
        imageQuality:
          draft.image_quality as ConfirmedScalpImageFindings["imageQuality"],
        findingConfidence: mapNumericConfidenceToBand(draft.confidence),
      },
    });
    if ("error" in comparison) {
      return NextResponse.json({ ok: false, error: comparison.error }, { status: 500 });
    }

    const applyResult = await markScalpImageAnalysisDraftApplied(
      supabase,
      draft.id,
      comparison.id
    );
    if (!applyResult.ok) {
      return NextResponse.json({ ok: false, error: applyResult.error }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id: draft.intake_id,
      event_type: "scalp_image_analysis_draft_applied",
      payload: {
        trichologist_id: trichologist.id,
        draft_id: draft.id,
        comparison_id: comparison.id,
      },
      actor_type: "trichologist",
    });

    return NextResponse.json({ ok: true, comparison_id: comparison.id });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
