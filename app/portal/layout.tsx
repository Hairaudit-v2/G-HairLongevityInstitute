import Link from "next/link";
import { isLongevityPortalEnabled } from "@/lib/features";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isLongevityPortalEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Patient portal</h1>
          <p className="mt-2 text-white/70">This feature is not currently available.</p>
          <Link href="/longevity" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
            Back to Longevity
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
      <div className="mx-auto max-w-2xl">{children}</div>
    </main>
  );
}
