-- Add prescriptions to allowed document types. Existing uploads unchanged; legacy "upload" displayed as Other in app.
alter table hli_longevity_documents
  drop constraint if exists hli_longevity_documents_doc_type_check;

alter table hli_longevity_documents
  add constraint hli_longevity_documents_doc_type_check check (doc_type in (
    'upload',
    'blood_request_letter',
    'other',
    'blood_test_upload',
    'scalp_photo',
    'medical_letter',
    'prescriptions'
  ));
