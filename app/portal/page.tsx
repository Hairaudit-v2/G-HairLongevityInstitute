import { redirect } from "next/navigation";
import { getPortalUser } from "@/lib/longevity/portalAuth";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";

/**
 * Portal root: send logged-in users to the right destination.
 * Trichologists -> review workspace; patients -> dashboard; unauthenticated -> login.
 */
export default async function PortalPage() {
  const user = await getPortalUser();
  if (!user) redirect("/portal/login");

  const trichologist = await getTrichologistFromRequest();
  if (trichologist) redirect("/portal/trichologist/review");

  redirect("/portal/dashboard");
}
