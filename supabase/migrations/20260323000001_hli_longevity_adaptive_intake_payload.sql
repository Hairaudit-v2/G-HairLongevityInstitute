-- Longevity adaptive intake payload storage (additive, backward-compatible)
-- Stores adaptive intake answers/schema/triage in hli_longevity_intakes for
-- clinician context and longitudinal retrieval without changing existing flows.

alter table if exists hli_longevity_intakes
  add column if not exists adaptive_answers jsonb default '{}'::jsonb,
  add column if not exists adaptive_schema_version text,
  add column if not exists adaptive_triage_output jsonb default '{}'::jsonb;

create index if not exists idx_hli_longevity_intakes_adaptive_schema_version
  on hli_longevity_intakes(adaptive_schema_version)
  where adaptive_schema_version is not null;
