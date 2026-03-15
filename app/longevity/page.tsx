import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";

export default function LongevityPage() {
  if (!isLongevityEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Longevity module</h1>
          <p className="mt-2 text-white/70">This feature is not currently available.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-xl font-semibold text-white">Hair Longevity Institute</h1>
        <p className="mt-2 text-white/70">Longevity intake and care pathway.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/longevity/start"
            className="inline-flex rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))]"
          >
            Start intake
          </Link>
          <Link
            href="/portal"
            className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            Patient portal
          </Link>
          <Link
            href="/longevity/dashboard"
            className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            Dashboard (session)
          </Link>
        </div>
      </div>
    </main>
  );
}
