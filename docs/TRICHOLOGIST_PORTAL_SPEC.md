# Trichologist Portal — Planning & Specification (Future)

This document is a **planning and specification** for a future **Trichologist login and dashboard**. The **patient-side longitudinal case model** (profile, additive intakes, document continuity) is stable and documented in **`LONGEVITY_PORTAL_ARCHITECTURE.md`** (§ Longitudinal case model); Trichologist implementation should rely on that model without changing it. within the Hair Longevity Institute longevity module. It is **not an implementation plan for immediate build**; it defines role, workflow, dashboard, data model, security, and a staged implementation sequence so that:

- Current **patient portal** progress is not interrupted.
- Trichologist features can be added later without rework.
- HLI intake/report/referral/admin flows **outside** the longevity namespace remain unchanged.
- Trichologist workflows stay **isolated** from HairAudit and Follicle Intelligence operational logic.

---

## 1. Role model

### 1.1 Trichologist role (HLI longevity only)

- **Definition:** A clinician (trichologist) who reviews **longevity** patient cases within the HLI product. They view submitted intakes, questionnaire responses, uploaded documents, and AI-derived flags; they add internal notes, set review outcomes, and optionally release patient-visible summaries or next-step guidance.
- **Scope:** Only **longevity** data: `hli_longevity_profiles`, `hli_longevity_intakes`, `hli_longevity_questionnaires`, `hli_longevity_documents`, and any additive review tables. No access to `hli_intakes`, `hli_reports`, `hli_medical_referrals`, or admin/doctor flows unless a separate, future integration contract exists.
- **Identity:** Trichologists are identified by a dedicated store (e.g. `hli_longevity_trichologists` or a link from `auth.users` to a trichologist record). Auth is separate from patient portal auth (e.g. same Supabase Auth with a role/metadata or a separate auth path).

### 1.2 Distinction from other roles

| Role | Scope | Primary use |
|------|--------|-------------|
| **Patient** | Own profile and intakes only; own documents | Portal: submit intakes, upload documents, view own dashboard. |
| **Trichologist** | All longevity cases in review queue; assigned cases; documents for those cases | Review queue, triage, internal notes, review outcome, patient-visible summary. |
| **Admin (existing)** | HairAudit / HLI main: intakes, reports, referrals, auditors | Audit platform, reports, referrals. **Not** the same as longevity Trichologist. |
| **Follicle Intelligence** | Consumer of signals; no direct operational ownership | Future: analytics, risk signals. Not a “login” role in HLI. |

- Trichologist is **not** a superset of patient: they do not act as a patient in the same session; they have a separate entry point (e.g. `/trichologist` or `/longevity/clinician`).
- Trichologist is **not** the same as HairAudit admin/doctor: no modification of `hli_intakes` / `hli_reports` / referral flows from the Trichologist portal.

### 1.3 What a Trichologist can view / edit / release

| Data | View | Edit | Release to patient |
|------|------|------|--------------------|
| Intake metadata (status, dates) | Yes | Status/outcome only via review workflow | — |
| Questionnaire responses | Yes | No (read-only) | No (internal only) |
| Uploaded documents (bloods, scalp, etc.) | Yes | No | No (view only) |
| AI-derived / triage flags | Yes | No (system-set) | Summarised in summary only if desired |
| Internal notes | Yes (own/team) | Yes | No |
| Review outcome / priority | Yes | Yes | — |
| Patient-visible summary / next steps | Yes | Yes | Yes (explicit “release” or “publish”) |
| Blood request letters (future) | Yes | Per blood-request workflow | Yes when generated for patient |

- “Release” means making a specific output (e.g. summary, next steps) visible to the patient in the **patient** portal. All such releases are auditable (who, when, what).

---

## 2. Workflow model

### 2.1 Lifecycle: submission to review

