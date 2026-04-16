import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { buildAuthRequiredJson } from "@/lib/longevity/redirects";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { listDocumentsForProfile } from "@/lib/longevity/documents";

export const dynamic = "force-dynamic";

/** List documents for the current longevity session. Optional ?intakeId= to filter. */
export async function GET(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const profileId = await getLongevitySessionFromRequest();
    const { searchParams } = new URL(req.url);
    const intakeId = searchParams.get("intakeId") ?? undefined;
    if (!profileId) {
      return NextResponse.json(
        buildAuthRequiredJson(
          intakeId ? `/longevity/start?resume=${intakeId}` : "/longevity/start",
          "Please sign in to access your uploaded documents.",
          { error: "session-expired" }
        ),
        { status: 401 }
      );
    }
    const supabase = supabaseAdmin();
    const documents = await listDocumentsForProfile(supabase, profileId, intakeId);
    return NextResponse.json({ ok: true, documents });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
