# Hair Longevity Institute: Portal & Integration Strategy

This document defines the **platform strategy**, **persistent patient portal architecture**, and **future integration-ready design** for Hair Longevity Institute (HLI), in relation to HairAudit and Follicle Intelligence.

---

## Platform strategy (invariants)

- **Hair Longevity Institute**, **HairAudit**, and **Follicle Intelligence** remain **separate products**.
- **No merging of codebases** or tight coupling of operational workflows.
- **HLI** is built as a **standalone patient portal** with its own:
  - UX (longevity/portal routes, components)
  - Auth (Supabase Auth scoped to longevity/portal)
  - Routes (`/longevity/*`, `/portal/*`)
  - Data ownership (`hli_longevity_*` tables only)
- The architecture is **integration-ready**: HLI can later exchange **selected data/signals** with HairAudit and Follicle Intelligence through **controlled contracts**, without merging systems.

**Ownership boundaries:**

| Domain | Owner | Scope |
|--------|--------|--------|
| Patient portal, intakes, questionnaires, blood/scalp uploads, blood request workflows | **HLI** | `hli_longevity_*` |
| Audit cases, reports, scoring, clinic/doctor workflows, verification/ranking | **HairAudit** | `hli_intakes`, `hli_reports`, `hli_medical_referrals`, admin/doctor flows |
| Shared intelligence/analytics (future) | **Follicle Intelligence** | Consumer of signals; not owner of HLI or HairAudit operational flows |

**Design rule:** Do not modify existing HLI intake/report/referral/admin flows **outside** the isolated longevity namespace. All new portal and integration-oriented work stays modular, reviewable, and backward-compatible.

---

## A. Safe architecture: persistent patient portal

### A.1 Current state (already implemented)

The longevity lane has been evolved into a **persistent patient portal** with:

- **Patient login** via Supabase Auth at `/portal/login`; session read on server via `@supabase/ssr`.
- **Profile binding**: `hli_longevity_profiles.auth_user_id` (nullable, unique) links one profile per auth user; cookie-only users remain supported.
- **Portal dashboard** at `/portal/dashboard`: lists intakes and documents, “New intake”, “Resume” (draft), Sign out. Dashboard sets the longevity session cookie so `/longevity/start` and `/api/longevity/*` use the same profile.
- **Repeat follow-up intakes**: each submission is a **new row** in `hli_longevity_intakes`; no overwriting of prior data.
- **Longitudinal continuity**: documents and blood requests tie to profile and/or intake; `hli_longevity_audit_events` provides an append-only timeline per profile/intake.

See **`LONGEVITY_PORTAL_ARCHITECTURE.md`** for routes, auth flow, and migration details.

### A.2 Architecture summary (portal model)

| Concern | Approach |
|--------|----------|
| **Identity** | One `hli_longevity_profiles` row per patient; optional 1:1 link to `auth.users` via `auth_user_id`. |
| **Auth** | Portal: Supabase Auth (login/signup). Anonymous: longevity session cookie only. |
| **Intakes** | One row per submission; `profile_id` → profile; status lifecycle: draft → submitted → in_review → complete. |
| **Documents** | Attach to profile and/or intake (and/or blood_request); longitudinal by profile. |
| **Blood requests** | Per intake; documents (e.g. letters) reference `blood_request_id`. |
| **Case continuity** | Profile is the durable entity; intakes and documents are time-ordered by `created_at`; audit events give a single timeline. |

### A.3 Longitudinal case continuity

- **Profile** = durable patient identity in the longevity product; all intakes, questionnaires, documents, and blood requests hang off the profile or its intakes.
- **Intakes** are never overwritten; “follow-up” = new intake with same `profile_id`.
- **Documents** can be profile-level (e.g. general uploads) or intake-level (e.g. bloods for a specific assessment).
- **Audit events** (`hli_longevity_audit_events`) are append-only and keyed by `profile_id` and optionally `intake_id`; they support a single longitudinal view of activity without touching HairAudit tables.

This gives a clear, HLI-owned longitudinal “case” (profile + timeline of intakes and events) that can later be exposed to other systems via controlled contracts.

---

## B. Future integration-ready design

