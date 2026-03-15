import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { setLongevitySession } from "@/lib/longevityAuth";
import { getPortalUser, ensurePortalProfile } from "@/lib/longevity/portalAuth";
import { listDocumentsForProfile } from "@/lib/longevity/documents";
import { listBloodRequestsForProfile } from "@/lib/longevity/bloodRequests";
import { getCurrentVsPreviousForIntake, profileHasTrendData } from "@/lib/longevity/bloodMarkerTrends";
import { getInterpretedMarkersForIntake } from "@/lib/longevity/bloodResultMarkers";
import { generateClinicalInsights } from "@/lib/longevity/clinicalInsights";
import { BloodRequestLetterCard } from "@/components/longevity/BloodRequestLetterCard";
import { CareJourneyTimeline } from "@/components/longevity/CareJourneyTimeline";
import { LongevityDocumentsSection } from "@/components/longevity/LongevityDocumentsSection";
import { PortalNextStep } from "@/components/longevity/PortalNextStep";
import { PortalSignOut } from "@/components/longevity/PortalSignOut";

/**
 * Portal dashboard: auth required; resolves profile from auth, sets longevity cookie, lists intakes + documents.
 * Handoff: If the user previously had a cookie-only session with the same email, ensurePortalProfile
 * links that profile to auth_user_id so all prior intakes and documents appear here. Session cookie
 * is set so "Resume" and "New intake" use this profile. Longitudinal model: one profile, many intakes
 * (additive); no overwrite of submitted intakes. Safe for future Trichologist workflows (see docs/TRICHOLOGIST_PORTAL_SPEC.md).
 */
export default async function PortalDashboardPage() {
  const user = await getPortalUser();
  if (!user) redirect("/portal/login");

  const supabase = supabaseAdmin();
  const profileId = await ensurePortalProfile(supabase, user);
  if (!profileId) {
    redirect("/portal/login?error=profile");
  }

  await setLongevitySession(profileId);

  const { data: intakes, error } = await supabase
    .from("hli_longevity_intakes")
    .select("id, status, created_at, updated_at, patient_visible_summary, patient_visible_released_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 text-red-200">Unable to load intakes.</p>
        <Link href="/portal" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
          Back
        </Link>
      </div>
    );
  }

  const list = intakes ?? [];
  const documents = await listDocumentsForProfile(supabase, profileId);
  const bloodRequests = await listBloodRequestsForProfile(supabase, profileId);
  const hasTrendData = await profileHasTrendData(supabase, profileId);
  const intakesWithReleasedSummary = list.filter(
    (i) => i.patient_visible_released_at != null && (i.patient_visible_summary ?? "").trim() !== ""
  );
  const latestIntakeId = list[0]?.id ?? null;
  let patientSafeInsights: string[] = [];
  if (latestIntakeId) {
    const [bloodResults, markerTrends] = await Promise.all([
      getInterpretedMarkersForIntake(supabase, latestIntakeId),
      getCurrentVsPreviousForIntake(supabase, profileId, latestIntakeId),
    ]);
    patientSafeInsights = generateClinicalInsights({
      interpretedMarkers: bloodResults,
      markerTrends,
    }).patientSafeInsights.slice(0, 3);
  }
  const hasResultsUploaded = bloodRequests.some((br) => br.status === "results_uploaded");

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
            Hair Longevity Institute™ — Patient Portal
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 text-white/70">Your intakes and documents</p>
        </div>
        <div className="flex items-center gap-3">
          <PortalSignOut />
          <Link href="/longevity" className="text-sm text-white/70 hover:text-white">
            Longevity home
          </Link>
        </div>
      </div>

      <div className="mt-8" aria-labelledby="next-step-heading">
        <PortalNextStep intakes={list} hasResultsUploaded={hasResultsUploaded} />
      </div>

      <CareJourneyTimeline
        intakes={list}
        bloodRequests={bloodRequests}
        intakesWithReleasedSummary={intakesWithReleasedSummary}
      />

      {hasTrendData && (
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5" aria-labelledby="trend-summary-heading">
          <h2 id="trend-summary-heading" className="text-base font-semibold text-white">
            Blood results over time
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Your key blood results are tracked over time. Your clinician can discuss any changes with you at your next review.
          </p>
        </section>
      )}

      {patientSafeInsights.length > 0 && (
        <section className="mt-6 rounded-2xl border border-[rgb(var(--gold))]/20 bg-[rgb(var(--gold))]/5 p-5" aria-labelledby="blood-insights-heading">
          <h2 id="blood-insights-heading" className="text-base font-semibold text-white">
            Your blood results summary
          </h2>
          <p className="mt-2 text-sm text-white/70">
            These are simple, high-level observations from your tracked blood results. Your clinician will interpret them in context with you.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/85">
            {patientSafeInsights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>
      )}

      {bloodRequests.length > 0 && (
        <section className="mt-10" aria-labelledby="blood-requests-heading">
          <h2 id="blood-requests-heading" className="text-lg font-semibold text-white">
            Recommended blood tests
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Your clinician has recommended blood tests for your assessment. You can generate a GP support letter to take to your doctor. The letter is for your GP&apos;s information only; it is not a pathology order—your GP decides which tests to request.
          </p>
          <div className="mt-4 space-y-4">
            {bloodRequests.map((br) => (
              <BloodRequestLetterCard key={br.id} br={br} />
            ))}
          </div>
        </section>
      )}

      {intakesWithReleasedSummary.length > 0 && (
        <section className="mt-10" aria-labelledby="clinician-summary-heading">
          <h2 id="clinician-summary-heading" className="text-lg font-semibold text-white">
            Clinician summary
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Summaries released to you by your clinician. One per intake when available.
          </p>
          <div className="mt-4 space-y-4">
            {intakesWithReleasedSummary.map((intake) => (
              <div
                key={intake.id}
                className="rounded-2xl border border-[rgb(var(--gold))]/20 bg-[rgb(var(--gold))]/5 p-6"
              >
                <p className="text-xs text-white/50">
                  Intake from {new Date(intake.created_at).toLocaleDateString()} · released{" "}
                  {intake.patient_visible_released_at
                    ? new Date(intake.patient_visible_released_at).toLocaleDateString()
                    : ""}
                </p>
                <div className="mt-3 whitespace-pre-wrap text-sm text-white/90">
                  {intake.patient_visible_summary ?? ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10" aria-labelledby="intake-history-heading">
        <h2 id="intake-history-heading" className="text-lg font-semibold text-white">
          Intake history
        </h2>
        <p className="mt-1 text-sm text-white/60">
          All your intakes, newest first. Each submission is kept; starting a new intake adds a follow-up and does not replace the previous one.
        </p>
        <div className="mt-4 space-y-4">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
              No intakes yet.
            </div>
          ) : (
            list.map((intake, index) => (
              <div
                key={intake.id}
                className={`rounded-2xl border p-6 ${
                  index === 0
                    ? "border-[rgb(var(--gold))]/40 bg-[rgb(var(--gold))]/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    {index === 0 && (
                      <span className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--gold))]">
                        Latest intake
                      </span>
                    )}
                    <span className="text-xs text-white/50 block mt-0.5">
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
      </section>

      <LongevityDocumentsSection documents={documents} />
    </>
  );
}
