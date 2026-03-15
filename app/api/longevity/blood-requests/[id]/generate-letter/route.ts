/**
 * POST /api/longevity/blood-requests/[id]/generate-letter — Generate GP support letter PDF for a blood request.
 * Patient must own the blood request (profile_id). Stores PDF privately, creates document row, updates request status.
 * Idempotent: if letter already generated, returns existing document_id.
 */

import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { generateGpSupportLetterPdf } from "@/lib/longevity/gpLetterGenerator";
import { buildLetterStoragePath, uploadLongevityFile } from "@/lib/longevity/storage";
import { createBloodRequestLetterDocument, auditLongevityEvent } from "@/lib/longevity/documents";

export const dynamic = "force-dynamic";

const BLOOD_REQUEST_STATUS_LETTER_GENERATED = "letter_generated";

export async function POST(
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

    const { id: bloodRequestId } = await params;
    if (!bloodRequestId) {
      return NextResponse.json({ ok: false, error: "Missing blood request id." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data: br, error: brErr } = await supabase
      .from("hli_longevity_blood_requests")
      .select("id, intake_id, profile_id, recommended_tests, reason, status, letter_document_id")
      .eq("id", bloodRequestId)
      .single();
    if (brErr || !br) {
      return NextResponse.json({ ok: false, error: "Blood request not found." }, { status: 404 });
    }
    if (br.profile_id !== profileId) {
      return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
    }
    if (br.status === "cancelled") {
      return NextResponse.json({ ok: false, error: "Blood request is cancelled." }, { status: 400 });
    }

    if (br.letter_document_id) {
      await auditLongevityEvent(supabase, {
        profile_id: profileId,
        intake_id: br.intake_id,
        event_type: "letter_download_requested",
        payload: { blood_request_id: bloodRequestId, document_id: br.letter_document_id },
        actor_type: "user",
      });
      return NextResponse.json({
        ok: true,
        document_id: br.letter_document_id,
        already_generated: true,
      });
    }

    const { data: profile } = await supabase
      .from("hli_longevity_profiles")
      .select("full_name")
      .eq("id", profileId)
      .single();
    const patientName = (profile?.full_name ?? "Patient").trim() || "Patient";

    const recommendedTests = Array.isArray(br.recommended_tests) ? (br.recommended_tests as string[]) : [];
    const pdfBytes = await generateGpSupportLetterPdf({
      patientName,
      generationDate: new Date().toISOString().slice(0, 10),
      reason: br.reason ?? "Suggested in the context of hair and scalp assessment.",
      recommendedTests,
    });

    const storagePath = buildLetterStoragePath(profileId, bloodRequestId);
    const uploadResult = await uploadLongevityFile(
      supabase,
      storagePath,
      Buffer.from(pdfBytes),
      "application/pdf"
    );
    if (!uploadResult.ok) {
      return NextResponse.json({ ok: false, error: uploadResult.error }, { status: 500 });
    }

    const filename = "GP-support-letter-blood-tests.pdf";
    const docResult = await createBloodRequestLetterDocument(supabase, {
      intake_id: br.intake_id,
      blood_request_id: bloodRequestId,
      storage_path: storagePath,
      filename,
      size_bytes: pdfBytes.length,
    });
    if ("error" in docResult) {
      return NextResponse.json({ ok: false, error: docResult.error }, { status: 500 });
    }

    const { error: updateErr } = await supabase
      .from("hli_longevity_blood_requests")
      .update({
        letter_document_id: docResult.id,
        status: BLOOD_REQUEST_STATUS_LETTER_GENERATED,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bloodRequestId);
    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: profileId,
      intake_id: br.intake_id,
      event_type: "gp_support_letter_generated",
      payload: { blood_request_id: bloodRequestId, document_id: docResult.id },
      actor_type: "system",
    });

    return NextResponse.json({
      ok: true,
      document_id: docResult.id,
      already_generated: false,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
