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

/** Plain-language hints for the patient intake upload step (supportive, non-diagnostic). */
export const ADAPTIVE_UPLOAD_GUIDANCE_PATIENT_HINTS: Record<UploadGuideId, string> = {
  frontal_hairline: "Front view of your hairline in soft natural light—everyday photos are fine.",
  temples: "Side views that include your temples.",
  crown: "Top-back of your head (crown); a mirror or someone helping works well.",
  top_down: "Looking down at your scalp so overall coverage shows.",
  center_part: "Hair parted down the middle so the part line is easy to see.",
  diffuse_top: "Overall view of the top of your scalp.",
  edges_closeup: "Close-up of your hairline or edges if tight styles or breakage might be relevant.",
  scalp_closeup: "Close-up of any itchy, tender, or flaky area—only if you are comfortable sharing.",
  patch_closeup: "Close-up of any spot that looks clearly different from the surrounding hair.",
  donor_back: "Lower back of the scalp if your care team has asked for a donor-area view.",
};
