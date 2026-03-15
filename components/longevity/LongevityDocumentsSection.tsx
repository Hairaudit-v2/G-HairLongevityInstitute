"use client";

import { useCallback, useEffect, useState } from "react";

export type LongevityDocumentMeta = {
  id: string;
  intake_id?: string | null;
  profile_id?: string | null;
  doc_type: string;
  filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

function formatSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDocType(docType: string): string {
  return docType.replace(/_/g, " ");
}

export function LongevityDocumentsSection({
  documents: initialDocuments,
}: {
  documents: LongevityDocumentMeta[];
}) {
  const [documents, setDocuments] = useState<LongevityDocumentMeta[]>(initialDocuments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/longevity/documents");
      const json = await res.json();
      if (res.ok && json.ok && Array.isArray(json.documents)) {
        setDocuments(json.documents);
      }
    } catch {
      // keep current list
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openDocument = useCallback(async (id: string) => {
    setError(null);
    setLoadingId(id);
    try {
      const res = await fetch(`/api/longevity/documents/${id}/signed-url`);
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Could not open document.");
        return;
      }
      window.open(json.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open document.");
    } finally {
      setLoadingId(null);
    }
  }, []);

  return (
    <section className="mt-10 border-t border-white/10 pt-8" aria-labelledby="documents-heading">
      <h2 id="documents-heading" className="text-lg font-semibold text-white">
        Documents
      </h2>
      <p className="mt-1 text-sm text-white/60">
        All documents you’ve uploaded across your intakes (newest first). Each document stays linked to the intake you uploaded it to; you can add more to any intake during a draft or after submission. Open to view or download (link expires in 1 hour).
      </p>
      {error && (
        <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}
      <div className="mt-4 space-y-3">
        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-white/50">
            No documents yet. Upload from the intake flow (during a draft or after submission) or when resuming a draft.
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-white truncate">
                  {doc.filename || "Unnamed file"}
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  {formatDocType(doc.doc_type)} · {formatSize(doc.size_bytes)} ·{" "}
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openDocument(doc.id)}
                disabled={loadingId === doc.id}
                className="rounded-xl border border-[rgb(var(--gold))]/50 bg-[rgb(var(--gold))]/10 px-4 py-2 text-sm font-medium text-white hover:bg-[rgb(var(--gold))]/20 disabled:opacity-50"
              >
                {loadingId === doc.id ? "Opening…" : "Open"}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
