import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DomainId } from "@/lib/scoring/scoreEngine";
import { getDomainLabel } from "@/lib/scoring/scoreEngine";
import { renderAndrogenCurveChart } from "./charts/androgenCurveChart";

async function loadBrandImage(
  candidates: Array<{ path: string; resize?: number }>
): Promise<Buffer | null> {
  const brandDir = path.join(process.cwd(), "public", "brand");
  for (const { path: rel, resize } of candidates) {
    const p = path.join(brandDir, rel);
    try {
      const buf = await readFile(p);
      if (p.endsWith(".svg")) {
        const sharp = (await import("sharp")).default;
        let pipe = sharp(buf);
        if (resize) pipe = pipe.resize(resize);
        return pipe.png().toBuffer();
      }
      if (resize && p.endsWith(".png")) {
        const sharp = (await import("sharp")).default;
        return sharp(buf).resize(resize).png().toBuffer();
      }
      return buf;
    } catch {
      continue;
    }
  }
  return null;
}

// Company colours: #0F1B2D navy, #C6A75E gold
const NAVY = rgb(15 / 255, 27 / 255, 45 / 255);
const GOLD = rgb(198 / 255, 167 / 255, 94 / 255);
const WHITE = rgb(1, 1, 1);
const LIGHT = rgb(0.92, 0.92, 0.9);
const MUTED = rgb(0.78, 0.78, 0.82);

const LABELS: Record<string, Record<string, string>> = {
  sex: { male: "Male", female: "Female", other: "Other / Prefer not to say" },
  primary_concern: {
    hair_loss: "Hair loss",
    scalp_condition: "Scalp condition",
    post_transplant: "Post-transplant support",
    other: "Other / unsure",
  },
  hair_loss_type: {
    receding_hairline: "Receding hairline / temples",
    crown_thinning: "Crown thinning / vertex",
    diffuse_thinning: "Diffuse thinning (all over)",
    sudden_shedding: "Sudden shedding (weeks/months)",
    patchy: "Patchy loss",
    unsure: "Not sure",
  },
  onset: { "0_3m": "0–3 months", "3_12m": "3–12 months", "1_3y": "1–3 years", "3y_plus": "3+ years" },
  meds: {
    finasteride: "Finasteride", dutasteride: "Dutasteride", minoxidil_topical: "Topical Minoxidil",
    minoxidil_oral: "Oral Minoxidil", spironolactone: "Spironolactone", trt: "TRT",
    none: "None", other: "Other",
  },
  goals: {
    stop_shedding: "Stop shedding", regrow: "Regrow", thicken: "Improve thickness/density",
    stabilise: "Stabilise long-term", plan_transplant: "Plan or optimise a transplant", fix_scalp: "Fix scalp symptoms",
  },
  trt: { true: "Yes", false: "No", yes: "Yes", no: "No" },
  dht_management: { true: "Yes", false: "No", yes: "Yes", no: "No" },
};

function label(map: Record<string, string> | undefined, key: string): string {
  return map?.[key] ?? key;
}

function formatKey(k: string): string {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSelections(s: Record<string, unknown>): string[] {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(s)) {
    if (v == null || v === "") continue;
    const m = LABELS[k as keyof typeof LABELS];
    const keyLabel = formatKey(k);
    if (Array.isArray(v)) {
      const vals = v.map((x) => (typeof x === "string" && m ? label(m, x) : String(x)));
      lines.push(`${keyLabel}: ${vals.join(", ")}`);
    } else if (typeof v === "string" && m) {
      lines.push(`${keyLabel}: ${label(m, v)}`);
    } else {
      lines.push(`${keyLabel}: ${String(v)}`);
    }
  }
  return lines;
}

export type BloodMarkerForReport = {
  name: string;
  value: string | number | null;
  unit?: string;
  referenceRange?: string;
  flag?: "low" | "normal" | "high" | "critical";
};

export type ImageCaptionForReport = {
  filename: string;
  caption: string;
  /** Optional: embed the actual image in the PDF (JPEG/PNG supported) */
  imageBytes?: Uint8Array;
  mimeType?: string;
};

export type AndrogenContext = {
  patientAge: number;
  sex: string;
  trt: boolean;
  dhtManagement: boolean;
  freeTPct: number | null;
};

export type PremiumReportInput = {
  intake: {
    id: string;
    full_name: string;
    email: string;
    dob: string;
    sex: string;
    country: string | null;
    primary_concern: string;
    selections: Record<string, unknown>;
    notes: string | null;
    created_at: string;
  };
  bloodMarkers: BloodMarkerForReport[];
  domainScores: Record<DomainId, number>;
  overallScore: number;
  riskTier: string;
  explainability: Record<DomainId, string[]>;
  imageCaptions: ImageCaptionForReport[];
  androgenContext?: AndrogenContext;
  version: number;
};

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

