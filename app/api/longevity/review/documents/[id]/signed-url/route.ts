/**
 * Trichologist-only signed URL for longevity documents (same bucket as patient flow).
 * Authorizes via intake review_status (queue or released), not patient session.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { REVIEW_STATUS, REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import { createLongevitySignedUrl } from "@/lib/longevity/storage";

export const dynamic = "force-dynamic";

const SIGNED_URL_EXPIRY_SEC = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Longevity API is disabled." },
      { status: 404 }
    );
  }
  try {
    const trichologist = await getTrichologistFromRequest();
    if (!trichologist) {
      return NextResponse.json(
        { ok: false, error: "Trichologist authentication required." },
        { status: 401 }
      );
    }

    const { id: documentId } = await params;
    if (!documentId) {
      return NextResponse.json(
        { ok: false, error: "Missing document id." },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const { data: doc, error: docErr } = await supabase
      .from("hli_longevity_documents")
      .select("id, intake_id, profile_id, storage_path, doc_type, mime_type")
      .eq("id", documentId)
      .single();
    if (docErr || !doc?.storage_path) {
      return NextResponse.json(
        { ok: false, error: "Document not found." },
        { status: 404 }
      );
    }

    if (!doc.intake_id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Document is not linked to an intake.",
        },
        { status: 403 }
      );
    }

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, review_status")
      .eq("id", doc.intake_id)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }

    const inQueue = REVIEW_STATUS_IN_QUEUE.includes(
      intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number]
    );
    const isReleased = intake.review_status === REVIEW_STATUS.REVIEW_COMPLETE;
    if (!inQueue && !isReleased) {
      return NextResponse.json(
        { ok: false, error: "Intake is not available for review." },
        { status: 403 }
      );
    }

    const result = await createLongevitySignedUrl(
      supabase,
      doc.storage_path,
      SIGNED_URL_EXPIRY_SEC
    );
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500 }
      );
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id: intake.id,
      event_type: "trichologist_document_signed_url",
      payload: {
        document_id: documentId,
        trichologist_id: trichologist.id,
        doc_type: doc.doc_type,
      },
      actor_type: "trichologist",
    });

    return NextResponse.json({
      ok: true,
      signedUrl: result.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY_SEC,
      mime_type: doc.mime_type ?? null,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
