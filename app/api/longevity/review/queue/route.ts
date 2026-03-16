/**
 * Internal API: list intakes in the Trichologist review queue (Phase B).
 * Requires Trichologist auth. Filter by review_status, priority, assigned_to_me; paginated.
 * Default ordering: highest priority first, then oldest (created_at asc). Longevity-scoped only.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS_IN_QUEUE, REVIEW_STATUS, REVIEW_PRIORITY } from "@/lib/longevity/reviewConstants";
import { computeTriage } from "@/lib/longevity/triage";
import { computeReviewComplexity } from "@/lib/longevity/reviewComplexity";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";
import type { ReviewComplexityResult } from "@/lib/longevity/reviewComplexity";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const MAX_FETCH = 2000;

/** Operational order: urgent first, then high, normal, low; then oldest first. */
function priorityRank(p: string | null): number {
  switch (p) {
    case REVIEW_PRIORITY.URGENT:
      return 1;
    case REVIEW_PRIORITY.HIGH:
      return 2;
    case REVIEW_PRIORITY.NORMAL:
      return 3;
    case REVIEW_PRIORITY.LOW:
      return 4;
    default:
      return 3;
  }
}

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
  complexity: ReviewComplexityResult;
};

/**
 * GET ?review_status=...&priority=...&assigned_to_me=1&limit=50&offset=0
 * Order: highest priority first, then oldest (created_at). Paginated.
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
    const includeReleased = searchParams.get("include_released") === "1" || searchParams.get("include_released") === "true";
    const baseStatusList =
      filterStatus && REVIEW_STATUS_IN_QUEUE.includes(filterStatus as (typeof REVIEW_STATUS_IN_QUEUE)[number])
        ? [filterStatus]
        : REVIEW_STATUS_IN_QUEUE;
    const statusList =
      includeReleased && !baseStatusList.includes(REVIEW_STATUS.REVIEW_COMPLETE)
        ? [...baseStatusList, REVIEW_STATUS.REVIEW_COMPLETE]
        : baseStatusList;

    const priorityFilter = searchParams.get("priority");
    const validPriorities = [REVIEW_PRIORITY.URGENT, REVIEW_PRIORITY.HIGH, REVIEW_PRIORITY.NORMAL, REVIEW_PRIORITY.LOW];
    const priority = validPriorities.includes(priorityFilter as (typeof validPriorities)[number]) ? priorityFilter : null;

    const assignedToMe = searchParams.get("assigned_to_me") === "1" || searchParams.get("assigned_to_me") === "true";
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
      MAX_PAGE_SIZE
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);

    const supabase = supabaseAdmin();
    let query = supabase
      .from("hli_longevity_intakes")
      .select("id, review_status, review_priority, created_at, assigned_trichologist_id, triaged_at, triage_version")
      .in("review_status", statusList)
      .order("created_at", { ascending: true })
      .limit(MAX_FETCH);

    if (priority) {
      query = query.eq("review_priority", priority);
    }
    if (assignedToMe) {
      query = query.eq("assigned_trichologist_id", trichologist.id);
    }

    const { data: intakes, error: intakesErr } = await query;
    if (intakesErr) {
      return NextResponse.json({ ok: false, error: intakesErr.message }, { status: 500 });
    }
    if (!intakes?.length) {
      return NextResponse.json({ ok: true, items: [], hasMore: false });
    }

    const sorted = [...intakes].sort((a, b) => {
      const ra = priorityRank(a.review_priority ?? null);
      const rb = priorityRank(b.review_priority ?? null);
      if (ra !== rb) return ra - rb;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    const page = sorted.slice(offset, offset + limit);
    const hasMore = offset + page.length < sorted.length;

    const intakeIds = page.map((i) => i.id);
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

    const items: ReviewQueueItem[] = page.map((intake) => {
      const responses = latestByIntake.get(intake.id) as LongevityQuestionnaireResponses | undefined;
      const triage = responses && typeof responses === "object" ? computeTriage(responses) : null;
      const flags = triage?.flags ?? {
        manualReviewRecommended: false,
        bloodsLikelyNeeded: false,
        possibleIronRisk: false,
        possibleThyroidRisk: false,
        possibleHormonalPattern: false,
        possibleInflammatoryPattern: false,
        possibleAndrogenPattern: false,
        possibleStressTrigger: false,
        postpartumFlag: false,
      };
      const complexity = computeReviewComplexity({
        flags,
        review_priority: intake.review_priority ?? null,
        questionnaireResponses: responses,
      });
      return {
        id: intake.id,
        review_status: intake.review_status ?? "",
        review_priority: intake.review_priority ?? null,
        created_at: intake.created_at,
        assigned_trichologist_id: intake.assigned_trichologist_id ?? null,
        triaged_at: intake.triaged_at ?? null,
        triage_version: intake.triage_version ?? null,
        flags,
        complexity,
      };
    });

    return NextResponse.json({ ok: true, items, hasMore });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
