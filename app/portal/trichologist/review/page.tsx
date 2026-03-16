import { redirect } from "next/navigation";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { TrichologistReviewWorkspace } from "@/components/longevity/TrichologistReviewWorkspace";

type PageProps = { searchParams: Promise<{ intake?: string }> };

/**
 * Trichologist review workspace. Trichologist-authenticated only.
 * Minimal internal UI: queue (High / Normal / Assigned to me) and case panel with
 * questionnaire snapshot, documents, notes, and actions (claim, add note, release summary).
 * Optional ?intake=ID deep-links to that case (e.g. from exceptions view).
 */
export default async function TrichologistReviewPage({ searchParams }: PageProps) {
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    redirect("/portal/login?redirect=/portal/trichologist/review");
  }

  const params = await searchParams;
  const initialIntakeId = params.intake?.trim() || null;

  return (
    <TrichologistReviewWorkspace
      trichologistId={trichologist.id}
      initialIntakeId={initialIntakeId}
    />
  );
}
