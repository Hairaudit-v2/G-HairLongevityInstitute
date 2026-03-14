"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Doctor = {
  id: string;
  full_name: string;
  email: string;
  country: string;
  license_number: string | null;
  registration_body: string | null;
  specialty: string | null;
  active: boolean;
  created_at: string;
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [license_number, setLicenseNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addingMultiple, setAddingMultiple] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/doctors")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setDoctors(d.doctors ?? []);
        else setError(d.error || "Failed");
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!full_name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: full_name.trim(),
          email: email.trim(),
          license_number: license_number.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setFullName("");
        setEmail("");
        setLicenseNumber("");
        setFormOpen(false);
        load();
      } else {
        alert(data.error || "Failed");
      }
    } catch {
      alert("Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddThree = async () => {
    setAddingMultiple(true);
    const three = [
      { full_name: "Dr. Sarah Chen", email: "sarah.chen@hli.example.au", license_number: "MED123456" },
      { full_name: "Dr. James Wilson", email: "james.wilson@hli.example.au", license_number: "MED234567" },
      { full_name: "Dr. Emma Taylor", email: "emma.taylor@hli.example.au", license_number: "MED345678" },
    ];
    for (const d of three) {
      await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
    }
    load();
    setAddingMultiple(false);
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    const res = await fetch(`/api/admin/doctors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    const data = await res.json();
    if (data.ok) load();
    else alert(data.error || "Failed");
  };

  return (
    <main className="min-h-screen bg-[#0F1B2D] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-white/60 hover:text-white">
              ← Admin
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">Doctors (AU)</h1>
            <p className="mt-1 text-sm text-white/60">Manage Australian doctors for medical review.</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setFormOpen(!formOpen)}
            className="rounded-lg bg-[rgb(198,167,94)] px-4 py-2 text-sm font-semibold text-[#0F1B2D] hover:opacity-90"
          >
            {formOpen ? "Cancel" : "Add doctor"}
          </button>
          <button
            type="button"
            onClick={handleAddThree}
            disabled={addingMultiple}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            Add 3 sample doctors
          </button>
        </div>

        {formOpen && (
          <form onSubmit={handleAdd} className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-medium">New doctor</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Full name *</label>
                <input
                  value={full_name}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">License number (optional)</label>
                <input
                  value={license_number}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  placeholder="AHPRA MED123456"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[rgb(198,167,94)] px-4 py-2 text-sm font-semibold text-[#0F1B2D] disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="text-sm text-white/60 hover:text-white">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="mt-10 text-white/60">Loading...</div>
        ) : (
          <div className="mt-8 space-y-2">
            {doctors.map((d) => (
              <div
                key={d.id}
                className={`flex items-center justify-between rounded-xl border p-4 ${
                  d.active ? "border-white/10 bg-white/5" : "border-white/5 bg-white/5 opacity-60"
                }`}
              >
                <div>
                  <div className="font-medium">{d.full_name}</div>
                  <div className="text-sm text-white/60">{d.email}</div>
                  {d.license_number && (
                    <div className="mt-1 text-xs text-white/50">{d.license_number}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleActive(d.id, d.active)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${
                    d.active
                      ? "border border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                      : "border border-green-500/50 text-green-400 hover:bg-green-500/10"
                  }`}
                >
                  {d.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
            {doctors.length === 0 && !loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
                No doctors. Add doctors to assign medical referrals.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
