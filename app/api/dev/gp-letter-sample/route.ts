/**
 * Dev-only: GET returns a sample GP support letter PDF for visual verification.
 * curl -o sample-gp-letter.pdf "http://localhost:3000/api/dev/gp-letter-sample"
 */
import { NextResponse } from "next/server";
import { generateGpSupportLetterPdf } from "@/lib/longevity/gpLetterGenerator";

export const dynamic = "force-dynamic";

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function GET() {
  if (isProd()) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  try {
    const pdfBytes = await generateGpSupportLetterPdf({
      patientName: "Jane Smith",
      generationDate: new Date().toISOString().slice(0, 10),
      reason:
        "Iron status, particularly ferritin levels, in relation to hair fibre production and shedding patterns. Thyroid function, as hormonal variation may influence hair cycling and overall scalp health.",
      recommendedTests: ["Ferritin", "Iron Studies", "TSH", "Free T4"],
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="GP-support-letter-sample.pdf"',
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
