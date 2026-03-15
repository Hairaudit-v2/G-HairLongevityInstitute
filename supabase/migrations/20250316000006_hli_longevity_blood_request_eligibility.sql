-- Hair Longevity Institute: Phase D — Blood request eligibility and tracking (additive).
-- Extends hli_longevity_blood_requests for recommended tests and recommendation source.
-- No letter generation in this migration.

alter table hli_longevity_blood_requests
  add column if not exists profile_id uuid references hli_longevity_profiles(id) on delete cascade,
  add column if not exists recommended_tests jsonb not null default '[]',
  add column if not exists reason text,
  add column if not exists recommended_by text,
  add column if not exists approved_at timestamptz,
  add column if not exists letter_document_id uuid references hli_longevity_documents(id) on delete set null;

alter table hli_longevity_blood_requests
  drop constraint if exists hli_longevity_blood_requests_recommended_by_check;
alter table hli_longevity_blood_requests
  add constraint hli_longevity_blood_requests_recommended_by_check check (
    recommended_by is null or recommended_by in ('rules', 'trichologist', 'system')
  );

create index if not exists idx_hli_longevity_blood_requests_profile
  on hli_longevity_blood_requests(profile_id) where profile_id is not null;

comment on column hli_longevity_blood_requests.recommended_tests is 'Array of recommended test codes (e.g. ferritin, tsh). From eligibility engine.';
comment on column hli_longevity_blood_requests.reason is 'Human- or system-readable reason for recommendation.';
comment on column hli_longevity_blood_requests.recommended_by is 'Source: rules (triage), trichologist, or system.';
comment on column hli_longevity_blood_requests.letter_document_id is 'Generated letter document when status reaches letter_generated (Phase D: nullable, no generation yet).';

-- Backfill profile_id from intake where null (backward compatibility)
update hli_longevity_blood_requests br
set profile_id = i.profile_id
from hli_longevity_intakes i
where br.intake_id = i.id and br.profile_id is null;
