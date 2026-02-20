-- Hair Longevity Institute: AI Pipeline Extension
-- Non-destructive migrations only. Existing tables unchanged.

-- hli_ai_jobs: track async AI extraction/scoring jobs
create table if not exists hli_ai_jobs (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_intakes(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','failed','complete')),
  stage text,
  attempts int not null default 0,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_hli_ai_jobs_intake on hli_ai_jobs(intake_id);
create index if not exists idx_hli_ai_jobs_status on hli_ai_jobs(status);

-- hli_ai_extractions: blood + image extraction payloads
create table if not exists hli_ai_extractions (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_intakes(id) on delete cascade,
  type text not null check (type in ('blood','image')),
  payload jsonb not null default '{}',
  confidence jsonb default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_hli_ai_extractions_intake on hli_ai_extractions(intake_id);
create index if not exists idx_hli_ai_extractions_type on hli_ai_extractions(intake_id, type);

-- hli_ai_scores: Follicle Intelligence domain scores
create table if not exists hli_ai_scores (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_intakes(id) on delete cascade,
  domain_scores jsonb not null default '{}',
  overall_score numeric,
  risk_tier text,
  explainability jsonb default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_hli_ai_scores_intake on hli_ai_scores(intake_id);

-- hli_reports: report lifecycle (draft -> approved -> released)
create table if not exists hli_reports (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_intakes(id) on delete cascade,
  version int not null default 1,
  status text not null default 'draft' check (status in ('draft','changes_required','approved','released')),
  storage_path text,
  created_at timestamptz default now(),
  approved_at timestamptz,
  released_at timestamptz
);
create index if not exists idx_hli_reports_intake on hli_reports(intake_id);
create index if not exists idx_hli_reports_status on hli_reports(status);

-- hli_auditor_notes: auditor review comments
create table if not exists hli_auditor_notes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references hli_reports(id) on delete cascade,
  intake_id uuid not null references hli_intakes(id) on delete cascade,
  author text,
  note text,
  status text check (status in ('changes_required','approved')),
  created_at timestamptz default now()
);
create index if not exists idx_hli_auditor_notes_report on hli_auditor_notes(report_id);

-- Optional: add columns to hli_intakes (non-breaking, IF NOT EXISTS via function)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='hli_intakes' and column_name='latest_report_id') then
    alter table hli_intakes add column latest_report_id uuid references hli_reports(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_name='hli_intakes' and column_name='updated_at') then
    alter table hli_intakes add column updated_at timestamptz default now();
  end if;
end $$;
