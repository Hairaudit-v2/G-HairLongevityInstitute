/**
 * GET /api/longevity/blood-requests/[id]/letter-download — Redirect to signed URL for the GP support letter.
 * Patient must own the blood request. Signed URLs only; no public access.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { getDocumentIfOwnedByProfile, auditLongevityEvent } from "@/lib/longevity/documents";
import { createLongevitySignedUrl } from "@/lib/longevity/storage";

export const dynamic = "force-dynamic";

const SIGNED_URL_EXPIRY_SEC = 300; // 5 minutes for redirect

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  const profileId = await getLongevitySessionFromRequest();
  if (!profileId) {
    return NextResponse.json({ ok: false, error: "Session required." }, { status: 401 });
  }

  const { id: bloodRequestId } = await params;
  if (!bloodRequestId) {
    return NextResponse.json({ ok: false, error: "Missing blood request id." }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data: br, error: brErr } = await supabase
    .from("hli_longevity_blood_requests")
    .select("id, profile_id, letter_document_id")
    .eq("id", bloodRequestId)
    .single();
  if (brErr || !br || br.profile_id !== profileId) {
    return NextResponse.json({ ok: false, error: "Blood request not found or not authorized." }, { status: 404 });
  }
  if (!br.letter_document_id) {
    return NextResponse.json({ ok: false, error: "No letter generated yet." }, { status: 404 });
  }

  const doc = await getDocumentIfOwnedByProfile(supabase, br.letter_document_id, profileId);
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

  const { data: intakeRow } = await supabase
    .from("hli_longevity_blood_requests")
    .select("intake_id")
    .eq("id", bloodRequestId)
    .single();

  await auditLongevityEvent(supabase, {
    profile_id: profileId,
    intake_id: intakeRow?.intake_id ?? null,
    event_type: "letter_download_accessed",
    payload: { blood_request_id: bloodRequestId, document_id: doc.id },
    actor_type: "user",
  });

  return NextResponse.redirect(result.signedUrl);
}
