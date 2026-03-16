import Link from "next/link";
import { redirect } from "next/navigation";
import { getTrichologistFromRequest } from "@/lib/longevity/trichologistAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getExceptions } from "@/lib/longevity/exceptions";
import { PortalSignOut } from "@/components/longevity/PortalSignOut";
import type {
  StartedNeverSubmittedRow,
  SubmittedNoDocumentsRow,
  SubmittedNeverClaimedRow,
  ClaimedNoNoteRow,
  ReleasedNotViewedRow,
  AwaitingPatientDocumentsRow,
} from "@/lib/longevity/exceptions";

function ageLabel(hours: number): string {
  if (hours < 1) return "< 1 h";
  if (hours < 24) return `${Math.round(hours)} h`;
  return `${(hours / 24).toFixed(1)} d`;
}

type PageProps = { searchParams: Promise<{ olderThan?: string }> };

export default async function TrichologistExceptionsPage({ searchParams }: PageProps) {
  const trichologist = await getTrichologistFromRequest();
  if (!trichologist) {
    redirect("/portal/login?redirect=/portal/trichologist/exceptions");
  }

  const params = await searchParams;
  const olderThan = params.olderThan?.trim() || "all";

  const supabase = supabaseAdmin();
  const data = await getExceptions(supabase, { olderThan });

  const periodLabel =
    olderThan === "all"
      ? "All"
      : olderThan === "24h"
        ? "Older than 24 h"
        : olderThan === "72h"
          ? "Older than 72 h"
          : olderThan === "7d"
            ? "Older than 7 d"
            : "All";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
            Hair Longevity Institute™ — Operational exceptions
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Backlog & exceptions</h1>
          <p className="mt-1 text-sm text-white/60">
            Cases stuck or leaking in the workflow. Deterministic rules from audit events and intake state.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PortalSignOut />
          <Link href="/portal/trichologist/review" className="text-sm text-white/70 hover:text-white">
            Review workspace
          </Link>
          <Link href="/portal/trichologist/insights" className="text-sm text-white/70 hover:text-white">
            Beta insights
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/50">Show:</span>
        <div className="flex rounded-lg border border-white/20 bg-white/5 p-0.5">
          <Link
            href="/portal/trichologist/exceptions?olderThan=all"
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              olderThan === "all" ? "bg-white/15 text-white" : "text-white/70 hover:text-white/90"
            }`}
          >
            All
          </Link>
          <Link
            href="/portal/trichologist/exceptions?olderThan=24h"
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              olderThan === "24h" ? "bg-white/15 text-white" : "text-white/70 hover:text-white/90"
            }`}
          >
            &gt; 24 h
          </Link>
          <Link
            href="/portal/trichologist/exceptions?olderThan=72h"
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              olderThan === "72h" ? "bg-white/15 text-white" : "text-white/70 hover:text-white/90"
            }`}
          >
            &gt; 72 h
          </Link>
          <Link
            href="/portal/trichologist/exceptions?olderThan=7d"
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              olderThan === "7d" ? "bg-white/15 text-white" : "text-white/70 hover:text-white/90"
            }`}
          >
            &gt; 7 d
          </Link>
        </div>
        <span className="text-xs text-white/40">({periodLabel})</span>
      </div>

      {/* 1. Started but never submitted */}
      <ExceptionSection
        title="Started but never submitted"
        count={data.started_never_submitted.length}
        explanation="Intake has intake_started event but no intake_submitted for that intake."
        rows={data.started_never_submitted}
        columns={[
          { key: "intake_id", label: "Intake", render: (r: StartedNeverSubmittedRow) => r.intake_id },
          { key: "profile_id", label: "Profile", render: (r: StartedNeverSubmittedRow) => r.profile_id ?? "—" },
          { key: "started_at", label: "Started", render: (r: StartedNeverSubmittedRow) => new Date(r.started_at).toLocaleString() },
          { key: "age_hours", label: "Age", render: (r: StartedNeverSubmittedRow) => ageLabel(r.age_hours) },
        ]}
        intakeIdKey="intake_id"
      />

      {/* 2. Submitted but no documents */}
      <ExceptionSection
        title="Submitted but no documents"
        count={data.submitted_no_documents.length}
        explanation="Intake has intake_submitted but no rows in hli_longevity_documents for that intake."
        rows={data.submitted_no_documents}
        columns={[
          { key: "intake_id", label: "Intake", render: (r: SubmittedNoDocumentsRow) => r.intake_id },
          { key: "profile_id", label: "Profile", render: (r: SubmittedNoDocumentsRow) => r.profile_id ?? "—" },
          { key: "submitted_at", label: "Submitted", render: (r: SubmittedNoDocumentsRow) => new Date(r.submitted_at).toLocaleString() },
          { key: "age_hours", label: "Age", render: (r: SubmittedNoDocumentsRow) => ageLabel(r.age_hours) },
        ]}
        intakeIdKey="intake_id"
      />

      {/* 3. Submitted but never claimed */}
      <ExceptionSection
        title="Submitted but never claimed"
        count={data.submitted_never_claimed.length}
        explanation="Intake has intake_submitted but no case_assigned event for that intake."
        rows={data.submitted_never_claimed}
        columns={[
          { key: "intake_id", label: "Intake", render: (r: SubmittedNeverClaimedRow) => r.intake_id },
          { key: "profile_id", label: "Profile", render: (r: SubmittedNeverClaimedRow) => r.profile_id ?? "—" },
          { key: "submitted_at", label: "Submitted", render: (r: SubmittedNeverClaimedRow) => new Date(r.submitted_at).toLocaleString() },
          { key: "review_priority", label: "Priority", render: (r: SubmittedNeverClaimedRow) => r.review_priority ?? "—" },
          { key: "age_hours", label: "Age", render: (r: SubmittedNeverClaimedRow) => ageLabel(r.age_hours) },
        ]}
        intakeIdKey="intake_id"
      />

      {/* 4. Claimed but no note */}
      <ExceptionSection
        title="Claimed but no note added"
        count={data.claimed_no_note.length}
        explanation="Intake has case_assigned but no note_added event for that intake."
        rows={data.claimed_no_note}
        columns={[
          { key: "intake_id", label: "Intake", render: (r: ClaimedNoNoteRow) => r.intake_id },
          { key: "profile_id", label: "Profile", render: (r: ClaimedNoNoteRow) => r.profile_id ?? "—" },
          { key: "claimed_at", label: "Claimed", render: (r: ClaimedNoNoteRow) => new Date(r.claimed_at).toLocaleString() },
          { key: "age_hours", label: "Age", render: (r: ClaimedNoNoteRow) => ageLabel(r.age_hours) },
        ]}
        intakeIdKey="intake_id"
      />

      {/* 5. Released but not viewed */}
      <ExceptionSection
        title="Released but not viewed"
        count={data.released_not_viewed.length}
        explanation="Intake has summary_released but no summary_viewed event for that intake."
        rows={data.released_not_viewed}
        columns={[
          { key: "intake_id", label: "Intake", render: (r: ReleasedNotViewedRow) => r.intake_id },
          { key: "profile_id", label: "Profile", render: (r: ReleasedNotViewedRow) => r.profile_id ?? "—" },
          { key: "released_at", label: "Released", render: (r: ReleasedNotViewedRow) => new Date(r.released_at).toLocaleString() },
          { key: "age_hours", label: "Age", render: (r: ReleasedNotViewedRow) => ageLabel(r.age_hours) },
        ]}
        intakeIdKey="intake_id"
      />

      {/* 6. Awaiting patient documents */}
      <ExceptionSection
        title="Awaiting patient documents"
        count={data.awaiting_patient_documents.length}
        explanation="review_status = awaiting_patient_documents. No recent upload after that state."
        rows={data.awaiting_patient_documents}
        columns={[
          { key: "intake_id", label: "Intake", render: (r: AwaitingPatientDocumentsRow) => r.intake_id },
          { key: "profile_id", label: "Profile", render: (r: AwaitingPatientDocumentsRow) => r.profile_id },
          { key: "last_reviewed_at", label: "Last reviewed", render: (r: AwaitingPatientDocumentsRow) => r.last_reviewed_at ? new Date(r.last_reviewed_at).toLocaleString() : "—" },
          { key: "age_hours", label: "Age", render: (r: AwaitingPatientDocumentsRow) => ageLabel(r.age_hours) },
        ]}
        intakeIdKey="intake_id"
      />
    </div>
  );
}

type Col<T> = { key: string; label: string; render: (r: T) => React.ReactNode };

function ExceptionSection<T extends Record<string, unknown>>({
  title,
  count,
  explanation,
  rows,
  columns,
  intakeIdKey,
}: {
  title: string;
  count: number;
  explanation: string;
  rows: T[];
  columns: Col<T>[];
  intakeIdKey: keyof T;
}) {
  const intakeId = (r: T) => String(r[intakeIdKey] ?? "");
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 text-xs text-white/50">{explanation}</p>
      <p className="mt-1 text-sm text-white/70">
        <strong>{count}</strong> {count === 1 ? "case" : "cases"}
      </p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-white/50">None in this period.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-white/70">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-2 font-medium">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 text-white/90">
                  {columns.map((col) => (
                    <td key={col.key} className="max-w-[10rem] truncate px-4 py-2">
                      {col.render(row)}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <Link
                      href={`/portal/trichologist/review?intake=${encodeURIComponent(intakeId(row))}`}
                      className="text-[rgb(var(--gold))] hover:underline"
                    >
                      Open case
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
