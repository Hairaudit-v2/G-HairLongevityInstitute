import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container } from "@/components/public/PublicCTA";
import { isLongevityEnabled } from "@/lib/features";

export default function EditorialPageShell({
  children,
  theme = "light",
}: {
  children: React.ReactNode;
  theme?: "light" | "dark";
}) {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";
  const isLight = theme === "light";

  return (
    <main className={`min-h-screen ${isLight ? "bg-page" : "bg-[rgb(var(--bg-dark))] text-white"}`}>
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel="Start My Hair Analysis"
        theme={theme}
      />
      <Container>{children}</Container>
      <Container>
        <PublicFooter theme={theme} />
      </Container>
    </main>
  );
}
