/**
 * Longevity document storage: private bucket, isolated prefix, signed URLs only.
 * Uses existing hli-intakes bucket with prefix "longevity/" to avoid new bucket setup.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { LongevityDocType } from "./documentTypes";

export const LONGEVITY_BUCKET = "hli-intakes";
export const LONGEVITY_PREFIX = "longevity";

/** Build storage path: longevity/{profileId}/{intakeId}/{docType}/{timestamp}-{safeFilename} */
export function buildLongevityStoragePath(
  profileId: string,
  intakeId: string,
  docType: LongevityDocType,
  safeFilename: string
): string {
  const timestamp = Date.now();
  const safe = safeFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${LONGEVITY_PREFIX}/${profileId}/${intakeId}/${docType}/${timestamp}-${safe}`;
}

/** Build storage path for GP support letter: longevity/{profileId}/blood-requests/{bloodRequestId}/gp-support-letter-{timestamp}.pdf */
export function buildLetterStoragePath(
  profileId: string,
  bloodRequestId: string
): string {
  const timestamp = Date.now();
  return `${LONGEVITY_PREFIX}/${profileId}/blood-requests/${bloodRequestId}/gp-support-letter-${timestamp}.pdf`;
}

export async function uploadLongevityFile(
  supabase: SupabaseClient,
  path: string,
  body: Blob | ArrayBuffer | Buffer,
  contentType: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.storage
    .from(LONGEVITY_BUCKET)
    .upload(path, body, {
      contentType,
      upsert: false,
    });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Download a private longevity file as bytes for internal processing. */
export async function downloadLongevityFile(
  supabase: SupabaseClient,
  path: string
): Promise<{ ok: true; bytes: Uint8Array } | { ok: false; error: string }> {
  const { data, error } = await supabase.storage
    .from(LONGEVITY_BUCKET)
    .download(path);
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to download file." };
  }
  return { ok: true, bytes: new Uint8Array(await data.arrayBuffer()) };
}

/** Create a short-lived signed URL (e.g. 1 hour). */
export async function createLongevitySignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<{ ok: true; signedUrl: string } | { ok: false; error: string }> {
  const { data, error } = await supabase.storage
    .from(LONGEVITY_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) return { ok: false, error: error.message };
  if (!data?.signedUrl) return { ok: false, error: "Failed to create signed URL." };
  return { ok: true, signedUrl: data.signedUrl };
}
