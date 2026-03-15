-- Hair Longevity Institute: Phase N — normalized integration events/signals outbox.
-- Longevity namespace only. Internal staging for future Follicle Intelligence integration.

create table if not exists hli_longevity_integration_outbox (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references hli_longevity_profiles(id) on delete set null,
  intake_id uuid references hli_longevity_intakes(id) on delete set null,
  blood_request_id uuid references hli_longevity_blood_requests(id) on delete set null,
  document_id uuid references hli_longevity_documents(id) on delete set null,
  emission_kind text not null check (emission_kind in ('event', 'signal')),
  emission_key text not null,
  schema_version text not null default '1',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_hli_longevity_integration_outbox_profile
  on hli_longevity_integration_outbox(profile_id);
create index if not exists idx_hli_longevity_integration_outbox_intake
  on hli_longevity_integration_outbox(intake_id);
create index if not exists idx_hli_longevity_integration_outbox_emission
  on hli_longevity_integration_outbox(emission_kind, emission_key, created_at desc);
create index if not exists idx_hli_longevity_integration_outbox_created
  on hli_longevity_integration_outbox(created_at desc);

comment on table hli_longevity_integration_outbox is 'Internal longevity-only staging table for normalized lifecycle events and structured clinical signals destined for future external integrations.';
