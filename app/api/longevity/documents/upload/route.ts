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
import { createDocumentRecord } from "@/lib/longevity/documents";
import { trackLongevityBetaEvent, BETA_EVENT } from "@/lib/longevity/analytics";
import { stageLongevityIntegrationArtifacts } from "@/lib/longevity/integrationOutbox";
import { LONGEVITY_EVENT_TYPE } from "@/lib/longevity/integrationContracts";
import { buildLongevityEventEnvelope } from "@/lib/longevity/normalizedEvents";
import { buildLongevitySignals } from "@/lib/longevity/normalizedSignals";
import { stageLongevityRemindersForIntake } from "@/lib/longevity/reminders";

export const dynamic = "force-dynamic";

const ALLOWED_DOC_TYPES: LongevityDocType[] = [
  LONGEVITY_DOC_TYPE.BLOOD_TEST_UPLOAD,
  LONGEVITY_DOC_TYPE.SCALP_PHOTO,
  LONGEVITY_DOC_TYPE.MEDICAL_LETTER,
  LONGEVITY_DOC_TYPE.PRESCRIPTIONS,
  LONGEVITY_DOC_TYPE.OTHER,
];

function isAllowedDocType(s: string): s is LongevityDocType {
  return ALLOWED_DOC_TYPES.includes(s as LongevityDocType);
}

/**
 * Upload a document. Multipart: intakeId, docType, file; optional bloodRequestId (Phase F).
 * Allowed for both draft and submitted intakes (longitudinal document continuity: patients can add
 * documents after submission). Intake questionnaire edits remain locked after submit; only document
 * uploads stay open for that intake.
 * When bloodRequestId is provided: links the document to the blood request, sets request status to
 * results_uploaded. Re-review readiness: returned blood result uploads are visible to clinicians
 * with the intake/documents and can re-enter the review lifecycle; no new automation required.
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
    const bloodRequestId = formData.get("bloodRequestId")?.toString()?.trim() || null;
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

    if (bloodRequestId) {
      const { data: br, error: brErr } = await supabase
        .from("hli_longevity_blood_requests")
        .select("id, intake_id, profile_id, status")
        .eq("id", bloodRequestId)
        .single();
      if (brErr || !br || br.profile_id !== profileId || br.intake_id !== intakeId) {
        return NextResponse.json({ ok: false, error: "Blood request not found or not authorized." }, { status: 404 });
      }
      if (br.status !== "letter_generated") {
        return NextResponse.json(
          { ok: false, error: "Generate your GP support letter first, then you can upload returned results." },
          { status: 400 }
        );
      }
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
      blood_request_id: bloodRequestId || undefined,
    });
    if ("error" in recordResult) {
      return NextResponse.json({ ok: false, error: recordResult.error }, { status: 500 });
    }

    if (bloodRequestId) {
      await supabase
        .from("hli_longevity_blood_requests")
        .update({
          status: "results_uploaded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bloodRequestId);
    }

    await trackLongevityBetaEvent(supabase, {
      event: BETA_EVENT.DOCUMENT_UPLOADED,
      profile_id: profileId,
      intake_id: intakeId,
      payload: {
        document_id: recordResult.id,
        doc_type: docType,
        filename: file.name,
        ...(bloodRequestId ? { blood_request_id: bloodRequestId } : {}),
      },
      actor_type: "user",
    });

    if (bloodRequestId) {
      try {
        const occurredAt = new Date().toISOString();
        await stageLongevityIntegrationArtifacts(supabase, {
          profile_id: profileId,
          intake_id: intakeId,
          blood_request_id: bloodRequestId,
          document_id: recordResult.id,
          event: buildLongevityEventEnvelope({
            event_type: LONGEVITY_EVENT_TYPE.BLOOD_RESULTS_UPLOADED,
            actor_type: "user",
            occurred_at: occurredAt,
            local_entity_type: "document",
            local_entity_id: recordResult.id,
            payload: {
              profile_id: profileId,
              intake_id: intakeId,
              document_id: recordResult.id,
              blood_request_id: bloodRequestId,
              doc_type: docType,
            },
          }),
          signals: buildLongevitySignals({
            profileId,
            intakeId,
            bloodRequest: { id: bloodRequestId, status: "results_uploaded" },
            hasBloodResultUploadDocument: true,
            hasStructuredMarkers: false,
            generatedAt: occurredAt,
            sourceEventType: LONGEVITY_EVENT_TYPE.BLOOD_RESULTS_UPLOADED,
          }),
        });
      } catch {
        // Integration staging is additive; do not fail upload if it fails.
      }

      try {
        await stageLongevityRemindersForIntake(supabase, {
          profileId,
          intakeId,
        });
      } catch {
        // Reminder staging is additive; do not fail upload if it fails.
      }

      try {
        const {
          recordReminderOutcome,
          REMINDER_OUTCOME_TYPE: OUTCOME_TYPE,
        } = await import("@/lib/longevity/reminderOutcomes");
        await recordReminderOutcome(supabase, {
          profileId,
          outcomeType: OUTCOME_TYPE.BLOOD_RESULTS_UPLOADED,
          relatedIntakeId: intakeId,
          relatedDocumentId: recordResult.id,
          occurredAt: new Date().toISOString(),
        });
      } catch {
        // Outcome attribution is additive; do not fail upload.
      }
    }

    if (docType === LONGEVITY_DOC_TYPE.SCALP_PHOTO) {
      try {
        const {
          recordReminderOutcome,
          REMINDER_OUTCOME_TYPE: OUTCOME_TYPE,
        } = await import("@/lib/longevity/reminderOutcomes");
        await recordReminderOutcome(supabase, {
          profileId,
          outcomeType: OUTCOME_TYPE.SCALP_PHOTO_UPLOADED,
          relatedIntakeId: intakeId,
          relatedDocumentId: recordResult.id,
          occurredAt: new Date().toISOString(),
        });
      } catch {
        // Outcome attribution is additive; do not fail upload.
      }
    }

    return NextResponse.json({
      ok: true,
      document: {
        id: recordResult.id,
        intake_id: intakeId,
        doc_type: docType,
        filename: file.name || validation.sanitizedFilename,
        mime_type: validation.mimeType,
        size_bytes: validation.sizeBytes,
        ...(bloodRequestId ? { blood_request_id: bloodRequestId } : {}),
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
