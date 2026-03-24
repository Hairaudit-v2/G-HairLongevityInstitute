-- Add structured JSON metadata for longevity documents (e.g. scalp image analysis: view, usability, quality flags).
-- Additive; existing rows default to empty object.

alter table hli_longevity_documents
  add column if not exists metadata jsonb not null default '{}'::jsonb;

comment on column hli_longevity_documents.metadata is 'Structured metadata (e.g. scalp_photo: detected_view, usability, quality_flags from Vision analysis). Merged on update; never replaces unrelated keys.';
