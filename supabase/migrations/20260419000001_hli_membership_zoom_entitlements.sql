-- Membership: included one-on-one Zoom sessions (2 × 30 min per Stripe subscription period) + audit trail.
-- Additive only. Requires hli_longevity_profiles (20250315000001+).
-- Prerequisite for entitlement_usage rows: 20260418000002_hli_entitlement_ledger_entitlement_usage.sql (ledger source_kind).

-- Track each consumption of an included session (auditable; scoped to membership billing period).
create table if not exists hli_membership_included_zoom_consumptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references hli_longevity_profiles(id) on delete cascade,
  membership_period_start timestamptz not null,
  consumed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_hli_mizc_profile_period
  on hli_membership_included_zoom_consumptions(profile_id, membership_period_start);

comment on table hli_membership_included_zoom_consumptions is
  'Each row records use of one membership-included 30-minute one-on-one Zoom session, tied to Stripe subscription current_period_start.';

-- Mirrors Stripe subscription current_period_start (ISO) for the active membership period — used to scope counts.
alter table hli_longevity_profiles
  add column if not exists membership_zoom_usage_period_start timestamptz;

comment on column hli_longevity_profiles.membership_zoom_usage_period_start is
  'Stripe subscription current_period_start (UTC) for the period in which included Zoom session counts apply.';
