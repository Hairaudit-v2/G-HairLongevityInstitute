-- Hair Longevity Institute: clinician-reviewed extracted blood marker drafts.
-- Additive and longevity-scoped: extracted values stay internal until explicitly applied.

create table if not exists hli_longevity_blood_marker_extraction_drafts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  document_id uuid references hli_longevity_documents(id) on delete cascade,
  blood_request_id uuid references hli_longevity_blood_requests(id) on delete set null,
  marker_name text not null,
  display_name text not null,
  raw_marker_name text,
  value numeric not null,
  unit text,
  reference_low numeric,
  reference_high numeric,
  raw_reference_range text,
  confidence numeric,
  source_filename text,
  extraction_version text not null default 'adapted_extractBlood_v1',
  status text not null default 'draft' check (status in ('draft', 'applied', 'dismissed')),
  applied_marker_id uuid references hli_longevity_blood_result_markers(id) on delete set null,
  extracted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_hli_longevity_bmed_intake_status
  on hli_longevity_blood_marker_extraction_drafts(intake_id, status, extracted_at desc);

create index if not exists idx_hli_longevity_bmed_document
  on hli_longevity_blood_marker_extraction_drafts(document_id)
  where document_id is not null;

create index if not exists idx_hli_longevity_bmed_applied_marker
  on hli_longevity_blood_marker_extraction_drafts(applied_marker_id)
  where applied_marker_id is not null;

comment on table hli_longevity_blood_marker_extraction_drafts is
  'Longevity-only staging table for extracted blood marker proposals. Drafts are internal until explicitly confirmed by a clinician.';

comment on column hli_longevity_blood_marker_extraction_drafts.marker_name is
  'Normalized marker name when registry mapping exists; otherwise stores the extracted marker label.';

comment on column hli_longevity_blood_marker_extraction_drafts.status is
  'draft = awaiting clinician review, applied = confirmed into structured markers, dismissed = reviewed but not kept.';
