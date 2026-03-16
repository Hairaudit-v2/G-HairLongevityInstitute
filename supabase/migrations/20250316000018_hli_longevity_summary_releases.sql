-- Release snapshot storage for longevity: what was actually released to the patient.
-- Additive only. One row per release; supports traceability and clinician review of released output.

create table if not exists hli_longevity_summary_releases (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  summary_text_snapshot text not null,
  released_at timestamptz not null default now(),
  released_by_trichologist_id uuid references hli_longevity_trichologists(id) on delete set null
);

create index if not exists idx_hli_longevity_summary_releases_intake
  on hli_longevity_summary_releases(intake_id);
create index if not exists idx_hli_longevity_summary_releases_released_at
  on hli_longevity_summary_releases(released_at desc);

comment on table hli_longevity_summary_releases is 'Snapshot of patient-visible summary at release time. For audit and clinician visibility of what was sent.';
