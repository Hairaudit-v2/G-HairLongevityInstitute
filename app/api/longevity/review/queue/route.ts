/**
 * Internal API: list intakes in the Trichologist review queue (Phase B).
 * Requires Trichologist auth. Filter by review_status; includes priority and key derived flags.
 * Longevity-scoped only. No UI in Phase B; Phase C dashboard will consume this.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { computeTriage } from "@/lib/longevity/triage";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

export const dynamic = "force-dynamic";

export type ReviewQueueItem = {
  id: string;
  review_status: string;
  review_priority: string | null;
  created_at: string;
  assigned_trichologist_id: string | null;
  triaged_at: string | null;
  triage_version: string | null;
  flags: {
    manualReviewRecommended: boolean;
    bloodsLikelyNeeded: boolean;
    possibleIronRisk: boolean;
    possibleThyroidRisk: boolean;
    possibleHormonalPattern: boolean;
    possibleInflammatoryPattern: boolean;
    possibleAndrogenPattern: boolean;
    possibleStressTrigger: boolean;
    postpartumFlag: boolean;
  };
};

/**
 * GET ?review_status=human_review_required|under_trichologist_review|awaiting_patient_documents
 * Optional filter; if omitted, returns all intakes in queue statuses (REVIEW_STATUS_IN_QUEUE).
 */
export async function GET(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const trichologist = await getTrichologistFromRequest();
    if (!trichologist) {
      return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("review_status");
    const statusList =
      filterStatus && REVIEW_STATUS_IN_QUEUE.includes(filterStatus as (typeof REVIEW_STATUS_IN_QUEUE)[number])
        ? [filterStatus]
        : REVIEW_STATUS_IN_QUEUE;

    const supabase = supabaseAdmin();
    const { data: intakes, error: intakesErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, review_status, review_priority, created_at, assigned_trichologist_id, triaged_at, triage_version")
      .in("review_status", statusList)
      .order("created_at", { ascending: true });
    if (intakesErr) {
      return NextResponse.json({ ok: false, error: intakesErr.message }, { status: 500 });
    }
    if (!intakes?.length) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const intakeIds = intakes.map((i) => i.id);
    const { data: questionnaires } = await supabase
      .from("hli_longevity_questionnaires")
      .select("intake_id, responses")
      .in("intake_id", intakeIds)
      .order("updated_at", { ascending: false });
    const latestByIntake = new Map<string, Record<string, unknown>>();
    for (const q of questionnaires ?? []) {
      if (q.intake_id && !latestByIntake.has(q.intake_id)) {
        latestByIntake.set(q.intake_id, (q.responses ?? {}) as Record<string, unknown>);
      }
    }

    const items: ReviewQueueItem[] = intakes.map((intake) => {
      const responses = latestByIntake.get(intake.id) as LongevityQuestionnaireResponses | undefined;
      const triage = responses && typeof responses === "object" ? computeTriage(responses) : null;
      return {
        id: intake.id,
        review_status: intake.review_status ?? "",
        review_priority: intake.review_priority ?? null,
        created_at: intake.created_at,
        assigned_trichologist_id: intake.assigned_trichologist_id ?? null,
        triaged_at: intake.triaged_at ?? null,
        triage_version: intake.triage_version ?? null,
        flags: triage?.flags ?? {
          manualReviewRecommended: false,
          bloodsLikelyNeeded: false,
          possibleIronRisk: false,
          possibleThyroidRisk: false,
          possibleHormonalPattern: false,
          possibleInflammatoryPattern: false,
          possibleAndrogenPattern: false,
          possibleStressTrigger: false,
          postpartumFlag: false,
        },
      };
    });

    return NextResponse.json({ ok: true, items });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
