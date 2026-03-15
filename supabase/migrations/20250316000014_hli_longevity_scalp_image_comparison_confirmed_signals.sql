-- Hair Longevity Institute: Phase O2 — confirmed scalp-image findings and progression signals.
-- Additive only; extends the clinician-reviewed scalp comparison record with
-- structured current findings and deterministic longitudinal outputs.

alter table if exists hli_longevity_scalp_image_comparisons
  add column if not exists current_thinning_distribution text[] not null default '{}',
  add column if not exists current_severity_band text check (
    current_severity_band in ('minimal', 'mild', 'moderate', 'advanced', 'uncertain')
  ),
  add column if not exists current_visible_scale_likelihood text check (
    current_visible_scale_likelihood in ('unlikely', 'possible', 'likely', 'uncertain')
  ),
  add column if not exists current_visible_redness_likelihood text check (
    current_visible_redness_likelihood in ('unlikely', 'possible', 'likely', 'uncertain')
  ),
  add column if not exists current_image_quality text check (
    current_image_quality in ('usable', 'borderline', 'poor')
  ),
  add column if not exists current_finding_confidence text check (
    current_finding_confidence in ('low', 'moderate', 'high')
  ),
  add column if not exists visual_progress_summary text[] not null default '{}',
  add column if not exists visual_persistent_drivers text[] not null default '{}',
  add column if not exists visual_follow_up_considerations text[] not null default '{}',
  add column if not exists visual_comparison_confidence text check (
    visual_comparison_confidence in ('low', 'moderate', 'high')
  ),
  add column if not exists progression_signals text[] not null default '{}',
  add column if not exists patient_visual_progress_summary text[] not null default '{}';

comment on column hli_longevity_scalp_image_comparisons.current_thinning_distribution is
  'Clinician-confirmed current visible thinning distribution for the intake.';
comment on column hli_longevity_scalp_image_comparisons.current_severity_band is
  'Clinician-confirmed current visible severity band.';
comment on column hli_longevity_scalp_image_comparisons.current_visible_scale_likelihood is
  'Clinician-confirmed likelihood of visible scale in the current confirmed photo set.';
comment on column hli_longevity_scalp_image_comparisons.current_visible_redness_likelihood is
  'Clinician-confirmed likelihood of visible redness or inflammatory visual features in the current confirmed photo set.';
comment on column hli_longevity_scalp_image_comparisons.current_image_quality is
  'Clinician-confirmed quality of the current photo set for visual assessment.';
comment on column hli_longevity_scalp_image_comparisons.current_finding_confidence is
  'Clinician confidence band for the confirmed current visual findings.';
comment on column hli_longevity_scalp_image_comparisons.visual_progress_summary is
  'Deterministic clinician-facing summary of reviewed visual progression versus the previous confirmed finding set.';
comment on column hli_longevity_scalp_image_comparisons.visual_persistent_drivers is
  'Deterministic clinician-facing summary of persistent visible scalp concerns.';
comment on column hli_longevity_scalp_image_comparisons.visual_follow_up_considerations is
  'Deterministic clinician-facing caveats or follow-up considerations for scalp image comparison.';
comment on column hli_longevity_scalp_image_comparisons.visual_comparison_confidence is
  'Deterministic clinician-facing confidence band for the visual comparison.';
comment on column hli_longevity_scalp_image_comparisons.progression_signals is
  'Structured progression signal keys derived from confirmed scalp-image findings.';
comment on column hli_longevity_scalp_image_comparisons.patient_visual_progress_summary is
  'Minimal patient-safe visual progress summary derived from confirmed scalp-image findings.';
