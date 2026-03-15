import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { QUESTIONNAIRE_SCHEMA_VERSION } from "@/lib/longevity/schema";
import type { LongevityQuestionnaireResponses } from "@/lib/longevity/schema";

export const dynamic = "force-dynamic";

function ownedBySession(profileId: string | null, intake: { profile_id: string } | null): boolean {
  return !!profileId && !!intake && intake.profile_id === profileId;
}

/** Get one intake with questionnaire (only if owned by session profile). */
export async function GET(
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
    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, status, schema_version, created_at, updated_at")
      .eq("id", id)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    if (!ownedBySession(profileId, intake)) {
      return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
    }
    const { data: questionnaire } = await supabase
      .from("hli_longevity_questionnaires")
      .select("id, schema_version, responses, updated_at")
      .eq("intake_id", id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const rawResponses = (questionnaire?.responses ?? {}) as Record<string, unknown>;
    const responsesWithVersion: LongevityQuestionnaireResponses & { schemaVersion?: string } = {
      ...rawResponses,
      schemaVersion: (rawResponses.schemaVersion as string) ?? questionnaire?.schema_version ?? QUESTIONNAIRE_SCHEMA_VERSION,
    };

    return NextResponse.json({
      ok: true,
      intake: {
        id: intake.id,
        status: intake.status,
        schema_version: intake.schema_version,
        created_at: intake.created_at,
        updated_at: intake.updated_at,
      },
      questionnaire: questionnaire
        ? {
            schema_version: questionnaire.schema_version,
            responses: responsesWithVersion,
            updated_at: questionnaire.updated_at,
          }
        : {
            schema_version: QUESTIONNAIRE_SCHEMA_VERSION,
            responses: { schemaVersion: QUESTIONNAIRE_SCHEMA_VERSION },
            updated_at: null,
          },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}

/** Update draft intake (questionnaire responses by section, optional profile full_name). Only draft and owned. */
export async function PATCH(
  req: Request,
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
    const body = await req.json().catch(() => ({}));
    const questionnairePayload = body.questionnaire as LongevityQuestionnaireResponses | undefined;
    const full_name = body.full_name !== undefined ? String(body.full_name).trim() : undefined;

    const supabase = supabaseAdmin();
    const { data: intake, error: fetchErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, status")
      .eq("id", id)
      .single();
    if (fetchErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    if (!ownedBySession(profileId, intake)) {
      return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
    }
    if (intake.status !== "draft") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Questionnaire is locked after submission. Only draft intakes can be updated. Document uploads may still be available for this intake.",
        },
        { status: 400 }
      );
    }

    if (full_name && profileId) {
      await supabase
        .from("hli_longevity_profiles")
        .update({ full_name, updated_at: new Date().toISOString() })
        .eq("id", profileId);
    }

    if (questionnairePayload && typeof questionnairePayload === "object") {
      const { data: existing } = await supabase
        .from("hli_longevity_questionnaires")
        .select("id, responses")
        .eq("intake_id", id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const current = (existing?.responses ?? {}) as Record<string, unknown>;
      const payload = questionnairePayload as Record<string, unknown>;
      // Merge preserves sibling fields: only keys present in payload are updated. Nested objects
      // (e.g. aboutYou.gp, aboutYou.consents, femaleHistory, maleHistory, uploadsNextSteps) are
      // merged recursively so partial updates do not erase sibling fields. Arrays are replaced.
      const merged: Record<string, unknown> = { ...current };
      for (const key of Object.keys(payload)) {
        const pv = payload[key];
        const cv = current[key];
        if (pv != null && typeof pv === "object" && !Array.isArray(pv)) {
          const curObj = cv != null && typeof cv === "object" && !Array.isArray(cv) ? (cv as Record<string, unknown>) : {};
          const pObj = pv as Record<string, unknown>;
          const section: Record<string, unknown> = { ...curObj };
          for (const subKey of Object.keys(pObj)) {
            const subP = pObj[subKey];
            const subC = (curObj as Record<string, unknown>)[subKey];
            if (subP != null && typeof subP === "object" && !Array.isArray(subP)) {
              const subCur = subC != null && typeof subC === "object" && !Array.isArray(subC) ? (subC as Record<string, unknown>) : {};
              section[subKey] = { ...subCur, ...(subP as Record<string, unknown>) };
            } else if (subP !== undefined) {
              section[subKey] = subP;
            }
          }
          merged[key] = section;
        } else if (pv !== undefined) {
          merged[key] = pv;
        }
      }
      // Always persist schemaVersion inside the payload so responses are self-describing.
      merged.schemaVersion = QUESTIONNAIRE_SCHEMA_VERSION;
      if (existing?.id) {
        const { error: updateErr } = await supabase
          .from("hli_longevity_questionnaires")
          .update({
            responses: merged,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (updateErr) {
          return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
        }
      } else {
        const { error: insertErr } = await supabase.from("hli_longevity_questionnaires").insert({
          intake_id: id,
          schema_version: QUESTIONNAIRE_SCHEMA_VERSION,
          responses: merged,
        });
        if (insertErr) {
          return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
        }
      }
      await supabase
        .from("hli_longevity_intakes")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
