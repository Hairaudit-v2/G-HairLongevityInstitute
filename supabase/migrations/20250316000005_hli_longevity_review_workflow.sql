-- Hair Longevity Institute: Review workflow foundations (additive only).
-- Adds triage metadata and review_priority validation. Longevity namespace only.

-- 1. Triage metadata on intakes
alter table hli_longevity_intakes
  add column if not exists triaged_at timestamptz,
  add column if not exists triage_version text;

comment on column hli_longevity_intakes.triaged_at is 'Timestamp when triage logic was last applied.';
comment on column hli_longevity_intakes.triage_version is 'Version identifier for triage rules used.';

-- 2. review_priority validation: low, normal, high, urgent (backward compatible)
alter table hli_longevity_intakes
  drop constraint if exists hli_longevity_intakes_review_priority_check;

alter table hli_longevity_intakes
  add constraint hli_longevity_intakes_review_priority_check check (
    review_priority is null or review_priority in ('low', 'normal', 'high', 'urgent')
  );
