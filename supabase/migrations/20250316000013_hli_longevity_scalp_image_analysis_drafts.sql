-- Hair Longevity Institute: draft-only scalp image analysis outputs.
-- AI outputs stay internal until a Trichologist reviews and applies/dismisses them.

create table if not exists hli_longevity_scalp_image_analysis_drafts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  previous_intake_id uuid references hli_longevity_intakes(id) on delete set null,
  current_document_ids uuid[] not null default '{}',
  previous_document_ids uuid[] not null default '{}',
  image_quality text not null check (image_quality in ('usable', 'borderline', 'poor')),
  thinning_distribution text[] not null default '{}',
  severity_estimate text not null check (severity_estimate in ('minimal', 'mild', 'moderate', 'advanced', 'uncertain')),
  visible_findings text[] not null default '{}',
  comparison_direction text not null check (comparison_direction in ('improved', 'stable', 'worsened', 'uncertain', 'insufficient_images')),
  confidence numeric,
  manual_review_recommended boolean not null default true,
  draft_summary text not null,
  raw_payload jsonb not null default '{}'::jsonb,
  analysis_version text not null default 'openai_scalp_draft_v1',
  status text not null default 'draft' check (status in ('draft', 'applied', 'dismissed')),
  applied_comparison_id uuid references hli_longevity_scalp_image_comparisons(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_hli_longevity_scalp_image_analysis_drafts_intake
  on hli_longevity_scalp_image_analysis_drafts(intake_id, status, created_at desc);

comment on table hli_longevity_scalp_image_analysis_drafts is 'Draft-only scalp image analysis outputs for longevity review. Non-diagnostic and never patient-visible before clinician confirmation.';