The following concepts prepare HLI for **cross-platform interoperability** with HairAudit and Follicle Intelligence **without** requiring immediate deep integration. Implement only what is needed for the portal today; add the rest when integration projects start.

### B.1 Canonical / global entity IDs

**Concept:** Every entity that might be referenced across systems has a **stable, system-scoped identity** so that HairAudit or Follicle Intelligence can refer to “this HLI profile” or “this HLI intake” without relying on internal UUIDs alone.

**Options (pick one when integrating):**

1. **Composite key:** `(source_system, local_id)`  
   - `source_system` = e.g. `"hli_longevity"`  
   - `local_id` = existing UUID (e.g. `hli_longevity_profiles.id`).  
   - No schema change today; define the convention in the contract.

2. **Global UUID (optional column):**  
   - Add `external_id` (or `global_id`) to key tables: e.g. `hli_longevity_profiles`, `hli_longevity_intakes`.  
   - Value: UUID v4 generated at creation, never changed; used only for cross-system references.  
   - Enables other systems to store “HLI profile X” without knowing internal DB primary key.

**Recommendation for now:** Do **not** add columns yet. Document the convention: “HLI entities are identified by `(source_system: 'hli_longevity', entity_type, local_id: uuid)`.” When building the first integration, add `external_id` only to entities that need to be referenced by other systems (e.g. profile, intake).

### B.2 Source-system–aware records

**Concept:** When HLI **emits** or **stores** data that might be consumed by another system, each record is tagged with **origin/source** so consumers can attribute and filter.

**Application:**

- **Outbound:** Events or payloads emitted by HLI should include a field such as `source_system: "hli_longevity"` (and optionally `source_entity_type`, `source_entity_id`). No change to existing tables required; this is part of the **event/payload contract**.
- **Inbound (future):** If HLI ever **receives** data from HairAudit or Follicle Intelligence, store it with a `source_system` (and optionally `source_id`) so it is clear it did not originate in HLI.

**Recommendation for now:** Define the field names and semantics in an **integration contract** (see B.4). Implement when building the first outbound channel (e.g. event feed or API).

### B.3 Normalized event emission

**Concept:** A **single, consistent** stream of “things that happened” (profile created, intake submitted, document uploaded, etc.) with a stable structure so Follicle Intelligence or HairAudit can consume without HLI-specific logic.

**Existing asset:** `hli_longevity_audit_events` is append-only and has `profile_id`, `intake_id`, `event_type`, `payload` (jsonb), `actor_type`, `created_at`. It is the natural source for “what happened in HLI.”

**Normalized emission (future):**

- **Option A – Same table, agreed contract:** Keep writing to `hli_longevity_audit_events`; define a **public event schema** (event types + payload shapes). Integrators read (e.g. via API or secure replication) and interpret using that schema.
- **Option B – Outbound event table/queue:** Add a small table or use a queue (e.g. `hli_longevity_outbound_events`) that mirrors a subset of audit events in a normalized shape (`event_type`, `entity_type`, `entity_id`, `payload`, `source_system`, `occurred_at`). HLI writes to both audit and outbound; consumers read only the outbound stream.

**Recommendation for now:** Do **not** add an outbound table yet. Document that **event semantics** will be defined by a **shared signal vocabulary** (B.4). When building integration, either expose a read API over `hli_longevity_audit_events` with a stable event-type and payload contract, or add a thin outbound layer that maps audit events to that contract.

### B.4 Shared signal vocabulary

**Concept:** A **small, versioned vocabulary** of event types and payload keys so that HairAudit and Follicle Intelligence can interpret HLI events (and, later, vice versa) without tight coupling.

**Elements:**

- **Namespace:** e.g. `hli_longevity.v1` or `hli_longevity.portal.v1`.
- **Event types:** e.g. `profile.linked`, `intake.submitted`, `intake.draft.saved`, `document.uploaded`, `blood_request.requested`. Define in a single place (markdown or JSON schema).
- **Payload shape:** For each event type, list allowed keys (e.g. `profile_id`, `intake_id`, `doc_type`, `actor_type`). Optional: JSON Schema for payloads.
- **Source attribution:** Every event includes `source_system: "hli_longevity"` (and optionally version).

