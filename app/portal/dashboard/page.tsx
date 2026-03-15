import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { setLongevitySession } from "@/lib/longevityAuth";
import { getPortalUser, ensurePortalProfile } from "@/lib/longevity/portalAuth";
import { listDocumentsForProfile } from "@/lib/longevity/documents";
import { LongevityDocumentsSection } from "@/components/longevity/LongevityDocumentsSection";
import { PortalNextStep } from "@/components/longevity/PortalNextStep";
import { PortalSignOut } from "@/components/longevity/PortalSignOut";

/**
 * Portal dashboard: auth required; resolves profile from auth, sets longevity cookie, lists intakes + documents.
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
    .select("id, status, created_at, updated_at")
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

      <div className="mt-8">
        <PortalNextStep intakes={list} />
      </div>

      <section className="mt-10" aria-labelledby="intake-history-heading">
        <h2 id="intake-history-heading" className="text-lg font-semibold text-white">
          Intake history
        </h2>
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
                        Latest
                      </span>
                    )}
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
      </section>

      <LongevityDocumentsSection documents={documents} />
    </>
  );
}
