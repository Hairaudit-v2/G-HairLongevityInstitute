import { redirect } from "next/navigation";
import Link from "next/link";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TrichologistProvisioningClient } from "@/components/longevity/TrichologistProvisioningClient";
import { PortalSignOut } from "@/components/longevity/PortalSignOut";

/**
 * Trichologist provisioning: list and add trichologists.
 * Access: existing trichologists only (so the first must be created via script).
 */
export default async function TrichologistProvisioningPage() {
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    redirect("/portal/login?redirect=/portal/trichologist/provisioning");
  }

  const supabase = supabaseAdmin();
  const { data: rows } = await supabase
    .from("hli_longevity_trichologists")
    .select("id, email, display_name, is_active, created_at")
    .order("created_at", { ascending: false });

  const list = (rows ?? []).map((r) => ({
    id: r.id,
    email: r.email ?? null,
    display_name: r.display_name ?? null,
    is_active: r.is_active ?? true,
    created_at: r.created_at,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
            Hair Longevity Institute™ — Trichologist management
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Trichologist provisioning</h1>
          <p className="mt-1 text-sm text-white/60">
            Add trichologists so they can access the review workspace. Only existing trichologists can open this page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PortalSignOut />
          <Link href="/portal/trichologist/review" className="text-sm text-white/70 hover:text-white">
            Review workspace
          </Link>
        </div>
      </div>

      <TrichologistProvisioningClient initialList={list} />
    </div>
  );
}
