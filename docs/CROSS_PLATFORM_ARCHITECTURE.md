# Cross-Platform Architecture: HLI, HairAudit, Follicle Intelligence

This document defines a **future-proof architecture** for three separate but integration-ready platforms: **Hair Longevity Institute (HLI)**, **HairAudit**, and **Follicle Intelligence**. It establishes product boundaries, identity strategy, canonical entities, events, signals, data-sharing rules, and an implementation path.

---

## 1. Product / domain boundaries

### 1.1 Invariants

- **Three separate products and codebases** in concept and operation.
- **No collapse** into one operational system; no tight coupling of HLI patient workflows to HairAudit audit workflows.
- **Follicle Intelligence** is not the direct owner of either platform’s transactional data; it consumes normalized data/signals and may return computed insights under contract.
- **Isolation, security boundaries, and domain ownership** are preserved; interoperability is through **stable contracts** and **explicit data flows**.

### 1.2 Domain ownership matrix

| Domain | Owner | Scope | Data / tables (examples) |
|--------|--------|--------|----------------------------|
| **Patient portal** | HLI | Trichology intake, blood/scalp uploads, longitudinal follow-up, patient-facing UX | `hli_longevity_*` |
| **Trichology intakes (longevity)** | HLI | Questionnaires, draft/submitted lifecycle, follow-up intakes | `hli_longevity_intakes`, `hli_longevity_questionnaires` |
| **Longevity documents & blood requests** | HLI | Uploads, letters, storage paths | `hli_longevity_documents`, `hli_longevity_blood_requests` |
| **Hair transplant audit** | HairAudit | Audit cases, patient/doctor/clinic/auditor workflows | `hli_intakes`, `hli_reports`, `hli_medical_referrals`, etc. |
| **Scoring, reports, benchmarking, verification** | HairAudit | Report lifecycle, AI scoring, auditor notes, rankings | `hli_reports`, `hli_ai_*`, `hli_auditor_notes` |
| **Shared intelligence** | Follicle Intelligence | Cross-platform signals, risk modeling, analytics, AI-ready feature services, white-label APIs | Consumes from HLI & HairAudit; owns only derived/aggregate and consent-bound copies |

### 1.3 Boundary rules

- **HLI** does not write to HairAudit tables; HairAudit does not write to HLI longevity tables.
- **Operational writes** stay in the system that owns the domain (HLI writes longevity; HairAudit writes audit/reports).
- **Follicle Intelligence** reads via defined contracts (events, APIs, or sync); it may write only to its own store (e.g. derived insights, feature vectors) or back to a platform via a **return contract** (e.g. “risk score for this case”).
- **Identity linking** and **global IDs** are defined in §2–3; they do not require merging databases.

---

## 2. Identity strategy across systems

### 2.1 Principle

- Each platform has **local identity** (e.g. HLI profile, HairAudit patient/intake).
- **Cross-platform identity** is expressed via **canonical global IDs** (§3) and optional **linkage records** so that “this person in HLI” can be associated with “this person in HairAudit” or “this global person” without either system owning the other’s data.

### 2.2 Local identities (source of truth per system)

| System | Local identity concept | Example store |
|--------|------------------------|----------------|
| HLI | Patient / profile | `hli_longevity_profiles.id`, optional `auth_user_id` |
| HairAudit | Patient / intake / case | e.g. `hli_intakes.id`, patient identifiers in audit model |
| Follicle Intelligence | None for PII; only references | References `global_person_id`, `global_case_id`, etc.; no “patient” row as source of truth |

### 2.3 Shared identity linking (future)

- A **global person** can have multiple **local identities** (one in HLI, one or more in HairAudit, e.g. per clinic).
- **Linkage** is stored in a single place: either a small **Identity & Registry** service or a dedicated store within Follicle Intelligence (registry only; no ownership of HLI/HairAudit transactional data).
- Linking is **explicit and consented**: e.g. patient opts in to “link my HLI profile with my audit record” or clinic links an audit case to a global person. Consent is recorded and auditable (§6).
- **Discovery**: When HLI emits an event with `global_person_id` (optional), Follicle Intelligence can correlate with HairAudit events for the same person. Neither platform needs to hold the other’s primary key.

### 2.4 Recommended approach

- **Phase 1 (now):** HLI and HairAudit each use only local IDs; no shared identity.
- **Phase 2 (integration):** Introduce an **Identity Registry** (minimal service or FI module) that:
  - Issues and stores **global_person_id** (and optionally other global IDs).
  - Stores **links**: `(global_person_id, source_system, local_entity_type, local_id)`.
  - Does not store PII; only IDs and linkage. PII remains in HLI or HairAudit.
