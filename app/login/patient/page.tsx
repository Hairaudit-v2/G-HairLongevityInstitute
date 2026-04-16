import { redirect } from "next/navigation";

export default function PatientLoginPage() {
  // Legacy patient-login URL now collapses into the role-aware portal entry.
  redirect("/portal");
}
