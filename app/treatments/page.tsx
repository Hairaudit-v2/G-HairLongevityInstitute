import HubEditorialPage, { hubMetadata } from "@/components/editorial/HubEditorialPage";

export const metadata = hubMetadata("treatments");

export default function TreatmentsHubPage() {
  return <HubEditorialPage hub="treatments" />;
}
