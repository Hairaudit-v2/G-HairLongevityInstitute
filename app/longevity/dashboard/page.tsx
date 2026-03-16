import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPatientProgressForProfile } from "@/lib/longevity/patientProgress";

/**
 * Cookie/session longevity dashboard: lightweight bridge to the secure portal.
 * Confirms submission/review state and steers patients to the portal for summaries and documents.
 * Does not duplicate full dashboard content; portal is the primary destination.
 */
export default async function LongevityDashboardPage() {
  if (!isLongevityEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Longevity</h1>
          <p className="mt-2 text-white/70">This feature is not currently available.</p>
          <Link href="/longevity" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
            Back
          </Link>
        </div>
      </main>
    );
  }

  const profileId = await getLongevitySessionFromRequest();
  if (!profileId) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Longevity</h1>
          <p className="mt-2 text-white/70">Start an intake to see your submissions here.</p>
          <Link
            href="/longevity/start"
            className="mt-6 inline-flex rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))]"
          >
            Start intake
          </Link>
        </div>
      </main>
    );
  }

  const supabase = supabaseAdmin();
  const { data: intakes, error } = await supabase
    .from("hli_longevity_intakes")
    .select("id, status")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Longevity</h1>
          <p className="mt-2 text-red-200">Unable to load your information.</p>
          <Link href="/longevity" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
            Back
          </Link>
        </div>
      </main>
    );
  }

  const list = intakes ?? [];
  const submittedCount = list.filter((i) => i.status !== "draft").length;
  const firstDraft = list.find((i) => i.status === "draft") ?? null;
  const { progress } = await getPatientProgressForProfile(supabase, profileId);
  const summaryReleased = progress.clinician_summary_released;

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
              Hair Longevity Institute™ — Longevity
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-white">Next steps</h1>
            <p className="mt-1 text-white/70">Your secure portal is where you view your review and documents.</p>
          </div>
          <Link href="/longevity" className="text-sm text-white/70 hover:text-white">
            ← Back
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          {summaryReleased ? (
            <>
              <p className="text-base font-medium text-emerald-200">
                Your Hair Longevity review is ready.
              </p>
              <p className="mt-2 text-sm text-white/80">
                View your clinician summary and documents in your secure portal. Your secure portal is the main place to view your review and documents; you can return there anytime to check progress.
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-medium text-white/90">
                {submittedCount > 0
                  ? "Your review is in progress."
                  : "You haven’t submitted an intake yet."}
              </p>
              <p className="mt-2 text-sm text-white/80">
                Your secure portal is the main place to view your review and documents when they’re ready. You can return there anytime to check progress.
              </p>
            </>
          )}
          <Link
            href="/portal/login?redirect=/portal/dashboard"
            className="mt-6 inline-flex rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))]"
          >
            Open secure portal
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/longevity/start"
            className="rounded-2xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            New intake
          </Link>
          {firstDraft && (
            <Link
              href={`/longevity/start?resume=${firstDraft.id}`}
              className="rounded-2xl border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-[rgb(var(--gold))]/20"
            >
              Resume draft
            </Link>
          )}
        </div>

        {submittedCount > 0 && (
          <p className="mt-6 text-xs text-white/50">
            You have {submittedCount} submitted intake{submittedCount !== 1 ? "s" : ""}. View details in your secure portal.
          </p>
        )}
      </div>
    </main>
  );
}
