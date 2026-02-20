import type { DocumentExtractor } from "./providers";
import { stubDocumentExtractor } from "./providers";
import { pdfDocumentExtractor } from "./pdfExtractor";
import { imageOcrExtractor } from "./imageOcrExtractor";

export type BloodMarker = {
  name: string;
  value: string | number | null;
  unit?: string;
  referenceRange?: string;
  flag?: "low" | "normal" | "high" | "critical";
  confidence: number;
};

export type BloodExtractionResult = {
  markers: BloodMarker[];
  rawText?: string;
  sourceFile?: string;
  confidence: number;
};

const CANONICAL_MARKERS = [
  "TSH", "Free T3", "Free T4", "T3", "T4", "Ferritin", "Vitamin D", "25-OH Vitamin D", "Zinc", "B12", "Folate",
  "Testosterone", "Free Testosterone", "DHT", "SHBG", "Estradiol", "Prolactin", "FSH", "LH",
  "Cortisol", "CRP", "ESR", "Hemoglobin", "Hb", "Hematocrit", "Hct", "Iron", "TIBC", "Transferrin", "Transferrin Saturation",
  "Creatinine", "Creat", "eGFR", "Glucose", "HbA1c", "Cholesterol", "HDL", "LDL", "Triglycerides", "TG",
  "Sodium", "Na", "Potassium", "K", "Chloride", "Cl", "Urea", "Uric Acid",
  "ALT", "AST", "GGT", "ALP", "Bilirubin", "Bil", "Albumin", "Alb",
  "WCC", "RBC", "Platelets", "Plt", "MCV", "MCH", "MCHC", "RDW",
];

const PLAUSIBLE_RANGES: Record<string, { min: number; max: number }> = {
  Ferritin: { min: 1, max: 2000 },
  "Vitamin D": { min: 5, max: 400 },
  "25-OH Vitamin D": { min: 5, max: 400 },
  B12: { min: 50, max: 2000 },
  Folate: { min: 1, max: 50 },
  CRP: { min: 0, max: 500 },
  Iron: { min: 2, max: 80 },
  Transferrin: { min: 15, max: 60 },
  "Transferrin Saturation": { min: 5, max: 80 },
  Creatinine: { min: 20, max: 1500 },
  Creat: { min: 20, max: 1500 },
  eGFR: { min: 5, max: 150 },
  Glucose: { min: 2, max: 50 },
  Cholesterol: { min: 2, max: 15 },
  HDL: { min: 0.3, max: 5 },
  LDL: { min: 0.5, max: 15 },
  Na: { min: 100, max: 180 },
  Sodium: { min: 100, max: 180 },
  K: { min: 2, max: 10 },
  Potassium: { min: 2, max: 10 },
  Cl: { min: 80, max: 130 },
  Chloride: { min: 80, max: 130 },
  Urea: { min: 1, max: 200 },
  ALT: { min: 1, max: 2000 },
  AST: { min: 1, max: 2000 },
  Albumin: { min: 20, max: 60 },
  Alb: { min: 20, max: 60 },
  Bilirubin: { min: 1, max: 100 },
  Bil: { min: 1, max: 100 },
};

function parseReferenceRange(s: string): { low?: number; high?: number } {
  let m = s.match(/(\d+\.?\d*)\s*[-–to]+\s*(\d+\.?\d*)/i);
  if (m) return { low: parseFloat(m[1]), high: parseFloat(m[2]) };
  m = s.match(/([<>])\s*(\d+\.?\d*)/);
  if (m) return m[1] === "<" ? { high: parseFloat(m[2]) } : { low: parseFloat(m[2]) };
  return {};
}

