import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { getDocumentIfOwnedByProfile } from "@/lib/longevity/documents";
import { createLongevitySignedUrl } from "@/lib/longevity/storage";
import { auditLongevityEvent } from "@/lib/longevity/documents";

export const dynamic = "force-dynamic";

const SIGNED_URL_EXPIRY_SEC = 3600; // 1 hour

/** Get a short-lived signed URL for the document. Only if owned by session profile. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const profileId = await getLongevitySessionFromRequest();
    if (!profileId) {
      return NextResponse.json({ ok: false, error: "Session required." }, { status: 401 });
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing document id." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const doc = await getDocumentIfOwnedByProfile(supabase, id, profileId);
    if (!doc) {
      return NextResponse.json({ ok: false, error: "Document not found or not authorized." }, { status: 404 });
    }

    const result = await createLongevitySignedUrl(
      supabase,
      doc.storage_path,
      SIGNED_URL_EXPIRY_SEC
    );
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: profileId,
      intake_id: doc.intake_id,
      event_type: "signed_url_issued",
      payload: { document_id: id },
      actor_type: "user",
    });

    return NextResponse.json({
      ok: true,
      signedUrl: result.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY_SEC,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
