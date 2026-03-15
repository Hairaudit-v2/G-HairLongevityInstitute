-- Hair Longevity Institute: Phase S — reminder outcome tracking for adherence analytics.
-- Longevity namespace only. Links sent reminders to subsequent patient actions.

create table if not exists hli_longevity_reminder_outcomes (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid not null references hli_longevity_reminders(id) on delete cascade,
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  outcome_type text not null check (
    outcome_type in (
      'follow_up_intake_submitted',
      'blood_results_uploaded',
      'scalp_photo_uploaded',
      'review_re_entry'
    )
  ),
  related_intake_id uuid references hli_longevity_intakes(id) on delete set null,
  related_document_id uuid references hli_longevity_documents(id) on delete set null,
  occurred_at timestamptz not null,
  delay_days integer not null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_hli_longevity_reminder_outcomes_reminder_type
  on hli_longevity_reminder_outcomes(reminder_id, outcome_type);

create index if not exists idx_hli_longevity_reminder_outcomes_profile
  on hli_longevity_reminder_outcomes(profile_id, occurred_at desc);

create index if not exists idx_hli_longevity_reminder_outcomes_occurred
  on hli_longevity_reminder_outcomes(occurred_at desc);

comment on table hli_longevity_reminder_outcomes is 'Longevity-only: links sent reminders to subsequent patient actions for adherence and return analytics.';
