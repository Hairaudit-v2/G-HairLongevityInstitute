-- HLI payment hardening: explicit grandfathering, entitlement audit ledger, support diagnostics.
-- Additive only.
--
-- PREREQUISITE: Same as 20260417000001 — run 20250315000001_hli_longevity.sql first (and migrations
-- that add `hli_longevity_blood_requests.letter_document_id`, e.g. 20250316000006, for the
-- grandfather CTE below). Prefer: `supabase db push` to apply the full chain in order.

-- Pre-Stripe users: set once during migration so access matches prior product behavior (auditable timestamp).
alter table hli_longevity_profiles
  add column if not exists blood_request_letter_grandfathered_at timestamptz;

alter table hli_longevity_profiles
  add column if not exists blood_analysis_review_grandfathered_at timestamptz;

comment on column hli_longevity_profiles.blood_request_letter_grandfathered_at is
  'Explicit legacy grant: blood request letter access before paid checkout. Auditable; entitlement reason = legacy_grandfather.';
comment on column hli_longevity_profiles.blood_analysis_review_grandfathered_at is
  'Explicit legacy grant: blood analysis review access before paid checkout. Set manually or via controlled migration.';

-- Append-only ledger for support: what happened, when, and why access exists.
create table if not exists hli_entitlement_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  source_kind text not null check (source_kind in (
    'stripe_checkout',
    'stripe_subscription',
    'legacy_migration',
    'admin'
  )),
  offering text,
  stripe_checkout_session_id text,
  stripe_event_id text,
  stripe_payment_intent_id text,
  stripe_subscription_id text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_hli_entitlement_ledger_profile_recorded
  on hli_entitlement_ledger(profile_id, recorded_at desc);

comment on table hli_entitlement_ledger is
  'Append-only entitlement and payment context for support (purchases, subscription sync, grandfathering).';

-- One-time grandfather: profiles that already had a generated letter document (pre-payment era).
with updated as (
  update hli_longevity_profiles p
  set blood_request_letter_grandfathered_at = coalesce(blood_request_letter_grandfathered_at, now())
  where blood_request_letter_grandfathered_at is null
    and exists (
      select 1
      from hli_longevity_intakes i
      inner join hli_longevity_blood_requests br on br.intake_id = i.id
      where i.profile_id = p.id
        and br.letter_document_id is not null
    )
  returning id
)
insert into hli_entitlement_ledger (profile_id, source_kind, offering, summary, metadata)
select
  id,
  'legacy_migration',
  'blood_request_letter',
  'Grandfathered access: a blood request letter was already generated on this account before paid checkout enforcement.',
  jsonb_build_object('reason', 'existing_letter_document')
from updated;

-- Optional manual grandfather (blood analysis review): run in SQL Editor after verifying criteria, e.g. legacy patients
-- who already had a released review before Stripe:
--   update hli_longevity_profiles
--   set blood_analysis_review_grandfathered_at = now()
--   where id = '<profile_uuid>';
--   insert into hli_entitlement_ledger (profile_id, source_kind, offering, summary, metadata)
--   values ('<profile_uuid>', 'legacy_migration', 'blood_analysis_review',
--     'Manual grandfather: blood analysis review access before paid checkout.',
--     '{"reason":"manual"}'::jsonb);
