import type { UploadGuideId } from "./adaptiveTypes";

export const ADAPTIVE_UPLOAD_GUIDANCE_LABELS: Record<UploadGuideId, string> = {
  frontal_hairline: "Frontal hairline in clear natural light",
  temples: "Both temple areas",
  crown: "Crown / vertex from above",
  top_down: "Top-down scalp view",
  center_part: "Center part line / midline close-up",
  diffuse_top: "Diffuse top scalp overview",
  edges_closeup: "Edges / hairline close-up",
  scalp_closeup: "Close-up of the scalp symptoms area",
  patch_closeup: "Close-up of any patchy or focal area",
  donor_back: "Back of scalp / donor area if relevant",
};
