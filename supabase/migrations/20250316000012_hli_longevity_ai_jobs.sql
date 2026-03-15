-- Hair Longevity Institute: longevity-scoped async AI job tracking.
-- Additive only; separate from legacy hli_ai_jobs.

create table if not exists hli_longevity_ai_jobs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references hli_longevity_profiles(id) on delete set null,
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  trichologist_id uuid references hli_longevity_trichologists(id) on delete set null,
  job_type text not null check (job_type in ('scalp_image_analysis')),
  status text not null default 'queued' check (status in ('queued', 'running', 'complete', 'failed')),
  stage text,
  attempts integer not null default 0,
  last_error text,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hli_longevity_ai_jobs_intake
  on hli_longevity_ai_jobs(intake_id, created_at desc);
create index if not exists idx_hli_longevity_ai_jobs_status
  on hli_longevity_ai_jobs(status, created_at desc);

comment on table hli_longevity_ai_jobs is 'Longevity-only async job tracking for clinician-reviewed AI draft workflows.';
