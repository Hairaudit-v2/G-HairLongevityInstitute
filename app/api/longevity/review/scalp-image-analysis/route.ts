import { NextResponse } from "next/server";
import { Inngest } from "inngest";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import { LONGEVITY_DOC_TYPE } from "@/lib/longevity/documentTypes";
import { runLongevityScalpImageAnalysisJob } from "@/lib/longevity/runScalpImageAnalysisJob";

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
      typeof body.intake_id === "string" ? body.intake_id.trim() : "";
    if (!intake_id) {
      return NextResponse.json(
        { ok: false, error: "intake_id is required." },
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

    const { count } = await supabase
      .from("hli_longevity_documents")
      .select("id", { count: "exact", head: true })
      .eq("intake_id", intake_id)
      .eq("doc_type", LONGEVITY_DOC_TYPE.SCALP_PHOTO);
    if (!count) {
      return NextResponse.json(
        { ok: false, error: "No scalp-photo documents found for this intake." },
        { status: 400 }
      );
    }

    const { data: job, error: jobErr } = await supabase
      .from("hli_longevity_ai_jobs")
      .insert({
        profile_id: intake.profile_id,
        intake_id,
        trichologist_id: trichologist.id,
        job_type: "scalp_image_analysis",
        status: "queued",
        stage: "queued",
      })
      .select("id")
      .single();
    if (jobErr || !job?.id) {
      return NextResponse.json(
        { ok: false, error: jobErr?.message ?? "Failed to create job." },
        { status: 500 }
      );
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      event_type: "scalp_image_analysis_queued",
      payload: { trichologist_id: trichologist.id, job_id: job.id },
      actor_type: "trichologist",
    });

    try {
      const inngest = new Inngest({ id: "hli" });
      await inngest.send({
        name: "hli/longevity.scalp-image-analysis.queued",
        data: {
          jobId: job.id,
          intakeId: intake_id,
          profileId: intake.profile_id,
          trichologistId: trichologist.id,
        },
      });
      return NextResponse.json({
        ok: true,
        job_id: job.id,
        queued: true,
      });
    } catch {
      const result = await runLongevityScalpImageAnalysisJob({
        jobId: job.id,
        intakeId: intake_id,
        profileId: intake.profile_id,
        trichologistId: trichologist.id,
      });
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.error ?? "Scalp analysis failed." },
          { status: 500 }
        );
      }
      return NextResponse.json({
        ok: true,
        job_id: job.id,
        queued: false,
        draft_count: result.draftCount ?? 0,
      });
    }
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
