-- Hair Longevity Institute: Medical Referral Workflow (Australia)
-- Non-destructive. Supports future international expansion via country column.

-- hli_doctors: Australian doctors for prescription-support review
create table if not exists hli_doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  country text not null default 'AU',
  license_number text,
  registration_body text,
  specialty text,
  active boolean not null default true,
  created_at timestamptz default now()
);
create index if not exists idx_hli_doctors_country on hli_doctors(country);
create index if not exists idx_hli_doctors_active on hli_doctors(active) where active = true;

-- hli_medical_referrals: referral routing (AU only for now)
create table if not exists hli_medical_referrals (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references hli_intakes(id) on delete cascade,
  report_id uuid references hli_reports(id) on delete set null,
  country text not null default 'AU',
  status text not null default 'pending' check (status in (
    'pending','assigned','in_review','needs_more_info','approved','declined','completed'
  )),
  reason text,
  assigned_doctor_id uuid references hli_doctors(id) on delete set null,
  patient_country text,
  decision_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_hli_medical_referrals_intake on hli_medical_referrals(intake_id);
create index if not exists idx_hli_medical_referrals_doctor on hli_medical_referrals(assigned_doctor_id);
create index if not exists idx_hli_medical_referrals_status on hli_medical_referrals(status);
create index if not exists idx_hli_medical_referrals_country on hli_medical_referrals(country);

-- hli_medical_notes: doctor/admin/auditor notes on referrals
create table if not exists hli_medical_notes (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references hli_medical_referrals(id) on delete cascade,
  author_type text not null check (author_type in ('doctor','admin','auditor')),
  author text,
  note text not null,
  created_at timestamptz default now()
);
create index if not exists idx_hli_medical_notes_referral on hli_medical_notes(referral_id);

-- RLS (TODO: when Supabase Auth is wired)
-- 1. Add doctor_user_id uuid references auth.users(id) to hli_doctors
-- 2. Doctors: SELECT on hli_medical_referrals WHERE assigned_doctor_id IN (SELECT id FROM hli_doctors WHERE doctor_user_id = auth.uid())
-- 3. Doctors: SELECT on hli_medical_notes WHERE referral_id IN (their referrals)
-- 4. Admin: full access via service role
