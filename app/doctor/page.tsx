"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Referral = {
  id: string;
  intake_id: string;
  report_id: string | null;
  status: string;
  reason: string | null;
  patient_country: string | null;
  created_at: string;
  intake_summary: { full_name: string; dob: string; sex: string; primary_concern: string } | null;
};

type Doctor = { id: string; full_name: string; email: string };

export default function DoctorDashboardPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [sessionSet, setSessionSet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/doctors")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setDoctors((d.doctors ?? []).filter((x: Doctor & { active?: boolean }) => x.active !== false));
      });
  }, []);

  const handleSelectDoctor = async () => {
    if (!selectedDoctorId) return;
    const res = await fetch("/api/doctor/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: selectedDoctorId }),
    });
    const data = await res.json();
    if (data.ok) {
      setSessionSet(true);
      loadReferrals();
    } else {
      alert(data.error || "Failed");
    }
  };

  const loadReferrals = () => {
    setLoading(true);
    fetch("/api/doctor/referrals")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setReferrals(d.referrals ?? []);
      })
      .catch(() => setReferrals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionSet) loadReferrals();
  }, [sessionSet]);

  const handleLogout = async () => {
    await fetch("/api/doctor/session", { method: "DELETE" });
    setSessionSet(false);
    setReferrals([]);
    setSelectedDoctorId("");
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString();
    } catch {
      return s;
    }
  };

  if (!sessionSet) {
    return (
      <main className="min-h-screen bg-[#0F1B2D] text-white">
        <div className="mx-auto max-w-md px-6 py-20">
          <h1 className="text-2xl font-semibold">Doctor Portal</h1>
          <p className="mt-2 text-sm text-white/60">Select your identity to view assigned referrals.</p>
          <div className="mt-6">
            <label className="text-sm text-white/70">I am</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
            >
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} ({d.email})
                </option>
              ))}
            </select>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleSelectDoctor}
                disabled={!selectedDoctorId}
                className="rounded-lg bg-[rgb(198,167,94)] px-4 py-2 font-medium text-[#0F1B2D] disabled:opacity-50"
              >
                Continue
              </button>
              <Link href="/" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
                Back
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1B2D] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">My Referrals</h1>
            <p className="mt-1 text-sm text-white/60">Cases assigned to you for medical review.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-white/60 hover:text-white"
          >
            Switch doctor
          </button>
        </div>

        {loading ? (
          <div className="mt-10 text-white/60">Loading...</div>
        ) : (
          <div className="mt-8 space-y-3">
            {referrals.map((r) => (
              <Link
                key={r.id}
                href={`/doctor/referrals/${r.id}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <div className="font-medium">{r.intake_summary?.full_name ?? "—"}</div>
                <div className="mt-1 text-sm text-white/60">
                  {r.intake_summary?.primary_concern} • {r.patient_country || "—"}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                  <span>{r.status.replace(/_/g, " ")}</span>
                  <span>{formatDate(r.created_at)}</span>
                </div>
              </Link>
            ))}
            {referrals.length === 0 && !loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
                No referrals assigned to you.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
