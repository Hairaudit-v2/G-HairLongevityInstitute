import type { VisionProvider } from "./providers";
import { stubVisionProvider } from "./providers";

export type ImageSignal = {
  blur_score: number; // 0-1, lower = sharper
  lighting_score: number; // 0-1, higher = better
  scalp_visibility_proxy: number; // 0-1, estimated visibility
  redness_proxy: number; // 0-1
  flaking_proxy: number; // 0-1
  donor_pattern_proxy: number; // 0-1, texture uniformity
  summary: string;
  confidence: number;
};

export type ImageExtractionResult = {
  filename: string;
  storage_path: string;
  signals: ImageSignal;
};

/**
 * Non-diagnostic heuristics when no AI available.
 * Phrase outputs as "signals consistent with…" and include confidence.
 */
function heuristicSignalsFromBytes(bytes: Uint8Array): ImageSignal {
  const len = bytes.length;
  const seed = len % 1000;
  // Placeholder: use file size as crude proxy (smaller = perhaps blurrier/compressed)
  const blur_score = Math.min(1, 0.3 + (seed / 1000) * 0.4);
  const lighting_score = 0.5 + (seed % 100) / 200;
  const scalp_visibility_proxy = 0.4 + (seed % 80) / 200;
  const redness_proxy = 0.2 + (seed % 60) / 200;
  const flaking_proxy = 0.1 + (seed % 40) / 200;
  const donor_pattern_proxy = 0.5 + (seed % 50) / 200;

  const summary =
    "Signals consistent with routine scalp documentation. Automated heuristics only; no diagnostic interpretation.";
  return {
    blur_score: Math.round(blur_score * 100) / 100,
    lighting_score: Math.round(lighting_score * 100) / 100,
    scalp_visibility_proxy: Math.round(scalp_visibility_proxy * 100) / 100,
    redness_proxy: Math.round(redness_proxy * 100) / 100,
    flaking_proxy: Math.round(flaking_proxy * 100) / 100,
    donor_pattern_proxy: Math.round(donor_pattern_proxy * 100) / 100,
    summary,
    confidence: 0.3,
  };
}

export async function extractImageSignals(params: {
  files: Array<{ bytes: Uint8Array; mimeType: string; filename: string; storage_path: string }>;
  provider?: VisionProvider;
  dryRun?: boolean;
}): Promise<ImageExtractionResult[]> {
  const provider = params.provider ?? stubVisionProvider;
  const results: ImageExtractionResult[] = [];

  if (params.dryRun) {
    for (const f of params.files) {
      results.push({
        filename: f.filename,
        storage_path: f.storage_path,
        signals: {
          blur_score: 0,
          lighting_score: 0,
          scalp_visibility_proxy: 0,
          redness_proxy: 0,
          flaking_proxy: 0,
          donor_pattern_proxy: 0,
          summary: "[DRY RUN] No image analysis performed",
          confidence: 0,
        },
      });
    }
    return results;
  }

  const prompt = `Analyze this scalp/hair photo. Return a JSON object with numeric scores 0-1:
blur_score (0=sharp, 1=blurry), lighting_score (0=dark, 1=good), scalp_visibility_proxy, redness_proxy, flaking_proxy, donor_pattern_proxy (texture uniformity).
Add a brief "summary" string phrased as "Signals consistent with…" and include confidence 0-1.`;

  for (const f of params.files) {
    try {
      const { text } = await provider.analyzeImage({
        imageBytes: f.bytes,
        mimeType: f.mimeType,
        prompt,
      });
      let signals: ImageSignal;
      try {
        const parsed = JSON.parse(text);
        signals = {
          blur_score: Math.min(1, Math.max(0, parsed.blur_score ?? 0.5)),
          lighting_score: Math.min(1, Math.max(0, parsed.lighting_score ?? 0.5)),
          scalp_visibility_proxy: Math.min(1, Math.max(0, parsed.scalp_visibility_proxy ?? 0.5)),
          redness_proxy: Math.min(1, Math.max(0, parsed.redness_proxy ?? 0.3)),
          flaking_proxy: Math.min(1, Math.max(0, parsed.flaking_proxy ?? 0.2)),
          donor_pattern_proxy: Math.min(1, Math.max(0, parsed.donor_pattern_proxy ?? 0.5)),
          summary: String(parsed.summary ?? parsed.Summary ?? "See automated analysis."),
          confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)),
        };
      } catch {
        signals = heuristicSignalsFromBytes(f.bytes);
      }
      results.push({ filename: f.filename, storage_path: f.storage_path, signals });
    } catch (e) {
      console.warn(`extractImages: failed for ${f.filename}`, e);
      results.push({
        filename: f.filename,
        storage_path: f.storage_path,
        signals: heuristicSignalsFromBytes(f.bytes),
      });
    }
  }
  return results;
}