1. **Patient** submits an intake (status: `submitted`).
2. **System** runs AI-assisted triage / derived flags (e.g. `manualReviewRecommended`, `bloodsLikelyNeeded` from `lib/longevity/derivedFlags.ts`). No human in the loop yet.
3. **System** sets a **review status** (and optionally priority) on the intake or on a separate review record:
   - Cases that need human review (e.g. flagged by rules or AI) move to a “human review” state.
   - Others may stay in a “no human review needed” path (e.g. auto-complete or standard pathway).
4. **Trichologist** sees a **queue** of cases needing review; they may **assign** a case to themselves (or be assigned).
5. **Trichologist** reviews questionnaire, documents, and flags; adds **internal notes**; sets **review outcome**; optionally writes and **releases** a **patient-visible summary** or next steps.
6. Case moves to a terminal or follow-up state (e.g. `review_complete` or `follow_up_recommended`). If “awaiting patient documents” is used, the case can later return to the queue when the patient uploads.

### 2.2 Escalation to human review

- **Rule-based:** Use existing derived flags (e.g. `manualReviewRecommended(r)` returns true for patchy loss, burning/tenderness, autoimmune, or ≥3 risk domains). When an intake is submitted, compute flags and set a **review_required** or **human_review_required** flag (or equivalent status).
- **Future AI:** If a future AI triage step runs (e.g. Follicle Intelligence or internal model), it can set a “human review recommended” or priority score. The spec stays agnostic of where the signal comes from; the **data model** only needs a place to store “this case needs human review” and optional priority/score.
- **Manual escalation:** Optional: an admin or support role could move a case into the Trichologist queue even if not auto-flagged (out of scope for first Trichologist release but allowed in the model).

### 2.3 Recommended case statuses (additive)

Extend or complement the **existing** intake status (`draft` | `submitted` | `in_review` | `complete`) with a **review-specific** status or a separate **review state** so that:

- **Patient-facing** intake status remains simple (e.g. draft / submitted / in_review / complete).
- **Clinician-facing** workflow uses a richer set for queue and triage.

Recommended **review status** values (stored on intake or on a separate review table):

| Status | Meaning |
|--------|--------|
| `submitted` | Patient submitted; not yet triaged or triage did not require human review. |
| `ai_review_pending` | Triage/AI step not yet run (optional; can be implicit). |
| `human_review_required` | Flagged for Trichologist review (by rules or AI). |
| `under_trichologist_review` | Assigned and being reviewed. |
| `awaiting_patient_documents` | Trichologist requested more documents; waiting on patient. |
| `review_complete` | Human review done; outcome set; no follow-up needed yet. |
| `follow_up_recommended` | Patient advised to do follow-up intake or upload in future. |

- **Backward compatibility:** Existing `in_review` and `complete` can be mapped to “under review” and “review complete” in the UI, or we add a dedicated **review_status** column and keep **status** for patient-facing lifecycle only. Recommendation: add **review_status** (or **clinician_status**) so existing `status` is unchanged and we don’t break current behaviour.

---

## 3. Dashboard model

### 3.1 Queue of cases needing review

- **Source:** Intakes (or review records) where `review_status` ∈ { `human_review_required`, `under_trichologist_review`, `awaiting_patient_documents` } (and optionally `ai_review_pending`).
- **Filters:** By status, priority, assigned/unassigned, date submitted.
- **Sort:** Priority (high first), then e.g. submitted date (oldest first) or “longest waiting”.

### 3.2 Priority and flag indicators

- **Priority:** Stored as `review_priority` (e.g. `low` | `normal` | `high` | `urgent`). Set by rules or AI; Trichologist may be allowed to change it.
- **Flags:** Display derived flags (e.g. “Iron risk”, “Thyroid risk”, “Manual review recommended”) from questionnaire so the Trichologist sees why the case was escalated. Flags are read-only (computed from questionnaire).

### 3.3 Assigned / unassigned logic

- **Unassigned:** `assigned_trichologist_id` is null; any Trichologist can pick up the case.
- **Assigned:** Set `assigned_trichologist_id` when a Trichologist claims or is assigned the case; optionally `assigned_at`.
- **My cases:** Filter where `assigned_trichologist_id = current_trichologist_id` for “My queue” vs “Unassigned queue”.

