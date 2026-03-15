-- Hair Longevity Institute: Portal auth and profile-level documents (additive).
-- Binds auth.users to hli_longevity_profiles. Does not reference hli_intakes, hli_reports, or referral tables.

-- 1. Link profiles to Supabase Auth (nullable for backward compatibility with cookie-only flow)
alter table hli_longevity_profiles
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists idx_hli_longevity_profiles_auth_user
  on hli_longevity_profiles(auth_user_id)
  where auth_user_id is not null;

create index if not exists idx_hli_longevity_profiles_auth_user_id
  on hli_longevity_profiles(auth_user_id);

comment on column hli_longevity_profiles.auth_user_id is 'Supabase Auth user; one profile per auth user when set. Null for cookie-only (anonymous) longevity sessions.';

-- 2. Allow documents to attach to profile (e.g. uploads before intake, or profile-level uploads)
alter table hli_longevity_documents
  add column if not exists profile_id uuid references hli_longevity_profiles(id) on delete cascade;

alter table hli_longevity_documents
  drop constraint if exists hli_longevity_documents_parent;

alter table hli_longevity_documents
  add constraint hli_longevity_documents_parent check (
    intake_id is not null
    or blood_request_id is not null
    or profile_id is not null
  );

create index if not exists idx_hli_longevity_documents_profile on hli_longevity_documents(profile_id);

comment on column hli_longevity_documents.profile_id is 'Optional: document belongs to profile (e.g. general upload). When set, intake_id may be null.';
