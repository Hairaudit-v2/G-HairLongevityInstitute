import HubEditorialPage, { hubMetadata } from "@/components/editorial/HubEditorialPage";

export const metadata = hubMetadata("blood-markers");

export default function BloodMarkersHubPage() {
  return <HubEditorialPage hub="blood-markers" />;
}
