"use client";

import { useState, useRef } from "react";

type BloodRequestForPatient = {
  id: string;
  intake_id: string;
  recommended_tests: string[];
  reason: string | null;
  status: string;
  created_at: string;
  letter_document_id: string | null;
};

const BLOOD_TEST_UPLOAD_DOC_TYPE = "blood_test_upload";

export function BloodRequestLetterCard({ br }: { br: BloodRequestForPatient }) {
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/longevity/blood-requests/${br.id}/generate-letter`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Failed to generate letter");
        return;
      }
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleUploadReturnedResults = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("intakeId", br.intake_id);
      formData.set("bloodRequestId", br.id);
      formData.set("docType", BLOOD_TEST_UPLOAD_DOC_TYPE);
      formData.set("file", file);
      const res = await fetch("/api/longevity/documents/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const statusLabel =
    br.status === "letter_generated"
      ? "Letter ready"
      : br.status === "results_uploaded"
        ? "Results uploaded"
        : br.status === "completed"
          ? "Completed"
          : br.status === "pending"
            ? "Pending"
            : br.status.replace(/_/g, " ");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs text-white/50">
        Request from {new Date(br.created_at).toLocaleDateString()} · status: {statusLabel}
      </p>
      {br.reason && <p className="mt-2 text-sm text-white/70">{br.reason}</p>}
      {br.recommended_tests.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {br.recommended_tests.map((code) => (
            <li
              key={code}
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/90 capitalize"
            >
              {code.replace(/_/g, " ")}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {br.letter_document_id ? (
          <a
            href={`/api/longevity/blood-requests/${br.id}/letter-download`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-xl border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-4 py-2 text-sm font-medium text-white hover:bg-[rgb(var(--gold))]/20"
          >
            Download GP support letter
          </a>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex rounded-xl border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-4 py-2 text-sm font-medium text-white hover:bg-[rgb(var(--gold))]/20 disabled:opacity-50"
          >
            {generating ? "Generating…" : "Generate GP support letter"}
          </button>
        )}
      </div>

      {/* Upload returned blood results (Phase F): after letter is generated, patient can upload results */}
      {br.status === "letter_generated" && br.letter_document_id && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-white/90">Upload returned blood results</p>
          <p className="mt-1 text-xs text-white/60">
            After your GP has requested tests and you have your results, upload them here (PDF or image).
          </p>
          <form onSubmit={handleUploadReturnedResults} className="mt-3 flex flex-wrap items-end gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="block w-full max-w-xs text-sm text-white/80 file:mr-2 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white"
              aria-label="Choose file"
            />
            <button
              type="submit"
              disabled={uploading}
              className="rounded-xl border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-4 py-2 text-sm font-medium text-white hover:bg-[rgb(var(--gold))]/20 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload results"}
            </button>
          </form>
        </div>
      )}
      {br.status === "results_uploaded" && (
        <p className="mt-3 text-sm text-emerald-200/90">
          Returned blood results have been uploaded. You can start a follow-up reassessment when ready.
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-white/50">
        This is a support letter for your GP, not a pathology order. Your GP decides which tests to request.
      </p>
    </div>
  );
}