- **Phase 3:** Platforms send events or API calls that include `global_person_id` when the person has been linked; FI (and optionally HairAudit) use it for correlation and analytics.

---

## 3. Canonical entity strategy

### 3.1 Global ID concepts

| Global ID | Meaning | Issuer | Used by |
|-----------|--------|--------|---------|
| **global_person_id** | One person across HLI, HairAudit, FI (e.g. patient) | Identity Registry (or FI registry module) | HLI, HairAudit, FI for correlation and consent |
| **global_case_id** | One “case” or engagement (e.g. one audit case, or one longitudinal “case” in HLI) | Source system (HLI or HairAudit) or Registry | FI, cross-references |
| **global_provider_id** | Doctor / provider across systems | Registry or HairAudit (if single source) | HairAudit, FI |
| **global_clinic_id** | Clinic / practice | Registry or HairAudit | HairAudit, FI |
| **global_document_id** | Document reference across systems (e.g. report, upload) | Source system | HLI, HairAudit, FI for references |

### 3.2 Issuance and storage

- **Option A – Registry as issuer:** A dedicated Identity & Registry service (or FI-owned registry) **issues** all global IDs and stores linkage. HLI and HairAudit store `global_person_id` (and others) as **foreign references** when an entity is linked; they do not issue global IDs themselves.
- **Option B – Source system issues:** Each system issues global IDs for entities it owns (e.g. HLI issues `global_document_id` for its documents) and **registers** them with the Registry so FI can resolve. `global_person_id` and `global_case_id` are still issued by the Registry to avoid collisions.

**Recommendation:** **Registry issues** `global_person_id`, `global_provider_id`, `global_clinic_id` (and optionally `global_case_id` if cases are shared). **Source systems issue** `global_document_id` and **global_case_id** when “case” is system-specific (e.g. HLI longitudinal case = profile + timeline; HairAudit case = audit case). Then register them with the Registry so FI can resolve `(source_system, local_id) ↔ global_*_id`.

### 3.3 Format and storage (recommendation)

- **Format:** UUID v4 for all global IDs; immutable once assigned.
- **Where stored:**
  - **Registry:** `(global_*_id, source_system, entity_type, local_id, created_at)`.
  - **HLI:** Add optional columns e.g. `hli_longevity_profiles.global_person_id`, `hli_longevity_intakes.global_case_id` (when linked). No FK to other products’ DBs.
  - **HairAudit:** Same idea: optional `global_person_id` / `global_case_id` / `global_provider_id` / `global_clinic_id` where needed.
- **Follicle Intelligence:** Stores only global IDs and derived data; no copy of full operational records unless under a specific data-sharing contract.

---

## 4. Normalized event model for cross-platform events

### 4.1 Purpose

- Both HLI and HairAudit emit **normalized events** that Follicle Intelligence (and optionally the other platform) can consume.
- Same **envelope** and **routing** rules; **payload** and **event_type** come from a shared vocabulary (§5).

### 4.2 Event envelope (contract)

Every cross-platform event has this shape:

```json
{
  "event_id": "uuid",
  "event_type": "string (from shared vocabulary)",
  "source_system": "hli_longevity | hairaudit",
  "source_version": "1",
  "occurred_at": "ISO8601",
  "actor_type": "user | system | admin",
  "entity_refs": {
    "global_person_id": "uuid | null",
    "global_case_id": "uuid | null",
    "global_document_id": "uuid | null",
    "source_system": "same as top-level",
    "local_entity_type": "profile | intake | case | report | ...",
    "local_entity_id": "uuid"
  },
  "payload": { ... }
}
```

- **event_id:** Unique per event (e.g. UUID); deduplication and idempotency.
- **event_type:** From shared signal vocabulary (§5).
- **source_system:** Which product emitted the event.
- **entity_refs:** Canonical and local identity so FI (and others) can correlate without holding PII. Include `global_*_id` when linkage exists.
- **payload:** Event-type-specific; no PII unless required by contract; prefer IDs.

### 4.3 Transport (future)

- **Push:** HLI and HairAudit POST events to an **Event Ingest API** (owned by FI or a thin gateway) that validates envelope and forwards to FI’s event store.
- **Pull:** FI polls an event feed from each system (e.g. read API over `hli_longevity_audit_events` and HairAudit equivalent) and normalizes into the same envelope.
- **Hybrid:** Systems write to an **event bus** (e.g. queue) with the same envelope; FI consumes. No direct DB access from FI to HLI/HairAudit.

Recommendation: **Push to an Ingest API** or **event bus** so FI does not need read access to operational DBs; both platforms transform their internal audit/events into this envelope before sending.

---

## 5. Shared signal vocabulary

### 5.1 Role

