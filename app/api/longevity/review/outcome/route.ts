/**
 * POST /api/longevity/review/outcome — Trichologist sets or updates review_outcome and last_reviewed_at.
 * Internal, longevity-scoped. Requires Trichologist auth.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_OUTCOME, REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import { getEligibility } from "@/lib/longevity/bloodRequestEligibility";
import { ensureBloodRequest } from "@/lib/longevity/bloodRequests";
import { stageLongevityIntegrationArtifacts } from "@/lib/longevity/integrationOutbox";
import { LONGEVITY_EVENT_TYPE } from "@/lib/longevity/integrationContracts";
import { buildLongevityEventEnvelope } from "@/lib/longevity/normalizedEvents";
import { buildLongevitySignals } from "@/lib/longevity/normalizedSignals";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import { computeTriage } from "@/lib/longevity/triage";

export const dynamic = "force-dynamic";

const ALLOWED_OUTCOMES = Object.values(REVIEW_OUTCOME);

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
    const review_outcome = typeof body.review_outcome === "string" ? body.review_outcome.trim() : null;
    if (!intake_id) {
      return NextResponse.json({ ok: false, error: "intake_id is required." }, { status: 400 });
    }
    if (!review_outcome || !ALLOWED_OUTCOMES.includes(review_outcome)) {
      return NextResponse.json(
        { ok: false, error: `review_outcome must be one of: ${ALLOWED_OUTCOMES.join(", ")}` },
        { status: 400 }
      );
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
    const { data: updated, error: updateErr } = await supabase
      .from("hli_longevity_intakes")
      .update({
        review_outcome,
        last_reviewed_at: now,
        updated_at: now,
      })
      .eq("id", intake_id)
      .select("id, review_outcome, last_reviewed_at")
      .single();
    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      event_type: "review_outcome_set",
      payload: { trichologist_id: trichologist.id, review_outcome },
      actor_type: "trichologist",
    });

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
          const triageFlags = computeTriage(responses).flags;
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
              try {
                const occurredAt = new Date().toISOString();
                await stageLongevityIntegrationArtifacts(supabase, {
                  profile_id: intake.profile_id,
                  intake_id,
                  blood_request_id: bloodRequest.id,
                  event: buildLongevityEventEnvelope({
                    event_type: LONGEVITY_EVENT_TYPE.BLOOD_REQUEST_CREATED,
                    actor_type: "trichologist",
                    occurred_at: occurredAt,
                    local_entity_type: "blood_request",
                    local_entity_id: bloodRequest.id,
                    payload: {
                      profile_id: intake.profile_id,
                      intake_id,
                      blood_request_id: bloodRequest.id,
                      recommended_by: "trichologist",
                      review_outcome,
                    },
                  }),
                  signals: buildLongevitySignals({
                    profileId: intake.profile_id,
                    intakeId: intake_id,
                    derivedFlags: triageFlags,
                    bloodRequest: {
                      id: bloodRequest.id,
                      status: bloodRequest.status,
                      recommended_by: "trichologist",
                    },
                    reviewOutcome: review_outcome,
                    hasBloodResultUploadDocument: false,
                    hasStructuredMarkers: false,
                    generatedAt: occurredAt,
                    sourceEventType: LONGEVITY_EVENT_TYPE.BLOOD_REQUEST_CREATED,
                  }),
                });
              } catch {
                // Integration staging is additive; do not fail outcome set if it fails.
              }
            }
          }
        }
      } catch {
        // Best-effort; do not fail outcome set
      }
    }

    return NextResponse.json({
      ok: true,
      intake: {
        id: updated.id,
        review_outcome: updated.review_outcome,
        last_reviewed_at: updated.last_reviewed_at,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
