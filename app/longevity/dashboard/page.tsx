import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { listDocumentsForProfile } from "@/lib/longevity/documents";
import { getPatientProgressForProfile } from "@/lib/longevity/patientProgress";
import { LongevityDocumentsSection } from "@/components/longevity/LongevityDocumentsSection";

export default async function LongevityDashboardPage() {
  if (!isLongevityEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Longevity dashboard</h1>
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
          <h1 className="text-xl font-semibold text-white">Longevity dashboard</h1>
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
    .select("id, status, created_at, updated_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Longevity dashboard</h1>
          <p className="mt-2 text-red-200">Unable to load intakes.</p>
          <Link href="/longevity" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
            Back
          </Link>
        </div>
      </main>
    );
  }

  const list = intakes ?? [];

  const documents = await listDocumentsForProfile(supabase, profileId);
  const { progress } = await getPatientProgressForProfile(supabase, profileId);

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
              Hair Longevity Institute™ — Longevity
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-white">Dashboard</h1>
            <p className="mt-1 text-white/70">Your intake status</p>
          </div>
          <Link
            href="/longevity"
            className="text-sm text-white/70 hover:text-white"
          >
            ← Back
          </Link>
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href="/longevity/start"
            className="inline-flex rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))]"
          >
            New intake
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">
            Your progress
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-3">
              <span
                className={
                  progress.blood_results_uploaded
                    ? "text-emerald-400"
                    : "text-white/40"
                }
                aria-hidden
              >
                {progress.blood_results_uploaded ? "✓" : "○"}
              </span>
              Blood results uploaded
            </li>
            <li className="flex items-center gap-3">
              <span
                className={
                  progress.follow_up_completed
                    ? "text-emerald-400"
                    : "text-white/40"
                }
                aria-hidden
              >
                {progress.follow_up_completed ? "✓" : "○"}
              </span>
              Follow-up completed
            </li>
            <li className="flex items-center gap-3">
              <span
                className={
                  progress.scalp_images_reviewed
                    ? "text-emerald-400"
                    : "text-white/40"
                }
                aria-hidden
              >
                {progress.scalp_images_reviewed ? "✓" : "○"}
              </span>
              Scalp images reviewed
            </li>
            <li className="flex items-center gap-3">
              <span
                className={
                  progress.clinician_summary_released
                    ? "text-emerald-400"
                    : "text-white/40"
                }
                aria-hidden
              >
                {progress.clinician_summary_released ? "✓" : "○"}
              </span>
              Clinician summary released
            </li>
            {progress.next_review_timing && (
              <li className="flex items-center gap-3 border-t border-white/10 pt-3 text-white/80">
                <span className="text-[rgb(var(--gold))]" aria-hidden>
                  →
                </span>
                Next review: {progress.next_review_timing}
              </li>
            )}
          </ul>
        </div>

        <div className="mt-8 space-y-4">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
              No intakes yet. Start one above.
            </div>
          ) : (
            list.map((intake) => (
              <div
                key={intake.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-white/50">
                      {new Date(intake.created_at).toLocaleDateString()}
                    </span>
                    <p className="mt-1 font-medium text-white">
                      Status:{" "}
                      <span
                        className={
                          intake.status === "draft"
                            ? "text-amber-300"
                            : intake.status === "submitted"
                              ? "text-emerald-300"
                              : "text-white/80"
                        }
                      >
                        {intake.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {intake.status === "draft" && (
                      <Link
                        href={`/longevity/start?resume=${intake.id}`}
                        className="rounded-2xl border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-4 py-2 text-sm font-medium text-white hover:bg-[rgb(var(--gold))]/20"
                      >
                        Resume
                      </Link>
                    )}
                    {intake.status !== "draft" && (
                      <span className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/70">
                        {intake.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <LongevityDocumentsSection documents={documents} />
      </div>
    </main>
  );
}
