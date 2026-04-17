-- HLI Stripe billing: entitlement columns on longevity profiles + webhook idempotency.
-- Additive only.

alter table hli_longevity_profiles
  add column if not exists stripe_customer_id text;

alter table hli_longevity_profiles
  add column if not exists blood_request_letter_purchased_at timestamptz;

alter table hli_longevity_profiles
  add column if not exists blood_analysis_review_purchased_at timestamptz;

alter table hli_longevity_profiles
  add column if not exists trichologist_appointment_purchased_at timestamptz;

alter table hli_longevity_profiles
  add column if not exists membership_stripe_subscription_id text;

alter table hli_longevity_profiles
  add column if not exists membership_status text;

alter table hli_longevity_profiles
  add column if not exists membership_current_period_end timestamptz;

alter table hli_longevity_profiles
  add column if not exists ongoing_support_access boolean not null default false;

comment on column hli_longevity_profiles.stripe_customer_id is 'Stripe Customer id (cus_...) for this profile.';
comment on column hli_longevity_profiles.blood_request_letter_purchased_at is 'Set when one-time letter purchase completes (or can be mirrored while membership active).';
comment on column hli_longevity_profiles.blood_analysis_review_purchased_at is 'Set when one-time follow-up blood analysis review purchase completes.';
comment on column hli_longevity_profiles.trichologist_appointment_purchased_at is 'Set when one-time trichologist appointment purchase completes.';
comment on column hli_longevity_profiles.membership_stripe_subscription_id is 'Stripe Subscription id (sub_...) when on membership.';
comment on column hli_longevity_profiles.membership_status is 'Mirrors Stripe subscription status: active, trialing, canceled, past_due, unpaid, etc.';
comment on column hli_longevity_profiles.membership_current_period_end is 'Current billing period end from Stripe subscription.';
comment on column hli_longevity_profiles.ongoing_support_access is 'True while membership grants ongoing support entitlements.';

create index if not exists idx_hli_longevity_profiles_stripe_customer
  on hli_longevity_profiles(stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists idx_hli_longevity_profiles_membership_sub
  on hli_longevity_profiles(membership_stripe_subscription_id)
  where membership_stripe_subscription_id is not null;

-- Idempotent webhook processing (Stripe may retry the same event id)
create table if not exists hli_stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now()
);

comment on table hli_stripe_webhook_events is 'Processed Stripe webhook event ids for idempotency.';
