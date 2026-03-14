-- Seed 3 AU doctors for medical referral workflow
-- Run: psql $DATABASE_URL -f scripts/seed-doctors.sql
-- Or execute in Supabase SQL Editor

insert into hli_doctors (full_name, email, country, license_number, registration_body, active)
values
  ('Dr. Sarah Chen', 'sarah.chen@hli.example.au', 'AU', 'MED123456', 'AHPRA', true),
  ('Dr. James Wilson', 'james.wilson@hli.example.au', 'AU', 'MED234567', 'AHPRA', true),
  ('Dr. Emma Taylor', 'emma.taylor@hli.example.au', 'AU', 'MED345678', 'AHPRA', true)
on conflict (email) do update set
  full_name = excluded.full_name,
  license_number = excluded.license_number,
  active = excluded.active;
