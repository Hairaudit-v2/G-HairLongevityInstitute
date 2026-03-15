-- Hair Longevity Institute: Phase Q — reminder staging for cadence-driven patient nudges.
-- Longevity namespace only. Internal staging first; no heavy messaging platform.

create table if not exists hli_longevity_reminders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  intake_id uuid not null references hli_longevity_intakes(id) on delete cascade,
  blood_request_id uuid references hli_longevity_blood_requests(id) on delete set null,
  reminder_type text not null check (
    reminder_type in (
      'follow_up_due',
      'follow_up_overdue',
      'blood_results_pending',
      'scalp_photos_recommended',
      'clinician_follow_up_recommended'
    )
  ),
  delivery_channel text not null default 'email' check (delivery_channel in ('email')),
  status text not null default 'staged' check (status in ('staged', 'sent', 'cancelled', 'failed')),
  dedupe_key text not null,
  recipient_email text not null,
  subject text not null,
  body_text text not null,
  follow_up_status text check (follow_up_status in ('due', 'overdue', 'upcoming', 'complete', 'none')),
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  cancelled_at timestamptz,
  last_error text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_hli_longevity_reminders_dedupe
  on hli_longevity_reminders(dedupe_key);

create index if not exists idx_hli_longevity_reminders_profile
  on hli_longevity_reminders(profile_id, created_at desc);

create index if not exists idx_hli_longevity_reminders_intake
  on hli_longevity_reminders(intake_id, created_at desc);

create index if not exists idx_hli_longevity_reminders_status
  on hli_longevity_reminders(status, scheduled_for asc);

comment on table hli_longevity_reminders is 'Longevity-only reminder staging table for cadence-driven patient nudges and future lightweight delivery.';
