import type { BillingSnapshot } from "@/lib/payment/billingSnapshot";
import { PortalBillingPortalButton } from "@/components/longevity/PortalBillingPortalButton";

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function EntitlementBlock({
  title,
  staffLine,
  plainEnglish,
}: {
  title: string;
  staffLine: string;
  plainEnglish: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/45">{title}</p>
      <p className="mt-2 text-[11px] leading-snug text-amber-100/75">
        <span className="font-medium text-amber-200/90">Support reference: </span>
        {staffLine}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/88">{plainEnglish}</p>
    </div>
  );
}

export function PortalBillingCard({ snapshot }: { snapshot: BillingSnapshot }) {
  const { detailed, ledger, stripeBillingPortalAvailable } = snapshot;
  const m = detailed.membershipActive;
  const periodEnd = detailed.membershipCurrentPeriodEnd;

  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
      aria-labelledby="billing-account-heading"
    >
      <h2 id="billing-account-heading" className="text-base font-semibold text-white">
        Account &amp; billing
      </h2>
      <p className="mt-1 text-sm text-white/65">
        What you have access to, in plain language. The amber lines are short labels our team uses when looking up your
        account.
      </p>

      <div className="mt-4 space-y-3 border-b border-white/10 pb-4 text-sm text-white/85">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
          <span className="text-white/60">Membership</span>
          <span className="font-medium text-white">
            {m ? "Active" : "Not subscribed"}
            {m && periodEnd ? (
              <span className="block text-xs font-normal text-white/55 sm:inline sm:pl-2">
                Current period ends {fmtDate(periodEnd)}
              </span>
            ) : null}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-white/55">
          {m
            ? "Includes blood request letters, follow-up blood analysis reviews, and ongoing support while your subscription is active. Cancel any time from the billing portal below."
            : "Membership includes blood request letters, blood analysis reviews, and ongoing support while active. Cancel any time — no long lock-in."}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <EntitlementBlock
          title="Blood request letter"
          staffLine={detailed.bloodRequestLetter.staffSummaryLine}
          plainEnglish={detailed.bloodRequestLetter.plainEnglishAccess}
        />
        <EntitlementBlock
          title="Blood analysis review"
          staffLine={detailed.bloodAnalysisReview.staffSummaryLine}
          plainEnglish={detailed.bloodAnalysisReview.plainEnglishAccess}
        />
        <EntitlementBlock
          title="Trichologist appointment"
          staffLine={detailed.trichologistAppointment.staffSummaryLine}
          plainEnglish={detailed.trichologistAppointment.plainEnglishAccess}
        />
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-white/70">
        <span className="text-white/50">Ongoing support: </span>
        {detailed.ongoingSupport ? (
          <span>Included with your active membership.</span>
        ) : (
          <span>Available when you have an active membership.</span>
        )}
      </div>

      {stripeBillingPortalAvailable ? (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-xs text-white/50">
            Update your card, download invoices, or cancel renewal in Stripe&apos;s secure billing portal. Cancellation
            stops future charges; access continues until the end of the paid period.
          </p>
          <div className="mt-3">
            <PortalBillingPortalButton />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-white/45">
          Billing management opens after your first Stripe checkout (membership or paid add-on).
        </p>
      )}

      {ledger.length > 0 ? (
        <div className="mt-6 border-t border-white/10 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-white/45">Recent account activity</h3>
          <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-xs text-white/55">
            {ledger.slice(0, 8).map((row) => (
              <li key={row.id} className="border-l border-white/10 pl-2">
                <span className="text-white/40">{fmtDate(row.recorded_at)}</span> — {row.summary}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
