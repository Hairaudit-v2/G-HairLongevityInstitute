"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { EDITORIAL_EVENT } from "@/lib/analytics/editorialEvents";
import { EDITORIAL_CONTENT_TYPES, type EditorialContentType } from "@/lib/content/types";

const HUBS = [
  { value: "all", label: "All hubs" },
  { value: "conditions", label: "Conditions" },
  { value: "blood-markers", label: "Blood markers" },
  { value: "treatments", label: "Treatments" },
  { value: "hair-loss-causes", label: "Hair loss causes" },
] as const;

const AUDIENCES = [
  { value: "all", label: "All audiences" },
  { value: "patients", label: "Patients" },
  { value: "clinicians", label: "Clinicians" },
] as const;

const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
] as const;

const CONTENT_TYPES: { value: "all" | EditorialContentType; label: string }[] = [
  { value: "all", label: "All formats" },
  ...EDITORIAL_CONTENT_TYPES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })),
];

function buildInsightsUrl(sp: URLSearchParams): string {
  const qs = sp.toString();
  return qs ? `/insights?${qs}` : "/insights";
}

export default function EditorialSearchPanel() {
  const router = useRouter();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const hub = params.get("hub") ?? "all";
  const audience = params.get("audience") ?? "all";
  const contentType = params.get("contentType") ?? "all";
  const sort = params.get("sort") ?? "newest";
  const topic = params.get("topic") ?? "";

  const formKey = `${q}|${hub}|${audience}|${contentType}|${sort}|${topic}`;

  function applyUpdates(updates: Record<string, string | undefined>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === "" || v === "all") sp.delete(k);
      else sp.set(k, v);
    }
    router.push(buildInsightsUrl(sp));
  }

  return (
    <form
      key={formKey}
      className="space-y-4 rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const nextQ = ((fd.get("q") as string) ?? "").trim();
        track(EDITORIAL_EVENT.SEARCH_SUBMIT, {
          q_len: String(nextQ.length),
          hub: String(fd.get("hub") ?? "all"),
        });
        applyUpdates({
          q: nextQ || undefined,
          hub: (fd.get("hub") as string) || undefined,
          audience: (fd.get("audience") as string) || undefined,
          contentType: (fd.get("contentType") as string) || undefined,
          sort: (fd.get("sort") as string) || undefined,
          topic: topic || undefined,
        });
      }}
    >
      <div>
        <label htmlFor="insights-q" className="sr-only">
          Search insights
        </label>
        <input
          id="insights-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search causes, markers, treatments…"
          className="w-full rounded-btn border border-[rgb(var(--border-soft))] bg-subtle/40 px-4 py-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:border-[rgb(var(--gold))]/40 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/25"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="insights-hub" className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">
            Hub
          </label>
          <select
            id="insights-hub"
            name="hub"
            defaultValue={hub}
            className="w-full rounded-btn border border-[rgb(var(--border-soft))] bg-card px-3 py-2 text-sm text-[rgb(var(--text-primary))]"
            onChange={(e) => {
              track(EDITORIAL_EVENT.SEARCH_FILTER, { field: "hub", value: e.target.value });
              applyUpdates({
                hub: e.target.value,
                audience,
                contentType,
                sort,
                q: q || undefined,
                topic: topic || undefined,
              });
            }}
          >
            {HUBS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="insights-audience" className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">
            Audience
          </label>
          <select
            id="insights-audience"
            name="audience"
            defaultValue={audience}
            className="w-full rounded-btn border border-[rgb(var(--border-soft))] bg-card px-3 py-2 text-sm text-[rgb(var(--text-primary))]"
            onChange={(e) => {
              track(EDITORIAL_EVENT.SEARCH_FILTER, { field: "audience", value: e.target.value });
              applyUpdates({
                hub,
                audience: e.target.value,
                contentType,
                sort,
                q: q || undefined,
                topic: topic || undefined,
              });
            }}
          >
            {AUDIENCES.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="insights-content-type" className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">
            Format
          </label>
          <select
            id="insights-content-type"
            name="contentType"
            defaultValue={contentType}
            className="w-full rounded-btn border border-[rgb(var(--border-soft))] bg-card px-3 py-2 text-sm text-[rgb(var(--text-primary))]"
            onChange={(e) => {
              track(EDITORIAL_EVENT.SEARCH_FILTER, { field: "contentType", value: e.target.value });
              applyUpdates({
                hub,
                audience,
                contentType: e.target.value,
                sort,
                q: q || undefined,
                topic: topic || undefined,
              });
            }}
          >
            {CONTENT_TYPES.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="insights-sort" className="mb-1 block text-xs font-medium text-[rgb(var(--text-muted))]">
            Sort
          </label>
          <select
            id="insights-sort"
            name="sort"
            defaultValue={sort}
            className="w-full rounded-btn border border-[rgb(var(--border-soft))] bg-card px-3 py-2 text-sm text-[rgb(var(--text-primary))]"
            onChange={(e) => {
              track(EDITORIAL_EVENT.SEARCH_FILTER, { field: "sort", value: e.target.value });
              applyUpdates({
                hub,
                audience,
                contentType,
                sort: e.target.value,
                q: q || undefined,
                topic: topic || undefined,
              });
            }}
          >
            {SORTS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {topic ? <input type="hidden" name="topic" value={topic} /> : null}
      <button
        type="submit"
        className="inline-flex min-h-[44px] items-center justify-center rounded-btn border border-[rgb(var(--medical))]/30 bg-medical/10 px-5 py-2.5 text-sm font-semibold text-medical hover:bg-medical/15"
      >
        Search
      </button>
    </form>
  );
}
