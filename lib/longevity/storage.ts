/**
 * Longevity document storage: private bucket, isolated prefix, signed URLs only.
 * Uses existing hli-intakes bucket with prefix "longevity/" to avoid new bucket setup.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { LongevityDocType } from "./documentTypes";

export const LONGEVITY_BUCKET = "hli-intakes";
export const LONGEVITY_PREFIX = "longevity";

/** Short random string for unique paths (collision-resistant with timestamp). */
function shortRandom(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint8Array(4);
    crypto.getRandomValues(arr);
    return Array.from(arr, (x) => x.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Build a unique storage path: longevity/{profileId}/{intakeId}/{docType}/{intakeId}_{timestamp}_{random}_{safeFilename}
 * Ensures no filename collisions when the same file is uploaded twice quickly (upsert: false).
 * Uploads remain grouped by profile and intake.
 */
export function buildLongevityStoragePath(
  profileId: string,
  intakeId: string,
  docType: LongevityDocType,
  safeFilename: string
): string {
  const timestamp = Date.now();
  const random = shortRandom();
  const safe = safeFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueSegment = `${intakeId}_${timestamp}_${random}_${safe}`;
  return `${LONGEVITY_PREFIX}/${profileId}/${intakeId}/${docType}/${uniqueSegment}`;
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
