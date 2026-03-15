-- Hair Longevity Institute: Phase O — structured scalp image comparison readiness.
-- Clinician-entered only. No automated image analysis.

create table if not exists hli_longevity_scalp_image_comparisons (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  previous_intake_id uuid references hli_longevity_intakes(id) on delete set null,
  trichologist_id uuid not null references hli_longevity_trichologists(id) on delete cascade,
  comparison_status text not null default 'pending_review' check (
    comparison_status in (
      'pending_review',
      'improved',
      'stable',
      'worsened',
      'uncertain',
      'insufficient_images'
    )
  ),
  compared_regions text[] not null default '{}',
  clinician_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (intake_id)
);

create index if not exists idx_hli_longevity_scalp_image_comparisons_profile
  on hli_longevity_scalp_image_comparisons(profile_id);
create index if not exists idx_hli_longevity_scalp_image_comparisons_previous
  on hli_longevity_scalp_image_comparisons(previous_intake_id) where previous_intake_id is not null;

comment on table hli_longevity_scalp_image_comparisons is 'Clinician-entered structured comparison notes for current vs previous scalp photo sets. Phase O.';