**Recommendation for now:** Add a **vocabulary doc** (e.g. `docs/signals/hli_longevity_events.md` or `docs/contracts/hli_longevity_signals.md`) that lists current `hli_longevity_audit_events.event_type` values and suggested payload keys. When integration starts, formalize as the single source of truth and add versioning.

### B.5 Summary: integration-ready, no immediate deep integration

| Concept | Action now | When integrating |
|--------|------------|-------------------|
| Canonical/global entity IDs | Document convention `(source_system, entity_type, local_id)` | Add `external_id` to profile/intake if needed |
| Source-system–aware records | Define `source_system` in contract | Add to outbound payloads and any inbound storage |
| Normalized event emission | Rely on `hli_longevity_audit_events`; document semantics | Add read API or outbound table/queue with stable schema |
| Shared signal vocabulary | Add vocabulary doc (event types + payload keys) | Version it; use as contract for consumers |

---

## C. Recommended implementation sequence

Phasing minimizes rework and keeps the longevity lane isolated.

### Phase 1 – Portal foundation (done)

- [x] Bind `auth.users` to `hli_longevity_profiles` (`auth_user_id`).
- [x] Add profile-level documents (`profile_id` on `hli_longevity_documents`).
- [x] Implement `/portal` (login, dashboard), Supabase Auth + session cookie sync.
- [x] Keep repeat intakes as new rows; no overwrite.
- [x] Longitudinal continuity: profile-centric intakes, documents, audit events.

### Phase 2 – Documentation and contracts (recommended next)

- [ ] **Update LONGEVITY_PORTAL_ARCHITECTURE.md** with any product-specific nuances (e.g. “case” = profile + timeline).
- [ ] **Add shared signal vocabulary doc:** list `event_type` values and payload keys for `hli_longevity_audit_events` (see B.4).
- [ ] **Document integration conventions:** canonical ID format, `source_system` semantics, and that HLI does not read HairAudit/Follicle tables.

No schema or code changes required; this is purely contract and vocabulary so future work is aligned.

### Phase 3 – Portal UX and longitudinal clarity (optional next)

- [ ] Differentiate “first-time intake” vs “follow-up” in UI (e.g. “Start new follow-up” vs “Start first intake”) if product needs it.
- [ ] Optional: profile-level “timeline” or activity view driven by `hli_longevity_audit_events`.
- [ ] Optional: allow linking documents to “current” or “latest” intake from dashboard without re-entering flow.

All changes stay inside longevity/portal namespace.

### Phase 4 – Integration readiness (when cross-platform work starts)

- [ ] Add **vocabulary versioning** (e.g. `hli_longevity.v1`) and treat it as the contract for event consumers.
- [ ] Expose **read API or feed** for events (filtered, secured) with payload shape matching the vocabulary.
- [ ] If external systems need to reference HLI entities: add **external_id** (or equivalent) to `hli_longevity_profiles` and optionally `hli_longevity_intakes`; populate on create; include in event payloads.
- [ ] Add **source_system** (and optional **source_entity_id**) to outbound payloads and to any inbound storage if HLI begins consuming external data.

No merge of HLI with HairAudit or Follicle Intelligence; only clear contracts and optional IDs for cross-system references.

---

## Document index

| Document | Purpose |
|----------|---------|
| **docs/HLI_PORTAL_AND_INTEGRATION_STRATEGY.md** (this file) | Platform strategy, portal architecture, integration-ready design, implementation sequence |
| **LONGEVITY_PORTAL_ARCHITECTURE.md** | Concrete portal implementation: routes, auth, migrations, env |
| **docs/contracts/hli_longevity_signals.md** | Shared signal vocabulary (event types, payload conventions) for future integration |

---

## Summary

- **A. Portal:** HLI is a standalone persistent patient portal with login, profile binding, dashboard, repeat intakes, and longitudinal case continuity; all implemented in the longevity namespace without changing existing HLI intake/report/referral flows.
- **B. Integration-ready:** Canonical IDs, source-system attribution, normalized event emission, and a shared signal vocabulary are **designed and documented** so HLI can later exchange selected data with HairAudit and Follicle Intelligence via **controlled contracts**, without merging systems or owning their flows.
- **C. Sequence:** Phase 1 done; Phase 2 = documentation and vocabulary; Phase 3 = portal UX/timeline; Phase 4 = integration implementation when needed.
