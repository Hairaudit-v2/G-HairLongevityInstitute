import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { getDocumentIfOwnedByProfile } from "@/lib/longevity/documents";

export const dynamic = "force-dynamic";

/** Get document metadata (no storage path). For future archive/delete support. */
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

    return NextResponse.json({
      ok: true,
      document: {
        id: doc.id,
        intake_id: doc.intake_id,
        doc_type: doc.doc_type,
        filename: doc.filename,
        mime_type: doc.mime_type,
        size_bytes: doc.size_bytes,
        created_at: doc.created_at,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
