import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest, setLongevitySession } from "@/lib/longevityAuth";
import { getPortalUser, ensurePortalProfile } from "@/lib/longevity/portalAuth";
import { buildAuthRequiredJson } from "@/lib/longevity/redirects";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { QUESTIONNAIRE_SCHEMA_VERSION } from "@/lib/longevity/schema";
import { trackLongevityBetaEvent, BETA_EVENT } from "@/lib/longevity/analytics";

export const dynamic = "force-dynamic";

/** List intakes for the current longevity session (profile). */
export async function GET() {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const profileId = await getLongevitySessionFromRequest();
    if (!profileId) {
      return NextResponse.json(
        buildAuthRequiredJson(
          "/portal/dashboard",
          "Please sign in to view your intakes.",
          { error: "session-expired" }
        ),
        { status: 401 }
      );
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
 * Create draft intake for an authenticated portal patient only.
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
    const full_name = String(body.full_name ?? "").trim();

    const authUser = await getPortalUser();
    if (!authUser) {
      return NextResponse.json(
        buildAuthRequiredJson(
          "/longevity/start",
          "Please create your account or sign in to begin your assessment."
        ),
        { status: 401 }
      );
    }
    const trichologist = await getTrichologistFromRequest();
    if (trichologist) {
      return NextResponse.json(
        { ok: false, error: "Clinician accounts cannot start patient intakes." },
        { status: 403 }
      );
    }

    const supabase = supabaseAdmin();
    const profileResult = await ensurePortalProfile(supabase, authUser);
    if (!profileResult.ok) {
      if (profileResult.reason === "no_email") {
        return NextResponse.json(
          {
            ok: false,
            error: "Your account is missing an email address. Please sign in with an email-based login.",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { ok: false, error: "We could not prepare your patient profile. Please try signing in again." },
        { status: 500 }
      );
    }

    const profileId = profileResult.profileId;
    const existingSession = await getLongevitySessionFromRequest();
    if (existingSession !== profileId) {
      await setLongevitySession(profileId);
    }

    if (full_name) {
      await supabase
        .from("hli_longevity_profiles")
        .update({ full_name, updated_at: new Date().toISOString() })
        .eq("id", profileId);
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

    await trackLongevityBetaEvent(supabase, {
      event: BETA_EVENT.INTAKE_STARTED,
      profile_id: profileId,
      intake_id: intake.id,
      actor_type: "user",
    });

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
