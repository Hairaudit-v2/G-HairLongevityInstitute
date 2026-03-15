import { NextResponse } from "next/server";
import { extractBloodMarkers, type BloodMarker } from "@/lib/ai/extractBlood";
import { isLongevityApiEnabled } from "@/lib/features";
import { buildDraftsFromExtractedMarkers } from "@/lib/longevity/bloodMarkerExtraction";
import { replacePendingBloodMarkerExtractionDraftsForIntake } from "@/lib/longevity/bloodMarkerExtractionDrafts";
import { getMarkersForIntake } from "@/lib/longevity/bloodResultMarkers";
import { auditLongevityEvent } from "@/lib/longevity/documents";
import { LONGEVITY_DOC_TYPE } from "@/lib/longevity/documentTypes";
import { downloadLongevityFile } from "@/lib/longevity/storage";
import { REVIEW_STATUS_IN_QUEUE } from "@/lib/longevity/reviewConstants";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";

export const dynamic = "force-dynamic";

type ExtractedMarkerWithSource = BloodMarker & { sourceFile?: string };

export async function POST(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const trichologist = await getTrichologistFromRequest();
    if (!trichologist) {
      return NextResponse.json({ ok: false, error: "Trichologist authentication required." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const intake_id = typeof body.intake_id === "string" ? body.intake_id.trim() : "";
    if (!intake_id) {
      return NextResponse.json({ ok: false, error: "intake_id is required." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id, review_status")
      .eq("id", intake_id)
      .single();
    if (intakeErr || !intake) {
      return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });
    }
    if (!REVIEW_STATUS_IN_QUEUE.includes(intake.review_status as (typeof REVIEW_STATUS_IN_QUEUE)[number])) {
      return NextResponse.json({ ok: false, error: "Intake is not in the review queue." }, { status: 403 });
    }

    const { data: documents, error: docsErr } = await supabase
      .from("hli_longevity_documents")
      .select("id, blood_request_id, filename, mime_type, storage_path")
      .eq("intake_id", intake_id)
      .eq("doc_type", LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD)
      .order("created_at", { ascending: false });
    if (docsErr) {
      return NextResponse.json({ ok: false, error: docsErr.message }, { status: 500 });
    }
    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No uploaded blood-result documents found for this intake." },
        { status: 400 }
      );
    }

    const files: Array<{ bytes: Uint8Array; mimeType: string; filename: string }> = [];
    for (const document of documents) {
      const download = await downloadLongevityFile(supabase, document.storage_path);
      if (!download.ok) {
        console.warn("Failed to download longevity blood document for extraction:", document.id, download.error);
        continue;
      }
      const originalFilename = (document.filename ?? "blood-result.pdf").trim() || "blood-result.pdf";
      files.push({
        bytes: download.bytes,
        mimeType: document.mime_type ?? "application/pdf",
        filename: `${document.id}__${originalFilename}`,
      });
    }
    if (files.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Uploaded blood-result documents could not be downloaded for extraction." },
        { status: 500 }
      );
    }

    const extraction = await extractBloodMarkers({ files });
    const existingMarkers = await getMarkersForIntake(supabase, intake_id);
    const drafts = buildDraftsFromExtractedMarkers({
      profile_id: intake.profile_id,
      intake_id,
      markers: extraction.markers as ExtractedMarkerWithSource[],
      sourceDocuments: documents.map((document) => ({
        id: document.id,
        filename: document.filename,
        blood_request_id: document.blood_request_id,
      })),
      existingMarkers,
    });

    const replaceResult = await replacePendingBloodMarkerExtractionDraftsForIntake(
      supabase,
      intake_id,
      drafts
    );
    if (!replaceResult.ok) {
      return NextResponse.json({ ok: false, error: replaceResult.error }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: intake.profile_id,
      intake_id,
      event_type: "blood_marker_extraction_run",
      payload: {
        trichologist_id: trichologist.id,
        source_document_count: files.length,
        extracted_marker_count: extraction.markers.length,
        staged_draft_count: replaceResult.inserted,
        extraction_confidence: extraction.confidence,
      },
      actor_type: "trichologist",
    });

    return NextResponse.json({
      ok: true,
      extracted_marker_count: extraction.markers.length,
      draft_count: replaceResult.inserted,
      document_count: files.length,
      confidence: extraction.confidence,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