function drawPageBackground(page: import("pdf-lib").PDFPage) {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_W,
    height: PAGE_H,
    color: NAVY,
  });
}

function drawHeader(
  page: import("pdf-lib").PDFPage,
  helvetica: import("pdf-lib").PDFFont,
  helveticaBold: import("pdf-lib").PDFFont,
  pageNum: number,
  totalPages: number
) {
  page.drawText("Hair Longevity Institute™", {
    x: MARGIN,
    y: PAGE_H - 28,
    size: 10,
    font: helveticaBold,
    color: GOLD,
  });
  page.drawText(`Page ${pageNum} of ${totalPages} | v1.0`, {
    x: PAGE_W - MARGIN - 80,
    y: PAGE_H - 28,
    size: 8,
    font: helvetica,
    color: LIGHT,
  });
  page.drawLine({
    start: { x: MARGIN, y: PAGE_H - 38 },
    end: { x: PAGE_W - MARGIN, y: PAGE_H - 38 },
    thickness: 0.5,
    color: GOLD,
  });
}

function drawFooter(
  page: import("pdf-lib").PDFPage,
  helvetica: import("pdf-lib").PDFFont,
  intakeId: string
) {
  page.drawText(`Ref: ${intakeId}`, {
    x: MARGIN,
    y: 30,
    size: 7,
    font: helvetica,
    color: MUTED,
  });
  page.drawText(
    "Confidential. For patient use only. Hair Longevity Institute™ does not provide medical advice or prescriptions.",
    { x: MARGIN, y: 18, size: 6, font: helvetica, color: MUTED, maxWidth: CONTENT_W }
  );
}

