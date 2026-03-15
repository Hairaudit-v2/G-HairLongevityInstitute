import Link from "next/link";
import { redirect } from "next/navigation";
import { isLongevityEnabled } from "@/lib/features";
import { getLongevitySessionFromRequest } from "@/lib/longevityAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Resume intake by ID. Requires longevity session (set after login or after creating a draft).
 * - No session → redirect to login with redirect back to this URL.
 * - Session present and intake owned → redirect to /longevity/start?resume=id.
 * - Session present but intake not found or not owned → show not found.
 */
export default async function LongevityIntakeResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isLongevityEnabled()) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Longevity intake</h1>
          <p className="mt-2 text-white/70">This feature is not currently available.</p>
          <Link href="/longevity" className="mt-4 inline-block text-sm text-white/60 hover:text-white/90">
            Back
          </Link>
        </div>
      </main>
    );
  }

  const { id } = await params;
  if (!id) {
    redirect("/longevity/start");
  }

  const profileId = await getLongevitySessionFromRequest();
  if (!profileId) {
    const redirectPath = `/longevity/intake/${id}`;
    redirect(`/portal/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  const supabase = supabaseAdmin();
  const { data: intake, error } = await supabase
    .from("hli_longevity_intakes")
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (error || !intake || intake.profile_id !== profileId) {
    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">Intake not found</h1>
          <p className="mt-2 text-white/70">
            This assessment may not exist or you don’t have access to it.
          </p>
          <Link
            href="/longevity/start"
            className="mt-6 inline-block text-sm text-[rgb(var(--gold))] hover:underline"
          >
            Start a new assessment
          </Link>
          <span className="mx-2 text-white/40">·</span>
          <Link href="/portal/dashboard" className="text-sm text-white/60 hover:text-white/90">
            Go to dashboard
          </Link>
        </div>
      </main>
    );
  }

  redirect(`/longevity/start?resume=${id}`);
}
