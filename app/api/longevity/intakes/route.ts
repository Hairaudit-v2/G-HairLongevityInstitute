import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest, setLongevitySession } from "@/lib/longevityAuth";
import { QUESTIONNAIRE_SCHEMA_VERSION } from "@/lib/longevity/schema";

export const dynamic = "force-dynamic";

/** List intakes for the current longevity session (profile). */
export async function GET() {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const profileId = await getLongevitySessionFromRequest();
    if (!profileId) {
      return NextResponse.json({ ok: true, intakes: [] });
    }
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("hli_longevity_intakes")
      .select("id, status, created_at, updated_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, intakes: data ?? [] });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}

/**
 * Create draft intake. Create or resolve profile; set session cookie; create intake + questionnaire.
 * Contract: intakeId is returned only after both hli_longevity_intakes and hli_longevity_questionnaires
 * rows exist, so the client can rely on a stable draft and intakeId before any later step actions.
 * Longitudinal: POST always creates a new intake row (additive). It never overwrites or replaces a
 * prior submitted intake. "Resume" is a separate flow: client uses GET /api/longevity/intakes/:id and
 * continues editing that draft; no new row is created for resume.
 */
export async function POST(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim();
    const full_name = String(body.full_name ?? "").trim();
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    let profileId: string | null = await getLongevitySessionFromRequest();

    if (!profileId) {
      const { data: existing } = await supabase
        .from("hli_longevity_profiles")
        .select("id")
        .eq("email", email)
        .limit(1)
        .maybeSingle();
      if (existing?.id) {
        profileId = existing.id;
        if (full_name) {
          await supabase
            .from("hli_longevity_profiles")
            .update({ full_name, updated_at: new Date().toISOString() })
            .eq("id", profileId);
        }
      } else {
        const { data: created, error: createErr } = await supabase
          .from("hli_longevity_profiles")
          .insert({ email, full_name: full_name || null })
          .select("id")
          .single();
        if (createErr || !created?.id) {
          return NextResponse.json(
            { ok: false, error: createErr?.message ?? "Failed to create profile." },
            { status: 500 }
          );
        }
        profileId = created.id;
      }
      if (profileId) await setLongevitySession(profileId);
    }

    if (!profileId) {
      return NextResponse.json(
        { ok: false, error: "Session or profile required." },
        { status: 401 }
      );
    }

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .insert({
        profile_id: profileId,
        status: "draft",
        schema_version: QUESTIONNAIRE_SCHEMA_VERSION,
      })
      .select("id")
      .single();
    if (intakeErr || !intake?.id) {
      return NextResponse.json(
        { ok: false, error: intakeErr?.message ?? "Failed to create intake." },
        { status: 500 }
      );
    }

    const initialResponses = { schemaVersion: QUESTIONNAIRE_SCHEMA_VERSION } as const;
    const { error: qErr } = await supabase.from("hli_longevity_questionnaires").insert({
      intake_id: intake.id,
      schema_version: QUESTIONNAIRE_SCHEMA_VERSION,
      responses: initialResponses,
    });
    if (qErr) {
      return NextResponse.json(
        { ok: false, error: qErr.message ?? "Failed to create questionnaire." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      intakeId: intake.id,
      profileId,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
