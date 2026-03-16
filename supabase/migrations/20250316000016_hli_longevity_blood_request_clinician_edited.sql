-- Phase D.1: Trichologist refinement of blood requests — provenance tracking.
-- Lightweight: one boolean to distinguish clinician-confirmed (unchanged) vs clinician-edited.

alter table hli_longevity_blood_requests
  add column if not exists clinician_edited boolean not null default false;

comment on column hli_longevity_blood_requests.clinician_edited is
  'True when a trichologist has refined recommended_tests or reason via the review workspace. Used for display: rules_only (recommended_by=rules), clinician_confirmed (trichologist, clinician_edited=false), clinician_edited (clinician_edited=true).';
