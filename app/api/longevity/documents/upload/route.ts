import { NextResponse } from "next/server";
import { isLongevityApiEnabled } from "@/lib/features";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { LONGEVITY_DOC_TYPE, type LongevityDocType } from "@/lib/longevity/documentTypes";
import { validateLongevityUpload } from "@/lib/longevity/fileValidation";
import {
  buildLongevityStoragePath,
  uploadLongevityFile,
} from "@/lib/longevity/storage";
import {
  createDocumentRecord,
  auditLongevityEvent,
} from "@/lib/longevity/documents";

export const dynamic = "force-dynamic";

const ALLOWED_DOC_TYPES: LongevityDocType[] = [
  LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD,
  LONGEVITY_DOC_TYPE.SCALP_PHOTO,
  LONGEVITY_DOC_TYPE.MEDICAL_LETTER,
  LONGEVITY_DOC_TYPE.OTHER,
];

function isAllowedDocType(s: string): s is LongevityDocType {
  return ALLOWED_DOC_TYPES.includes(s as LongevityDocType);
}

/**
 * Upload a document. Multipart: intakeId, docType, file.
 * Allowed for both draft and submitted intakes (longitudinal document continuity: patients can add
 * documents after submission). Intake questionnaire edits remain locked after submit; only document
 * uploads stay open for that intake.
 */
export async function POST(req: Request) {
  if (!isLongevityApiEnabled()) {
    return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
  }
  try {
    const profileId = await getLongevitySessionFromRequest();
    if (!profileId) {
      return NextResponse.json({ ok: false, error: "Session required." }, { status: 401 });
    }

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
    }

    const intakeId = formData.get("intakeId")?.toString()?.trim();
    const docTypeRaw = formData.get("docType")?.toString()?.trim();
    const file = formData.get("file");

    if (!intakeId) {
      return NextResponse.json({ ok: false, error: "Missing intakeId." }, { status: 400 });
    }
    if (!docTypeRaw || !isAllowedDocType(docTypeRaw)) {
      return NextResponse.json({
        ok: false,
        error: `Invalid docType. Allowed: ${ALLOWED_DOC_TYPES.join(", ")}.`,
      }, { status: 400 });
    }
    const docType = docTypeRaw as LongevityDocType;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing or invalid file." }, { status: 400 });
    }

    const validation = validateLongevityUpload(docType, {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { data: intake, error: intakeErr } = await supabase
      .from("hli_longevity_intakes")
      .select("id, profile_id")
      .eq("id", intakeId)
      .single();
    if (intakeErr || !intake || intake.profile_id !== profileId) {
      return NextResponse.json({ ok: false, error: "Intake not found or not authorized." }, { status: 404 });
    }

    const storagePath = buildLongevityStoragePath(
      profileId,
      intakeId,
      docType,
      validation.sanitizedFilename
    );

    const arrayBuffer = await file.arrayBuffer();
    const uploadResult = await uploadLongevityFile(
      supabase,
      storagePath,
      arrayBuffer,
      validation.mimeType
    );
    if (!uploadResult.ok) {
      return NextResponse.json({ ok: false, error: uploadResult.error }, { status: 500 });
    }

    const recordResult = await createDocumentRecord(supabase, {
      intake_id: intakeId,
      doc_type: docType,
      storage_path: storagePath,
      filename: file.name || validation.sanitizedFilename,
      mime_type: validation.mimeType,
      size_bytes: validation.sizeBytes,
    });
    if ("error" in recordResult) {
      return NextResponse.json({ ok: false, error: recordResult.error }, { status: 500 });
    }

    await auditLongevityEvent(supabase, {
      profile_id: profileId,
      intake_id: intakeId,
      event_type: "document_uploaded",
      payload: { document_id: recordResult.id, doc_type: docType, filename: file.name },
      actor_type: "user",
    });

    return NextResponse.json({
      ok: true,
      document: {
        id: recordResult.id,
        intake_id: intakeId,
        doc_type: docType,
        filename: file.name || validation.sanitizedFilename,
        mime_type: validation.mimeType,
        size_bytes: validation.sizeBytes,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