### 3.4 Difficult-case triage

- **Triage view:** List or cards showing: intake id, profile (de-identified or minimal: e.g. initials, age band), submitted date, priority, flags, assigned or not.
- **Detail view:** Full questionnaire (read-only), all documents (view only), internal notes (edit), outcome and patient-visible summary (edit/release). No edit of raw questionnaire or document content.

### 3.5 Document review

- Trichologist can **open** documents (signed URL or secure viewer) for intakes they are allowed to see (queue or assigned). Access is logged (audit).
- No “approve document” as a separate workflow required for first version; review outcome applies to the **case**, not per-document. Optional later: “document reviewed” checkboxes.

### 3.6 Patient-visible vs internal-only outputs

- **Internal only:** Internal notes, review outcome codes, priority, assignment. Never shown in the patient portal.
- **Patient-visible:** Only what is explicitly released: e.g. a **patient_visible_summary** or “next steps” text, and optionally “review complete” or “follow-up recommended” as a status the patient sees. Release is an explicit action (button or flag) and must be audited.

---

## 4. Data model recommendations (additive, longevity-only)

All of the following are **additive** and **isolated** to the longevity module (`hli_longevity_*`). No changes to `hli_intakes`, `hli_reports`, or referral tables.

### 4.1 Trichologist identity (new table, when building)

- **`hli_longevity_trichologists`**
  - `id` uuid PK
  - `auth_user_id` uuid not null unique → `auth.users(id)` (or nullable if invited-not-yet-activated)
  - `display_name` text
  - `email` text
  - `created_at`, `updated_at`
  - Optional: `is_active` boolean default true

So: Trichologists log in via Supabase Auth; the app resolves `auth_user_id` → `hli_longevity_trichologists.id`.

### 4.2 Intake-level review fields (additive columns on `hli_longevity_intakes`)

Add columns only when implementing the Trichologist flow; not required for current patient portal.

| Column | Type | Purpose |
|--------|------|--------|
| `review_status` | text | One of: submitted, ai_review_pending, human_review_required, under_trichologist_review, awaiting_patient_documents, review_complete, follow_up_recommended. |
| `review_priority` | text | low, normal, high, urgent (nullable). |
| `assigned_trichologist_id` | uuid FK → hli_longevity_trichologists(id) | Who is reviewing (nullable). |
| `assigned_at` | timestamptz | When assigned (nullable). |
| `last_reviewed_at` | timestamptz | Last time a Trichologist saved notes/outcome (nullable). |
| `review_outcome` | text | E.g. standard_pathway, bloods_recommended, referral_recommended, follow_up_scheduled, other (nullable). |
| `patient_visible_summary` | text | Released summary or next steps for patient (nullable). |
| `patient_visible_released_at` | timestamptz | When summary was released (nullable). |

- **Existing `status`** on intakes stays as-is for patient-facing lifecycle (draft, submitted, in_review, complete). Use **review_status** for clinician workflow so we don’t overload `status` or break existing behaviour.

### 4.3 Internal notes (new table, when building)

- **`hli_longevity_review_notes`**
  - `id` uuid PK
  - `intake_id` uuid not null FK → hli_longevity_intakes(id) on delete cascade
  - `trichologist_id` uuid not null FK → hli_longevity_trichologists(id)
  - `body` text not null
  - `created_at` timestamptz default now()
  - Optional: `is_internal` boolean default true (for future use)

So: multiple notes per intake; always internal-only; audit by trichologist_id and created_at.

### 4.4 Derived flags storage (optional, when building)

- Option A: Compute flags on demand from questionnaire (current approach in `derivedFlags.ts`). No new tables.
- Option B: Add **`hli_longevity_intake_flags`** (intake_id, flag_name, value, computed_at) for caching and queue filtering. Optional; only if query performance or “filter by flag” in the dashboard requires it.

