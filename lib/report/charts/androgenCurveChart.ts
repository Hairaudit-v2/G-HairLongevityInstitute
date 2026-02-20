/**
 * Server-side androgen curve chart renderer.
 * Age + Free Testosterone influence (educational risk model).
 * Renders to PNG buffer using @napi-rs/canvas.
 */
import { createCanvas } from "@napi-rs/canvas";

const MU = 23;
const SIGMA = 9;
const AGE_MIN = 15;
const AGE_MAX = 70;

function gaussian(x: number, mu: number, sigma: number): number {
  return Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
}

export type AndrogenChartParams = {
  patientAge: number;
  freeTPct: number | null;
  trt: boolean;
  dhtManagement: boolean;
};

export type AndrogenChartResult = {
  pngBuffer: Buffer;
  annotations: string[];
};

export function renderAndrogenCurveChart(params: AndrogenChartParams): AndrogenChartResult {
  const { patientAge, freeTPct, trt, dhtManagement } = params;

  const ftFactor =
    freeTPct != null
      ? Math.min(1.3, Math.max(0.7, 0.7 + 0.6 * (freeTPct / 100)))
      : 1.0;
  const annotations: string[] = [];
  if (freeTPct == null) annotations.push("Free T not available");
  if (trt) annotations.push("TRT: yes");

  const ageStep = 0.5;
  const ages: number[] = [];
  for (let a = AGE_MIN; a <= AGE_MAX; a += ageStep) ages.push(a);

  const baseCurve = ages.map((a) => gaussian(a, MU, SIGMA));
  const maxBase = Math.max(...baseCurve);
  const normalized = baseCurve.map((v) => (maxBase > 0 ? v / maxBase : 0));

  const trtMult = trt ? 1.15 : 1;
  const unmanaged = normalized.map((v) => v * ftFactor * trtMult);
  const dhtManaged = unmanaged.map((v) => v * 0.72);

  const width = 480;
  const height = 280;
  const padding = { top: 30, right: 40, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const bg = "#0F1B2D";
  const axisColor = "rgba(217, 217, 214, 0.6)";
  const gold = "#C6A75E";
  const goldDim = "rgba(198, 167, 94, 0.5)";
  const platinum = "rgba(217, 217, 214, 0.9)";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const x = (age: number) => padding.left + ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * chartW;
  const y = (val: number) => {
    const maxY = Math.max(...unmanaged, ...dhtManaged);
    const scaled = maxY > 0 ? val / maxY : 0;
    return padding.top + chartH - scaled * chartH;
  };

  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 1;
  ctx.font = "10px sans-serif";
  ctx.fillStyle = platinum;

  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.stroke();

  for (let a = 20; a <= 70; a += 10) {
    const px = x(a);
    ctx.fillText(String(a), px - 6, padding.top + chartH + 16);
  }
  ctx.fillText("Age", padding.left + chartW / 2 - 12, height - 8);
  ctx.save();
  ctx.translate(18, padding.top + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Relative androgen drive", -60, 0);
  ctx.restore();

  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  for (let i = 0; i < ages.length; i++) {
    const px = x(ages[i]);
    const py = y(unmanaged[i]);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.strokeStyle = goldDim;
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < ages.length; i++) {
    const px = x(ages[i]);
    const py = y(dhtManaged[i]);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  const ageIdx = ages.findIndex((a) => a >= patientAge);
  const idx = ageIdx >= 0 ? Math.min(ageIdx, ages.length - 1) : ages.length - 1;
  const patientVal = unmanaged[idx];
  const dotX = x(patientAge);
  const dotY = y(patientVal);

  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = platinum;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "8px sans-serif";
  ctx.fillStyle = platinum;
  ctx.fillText(`You (age ${patientAge})`, dotX + 8, dotY + 4);

  ctx.font = "9px sans-serif";
  ctx.fillStyle = gold;
  ctx.fillText("— Unmanaged", padding.left + chartW - 80, padding.top - 8);
  ctx.strokeStyle = goldDim;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padding.left + chartW - 95, padding.top - 8);
  ctx.lineTo(padding.left + chartW - 85, padding.top - 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = goldDim;
  ctx.fillText("— DHT managed (×0.72)", padding.left + chartW - 80, padding.top + 4);

  if (annotations.length > 0) {
    ctx.font = "8px sans-serif";
    ctx.fillStyle = "rgba(255, 180, 80, 0.9)";
    ctx.fillText(annotations.join(" • "), padding.left, padding.top - 8);
  }

  const pngBuffer = canvas.toBuffer("image/png");
  return { pngBuffer, annotations };
}
