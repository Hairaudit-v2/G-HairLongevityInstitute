-- Append-only clinician ratings on AI-assisted review outputs (adaptive triage, scalp image intelligence, fusion).
-- For calibration and quality review; not patient-visible.

create table if not exists hli_longevity_clinician_ai_feedback (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  trichologist_id uuid references hli_longevity_trichologists(id) on delete set null,
  adaptive_triage_usefulness text
    constraint hli_clinician_ai_feedback_adaptive_check
    check (adaptive_triage_usefulness is null or adaptive_triage_usefulness in ('useful', 'unclear', 'misleading')),
  scalp_image_intelligence_usefulness text
    constraint hli_clinician_ai_feedback_scalp_check
    check (scalp_image_intelligence_usefulness is null or scalp_image_intelligence_usefulness in ('useful', 'unclear', 'misleading')),
  intake_image_fusion_usefulness text
    constraint hli_clinician_ai_feedback_fusion_check
    check (intake_image_fusion_usefulness is null or intake_image_fusion_usefulness in ('useful', 'unclear', 'misleading')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_hli_clinician_ai_feedback_intake_created
  on hli_longevity_clinician_ai_feedback(intake_id, created_at desc);

create index if not exists idx_hli_clinician_ai_feedback_profile_created
  on hli_longevity_clinician_ai_feedback(profile_id, created_at desc);

comment on table hli_longevity_clinician_ai_feedback is 'Clinician-only structured feedback on adaptive triage, scalp image intelligence, and intake-image fusion outputs. Append-only for calibration analysis.';