Recommendation: **start with Option A**; add Option B only if needed.

### 4.5 Indexes (when adding columns/tables)

- `hli_longevity_intakes(review_status)`, `(assigned_trichologist_id)`, `(review_priority)` for queue and “my cases” filters.
- `hli_longevity_review_notes(intake_id)`, `(trichologist_id)`.

---

## 5. Security model

### 5.1 What a Trichologist can access

- **Read:** All longevity intakes that are in a “reviewable” state (or all submitted+ for simplicity), plus their questionnaires, documents (via signed URL or secure viewer), and audit events for those intakes. No read access to other products’ data (HairAudit, etc.) from the Trichologist portal.
- **Write:** Only longevity review data: assignment, review_status, review_priority, review_outcome, last_reviewed_at, patient_visible_summary, patient_visible_released_at; and rows in `hli_longevity_review_notes`. No write to questionnaire responses or document binaries.
- **Delete:** No delete of intakes or profiles from the Trichologist UI. Optional: allow “unassign” (set assigned_trichologist_id to null).

### 5.2 How access differs from patients

- **Patient:** Authenticated by `auth_user_id` → single `hli_longevity_profiles.id`; can only access that profile’s intakes and documents; APIs and UI filter by profile_id.
- **Trichologist:** Authenticated by `auth_user_id` → `hli_longevity_trichologists.id`; can access all intakes in the review queue (and assigned cases); APIs and UI filter by “is trichologist” and then by review_status / assigned_trichologist_id. No access to patient portal routes with patient identity.

### 5.3 Document access and audit

- **Document access:** Trichologist requests a signed URL (or stream) for a document; backend checks that the document’s intake is one the Trichologist is allowed to see (in queue or assigned) and that the user is a Trichologist. Use existing storage path and signed-URL pattern; add a **separate** API route (e.g. `/api/longevity/trichologist/documents/[id]/signed-url`) so that patient document routes are unchanged and Trichologist access is explicitly checked and logged.
- **Audit logging:** Log in `hli_longevity_audit_events`: actor_type = `trichologist`, and payload include trichologist_id, intake_id, action (e.g. assigned, review_started, outcome_set, summary_released), and optional document_id when a document is viewed. Patient-visible summary release must be audited (who, when, intake_id).

---

## 6. Recommended implementation sequence

### 6.1 Plan now (no code required)

- Treat this spec as the **single source of truth** for Trichologist role, workflow, dashboard, and data model.
- **Do not** add Trichologist tables or routes to the codebase until the patient portal (auth, profile binding, dashboard, documents) is stable and the next priority is clinician review.
- If you add **any** schema or API that might be reused later (e.g. a generic “review_status” on intakes), keep it **additive** and **nullable** so current behaviour is unchanged.

### 6.2 After patient auth / profile binding / dashboard are complete

- **Phase A – Data and identity**
  - Add migration: `hli_longevity_trichologists` table.
  - Add migration: optional columns on `hli_longevity_intakes` (review_status, review_priority, assigned_trichologist_id, assigned_at, last_reviewed_at, review_outcome, patient_visible_summary, patient_visible_released_at). All nullable; existing status unchanged.
  - Add migration: `hli_longevity_review_notes` table.
  - Implement Trichologist auth: resolve auth_user_id → trichologist record; reject if not a Trichologist on Trichologist routes.

- **Phase B – Triage and queue (no UI yet)** — *Implemented.* See **docs/LONGEVITY_TRIAGE.md** for how triage works and how Phase C should rely on it.
  - On intake submit, compute derived flags and set `review_status` (e.g. human_review_required when manualReviewRecommended), `review_priority`, and `review_decision_source = 'rules'`.
  - API: `GET /api/longevity/review/queue` (Trichologist auth); filter by review_status; returns priority and key derived flags.