export async function renderPremiumReport(input: PremiumReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages: import("pdf-lib").PDFPage[] = [];

  const addPage = () => {
    const p = doc.addPage([PAGE_W, PAGE_H]);
    drawPageBackground(p);
    pages.push(p);
    return p;
  };

  let y: number;
  const lineH = (size: number) => size * 1.3 + 2;

  const draw = (
    page: import("pdf-lib").PDFPage,
    text: string,
    size: number,
    bold = false,
    color = LIGHT
  ) => {
    const font = bold ? helveticaBold : helvetica;
    page.drawText(text, { x: MARGIN, y, size, font, color, maxWidth: CONTENT_W });
    return (y -= lineH(size));
  };

  const drawBar = (page: import("pdf-lib").PDFPage, label: string, value: number, maxVal: number) => {
    const barW = 200;
    const barH = 8;
    const fillW = (value / maxVal) * barW;
    page.drawText(label, { x: MARGIN, y, size: 9, font: helvetica, color: LIGHT, maxWidth: 180 });
    y -= 2;
    page.drawRectangle({
      x: MARGIN,
      y: y - barH,
      width: barW,
      height: barH,
      color: rgb(0.15, 0.2, 0.28),
    });
    page.drawRectangle({
      x: MARGIN,
      y: y - barH,
      width: Math.max(2, fillW),
      height: barH,
      color: value > 6 ? rgb(0.9, 0.5, 0.25) : value > 4 ? GOLD : rgb(0.35, 0.6, 0.45),
    });
    y -= barH + 12;
  };

  const hasAndrogen =
    input.androgenContext &&
    input.intake.sex?.toLowerCase() === "male" &&
    input.androgenContext.patientAge >= 15 &&
    input.androgenContext.patientAge <= 70;
  const totalPages = hasAndrogen ? 7 : 6;

  // Page 1: Cover + Patient Summary
  let page = addPage();
  drawHeader(page, helvetica, helveticaBold, 1, totalPages);
  y = PAGE_H - 55;

  const logoPng = await loadBrandImage([
    { path: "hli-logo.png" },
    { path: "Print_Transparent.png" },
    { path: "Print_Transparent.svg", resize: 240 },
    { path: "Print.svg", resize: 240 },
  ]);
  if (logoPng && logoPng.length > 0) {
    try {
      const logoImg = await doc.embedPng(logoPng);
      const logoW = 180;
      const logoH = (logoImg.height / logoImg.width) * logoW;
      page.drawImage(logoImg, { x: MARGIN, y: y - logoH, width: logoW, height: logoH });
      y -= logoH + 20;
    } catch {
      // fallback if embedding fails
    }
  }

  page.drawText("Follicle Intelligence™", { x: MARGIN, y, size: 24, font: helveticaBold, color: GOLD });
  y -= 28;
  page.drawText("Premium Diagnostic Report", { x: MARGIN, y, size: 16, font: helveticaBold, color: LIGHT });
  y -= 36;

  draw(page, "Patient details", 12, true);
  draw(page, `Name: ${input.intake.full_name}`, 10);
  draw(page, `Email: ${input.intake.email}`, 10);
  draw(page, `DOB: ${input.intake.dob}`, 10);
  draw(page, `Sex: ${label(LABELS.sex, input.intake.sex)}`, 10);
  if (input.intake.country) draw(page, `Country: ${input.intake.country}`, 10);
  draw(page, `Primary concern: ${label(LABELS.primary_concern, input.intake.primary_concern)}`, 10);
  draw(page, `Report version: ${input.version} | Generated: ${new Date().toISOString().slice(0, 10)}`, 9);
  y -= 16;

  if (input.intake.selections && Object.keys(input.intake.selections).length > 0) {
    draw(page, "Clinical summary", 12, true);
    for (const line of formatSelections(input.intake.selections)) {
      draw(page, line, 9);
    }
    y -= 8;
  }

  drawFooter(page, helvetica, input.intake.id);

  // Page 2: Blood markers
  page = addPage();
  drawHeader(page, helvetica, helveticaBold, 2, totalPages);
  y = PAGE_H - 55;

  draw(page, "Blood markers", 14, true, GOLD);
  y -= 8;

  if (input.bloodMarkers.length > 0) {
    for (const m of input.bloodMarkers.slice(0, 20)) {
      const val = m.value != null ? String(m.value) : "—";
      const unit = m.unit ? ` ${m.unit}` : "";
      const flag = m.flag ? ` [${m.flag}]` : "";
      const ref = m.referenceRange ? ` (ref: ${m.referenceRange})` : "";
      draw(page, `${m.name}: ${val}${unit}${flag}${ref}`, 9);
    }
    if (input.bloodMarkers.length > 20) {
      draw(page, `… and ${input.bloodMarkers.length - 20} more markers`, 8);
    }
  } else {
    draw(page, "No blood markers extracted. Upload blood test PDFs for analysis.", 9);
  }
  drawFooter(page, helvetica, input.intake.id);

  // Page 3: Domain scores + gauges
  page = addPage();
  drawHeader(page, helvetica, helveticaBold, 3, totalPages);
  y = PAGE_H - 55;

  draw(page, "Follicle Intelligence™ domain scores", 14, true, GOLD);
  draw(page, `Overall: ${input.overallScore.toFixed(1)}/10 | Risk tier: ${input.riskTier}`, 10);
  y -= 16;

  for (const domain of ["androgen_exposure", "inflammatory_load", "thyroid_metabolic", "nutrient_sufficiency", "stress_regulation"] as const) {
    const score = input.domainScores[domain] ?? 5;
    drawBar(page, `${getDomainLabel(domain)}: ${score.toFixed(1)}`, score, 10);
    const drivers = input.explainability[domain];
    if (drivers?.length) {
      draw(page, `  Drivers: ${drivers.join("; ")}`, 7, false, MUTED);
      y -= 4;
    }
  }
  drawFooter(page, helvetica, input.intake.id);

  // Page 4 (men only): Age + Free Testosterone Influence
  if (hasAndrogen && input.androgenContext) {
    const ac = input.androgenContext;
    const { pngBuffer } = renderAndrogenCurveChart({
      patientAge: ac.patientAge,
      freeTPct: ac.freeTPct,
      trt: ac.trt,
      dhtManagement: ac.dhtManagement,
    });
    page = addPage();
    drawHeader(page, helvetica, helveticaBold, 4, totalPages);
    y = PAGE_H - 55;

    draw(page, "Age + Free Testosterone Influence (Educational Risk Model)", 14, true, GOLD);
    y -= 16;

    const chartImg = await doc.embedPng(pngBuffer);
    const chartW = 420;
    const chartH = (chartImg.height / chartImg.width) * chartW;
    page.drawImage(chartImg, {
      x: MARGIN,
      y: y - chartH,
      width: chartW,
      height: chartH,
    });
    y -= chartH + 20;

    const safeCopy = [
      "• Educational model, not deterministic.",
      "• Earlier onset + higher androgen drive can correlate with faster progression; genetics dominates.",
      "• TRT may increase androgen exposure in susceptible individuals.",
      "• DHT management may reduce androgen-driven acceleration.",
    ];
    for (const line of safeCopy) {
      draw(page, line, 8, false, MUTED);
    }
    drawFooter(page, helvetica, input.intake.id);
  }

  // Page 4 or 5: Image panel (embed thumbnails when bytes provided)
  const imagePageNum = hasAndrogen ? 5 : 4;
  page = addPage();
  drawHeader(page, helvetica, helveticaBold, imagePageNum, totalPages);
  y = PAGE_H - 55;

  draw(page, "Image signals", 14, true, GOLD);
  y -= 12;

  const imgMaxW = 200;
  const imgMaxH = 160;
  const imgGap = 24;
  const imagesToShow = input.imageCaptions.slice(0, 6);
  let col = 0;
  let rowStartY = y;
  let rowBottom = y;

  for (const img of imagesToShow) {
    const hasBytes = img.imageBytes && img.imageBytes.length > 0 && img.mimeType;
    const isJpeg = hasBytes && /^image\/(jpe?g|jfif)$/i.test(img.mimeType!);
    const isPng = hasBytes && /^image\/png$/i.test(img.mimeType!);
    let pdfImage: import("pdf-lib").PDFImage | null = null;
    if (isJpeg || isPng) {
      try {
        pdfImage = isJpeg ? await doc.embedJpg(img.imageBytes!) : await doc.embedPng(img.imageBytes!);
      } catch {
        pdfImage = null;
      }
    }

    const drawY = col === 0 ? y : rowStartY;
    const x = col === 0 ? MARGIN : MARGIN + imgMaxW + imgGap;
    if (pdfImage) {
      const scale = Math.min(imgMaxW / pdfImage.width, imgMaxH / pdfImage.height, 1);
      const w = pdfImage.width * scale;
      const h = pdfImage.height * scale;
      page.drawImage(pdfImage, {
        x,
        y: drawY - h,
        width: w,
        height: h,
      });
      page.drawText(img.filename, { x, y: drawY - h - 4, size: 7, font: helvetica, color: LIGHT, maxWidth: imgMaxW });
      const captionLines = img.caption.slice(0, 120) + (img.caption.length > 120 ? "…" : "");
      page.drawText(captionLines, { x, y: drawY - h - 16, size: 6, font: helvetica, color: MUTED, maxWidth: imgMaxW });
      const bottom = drawY - h - 28;
      rowBottom = Math.min(rowBottom, bottom);
      if (col === 0) y = bottom;
      else y = rowBottom;
    } else {
      if (col === 1) y = rowStartY;
      draw(page, `${img.filename}:`, 9, true);
      draw(page, img.caption, 8);
      y -= 6;
      rowBottom = Math.min(rowBottom, y);
      if (col === 1) y = rowBottom;
    }
    col = (col + 1) % 2;
    if (col === 0) {
      rowStartY = y;
      rowBottom = y;
    }
  }
  if (input.imageCaptions.length === 0) {
    draw(page, "No image analysis available. Upload scalp/hair photos for signal extraction.", 9);
  } else if (input.imageCaptions.length > 6) {
    draw(page, `… and ${input.imageCaptions.length - 6} more images`, 8);
  }
  drawFooter(page, helvetica, input.intake.id);

  const phasedPageNum = hasAndrogen ? 6 : 5;
  const govPageNum = hasAndrogen ? 7 : 6;

  // Page 5 or 6: Phased strategy
  page = addPage();
  drawHeader(page, helvetica, helveticaBold, phasedPageNum, totalPages);
  y = PAGE_H - 55;

  draw(page, "Phased strategy (draft)", 14, true, GOLD);
  y -= 12;

  const phases = [
    { phase: "Phase 1", title: "Baseline & stabilisation", items: ["Lab recheck if indicated", "Optimise scalp environment", "Address nutrient gaps"] },
    { phase: "Phase 2", title: "Targeted intervention", items: ["Personalised protocol review", "Monitor response at 8–12 weeks"] },
    { phase: "Phase 3", title: "Maintenance", items: ["Long-term monitoring", "Annual reassessment"] },
  ];
  for (const p of phases) {
    draw(page, `${p.phase}: ${p.title}`, 10, true);
    for (const item of p.items) {
      draw(page, `• ${item}`, 9);
    }
    y -= 8;
  }
  drawFooter(page, helvetica, input.intake.id);

  // Page 6 or 7: Governance
  page = addPage();
  drawHeader(page, helvetica, helveticaBold, govPageNum, totalPages);
  y = PAGE_H - 55;

  draw(page, "Governance & disclaimer", 14, true, GOLD);
  y -= 16;

  const govText = [
    "This report is generated from patient-supplied information and automated analysis. It is not a medical diagnosis.",
    "Blood markers and image signals are extracted with limited confidence. All findings should be verified by a qualified clinician.",
    "Hair Longevity Institute™ does not provide medical advice, prescriptions, or treatment recommendations.",
    "This report is confidential and intended for the patient and their healthcare provider.",
  ];
  for (const t of govText) {
    draw(page, t, 9);
    y -= 4;
  }
  drawFooter(page, helvetica, input.intake.id);

  return doc.save();
}
