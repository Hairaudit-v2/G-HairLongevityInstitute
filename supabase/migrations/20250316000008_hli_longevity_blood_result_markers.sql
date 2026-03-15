-- Hair Longevity Institute: Phase G — Structured blood result markers (additive).
-- Enables interpretation and longitudinal trend tracking. Longevity namespace only.

create table if not exists hli_longevity_blood_result_markers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  blood_request_id uuid references hli_longevity_blood_requests(id) on delete set null,
  marker_name text not null,
  value numeric not null,
  unit text,
  reference_low numeric,
  reference_high numeric,
  collected_at timestamptz,
  lab_name text,
  created_at timestamptz default now()
);

create index if not exists idx_hli_longevity_blood_result_markers_profile
  on hli_longevity_blood_result_markers(profile_id);
create index if not exists idx_hli_longevity_blood_result_markers_intake
  on hli_longevity_blood_result_markers(intake_id);
create index if not exists idx_hli_longevity_blood_result_markers_blood_request
  on hli_longevity_blood_result_markers(blood_request_id) where blood_request_id is not null;
create index if not exists idx_hli_longevity_blood_result_markers_collected
  on hli_longevity_blood_result_markers(profile_id, collected_at desc);

comment on table hli_longevity_blood_result_markers is 'Structured blood test markers per intake/profile for interpretation and longitudinal trends. Phase G.';
comment on column hli_longevity_blood_result_markers.blood_request_id is 'Optional link to blood request when results correspond to a requested panel.';
comment on column hli_longevity_blood_result_markers.collected_at is 'When the sample was collected; supports trend over time.';
