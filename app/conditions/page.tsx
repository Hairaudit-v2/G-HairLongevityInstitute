import HubEditorialPage, { hubMetadata } from "@/components/editorial/HubEditorialPage";

export const metadata = hubMetadata("conditions");

export default function ConditionsHubPage() {
  return <HubEditorialPage hub="conditions" />;
}