- **One vocabulary** of event types and payload conventions that **HLI and HairAudit** both use when emitting to Follicle Intelligence.
- FI interprets by `source_system` + `event_type`; payload shape is defined per type so FI can parse without product-specific logic.

### 5.2 Namespace and versioning

- **Namespace:** e.g. `follicle_signals` or `cross_platform.v1`.
- **Event type format:** `domain.action` or `domain.entity.action` (e.g. `longevity.intake.submitted`, `audit.report.approved`).
- **Versioning:** When payload or semantics change, introduce a new version (e.g. `source_version: "2"`) and document in the vocabulary.

### 5.3 Example event types (unified vocabulary)

| event_type | source_system | Description | Key payload / entity_refs |
|------------|---------------|-------------|----------------------------|
| `longevity.profile.created` | hli_longevity | HLI profile created | profile_id, optional global_person_id |
| `longevity.profile.linked` | hli_longevity | Profile linked to auth | profile_id |
| `longevity.intake.submitted` | hli_longevity | Longevity intake submitted | profile_id, intake_id, optional global_case_id |
| `longevity.document.uploaded` | hli_longevity | Document uploaded | profile_id, intake_id?, document_id, doc_type |
| `longevity.blood_request.completed` | hli_longevity | Blood request completed | profile_id, intake_id, blood_request_id |
| `audit.case.created` | hairaudit | Audit case created | case/intake id, optional global_person_id, global_clinic_id |
| `audit.report.generated` | hairaudit | Report generated | report_id, case_id, optional global_document_id |
| `audit.report.approved` | hairaudit | Report approved | report_id, case_id |
| `audit.referral.created` | hairaudit | Referral created | referral_id, case_id, optional global_provider_id |

- **HLI** already has a draft vocabulary in **`docs/contracts/hli_longevity_signals.md`**; align those event types with this naming (e.g. `longevity.*`).
- **HairAudit** should define a parallel set (`audit.*`) in a similar contract doc. FI consumes both under the same envelope and vocabulary.

### 5.4 Where to maintain

- **Single doc or repo:** e.g. `docs/contracts/shared_signal_vocabulary.md` (or in a shared repo if multiple codebases). List all event types, payload shapes, and which system emits them. FI and both platforms use it as the contract.

---

## 6. Data-sharing model: consent and source-of-truth

### 6.1 Principles

- **Source of truth:** Operational data is owned by the system that created it (HLI or HairAudit). No system overwrites another’s source data.
- **Explicit consent:** Sharing with Follicle Intelligence (or linking identity across systems) requires **recorded consent** (e.g. purpose, scope, timestamp). Consent is stored by the **source system** or in the Registry; FI only receives data that is consented and within contract.
- **Minimal and purpose-bound:** Only data necessary for the agreed purpose (e.g. risk modeling, analytics, insights) is shared; use IDs and signals rather than full PII where possible.
- **Auditability:** Events and consent decisions are logged; access to shared data is traceable.

### 6.2 Consent model (recommendation)

- **Consent record** (stored in HLI for HLI data, in HairAudit for HairAudit data, or in Registry when linking):
  - `scope`: e.g. `share_with_follicle_intelligence`, `link_identity_for_audit`.
  - `purpose`: short description.
  - `granted_at`, `revoked_at` (optional).
  - `subject`: local identity (e.g. profile_id or case id) and optionally global_person_id once linked.
- **FI** does not store consent; it only receives data that the source system (or gateway) has already filtered by consent. Gateway or source system checks consent before pushing events or responding to API calls.

### 6.3 Data flows (summary)

| Direction | Content | Consent / gate |
|----------|--------|------------------|
| HLI → FI | Normalized events, optional global IDs, minimal payload | Consent for “share with FI”; HLI (or gateway) filters |
| HairAudit → FI | Normalized events, optional global IDs, minimal payload | Consent or policy; HairAudit (or gateway) filters |
| FI → HLI | Computed insights (e.g. risk score, features) | Contract; HLI decides what to store and show |
| FI → HairAudit | Computed insights, signals | Contract; HairAudit decides what to store and show |
| HLI ↔ HairAudit | No direct operational data flow; correlation via FI or Registry using global_person_id when linked | Explicit linking consent |

---

## 7. Implementation path and next steps

### 7.1 Implementation path (high level)

