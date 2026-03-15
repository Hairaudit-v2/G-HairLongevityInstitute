-- Hair Longevity Institute: Trichologist Phase A foundations (additive only).
-- No references to hli_intakes, hli_reports, or referral tables.
-- Patient-facing intake status is unchanged; review_* columns are for clinician workflow only.

-- 1. Trichologist identity (HLI longevity only; separate from patient and admin auth)
create table if not exists hli_longevity_trichologists (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_hli_longevity_trichologists_auth_user
  on hli_longevity_trichologists(auth_user_id);
create index if not exists idx_hli_longevity_trichologists_active
  on hli_longevity_trichologists(is_active) where is_active = true;

comment on table hli_longevity_trichologists is 'Trichologist identity for HLI longevity review workflow. Resolved from auth.users; isolated from patient portal and HairAudit.';

-- 2. Additive review workflow columns on intakes (nullable; patient status unchanged)
alter table hli_longevity_intakes
  add column if not exists review_status text,
  add column if not exists review_priority text,
  add column if not exists review_decision_source text,
  add column if not exists assigned_trichologist_id uuid references hli_longevity_trichologists(id) on delete set null,
  add column if not exists assigned_at timestamptz,
  add column if not exists last_reviewed_at timestamptz,
  add column if not exists review_outcome text,
  add column if not exists patient_visible_summary text,
  add column if not exists patient_visible_released_at timestamptz;

alter table hli_longevity_intakes
  drop constraint if exists hli_longevity_intakes_review_decision_source_check;
alter table hli_longevity_intakes
  add constraint hli_longevity_intakes_review_decision_source_check check (
    review_decision_source is null or review_decision_source in ('rules', 'ai', 'trichologist', 'mixed')
  );

create index if not exists idx_hli_longevity_intakes_review_status
  on hli_longevity_intakes(review_status) where review_status is not null;
create index if not exists idx_hli_longevity_intakes_assigned_trichologist
  on hli_longevity_intakes(assigned_trichologist_id) where assigned_trichologist_id is not null;
create index if not exists idx_hli_longevity_intakes_review_priority
  on hli_longevity_intakes(review_priority) where review_priority is not null;

comment on column hli_longevity_intakes.review_status is 'Clinician workflow state (additive). Patient-facing status column unchanged. See reviewConstants for allowed values.';
comment on column hli_longevity_intakes.review_decision_source is 'Source of review decision/triage: rules, ai, trichologist, or mixed (nullable).';
comment on column hli_longevity_intakes.assigned_trichologist_id is 'Trichologist currently assigned to this intake (nullable).';

-- 3. Internal review notes (Trichologist-only; never patient-visible)
create table if not exists hli_longevity_review_notes (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  trichologist_id uuid not null references hli_longevity_trichologists(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create index if not exists idx_hli_longevity_review_notes_intake on hli_longevity_review_notes(intake_id);
create index if not exists idx_hli_longevity_review_notes_trichologist on hli_longevity_review_notes(trichologist_id);

comment on table hli_longevity_review_notes is 'Internal notes by Trichologists on an intake. Not patient-visible.';

-- 4. Allow trichologist as actor_type in audit events (for Phase B+ logging)
alter table hli_longevity_audit_events
  drop constraint if exists hli_longevity_audit_events_actor_type_check;

alter table hli_longevity_audit_events
  add constraint hli_longevity_audit_events_actor_type_check check (
    actor_type in ('user', 'system', 'admin', 'trichologist')
  );
