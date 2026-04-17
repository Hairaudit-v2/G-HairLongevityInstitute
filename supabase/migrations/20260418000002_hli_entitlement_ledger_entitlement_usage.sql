-- Extend entitlement ledger source_kind for membership Zoom consumption rows (append-only usage events).
-- Runs immediately after 20260418000001_hli_payment_hardening.sql (which creates hli_entitlement_ledger).

alter table hli_entitlement_ledger drop constraint if exists hli_entitlement_ledger_source_kind_check;

alter table hli_entitlement_ledger
  add constraint hli_entitlement_ledger_source_kind_check
  check (source_kind in (
    'stripe_checkout',
    'stripe_subscription',
    'legacy_migration',
    'admin',
    'entitlement_usage'
  ));