| Phase | Focus | HLI | HairAudit | Follicle Intelligence |
|-------|--------|-----|-----------|------------------------|
| **1** | HLI portal only | Implement portal (auth, dashboard, longitudinal intakes); keep isolation | No change | No change |
| **2** | Contracts and vocabulary | Document events; add optional `external_id` if needed | Document audit events and entity model | Document ingest contract and vocabulary |
| **3** | Event emission (HLI) | Emit normalized events (same envelope) to log or internal queue | — | — |
| **4** | FI ingest | — | — | Event Ingest API or consumer; store by envelope |
| **5** | Identity Registry | Store optional `global_person_id` when issued; send in events | Same | Issue and store global IDs; linkage |
| **6** | HairAudit emission | — | Emit normalized events | FI consumes both |
| **7** | Consent and gating | Consent record; gate outbound by consent | Same | Consume only what’s sent |

### 7.2 Immediate next technical steps

1. **HLI (current codebase)**  
   - Keep building the HLI portal as the single focus (§7.1 Phase 1).  
   - No schema or workflow changes to HairAudit.

2. **Documentation**  
   - Add **`docs/contracts/shared_signal_vocabulary.md`** that:
     - Defines the **normalized event envelope** (§4.2).
     - Lists **event types** for both `hli_longevity` and `hairaudit` (stub the latter).
     - References **`docs/contracts/hli_longevity_signals.md`** for HLI detail and a future `hairaudit_signals.md` for HairAudit.

3. **HLI: optional integration hooks (no FI dependency)**  
   - Add **optional** columns only when you need them for future linking (can be Phase 2):
     - `hli_longevity_profiles.global_person_id` (nullable UUID).
     - `hli_longevity_intakes.global_case_id` (nullable UUID).
   - Ensure **audit/event payloads** can carry `source_system`, `event_type`, and a **stable local id** (and later `global_person_id` / `global_case_id` when present). Prefer extending existing `hli_longevity_audit_events` payload shape rather than new tables for now.

4. **HairAudit**  
   - No code change now.  
   - Document in the same repo (or HairAudit repo) that audit events will be mapped to the shared envelope and vocabulary when Phase 6 starts.

5. **Follicle Intelligence**  
   - No build now.  
   - Document the **Event Ingest API** contract (envelope + vocabulary) and the **Identity Registry** responsibilities so both can be implemented in a later phase.

### 7.3 Future integration hooks to add now (minimal)

To avoid rework later, add only **low-cost, backward-compatible** hooks:

| Hook | Where | What |
|------|--------|------|
| **Envelope-ready events** | HLI | When writing to `hli_longevity_audit_events`, include in payload (or in a thin mapping layer) the fields needed for the normalized envelope: `event_type`, `source_system`, `local_entity_type`, `local_entity_id`. No new tables. |
| **Optional global ID columns** | HLI (migration) | Nullable `global_person_id` on `hli_longevity_profiles`, nullable `global_case_id` on `hli_longevity_intakes`. Populate only when Registry exists and linkage is done. |
| **Shared vocabulary doc** | Repo | Single `docs/contracts/shared_signal_vocabulary.md` with envelope + event type list for both systems. |
| **Consent placeholder** | HLI | Optional `consent_scope` / `consent_at` on profile or a single `hli_longevity_consents` table (scope, granted_at, profile_id). No FI call; just readiness. |

Do **not** add: FI API clients, Registry implementation, or HairAudit event emission in the HLI codebase. Keep those for when the integration project starts.

---

## 8. Document index and references

| Document | Purpose |
|----------|---------|
| **docs/CROSS_PLATFORM_ARCHITECTURE.md** (this file) | Cross-platform boundaries, identity, canonical entities, events, vocabulary, data-sharing, implementation path |
| **docs/HLI_PORTAL_AND_INTEGRATION_STRATEGY.md** | HLI-specific portal and integration strategy |
| **LONGEVITY_PORTAL_ARCHITECTURE.md** | HLI portal implementation (routes, auth, migrations) |
| **docs/contracts/hli_longevity_signals.md** | HLI event types and payload conventions (draft) |
| **docs/contracts/shared_signal_vocabulary.md** | Unified envelope + event types for HLI and HairAudit |

---

## Summary

- **Boundaries:** HLI owns patient portal and longevity data; HairAudit owns audit/reports; Follicle Intelligence consumes signals and returns insights under contract, without owning transactional data.
- **Identity:** Local IDs per system; optional global IDs (e.g. `global_person_id`) issued and linked via a future Identity Registry; consent for linking and sharing.
- **Canonical entities:** `global_person_id`, `global_case_id`, `global_provider_id`, `global_clinic_id`, `global_document_id` with clear issuer and storage rules.
- **Events:** Normalized envelope; shared signal vocabulary; both platforms emit; FI consumes.
- **Data-sharing:** Source-of-truth stays in HLI/HairAudit; explicit consent; minimal, purpose-bound sharing.
- **Implementation:** Proceed with HLI portal now; add documentation and optional schema hooks for global IDs and consent; defer Registry, FI ingest, and HairAudit emission to later phases.
