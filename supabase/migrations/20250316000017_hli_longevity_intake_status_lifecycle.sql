-- Backfill patient-facing status so it reflects workflow progress.
-- Safe, additive: only updates rows where status is out of sync with review/release state.
-- Run once; new transitions are handled in application code (claim, release, unassign, submit triage).

-- 1. Released summary => complete (patient should see "Review completed")
update hli_longevity_intakes
set status = 'complete', updated_at = now()
where patient_visible_released_at is not null
  and (status is null or status != 'complete');

-- 2. In clinician queue or under review => in_review (patient should see "In review")
update hli_longevity_intakes
set status = 'in_review', updated_at = now()
where review_status in ('human_review_required', 'under_trichologist_review', 'awaiting_patient_documents')
  and status = 'submitted';
