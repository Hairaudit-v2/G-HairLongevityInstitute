/**
 * Short confirmation after returning from Stripe Checkout (search param welcome=*).
 */

const WELCOME_COPY: Record<string, string> = {
  "blood-letter":
    "Your blood request letter access is active. Scroll to your blood request and use “Generate letter” when you are ready.",
  "blood-review":
    "Your follow-up blood analysis review access is active. Upload results in your portal when available so your clinician can review them in context.",
  membership:
    "Welcome to membership. Blood request letters, blood analysis reviews, and ongoing support are included for as long as your subscription stays active.",
  appointment:
    "Your appointment booking fee is paid. Email the team to schedule your one-on-one trichologist session.",
  paid: "Thank you — your payment was received. Your account should reflect the update below.",
};

export function PortalCheckoutWelcome({ welcome }: { welcome?: string | null }) {
  if (!welcome) return null;
  const text = WELCOME_COPY[welcome] ?? WELCOME_COPY.paid;
  return (
    <div
      className="rounded-2xl border border-emerald-400/25 bg-emerald-950/35 p-4 text-sm leading-relaxed text-emerald-50/95"
      role="status"
    >
      <p className="font-medium text-emerald-100/95">Payment confirmed</p>
      <p className="mt-2 text-emerald-50/90">{text}</p>
    </div>
  );
}