- **Phase C – Trichologist dashboard UI**
  - Routes: e.g. `/longevity/trichologist` or `/trichologist` (redirect to login or dashboard).
  - Login: separate from patient (e.g. same Supabase Auth with role/metadata, or separate path).
  - Dashboard: queue (unassigned / my cases), priority and flags, assign/start review.
  - Case detail: questionnaire (read-only), documents (view with audit), internal notes (CRUD), outcome and patient-visible summary (edit + release with audit).

- **Phase D – Patient-visible summary**
  - Patient portal: show “Clinician summary” or “Next steps” when `patient_visible_summary` is not null and `patient_visible_released_at` is set. Read-only for patient.

### 6.3 Avoiding rework

- **Do not** build a generic “admin” or “HairAudit-style” dashboard; keep Trichologist scope to **longevity review only** and reuse existing longevity types (questionnaire schema, document types).
- **Do not** couple to Follicle Intelligence or HairAudit: no shared tables or shared auth; integration later via events/APIs if needed.
- **Do** reuse: existing questionnaire and document storage, existing audit_events table (with actor_type and payload), and existing Supabase Auth for Trichologist identity (with a separate trichologist table and route guard).
- **Do** add only the columns and tables listed above when you start Phase A; avoid speculative fields until the workflow demands them.

---

## 7. Summary

| Item | Recommendation |
|------|----------------|
| **Role** | Trichologist = longevity-only clinician; separate from patient and from HairAudit admin/doctor. |
| **Workflow** | Submitted → triage (flags) → human_review_required → assigned → under_review → outcome + optional patient summary release. |
| **Statuses** | Add **review_status** (and keep existing **status**); use recommended values for queue and triage. |
| **Dashboard** | Queue (unassigned / my cases), priority/flags, assign, case detail (read questionnaire/documents, write notes/outcome/summary). |
| **Data model** | Additive: hli_longevity_trichologists; optional columns on intakes; hli_longevity_review_notes. |
| **Security** | Trichologist sees only longevity data; document access via dedicated API + audit; patient sees only released summary. |
| **Sequence** | Plan now; build data/identity after patient portal is stable; then triage/queue API; then Trichologist UI; then patient-visible summary. |

This spec is **safe to implement later** without disrupting the current patient portal roadmap and keeps the Trichologist experience **separate but connected** to the patient experience within the isolated longevity namespace.

---

## Phase A implementation (foundations)

Phase A adds **backend/schema/auth foundations only**; no Trichologist dashboard UI or blood request workflow.

**Schema (migration `20250316000004_hli_longevity_trichologist_foundations.sql`):**
- **hli_longevity_trichologists**: id, auth_user_id, display_name, email, is_active, created_at, updated_at.
- **hli_longevity_intakes** (additive nullable columns): review_status, review_priority, review_decision_source (rules | ai | trichologist | mixed), assigned_trichologist_id, assigned_at, last_reviewed_at, review_outcome, patient_visible_summary, patient_visible_released_at. Patient-facing `status` unchanged.
- **hli_longevity_review_notes**: id, intake_id, trichologist_id, body, created_at.
- **hli_longevity_audit_events**: actor_type check extended to include `trichologist`.

**Code (longevity module only):**
- **lib/longevity/trichologistAuth.ts**: `getTrichologistFromRequest()`, `getTrichologistById()` — resolve Trichologist from Supabase Auth via hli_longevity_trichologists; does not affect patient or admin auth.
- **lib/longevity/reviewConstants.ts**: `REVIEW_STATUS`, `REVIEW_PRIORITY`, `REVIEW_DECISION_SOURCE` (rules, ai, trichologist, mixed), types; `REVIEW_STATUS_IN_QUEUE`; `AUDIT_ACTOR_TRICHOLOGIST`.
- **lib/longevity/documents.ts**: `auditLongevityEvent` accepts `actor_type: "trichologist"`; comment for Trichologist audit payload (trichologist_id in payload when needed).

**Phase B/C can rely on:** Trichologist identity table and auth helpers; intake review columns; review_notes table; shared review status/priority constants; audit events supporting actor_type trichologist.
