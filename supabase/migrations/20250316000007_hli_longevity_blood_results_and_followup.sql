-- Hair Longevity Institute: Phase F — Returned blood results and follow-up (additive).
-- Allow blood request status results_uploaded when patient has uploaded returned results.

alter table hli_longevity_blood_requests
  drop constraint if exists hli_longevity_blood_requests_status_check;

alter table hli_longevity_blood_requests
  add constraint hli_longevity_blood_requests_status_check check (status in (
    'pending',
    'letter_requested',
    'letter_generated',
    'results_uploaded',
    'completed',
    'cancelled'
  ));

comment on column hli_longevity_blood_requests.status is 'pending|letter_requested|letter_generated|results_uploaded|completed|cancelled. results_uploaded = patient has uploaded returned blood results (Phase F).';
