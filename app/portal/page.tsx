import { redirect } from "next/navigation";
import { getPortalUser } from "@/lib/longevity/portalAuth";

/**
 * Portal root: send logged-in users to dashboard, others to login.
 */
export default async function PortalPage() {
  const user = await getPortalUser();
  if (user) redirect("/portal/dashboard");
  redirect("/portal/login");
}
