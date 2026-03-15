import { redirect } from "next/navigation";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { TrichologistReviewWorkspace } from "@/components/longevity/TrichologistReviewWorkspace";

/**
 * Trichologist review workspace. Trichologist-authenticated only.
 * Minimal internal UI: queue (High / Normal / Assigned to me) and case panel with
 * questionnaire snapshot, documents, notes, and actions (claim, add note, release summary).
 */
export default async function TrichologistReviewPage() {
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    redirect("/portal/login?redirect=/portal/trichologist/review");
  }

  return <TrichologistReviewWorkspace trichologistId={trichologist.id} />;
}
