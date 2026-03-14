"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Referral = {
  id: string;
  intake_id: string;
  report_id: string | null;
  status: string;
  reason: string | null;
  assigned_doctor_id: string | null;
  patient_country: string | null;
  created_at: string;
  updated_at: string;
  doctor: { id: string; full_name: string; email: string } | null;
  intake: { id: string; full_name: string; primary_concern: string; country: string | null } | null;
};

type Doctor = { id: string; full_name: string; email: string; active?: boolean };

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignDoctorId, setAssignDoctorId] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/referrals${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setReferrals(d.referrals ?? []);
      })
      .finally(() => setLoading(false));
  };

  const loadDoctors = () => {
    fetch("/api/admin/doctors")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setDoctors(d.doctors ?? []);
      });
  };

  useEffect(() => {
    load();
    loadDoctors();
  }, [statusFilter]);

  const handleAssign = async (referralId: string) => {
    const doctorId = assignDoctorId[referralId];
    if (!doctorId) {
      alert("Select a doctor");
      return;
    }
    setAssigning(referralId);
    try {
      const res = await fetch(`/api/admin/referrals/${referralId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId }),
      });
      const data = await res.json();
      if (data.ok) {
        load();
        setAssignDoctorId((prev) => ({ ...prev, [referralId]: "" }));
      } else {
        alert(data.error || "Failed");
      }
    } catch {
      alert("Failed");
    } finally {
      setAssigning(null);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString();
    } catch {
      return s;
    }
  };

  const statusColors: Record<string, string> = {
    pending: "text-amber-400",
    assigned: "text-blue-400",
    in_review: "text-cyan-400",
    needs_more_info: "text-orange-400",
    approved: "text-green-400",
    declined: "text-red-400",
    completed: "text-white/60",
  };

  return (
    <main className="min-h-screen bg-[#0F1B2D] text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-white/60 hover:text-white">
              ← Admin
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">Medical Referrals (AU)</h1>
            <p className="mt-1 text-sm text-white/60">Assign doctors and track review status.</p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_review">In review</option>
            <option value="needs_more_info">Needs more info</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="mt-10 text-white/60">Loading...</div>
        ) : (
          <div className="mt-8 space-y-3">
            {referrals.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.intake?.full_name ?? "—"}</span>
                      <span className={`text-xs ${statusColors[r.status] ?? ""}`}>
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      {r.intake?.primary_concern} • {r.patient_country || r.intake?.country || "—"}
                    </div>
                    {r.reason && (
                      <div className="mt-1 text-xs text-white/50">Reason: {r.reason}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.status === "pending" && (
                      <>
                        <select
                          value={assignDoctorId[r.id] ?? ""}
                          onChange={(e) =>
                            setAssignDoctorId((prev) => ({ ...prev, [r.id]: e.target.value }))
                          }
                          className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white"
                        >
                          <option value="">Select doctor</option>
                          {doctors
                            .filter((d) => d.active !== false)
                            .map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.full_name}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAssign(r.id)}
                          disabled={assigning === r.id || !assignDoctorId[r.id]}
                          className="rounded-lg bg-[rgb(198,167,94)] px-3 py-1.5 text-sm font-medium text-[#0F1B2D] disabled:opacity-50"
                        >
                          {assigning === r.id ? "Assigning..." : "Assign"}
                        </button>
                      </>
                    )}
                    {r.doctor && (
                      <span className="text-sm text-white/70">Assigned: {r.doctor.full_name}</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-sm">
                  <Link
                    href={`/audits/${r.intake_id}`}
                    className="text-[rgb(198,167,94)] hover:underline"
                  >
                    View audit
                  </Link>
                  <Link
                    href={`/doctor/referrals/${r.id}`}
                    className="text-white/60 hover:text-white"
                  >
                    Doctor view
                  </Link>
                </div>
              </div>
            ))}
            {referrals.length === 0 && !loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
                No referrals. Create from the auditor page (Request Medical Review).
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
