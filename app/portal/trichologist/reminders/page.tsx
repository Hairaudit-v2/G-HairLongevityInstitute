import { redirect } from "next/navigation";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { ReminderInspectionPageContent } from "@/components/longevity/ReminderInspectionTable";

/**
 * Internal longevity reminders inspection. Trichologist-authenticated only.
 * Lightweight view of staged/cancelled/sent reminders; no patient-facing exposure.
 */
export default async function TrichologistRemindersPage() {
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    redirect("/portal/login?redirect=/portal/trichologist/reminders");
  }

  return <ReminderInspectionPageContent />;
}
