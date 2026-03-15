import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { computeTriage } from "@/lib/longevity/triage";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

export const dynamic = "force-dynamic";

/**
 * Submit an intake (draft → submitted). Submission is final for the questionnaire (no overwrite;
 * questionnaire is locked for PATCH). New follow-up activity uses a new intake (POST /api/longevity/intakes).
 * Longitudinal: this intake row is never replaced; documents can still be added to it after submit.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const profileId = await getLongevitySessionFromRequest();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing intake id." }, { status: 400 });
    }
    const supabase = supabaseAdmin();
    const { data: intake, error: fetchErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, status")
      .eq("id", id)
      .single();
    if (fetchErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    if (!profileId || intake.profile_id !== profileId) {
      return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
    }
    if (intake.status !== "draft") {
      return NextResponse.json(
        { ok: false, error: "Only draft intakes can be submitted." },
        { status: 400 }
      );
    }

    const { error: updateErr } = await supabase
      .from("hli_longevity_intakes")
      .update({ status: "submitted", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    await supabase.from("hli_longevity_audit_events").insert({
      intake_id: id,
      profile_id: profileId,
      event_type: "intake_submitted",
      payload: {},
      actor_type: "user",
    });

    // Phase B: run triage and set review_status / review_priority / review_decision_source.
    // Best-effort: if questionnaire missing or triage throws, leave review_* null (backward compatible).
    try {
      const { data: questionnaire } = await supabase
        .from("hli_longevity_questionnaires")
        .select("responses")
        .eq("intake_id", id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const responses = (questionnaire?.responses ?? {}) as LongevityQuestionnaireResponses;
      if (responses && typeof responses === "object") {
        const triage = computeTriage(responses);
        await supabase
          .from("hli_longevity_intakes")
          .update({
            review_status: triage.review_status,
            review_priority: triage.review_priority,
            review_decision_source: triage.review_decision_source,
            triaged_at: triage.triaged_at,
            triage_version: triage.triage_version,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }
    } catch {
      // Triage is additive; do not fail submit if triage fails.
    }

    return NextResponse.json({ ok: true, status: "submitted" });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
