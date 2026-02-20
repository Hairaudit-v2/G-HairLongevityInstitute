import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: "Server misconfigured." }, { status: 500 });
    }

    const supabase = supabaseAdmin();
    const { data: intake } = await supabase.from("hli_intakes").select("id").eq("id", id).single();
    if (!intake) return NextResponse.json({ ok: false, error: "Intake not found." }, { status: 404 });

    const { data: job } = await supabase
      .from("hli_ai_jobs")
      .insert({ intake_id: id, status: "queued" })
      .select("id")
      .single();

    if (!job) return NextResponse.json({ ok: false, error: "Failed to create job." }, { status: 500 });

    // Inngest: send event to trigger worker (if Inngest client is configured)
    try {
      const { Inngest } = await import("inngest");
      const inngest = new Inngest({ id: "hli" });
      await inngest.send({
        name: "hli/ai.job.queued",
        data: { jobId: job.id, intakeId: id },
      });
    } catch {
      // Inngest not configured: run pipeline inline (synchronous fallback)
      const { runPipeline } = await import("@/lib/pipeline/runPipeline");
      const result = await runPipeline({ intakeId: id, jobId: job.id, dryRun: false });
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
      }
      return NextResponse.json({
        ok: true,
        jobId: job.id,
        message: "AI job completed.",
        reportId: result.reportId,
        storagePath: result.storagePath,
      });
    }

    return NextResponse.json({
      ok: true,
      jobId: job.id,
      message: "AI job queued.",
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
