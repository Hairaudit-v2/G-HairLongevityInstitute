-- Hair Longevity Institute: Longevity module (isolated lane)
-- Additive only. No references to hli_intakes, hli_reports, or referral tables.
-- Do not repurpose existing audit/intake tables.

-- hli_longevity_profiles: identity for longevity workflow (no FK to existing hli_* tables)
create table if not exists hli_longevity_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_hli_longevity_profiles_email on hli_longevity_profiles(email);

-- hli_longevity_intakes: one per longevity onboarding submission
create table if not exists hli_longevity_intakes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','submitted','in_review','complete')),
  schema_version text not null default '1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_hli_longevity_intakes_profile on hli_longevity_intakes(profile_id);
create index if not exists idx_hli_longevity_intakes_status on hli_longevity_intakes(status);
create index if not exists idx_hli_longevity_intakes_created on hli_longevity_intakes(created_at desc);

-- hli_longevity_questionnaires: structured symptom/history responses per intake
create table if not exists hli_longevity_questionnaires (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  schema_version text not null default '1',
  responses jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_hli_longevity_questionnaires_intake on hli_longevity_questionnaires(intake_id);

-- hli_longevity_blood_requests: blood request letter workflow per intake
create table if not exists hli_longevity_blood_requests (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  status text not null default 'pending' check (status in (
    'pending','letter_requested','letter_generated','completed','cancelled'
  )),
  schema_version text default '1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_hli_longevity_blood_requests_intake on hli_longevity_blood_requests(intake_id);
create index if not exists idx_hli_longevity_blood_requests_status on hli_longevity_blood_requests(status);

-- hli_longevity_documents: uploads and generated docs (letters); storage_path server-side only
create table if not exists hli_longevity_documents (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid references hli_longevity_intakes(id) on delete cascade,
  blood_request_id uuid references hli_longevity_blood_requests(id) on delete set null,
  doc_type text not null check (doc_type in ('upload','blood_request_letter','other')),
  storage_path text not null,
  filename text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz default now(),
  constraint hli_longevity_documents_parent check (
    intake_id is not null or blood_request_id is not null
  )
);
create index if not exists idx_hli_longevity_documents_intake on hli_longevity_documents(intake_id);
create index if not exists idx_hli_longevity_documents_blood_request on hli_longevity_documents(blood_request_id);
create index if not exists idx_hli_longevity_documents_type on hli_longevity_documents(doc_type);

-- hli_longevity_audit_events: append-only workflow timeline
create table if not exists hli_longevity_audit_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references hli_longevity_profiles(id) on delete set null,
  intake_id uuid references hli_longevity_intakes(id) on delete set null,
  event_type text not null,
  payload jsonb default '{}',
  actor_type text check (actor_type in ('user','system','admin')),
  created_at timestamptz default now()
);
create index if not exists idx_hli_longevity_audit_events_profile on hli_longevity_audit_events(profile_id);
create index if not exists idx_hli_longevity_audit_events_intake on hli_longevity_audit_events(intake_id);
create index if not exists idx_hli_longevity_audit_events_created on hli_longevity_audit_events(created_at desc);
