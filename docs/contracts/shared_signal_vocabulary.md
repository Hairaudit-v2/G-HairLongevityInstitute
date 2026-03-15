# Shared Signal Vocabulary — Cross-Platform Events

This document defines the **normalized event envelope** and **event type registry** for events emitted by **Hair Longevity Institute (HLI)** and **HairAudit** and consumed by **Follicle Intelligence** (and optionally by each other). It is the single contract for cross-platform event shape and semantics.

See **`docs/CROSS_PLATFORM_ARCHITECTURE.md`** for product boundaries, identity strategy, and implementation path.

---

## 1. Event envelope (normalized)

Every event sent across system boundaries MUST use this envelope. Systems may store events internally in any shape but MUST map to this shape when emitting.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event_id` | UUID string | Yes | Unique per event; used for deduplication and idempotency. |
| `event_type` | string | Yes | From the shared vocabulary below (e.g. `longevity.intake.submitted`). |
| `source_system` | string | Yes | `hli_longevity` \| `hairaudit`. |
| `source_version` | string | No | Version of the emitting system’s event contract (e.g. `"1"`). |
| `occurred_at` | ISO8601 string | Yes | When the event occurred. |
| `actor_type` | string | No | `user` \| `system` \| `admin`. |
| `entity_refs` | object | Yes | Canonical and local identity (see below). |
| `payload` | object | No | Event-type-specific data; no PII unless required by contract. |

### 1.1 entity_refs (required)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source_system` | string | Yes | Same as top-level `source_system`. |
| `local_entity_type` | string | Yes | e.g. `profile`, `intake`, `case`, `report`, `document`. |
| `local_entity_id` | UUID string | Yes | Primary key in the source system. |
| `global_person_id` | UUID string | No | Set when person is linked in the Identity Registry. |
| `global_case_id` | UUID string | No | Set when case is registered. |
| `global_document_id` | UUID string | No | Set when document is registered. |
| `global_provider_id` | UUID string | No | Relevant for HairAudit events. |
| `global_clinic_id` | UUID string | No | Relevant for HairAudit events. |

---

## 2. Event type registry

### 2.1 Naming convention

- Format: `{domain}.{entity}.{action}` or `{domain}.{action}`.
- **domain:** `longevity` (HLI) or `audit` (HairAudit).
- **entity:** profile, intake, document, case, report, referral, etc.
- **action:** created, submitted, updated, approved, completed, etc.

### 2.2 HLI Longevity (source_system: `hli_longevity`)

| event_type | Description | Key payload / entity_refs |
|------------|-------------|---------------------------|
| `longevity.profile.created` | HLI profile created | `local_entity_type`: profile, `local_entity_id`: profile id |
| `longevity.profile.linked` | Profile linked to auth user | profile id |
| `longevity.intake.created` | Draft intake created | profile id, intake id |
| `longevity.intake.updated` | Draft intake/questionnaire updated | profile id, intake id |
| `longevity.intake.submitted` | Intake submitted | profile id, intake id |
| `longevity.intake.status_changed` | Status transition | profile id, intake id, `from_status`, `to_status` |
| `longevity.document.uploaded` | Document upload recorded | profile id, intake id (optional), document id, `doc_type` |
| `longevity.document.generated` | System-generated document (e.g. letter) | profile id, document id, `doc_type` |
| `longevity.blood_request.requested` | Blood request letter requested | profile id, intake id, blood_request id |
| `longevity.blood_request.completed` | Blood request completed | profile id, intake id, blood_request id |

Full HLI payload conventions: **`docs/contracts/hli_longevity_signals.md`**.

### 2.3 HairAudit (source_system: `hairaudit`)

| event_type | Description | Key payload / entity_refs |
|------------|-------------|---------------------------|
| `audit.case.created` | Audit case / intake created | case/intake id, optional global_person_id, global_clinic_id |
| `audit.report.generated` | Report generated | report id, case id, optional global_document_id |
| `audit.report.approved` | Report approved | report id, case id |
| `audit.report.released` | Report released to patient | report id, case id |
| `audit.referral.created` | Medical referral created | referral id, case id, optional global_provider_id |
| `audit.referral.status_changed` | Referral status updated | referral id, case id, status |

HairAudit-specific payload conventions: to be added in `docs/contracts/hairaudit_signals.md` (or in HairAudit repo).

---

## 3. Versioning and change policy

- **Additive only:** New event types and new optional fields in payload/entity_refs are allowed.
- **Breaking changes:** New `source_version` and document in this file; deprecate old types with a timeline.
- **Follicle Intelligence** may support multiple `source_version` values during transition.

---

## 4. References

- **Architecture:** `docs/CROSS_PLATFORM_ARCHITECTURE.md`
- **HLI signals (draft):** `docs/contracts/hli_longevity_signals.md`
- **HLI portal:** `LONGEVITY_PORTAL_ARCHITECTURE.md`, `docs/HLI_PORTAL_AND_INTEGRATION_STRATEGY.md`
