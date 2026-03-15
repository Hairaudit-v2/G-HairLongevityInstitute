import { redirect } from "next/navigation";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { AdherenceOverviewContent } from "@/components/longevity/AdherenceOverview";

/**
 * Internal longevity adherence overview. Trichologist-authenticated only.
 * Compact view: reminder conversion, overdue count, recent outcomes.
 */
export default async function TrichologistAdherencePage() {
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    redirect("/portal/login?redirect=/portal/trichologist/adherence");
  }

  return <AdherenceOverviewContent />;
}
