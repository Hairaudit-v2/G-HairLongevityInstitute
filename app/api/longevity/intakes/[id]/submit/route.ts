import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { buildAuthRequiredJson } from "@/lib/longevity/redirects";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { computeTriage } from "@/lib/longevity/triage";
import { ruleBasedEligible, recommendedTestsFromFlags, reasonFromFlags } from "@/lib/longevity/bloodRequestEligibility";
import { ensureBloodRequest } from "@/lib/longevity/bloodRequests";
import { stageLongevityIntegrationArtifacts } from "@/lib/longevity/integrationOutbox";
import { LONGEVITY_EVENT_TYPE } from "@/lib/longevity/integrationContracts";
import { buildLongevityEventEnvelope } from "@/lib/longevity/normalizedEvents";
import { buildLongevitySignals } from "@/lib/longevity/normalizedSignals";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import { trackLongevityBetaEvent, BETA_EVENT } from "@/lib/longevity/analytics";
import { buildLongevityAdaptivePayload } from "@/lib/longevity/intake";

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
    if (!profileId) {
      return NextResponse.json(
        buildAuthRequiredJson(
          `/longevity/start?resume=${id}`,
          "Please sign in to submit your assessment.",
          { error: "session-expired" }
        ),
        { status: 401 }
      );
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
    if (intake.profile_id !== profileId) {
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

    await trackLongevityBetaEvent(supabase, {
      event: BETA_EVENT.INTAKE_SUBMITTED,
      profile_id: profileId,
      intake_id: id,
      actor_type: "user",
    });

    // Phase B: run triage and set review_status / review_priority / review_decision_source.
    // Best-effort: if questionnaire missing or triage throws, leave review_* null (backward compatible).
    let triageFlags: ReturnType<typeof computeTriage>["flags"] | null = null;
    let reviewStatus: string | null = null;
    let reviewPriority: string | null = null;
    let activeBloodRequest: { id: string; status: string } | null = null;
    let bloodRequestCreated = false;
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
        const adaptivePayload = buildLongevityAdaptivePayload(responses);
        const triage = computeTriage(responses);
        triageFlags = triage.flags;
        reviewStatus = triage.review_status;
        reviewPriority = triage.review_priority;
        const inQueue = REVIEW_STATUS_IN_QUEUE.includes(
          triage.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number]
        );
        await supabase
          .from("hli_longevity_intakes")
          .update({
            review_status: triage.review_status,
            review_priority: triage.review_priority,
            review_decision_source: triage.review_decision_source,
            triaged_at: triage.triaged_at,
            triage_version: triage.triage_version,
            adaptive_answers: adaptivePayload.adaptive_answers,
            adaptive_schema_version: adaptivePayload.adaptive_schema_version,
            adaptive_triage_output: adaptivePayload.adaptive_triage_output,
            ...(inQueue ? { status: "in_review" as const } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (ruleBasedEligible(responses) && profileId) {
          try {
            const bloodRequest = await ensureBloodRequest(supabase, {
              intake_id: id,
              profile_id: profileId,
              recommended_tests: recommendedTestsFromFlags(responses),
              reason: reasonFromFlags(responses),
              recommended_by: "rules",
            });
            if (!("error" in bloodRequest)) {
              activeBloodRequest = {
                id: bloodRequest.id,
                status: bloodRequest.status,
              };
              bloodRequestCreated = bloodRequest.created;
            }
          } catch {
            // Best-effort; do not fail submit
          }
        }
      }
    } catch {
      // Triage is additive; do not fail submit if triage fails.
    }

    try {
      const intakeOccurredAt = new Date().toISOString();
      await stageLongevityIntegrationArtifacts(supabase, {
        profile_id: profileId,
        intake_id: id,
        blood_request_id: activeBloodRequest?.id ?? null,
        event: buildLongevityEventEnvelope({
          event_type: LONGEVITY_EVENT_TYPE.INTAKE_SUBMITTED,
          actor_type: "user",
          occurred_at: intakeOccurredAt,
          local_entity_type: "intake",
          local_entity_id: id,
          payload: {
            profile_id: profileId,
            intake_id: id,
            status: "submitted",
            review_status: reviewStatus,
            review_priority: reviewPriority,
          },
        }),
        signals: buildLongevitySignals({
          profileId,
          intakeId: id,
          derivedFlags: triageFlags,
          bloodRequest: activeBloodRequest,
          hasBloodResultUploadDocument: false,
          hasStructuredMarkers: false,
          generatedAt: intakeOccurredAt,
          sourceEventType: LONGEVITY_EVENT_TYPE.INTAKE_SUBMITTED,
        }),
      });

      if (bloodRequestCreated && activeBloodRequest) {
        const bloodRequestOccurredAt = new Date().toISOString();
        await stageLongevityIntegrationArtifacts(supabase, {
          profile_id: profileId,
          intake_id: id,
          blood_request_id: activeBloodRequest.id,
          event: buildLongevityEventEnvelope({
            event_type: LONGEVITY_EVENT_TYPE.BLOOD_REQUEST_CREATED,
            actor_type: "system",
            occurred_at: bloodRequestOccurredAt,
            local_entity_type: "blood_request",
            local_entity_id: activeBloodRequest.id,
            payload: {
              profile_id: profileId,
              intake_id: id,
              blood_request_id: activeBloodRequest.id,
              recommended_by: "rules",
            },
          }),
          signals: buildLongevitySignals({
            profileId,
            intakeId: id,
            derivedFlags: triageFlags,
            bloodRequest: activeBloodRequest,
            hasBloodResultUploadDocument: false,
            hasStructuredMarkers: false,
            generatedAt: bloodRequestOccurredAt,
            sourceEventType: LONGEVITY_EVENT_TYPE.BLOOD_REQUEST_CREATED,
          }),
        });
      }
    } catch {
      // Integration staging is additive; do not fail submit if it fails.
    }

    try {
      const {
        recordReminderOutcome,
        REMINDER_OUTCOME_TYPE: OUTCOME_TYPE,
      } = await import("@/lib/longevity/reminderOutcomes");
      await recordReminderOutcome(supabase, {
        profileId,
        outcomeType: OUTCOME_TYPE.FOLLOW_UP_INTAKE_SUBMITTED,
        relatedIntakeId: id,
        occurredAt: new Date().toISOString(),
      });
    } catch {
      // Outcome attribution is additive; do not fail submit.
    }

    return NextResponse.json({ ok: true, status: "submitted" });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
