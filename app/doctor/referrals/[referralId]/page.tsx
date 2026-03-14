"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type CaseData = {
  referral: { id: string; status: string; reason: string | null; decision_payload: unknown };
  intake: Record<string, unknown> | null;
  bloodMarkers: Array<{ name: string; value: unknown; unit?: string; flag?: string }>;
  imageSignals: unknown[];
  scores: { domain_scores: Record<string, number>; overall_score: number; risk_tier: string } | null;
  reportSignedUrl: string | null;
  files: Array<{ id: string; kind: string; filename: string; signed_url: string }>;
  notes: Array<{ author: string; author_type: string; note: string; created_at: string }>;
};

export default function DoctorReferralPage() {
  const params = useParams();
  const referralId = params?.referralId as string | undefined;
  const [data, setData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decisionStatus, setDecisionStatus] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [recommendationSummary, setRecommendationSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!referralId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/doctor/referrals/${referralId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setData(d);
        else setError(d.error || "Failed to load");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [referralId]);

  const handleDecision = async () => {
    if (!referralId || !decisionStatus) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        status: decisionStatus,
        note: decisionNote || undefined,
      };
      if (decisionStatus === "approved") {
        if (recommendationSummary) body.recommendation_summary = recommendationSummary;
      }
      const res = await fetch(`/api/doctor/referrals/${referralId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.ok) {
        setData((prev) =>
          prev ? { ...prev, referral: { ...prev.referral, status: decisionStatus } } : null
        );
        setDecisionStatus("");
        setDecisionNote("");
        setRecommendationSummary("");
      } else {
        alert(result.error || "Failed");
      }
    } catch {
      alert("Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString();
    } catch {
      return s;
    }
  };

  if (!referralId) return <div className="min-h-screen bg-[#0F1B2D]" />;
  if (loading && !data) {
    return (
      <main className="min-h-screen bg-[#0F1B2D] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-white/60">Loading...</div>
        </div>
      </main>
    );
  }
  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#0F1B2D] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            {error || "Not found"}
          </div>
          <Link href="/doctor" className="mt-4 inline-block text-[rgb(198,167,94)] hover:underline">
            ← Back to referrals
          </Link>
        </div>
      </main>
    );
  }

  const canDecide = !["approved", "declined", "completed"].includes(data.referral.status);

  return (
    <main className="min-h-screen bg-[#0F1B2D] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/doctor" className="text-sm text-white/60 hover:text-white">
          ← Back to referrals
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Medical Review</h1>
        <div className="mt-2 text-sm text-white/60">
          Status: {data.referral.status.replace(/_/g, " ")}
        </div>

        <div className="mt-8 space-y-8">
          {/* Intake summary */}
          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-medium text-[rgb(198,167,94)]">Patient summary</h2>
            {data.intake && (
              <div className="mt-4 grid gap-2 text-sm">
                <div>Name: {String(data.intake.full_name ?? "—")}</div>
                <div>DOB: {String(data.intake.dob ?? "—")}</div>
                <div>Sex: {String(data.intake.sex ?? "—")}</div>
                <div>Country: {String(data.intake.country ?? "—")}</div>
                <div>Primary concern: {String(data.intake.primary_concern ?? "—")}</div>
                {data.intake.selections != null ? (
                  <div className="mt-2 text-white/70">
                    Selections: {JSON.stringify(data.intake.selections)}
                  </div>
                ) : null}
              </div>
            )}
          </section>

          {/* Report */}
          {data.reportSignedUrl && (
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-medium text-[rgb(198,167,94)]">Diagnostic report</h2>
              <a
                href={data.reportSignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-[rgb(198,167,94)] hover:underline"
              >
                View PDF
              </a>
            </section>
          )}

          {/* Blood markers */}
          {data.bloodMarkers.length > 0 && (
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-medium text-[rgb(198,167,94)]">Blood markers</h2>
              <div className="mt-4 space-y-1 text-sm">
                {data.bloodMarkers.map((m) => (
                  <div key={m.name}>
                    {m.name}: {String(m.value)} {m.unit ?? ""} {m.flag ? `[${m.flag}]` : ""}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Files */}
          {data.files.length > 0 && (
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-medium text-[rgb(198,167,94)]">Uploads</h2>
              <div className="mt-4 space-y-2">
                {data.files.map((f) => (
                  <a
                    key={f.id}
                    href={f.signed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-white/80 hover:text-[rgb(198,167,94)]"
                  >
                    {f.filename} ({f.kind})
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {data.notes.length > 0 && (
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-medium text-[rgb(198,167,94)]">Notes</h2>
              <div className="mt-4 space-y-3">
                {data.notes.map((n) => (
                  <div key={n.created_at} className="rounded border border-white/5 bg-black/10 p-3 text-sm">
                    <div className="text-white/60">
                      {n.author} ({n.author_type}) • {formatDate(n.created_at)}
                    </div>
                    <div className="mt-1">{n.note}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Decision */}
          {canDecide && (
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-medium text-[rgb(198,167,94)]">Your decision</h2>
              <p className="mt-2 text-xs text-white/60">
                This does not generate a prescription. You provide an independent clinical decision and recommendation.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["needs_more_info", "approved", "declined", "completed"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDecisionStatus(s)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      decisionStatus === s
                        ? "bg-[rgb(198,167,94)] text-[#0F1B2D]"
                        : "border border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
              {decisionStatus === "approved" && (
                <div className="mt-4">
                  <label className="text-sm text-white/70">Recommendation summary (non-dosing)</label>
                  <textarea
                    value={recommendationSummary}
                    onChange={(e) => setRecommendationSummary(e.target.value)}
                    placeholder="e.g. Patient may benefit from DHT modulation discussion with prescribing clinician..."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
              )}
              <div className="mt-4">
                <label className="text-sm text-white/70">Note</label>
                <textarea
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  rows={2}
                />
              </div>
              <button
                type="button"
                onClick={handleDecision}
                disabled={submitting}
                className="mt-4 rounded-lg bg-[rgb(198,167,94)] px-4 py-2 font-medium text-[#0F1B2D] disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit decision"}
              </button>
            </section>
          )}

          {!canDecide && (
            <div className="text-sm text-white/60">
              This referral has been closed ({data.referral.status}).
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
