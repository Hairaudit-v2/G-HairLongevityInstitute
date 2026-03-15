import { inngest } from "./client";
import { runPipeline } from "@/lib/pipeline/runPipeline";
import { runLongevityScalpImageAnalysisJob } from "@/lib/longevity/runScalpImageAnalysisJob";

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

export const hliLongevityScalpImageAnalysisJob = inngest.createFunction(
  { id: "hli-longevity-scalp-image-analysis-job", retries: 2 },
  { event: "hli/longevity.scalp-image-analysis.queued" },
  async ({ event }) => {
    const { jobId, intakeId, profileId, trichologistId } = event.data;
    const result = await runLongevityScalpImageAnalysisJob({
      jobId,
      intakeId,
      profileId,
      trichologistId: trichologistId ?? null,
    });
    if (!result.ok) throw new Error(result.error);
    return result;
  }
);

export default [hliAiJob, hliLongevityScalpImageAnalysisJob];
