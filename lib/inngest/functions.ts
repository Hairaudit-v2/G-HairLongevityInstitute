import { inngest } from "./client";
import { runPipeline } from "@/lib/pipeline/runPipeline";

export const hliAiJob = inngest.createFunction(
  { id: "hli-ai-job", retries: 2 },
  { event: "hli/ai.job.queued" },
  async ({ event }) => {
    const { jobId, intakeId } = event.data;
    const result = await runPipeline({ intakeId, jobId, dryRun: false });
    if (!result.ok) throw new Error(result.error);
    return result;
  }
);

export default [hliAiJob];
