/**
 * Local dev route: run pipeline synchronously.
 * POST /api/dev/runPipeline?intakeId=xxx
 * Body: { dryRun?: boolean }
 */
import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline/runPipeline";

export const dynamic = "force-dynamic";

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function POST(req: Request) {
  if (isProd()) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  try {
    const url = new URL(req.url);
    const intakeId = url.searchParams.get("intakeId");
    if (!intakeId) {
      return NextResponse.json({ ok: false, error: "Missing intakeId query param." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = Boolean(body?.dryRun);

    const result = await runPipeline({ intakeId, dryRun });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      jobId: result.jobId,
      reportId: result.reportId,
      storagePath: result.storagePath,
      message: dryRun ? "Pipeline completed (dry run)." : "Pipeline completed.",
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
