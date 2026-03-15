# HLI Longevity — Shared Signal Vocabulary (draft)

This document defines **event types and payload conventions** for the Hair Longevity Institute longevity/portal module. It is the draft contract for future integration with HairAudit and Follicle Intelligence: consumers can rely on these event types and payload shapes without coupling to HLI internals.

**Namespace:** `hli_longevity`  
**Version:** draft (no version prefix yet; will become e.g. `hli_longevity.v1` when integration starts)

**Source attribution:** All events originate from source system `hli_longevity`. Outbound payloads should include:

- `source_system`: `"hli_longevity"`
- (Optional) `source_version`: e.g. `"1"` when versioned

---

## Canonical entity identification (convention)

When referring to HLI entities in events or cross-system payloads:

- **Format:** `(source_system, entity_type, local_id)`
- **source_system:** `"hli_longevity"`
- **entity_type:** `profile` | `intake` | `document` | `blood_request` | `questionnaire`
- **local_id:** UUID primary key of the row (e.g. `hli_longevity_profiles.id`)

Future: HLI may add stable `external_id` (global UUID) for profiles/intakes; if so, that can be used as the canonical cross-system reference instead of `local_id`.

---

## Event types (aligned to hli_longevity_audit_events)

The following event types correspond to or extend what is (or can be) written to `hli_longevity_audit_events.event_type`. Payload keys are the agreed shape for normalized emission.

| event_type | Description | Typical payload keys |
|------------|-------------|---------------------------|
| `profile.created` | New longevity profile created (e.g. from intake or portal signup). | `profile_id` |
| `profile.linked` | Profile linked to auth user (first portal login). | `profile_id`, `auth_user_id`? (optional; avoid PII in logs) |
| `intake.created` | Draft intake created. | `profile_id`, `intake_id` |
| `intake.updated` | Draft intake/questionnaire updated. | `profile_id`, `intake_id` |
| `intake.submitted` | Intake submitted (no longer draft). | `profile_id`, `intake_id` |
| `intake.status_changed` | Status transition (e.g. in_review → complete). | `profile_id`, `intake_id`, `from_status`, `to_status` |
| `document.uploaded` | Document record created (upload). | `profile_id`, `intake_id`?, `document_id`, `doc_type` |
| `document.generated` | System-generated document (e.g. blood request letter). | `profile_id`, `intake_id`?, `document_id`, `doc_type`, `blood_request_id`? |
| `signed_url_issued` | User requested a signed URL for a document. | `profile_id`, `intake_id`?, `document_id` |
| `blood_request.requested` | Blood request letter requested. | `profile_id`, `intake_id`, `blood_request_id` |
| `blood_request.completed` | Blood request workflow completed. | `profile_id`, `intake_id`, `blood_request_id` |

**Payload rules:**

- `profile_id`: always present when the event is scoped to a profile.
- `intake_id`: present when the event is scoped to an intake.
- Optional keys can be omitted. Consumers should treat missing keys as null/absent.
- Do not put PII (e.g. email, name) in event payloads unless required by contract; prefer IDs.

---

## Use by other systems

- **HairAudit:** May consume `intake.submitted` (or equivalent) to know when an HLI intake is available for audit workflows; identity via `(hli_longevity, intake, local_id)`.
- **Follicle Intelligence:** May consume a stream of events for analytics and signals; same vocabulary and payload shapes.
- **HLI** remains the single owner of longevity data; this vocabulary only defines how events are **expressed** for outbound use.

---

## Change policy (when versioned)

- New event types and optional payload keys: additive only.
- Renames or removal of event types or required keys: new version (e.g. `hli_longevity.v2`).
- Document version and, when implemented, `source_version` in payloads.
