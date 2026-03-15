/**
 * POST /api/longevity/review/release — Trichologist releases patient-visible summary and marks review complete.
 * Internal, longevity-scoped. Requires Trichologist auth.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS, REVIEW_STATUS_IN_QUEUE, REVIEW_OUTCOME } from "@/lib/longevity/reviewConstants";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import { getEligibility } from "@/lib/longevity/bloodRequestEligibility";
import { ensureBloodRequest } from "@/lib/longevity/bloodRequests";
import { stageLongevityIntegrationArtifacts } from "@/lib/longevity/integrationOutbox";
import { LONGEVITY_EVENT_TYPE } from "@/lib/longevity/integrationContracts";
import { buildLongevityEventEnvelope } from "@/lib/longevity/normalizedEvents";
import { buildLongevitySignals } from "@/lib/longevity/normalizedSignals";
import { stageLongevityRemindersForIntake } from "@/lib/longevity/reminders";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import { getLongevityWorkflowSnapshotForIntake } from "@/lib/longevity/workflowSnapshot";

const ALLOWED_OUTCOMES = Object.values(REVIEW_OUTCOME);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const trichologist = await getTrichologistFromRequest();
    if (!trichologist) {
      return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const intake_id = typeof body.intake_id === "string" ? body.intake_id.trim() : null;
    const patient_visible_summary = typeof body.patient_visible_summary === "string" ? body.patient_visible_summary.trim() : "";
    let review_outcome: string | undefined = typeof body.review_outcome === "string" ? body.review_outcome.trim() || undefined : undefined;
    if (review_outcome !== undefined && !(ALLOWED_OUTCOMES as readonly string[]).includes(review_outcome)) {
      return NextResponse.json(
        { ok: false, error: `review_outcome must be one of: ${ALLOWED_OUTCOMES.join(", ")}` },
        { status: 400 }
      );
    }
    if (!intake_id) {
      return NextResponse.json({ ok: false, error: "intake_id is required." }, { status: 400 });
    }
    if (!patient_visible_summary) {
      return NextResponse.json({ ok: false, error: "patient_visible_summary is required." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data: intake, error: fetchErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, review_status")
      .eq("id", intake_id)
      .single();
    if (fetchErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    if (!REVIEW_STATUS_IN_QUEUE.includes(intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number])) {
      return NextResponse.json(
        { ok: false, error: "Intake is not in the review queue." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      patient_visible_summary,
      patient_visible_released_at: now,
      last_reviewed_at: now,
      review_status: REVIEW_STATUS.REVIEW_COMPLETE,
      updated_at: now,
    };
    if (review_outcome !== undefined) {
      updatePayload.review_outcome = review_outcome;
    }

    const { data: updated, error: updateErr } = await supabase
      .from("hli_longevity_intakes")
      .update(updatePayload)
      .eq("id", intake_id)
      .select("id, review_status, review_outcome, patient_visible_summary, patient_visible_released_at, last_reviewed_at")
      .single();
    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      event_type: "patient_summary_released",
      payload: { trichologist_id: trichologist.id },
      actor_type: "trichologist",
    });

    let createdBloodRequest: { id: string; status: string } | null = null;
    if (review_outcome === REVIEW_OUTCOME.BLOODS_RECOMMENDED && intake.profile_id) {
      try {
        const { data: questionnaire } = await supabase
          .from("hli_longevity_questionnaires")
          .select("responses")
          .eq("intake_id", intake_id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const responses = (questionnaire?.responses ?? {}) as LongevityQuestionnaireResponses;
        if (responses && typeof responses === "object") {
          const eligibility = getEligibility(responses, review_outcome);
          if (eligibility?.eligible && eligibility.recommended_by === "trichologist") {
            const bloodRequest = await ensureBloodRequest(supabase, {
              intake_id,
              profile_id: intake.profile_id,
              recommended_tests: eligibility.recommended_tests,
              reason: eligibility.reason,
              recommended_by: "trichologist",
            });
            if (!("error" in bloodRequest) && bloodRequest.created) {
              createdBloodRequest = {
                id: bloodRequest.id,
                status: bloodRequest.status,
              };
            }
          }
        }
      } catch {
        // Best-effort; do not fail release
      }
    }

    if (intake.profile_id) {
      try {
        const snapshot = await getLongevityWorkflowSnapshotForIntake(supabase, {
          profileId: intake.profile_id,
          intakeId: intake_id,
          reviewOutcome: updated.review_outcome ?? null,
        });

        if (createdBloodRequest) {
          const bloodRequestOccurredAt = new Date().toISOString();
          await stageLongevityIntegrationArtifacts(supabase, {
            profile_id: intake.profile_id,
            intake_id,
            blood_request_id: createdBloodRequest.id,
            event: buildLongevityEventEnvelope({
              event_type: LONGEVITY_EVENT_TYPE.BLOOD_REQUEST_CREATED,
              actor_type: "trichologist",
              occurred_at: bloodRequestOccurredAt,
              local_entity_type: "blood_request",
              local_entity_id: createdBloodRequest.id,
              payload: {
                profile_id: intake.profile_id,
                intake_id,
                blood_request_id: createdBloodRequest.id,
                recommended_by: "trichologist",
                review_outcome: updated.review_outcome ?? null,
              },
            }),
            signals: buildLongevitySignals({
              profileId: intake.profile_id,
              intakeId: intake_id,
              derivedFlags: snapshot.derivedFlags,
              clinicalInsights: snapshot.clinicalInsights,
              carePlan: snapshot.carePlan,
              caseComparison: snapshot.caseComparison,
              bloodRequest: snapshot.bloodRequest
                ? {
                    id: snapshot.bloodRequest.id,
                    status: snapshot.bloodRequest.status,
                    recommended_by: snapshot.bloodRequest.recommended_by,
                  }
                : null,
              reviewOutcome: updated.review_outcome ?? null,
              hasBloodResultUploadDocument: snapshot.hasBloodResultUploadDocument,
              hasStructuredMarkers: snapshot.hasStructuredMarkers,
              generatedAt: bloodRequestOccurredAt,
              sourceEventType: LONGEVITY_EVENT_TYPE.BLOOD_REQUEST_CREATED,
            }),
          });
        }

        const reviewOccurredAt = updated.patient_visible_released_at ?? now;
        await stageLongevityIntegrationArtifacts(supabase, {
          profile_id: intake.profile_id,
          intake_id,
          blood_request_id: snapshot.bloodRequest?.id ?? null,
          event: buildLongevityEventEnvelope({
            event_type: LONGEVITY_EVENT_TYPE.REVIEW_COMPLETED,
            actor_type: "trichologist",
            occurred_at: reviewOccurredAt,
            local_entity_type: "intake",
            local_entity_id: intake_id,
            payload: {
              profile_id: intake.profile_id,
              intake_id,
              review_status: updated.review_status,
              review_outcome: updated.review_outcome ?? null,
              patient_visible_released_at: updated.patient_visible_released_at ?? null,
            },
          }),
          signals: buildLongevitySignals({
            profileId: intake.profile_id,
            intakeId: intake_id,
            derivedFlags: snapshot.derivedFlags,
            clinicalInsights: snapshot.clinicalInsights,
            carePlan: snapshot.carePlan,
            caseComparison: snapshot.caseComparison,
            bloodRequest: snapshot.bloodRequest
              ? {
                  id: snapshot.bloodRequest.id,
                  status: snapshot.bloodRequest.status,
                  recommended_by: snapshot.bloodRequest.recommended_by,
                }
              : null,
            reviewOutcome: updated.review_outcome ?? null,
            hasBloodResultUploadDocument: snapshot.hasBloodResultUploadDocument,
            hasStructuredMarkers: snapshot.hasStructuredMarkers,
            generatedAt: reviewOccurredAt,
            sourceEventType: LONGEVITY_EVENT_TYPE.REVIEW_COMPLETED,
          }),
        });

        const carePlanOccurredAt = new Date().toISOString();
        await stageLongevityIntegrationArtifacts(supabase, {
          profile_id: intake.profile_id,
          intake_id,
          blood_request_id: snapshot.bloodRequest?.id ?? null,
          event: buildLongevityEventEnvelope({
            event_type: LONGEVITY_EVENT_TYPE.CARE_PLAN_GENERATED,
            actor_type: "system",
            occurred_at: carePlanOccurredAt,
            local_entity_type: "intake",
            local_entity_id: intake_id,
            payload: {
              profile_id: intake.profile_id,
              intake_id,
              review_outcome: updated.review_outcome ?? null,
              next_step_count: snapshot.carePlan.nextStepRecommendations.length,
              follow_up_timing_suggestion:
                snapshot.carePlan.followUpTimingSuggestion,
              gp_follow_up_suggested: snapshot.carePlan.gpFollowUpSuggested,
              scalp_photo_follow_up_needed:
                snapshot.carePlan.scalpPhotoFollowUpNeeded,
            },
          }),
          signals: buildLongevitySignals({
            profileId: intake.profile_id,
            intakeId: intake_id,
            derivedFlags: snapshot.derivedFlags,
            clinicalInsights: snapshot.clinicalInsights,
            carePlan: snapshot.carePlan,
            caseComparison: snapshot.caseComparison,
            bloodRequest: snapshot.bloodRequest
              ? {
                  id: snapshot.bloodRequest.id,
                  status: snapshot.bloodRequest.status,
                  recommended_by: snapshot.bloodRequest.recommended_by,
                }
              : null,
            reviewOutcome: updated.review_outcome ?? null,
            hasBloodResultUploadDocument: snapshot.hasBloodResultUploadDocument,
            hasStructuredMarkers: snapshot.hasStructuredMarkers,
            generatedAt: carePlanOccurredAt,
            sourceEventType: LONGEVITY_EVENT_TYPE.CARE_PLAN_GENERATED,
          }),
        });
      } catch {
        // Integration staging is additive; do not fail release if it fails.
      }

      try {
        await stageLongevityRemindersForIntake(supabase, {
          profileId: intake.profile_id,
          intakeId: intake_id,
          reviewOutcome: updated.review_outcome ?? null,
        });
      } catch {
        // Reminder staging is additive; do not fail release if it fails.
      }
    }

    return NextResponse.json({
      ok: true,
      intake: {
        id: updated.id,
        review_status: updated.review_status,
        review_outcome: updated.review_outcome ?? null,
        patient_visible_summary: updated.patient_visible_summary ?? null,
        patient_visible_released_at: updated.patient_visible_released_at ?? null,
        last_reviewed_at: updated.last_reviewed_at ?? null,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