function inferFlag(value: number, range: { low?: number; high?: number }): "low" | "normal" | "high" | undefined {
  if (range.low != null && value < range.low) return "low";
  if (range.high != null && value > range.high) return "high";
  return "normal";
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isLikelyYear(value: number): boolean {
  return value >= 1980 && value <= 2035;
}

function isImplausibleZero(name: string, value: number): boolean {
  if (value !== 0) return false;
  const zeroOk = ["CRP", "ESR", "Triglycerides", "TG"];
  return !zeroOk.includes(name);
}

function matchLabelToMarker(label: string): string | null {
  const L = label.toUpperCase();
  if (/25[- ]?HYDROXY|25[- ]?OH.*VITAMIN\s*D/i.test(label)) return "Vitamin D";
  if (/VITAMIN\s*B\s*12|B\s*12\b|COBALAMIN/i.test(label)) return "B12";
  if (/FOLATE|FOLIC|RBC\s*FOLATE/i.test(label)) return "Folate";
  if (/\bFERRITIN|\bFERITIN/i.test(label)) return "Ferritin";
  if (/\bTSH\b/i.test(label)) return "TSH";
  if (/FREE\s*T\s*3/i.test(label)) return "Free T3";
  if (/FREE\s*T\s*4/i.test(label)) return "Free T4";
  if (/FREE\s*TESTOSTERONE|FREE\s*T\s*\(/i.test(label)) return "Free Testosterone";
  if (/\bCRP\b|C[- ]?REACTIVE/i.test(label)) return "CRP";
  if (/eGFR|GFR\b/i.test(label)) return "eGFR";
  if (/CREATININE|\bCREAT\b/i.test(label)) return "Creatinine";
  if (/CHOLESTEROL|CHOL\b/i.test(label)) return "Cholesterol";
  if (/\bHDL\b/i.test(label)) return "HDL";
  if (/\bLDL\b/i.test(label)) return "LDL";
  if (/GLUCOSE|GLUC\b/i.test(label)) return "Glucose";
  if (/SODIUM|\bNA\b(?!\w)/i.test(label) && L.length < 15) return "Na";
  if (/POTASSIUM|\bK\b(?!\w)/i.test(label) && L.length < 15) return "K";
  if (/CHLORIDE|\bCL\b(?!\w)/i.test(label) && L.length < 15) return "Cl";
  if (/\bUREA\b/i.test(label)) return "Urea";
  if (/\bALT\b|ALANINE/i.test(label)) return "ALT";
  if (/\bAST\b|ASPARTATE/i.test(label)) return "AST";
  if (/BILIRUBIN|\bBIL\b/i.test(label)) return "Bilirubin";
  if (/ALBUMIN|\bALB\b/i.test(label)) return "Albumin";
  if (/\bIRON\b(?!\s*B)/i.test(label) && !L.includes("BINDING")) return "Iron";
  if (/TRANSFERRIN\s*SATN|TFN\s*SATN|TRANSFERRIN\s*SAT/i.test(label)) return "Transferrin Saturation";
  if (/\bTRANSFERRIN\b/i.test(label)) return "Transferrin";
  if (/VITAMIN\s*D(?!\s*B)/i.test(label)) return "Vitamin D";
  for (const name of ["Hemoglobin", "Hb", "Hematocrit", "Hct", "Triglycerides", "TG", "ESR", "GGT", "ALP", "MCV", "MCH", "WCC", "RBC", "Platelets", "Plt"]) {
    const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(label) && (name.length > 2 || L === name)) return name;
  }
  return null;
}

const INVALID_UNITS = /\b(laboratory|pathology|diagnostic|referred|instrument|requested)\b/i;
function scoreMatch(
  name: string,
  value: number,
  unit?: string,
  refRange?: string
): number {
  if (isLikelyYear(value)) return -10;
  if (isImplausibleZero(name, value)) return -5;
  if (unit && INVALID_UNITS.test(unit)) return -4;
  const range = PLAUSIBLE_RANGES[name];
  if (range && (value < range.min || value > range.max)) return -3;
  let score = 0;
  if (unit && /^(nmol|mmol|µmol|g\/L|mg\/dL|mL\/min|pmol|IU|\/L)/i.test(unit)) score += 3;
  else if (unit && !INVALID_UNITS.test(unit)) score += 1;
  if (refRange) score += 2;
  if (range && value >= range.min && value <= range.max) score += 2;
  return score;
}

/** Parse CUMULATIVE IRON STUDIES table: Date | Iron | Transferrin | TFN Satn | Ferritin | Lab.No. */
function parseIronStudiesTable(fullText: string, candidatesByMarker: Map<string, Array<{ value: number; unit?: string; refRange?: string }>>): void {
  const match = fullText.match(/iron\s*studies|CUMULATIVE\s*IRON\s*STUDIES/i);
  if (!match) return;
  const refMatch = fullText.match(/Ref:\s*\(([^)]+)\)\s*\(([^)]+)\)\s*\(([^)]+)\)\s*\(([^)]+)\)/i);
  const refRanges = refMatch ? [refMatch[1].trim(), refMatch[2].trim(), refMatch[3].trim(), refMatch[4].trim()] : [];
  const dataRows = fullText.matchAll(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s+\d+)?/g);
  const rows: Array<{ iron: number; transferrin: number; tfnSat: number; ferritin: number }> = [];
  for (const r of dataRows) {
    const iron = parseFloat(r[4]);
    const transferrin = parseFloat(r[5]);
    const tfnSat = parseFloat(r[6]);
    const ferritin = parseFloat(r[7]);
    if (!isNaN(iron) && !isNaN(transferrin) && !isNaN(tfnSat) && !isNaN(ferritin)) {
      rows.push({ iron, transferrin, tfnSat, ferritin });
    }
  }
  if (rows.length === 0) return;
  const last = rows[rows.length - 1];
  const push = (name: string, value: number, unit: string, ref?: string) => {
    if (!candidatesByMarker.has(name)) candidatesByMarker.set(name, []);
    candidatesByMarker.get(name)!.push({ value, unit, refRange: ref });
  };
  push("Iron", last.iron, "umol/L", refRanges[0]);
  push("Transferrin", last.transferrin, "umol/L", refRanges[1]);
  push("Transferrin Saturation", last.tfnSat, "%", refRanges[2]);
  push("Ferritin", last.ferritin, "ug/L", refRanges[3]);
}

