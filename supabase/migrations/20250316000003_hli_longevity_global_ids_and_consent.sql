-- Hair Longevity Institute: Optional integration hooks (global IDs + consent placeholder).
-- Additive only. No references to hli_intakes, hli_reports, or referral tables.
-- These columns/tables are for future cross-platform identity and data-sharing; leave null/unused until integration.

-- 1. Global person/case references (populated only when Identity Registry links the entity)
alter table hli_longevity_profiles
  add column if not exists global_person_id uuid;

alter table hli_longevity_intakes
  add column if not exists global_case_id uuid;

comment on column hli_longevity_profiles.global_person_id is 'Optional: cross-platform person ID from Identity Registry. Null until linkage.';
comment on column hli_longevity_intakes.global_case_id is 'Optional: cross-platform case ID. Null until registered.';

create index if not exists idx_hli_longevity_profiles_global_person
  on hli_longevity_profiles(global_person_id)
  where global_person_id is not null;

create index if not exists idx_hli_longevity_intakes_global_case
  on hli_longevity_intakes(global_case_id)
  where global_case_id is not null;

-- 2. Consent placeholder: record consent scope and time for future data-sharing / identity linking
create table if not exists hli_longevity_consents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  scope text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_hli_longevity_consents_profile on hli_longevity_consents(profile_id);
create index if not exists idx_hli_longevity_consents_scope on hli_longevity_consents(scope);
comment on table hli_longevity_consents is 'Consent records for data-sharing and identity linking. Used when integrating with Follicle Intelligence or Identity Registry.';
