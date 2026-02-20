import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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
  onset: {
    "0_3m": "0–3 months",
    "3_12m": "3–12 months",
    "1_3y": "1–3 years",
    "3y_plus": "3+ years",
  },
  meds: {
    finasteride: "Finasteride",
    dutasteride: "Dutasteride",
    minoxidil_topical: "Topical Minoxidil",
    minoxidil_oral: "Oral Minoxidil",
    spironolactone: "Spironolactone",
    trt: "TRT / Testosterone optimisation",
    none: "None",
    other: "Other",
  },
  goals: {
    stop_shedding: "Stop shedding",
    regrow: "Regrow",
    thicken: "Improve thickness/density",
    stabilise: "Stabilise long-term",
    plan_transplant: "Plan or optimise a transplant",
    fix_scalp: "Fix scalp symptoms",
  },
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

type IntakeForReport = {
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
  fileCount?: { blood: number; photo: number };
};

export async function generateDiagnosticReportPdf(intake: IntakeForReport): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let y = 792;

  const lineHeight = (size: number) => size * 1.25 + 2;

  const draw = (text: string, size: number, bold = false, color = rgb(0.1, 0.1, 0.15)) => {
    const font = bold ? helveticaBold : helvetica;
    page.drawText(text, {
      x: margin,
      y,
      size,
      font,
      color,
      maxWidth: 495,
    });
    y -= lineHeight(size);
  };

  const drawLine = () => {
    page.drawLine({
      start: { x: margin, y },
      end: { x: 545, y },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.75),
    });
    y -= 12;
  };

  // Header
  page.drawText("Hair Longevity Institute™", {
    x: margin,
    y,
    size: 22,
    font: helveticaBold,
    color: rgb(0.58, 0.41, 0.29),
  });
  y -= 28;

  page.drawText("Diagnostic Intake Summary", {
    x: margin,
    y,
    size: 14,
    font: helveticaBold,
    color: rgb(0.15, 0.15, 0.2),
  });
  y -= 24;

  drawLine();

  // Patient info
  draw("Patient details", 12, true);
  y -= 4;
  draw(`Name: ${intake.full_name}`, 10);
  draw(`Email: ${intake.email}`, 10);
  draw(`DOB: ${intake.dob}`, 10);
  draw(`Sex: ${label(LABELS.sex, intake.sex)}`, 10);
  if (intake.country) draw(`Country: ${intake.country}`, 10);
  draw(`Primary concern: ${label(LABELS.primary_concern, intake.primary_concern)}`, 10);
  draw(`Submitted: ${new Date(intake.created_at).toLocaleString()}`, 10);
  y -= 8;

  drawLine();

  // Selections
  if (intake.selections && Object.keys(intake.selections).length > 0) {
    draw("Clinical summary", 12, true);
    y -= 4;
    for (const line of formatSelections(intake.selections as Record<string, unknown>)) {
      draw(line, 9);
    }
    y -= 8;
  }

  // Notes
  if (intake.notes?.trim()) {
    drawLine();
    draw("Notes", 12, true);
    y -= 4;
    const noteLines = intake.notes.trim().split(/\n/);
    for (const line of noteLines) {
      draw(line, 9);
    }
    y -= 8;
  }

  // Files
  if (intake.fileCount && (intake.fileCount.blood > 0 || intake.fileCount.photo > 0)) {
    drawLine();
    draw("Uploaded files", 12, true);
    y -= 4;
    draw(`Blood tests: ${intake.fileCount.blood} file(s)`, 9);
    draw(`Hair photos: ${intake.fileCount.photo} file(s)`, 9);
    y -= 8;
  }

  drawLine();

  // Footer
  y = Math.min(y, 80);
  page.drawText(`Reference: ${intake.id}`, {
    x: margin,
    y,
    size: 8,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.55),
  });
  y -= 12;

  page.drawText(
    "This is an intake summary only. The full diagnostic review with recommendations will be provided separately. Hair Longevity Institute™ does not provide medical advice or prescriptions.",
    {
      x: margin,
      y,
      size: 7,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.55),
      maxWidth: 495,
    }
  );

  return doc.save();
}