function extractMarkersFromText(text: string): BloodMarker[] {
  const fullText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const candidatesByMarker = new Map<string, Array<{ value: number; unit?: string; refRange?: string }>>();

  parseIronStudiesTable(fullText, candidatesByMarker);

  const patterns = [
    new RegExp("([A-Za-z0-9][A-Za-z0-9\\s/-]*?)\\s*[:=]?\\s*([\\d.]+)\\s*([a-zA-Z/%µ·/]+)?\\s*(?:\\(([^)]+)\\))?", "g"),
    new RegExp("--\\s*([^\\n]+?)\\s+([\\d.]+)\\s+([a-zA-Z/%µ·/]+)?\\s*(?:\\(([^)]+)\\))?", "g"),
  ];

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(fullText)) !== null) {
      const label = m[1].trim().replace(/\s+/g, " ");
      const value = parseFloat(m[2]);
      if (isNaN(value)) continue;
      const unit = m[3]?.trim().replace(/\s*\/\s*$/, "") || undefined;
      const refRange = m[4]?.trim();

      const matched = matchLabelToMarker(label);
      if (matched) {
        if (!candidatesByMarker.has(matched)) candidatesByMarker.set(matched, []);
        candidatesByMarker.get(matched)!.push({ value, unit, refRange });
      }
    }
  }

  const markers: BloodMarker[] = [];
  const usedNames = new Set<string>();

  const CANON_ALIASES: Record<string, string> = { "25-OH Vitamin D": "Vitamin D", "Creat": "Creatinine", "Alb": "Albumin", "Bil": "Bilirubin" };
  for (const name of CANONICAL_MARKERS) {
    const canon = CANON_ALIASES[name] ?? name;
    if (usedNames.has(canon)) continue;

    const candidates = candidatesByMarker.get(name) || candidatesByMarker.get(canon);
    if (!candidates?.length) continue;

    const scored = candidates
      .map((c) => ({ ...c, score: scoreMatch(name, c.value, c.unit, c.refRange) }))
      .filter((c) => c.score > 0);

    if (scored.length === 0) continue;
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    const { low, high } = best.refRange ? parseReferenceRange(best.refRange) : {};
    const flag = low != null || high != null ? inferFlag(best.value, { low, high }) : undefined;

    markers.push({
      name: canon,
      value: best.value,
      unit: best.unit,
      referenceRange: best.refRange,
      flag,
      confidence: best.score >= 5 ? 0.85 : 0.7,
    });
    usedNames.add(canon);
  }

  return markers;
}

export async function extractBloodMarkers(params: {
  files: Array<{ bytes: Uint8Array; mimeType: string; filename: string }>;
  extractor?: DocumentExtractor;
  dryRun?: boolean;
}): Promise<BloodExtractionResult> {
  const allMarkers: BloodMarker[] = [];
  let totalConfidence = 0;
  let fileCount = 0;

  if (params.dryRun) {
    return {
      markers: [],
      rawText: "[DRY RUN] No extraction performed",
      confidence: 0,
    };
  }

  for (const f of params.files) {
    try {
      const effectiveExtractor =
        params.extractor ??
        (f.mimeType === "application/pdf" || f.filename.toLowerCase().endsWith(".pdf")
          ? pdfDocumentExtractor
          : f.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|bmp|webp|gif)$/i.test(f.filename)
            ? imageOcrExtractor
            : stubDocumentExtractor);
      const { text } = await effectiveExtractor.extractText({
        bytes: f.bytes,
        mimeType: f.mimeType,
        filename: f.filename,
      });
      if (!text?.trim() && f.mimeType === "application/pdf") {
        console.warn(`extractBlood: PDF "${f.filename}" produced no text (scanned/image PDF may need OCR).`);
      }
      const parsed = extractMarkersFromText(text);
      allMarkers.push(
        ...parsed.map((m) => ({ ...m, sourceFile: f.filename }))
      );
      totalConfidence += parsed.length > 0 ? 0.8 : 0.3;
      fileCount++;
    } catch (e) {
      console.warn(`extractBlood: failed for ${f.filename}`, e);
    }
  }

  const confidence = fileCount > 0 ? totalConfidence / fileCount : 0;
  return {
    markers: allMarkers,
    confidence: Math.min(1, confidence),
  };
}
