# Changelog: Backend review workflow foundations

## Migration

- **`supabase/migrations/20250316000005_hli_longevity_review_workflow.sql`**
  - **hli_longevity_intakes:** Added nullable columns:
    - `triaged_at` (timestamptz) — timestamp when triage logic was last applied.
    - `triage_version` (text) — version identifier for triage rules used.
  - **review_priority validation:** Added check constraint so `review_priority` is either null or one of: `low`, `normal`, `high`, `urgent`. Backward compatible (existing nulls and valid values unchanged).

---

## Triage updates

- **`lib/longevity/triage.ts`**
  - Added constant: `TRIAGE_VERSION = 'rules_v1'`.
  - **`computeTriage(responses)`** now also returns:
    - `triaged_at` — ISO timestamp at compute time.
    - `triage_version` — `TRIAGE_VERSION`.
  - Rules unchanged: `manualReviewRecommended` → `review_status = human_review_required`, else `submitted`; manual review → `review_priority = high`, else `normal`; `review_decision_source = 'rules'`.

---

## Submit route

- **`app/api/longevity/intakes/[id]/submit/route.ts`**
  - After triage, persists to **hli_longevity_intakes:** `review_status`, `review_priority`, `review_decision_source`, **`triaged_at`**, **`triage_version`** (in addition to existing fields).
  - Best-effort triage unchanged; submission still returns `{ ok: true, status: "submitted" }` even if triage fails.

---

## Endpoints

1. **POST /api/longevity/review/claim**
   - **Input:** `{ intake_id: string }`.
   - **Auth:** Trichologist only.
   - **Behavior:** Sets `assigned_trichologist_id`, `assigned_at`, `review_status = under_trichologist_review` on the intake. Writes audit event `review_claimed`. Intake must be in review queue.
   - **Response:** Updated intake summary (id, review_status, review_priority, assigned_trichologist_id, assigned_at, created_at).

2. **POST /api/longevity/review/notes**
   - **Input:** `{ intake_id: string, body: string }`.
   - **Auth:** Trichologist only.
   - **Behavior:** Inserts into `hli_longevity_review_notes` (intake_id, trichologist_id, body). Writes audit event `review_note_added`. Intake must be in review queue.
   - **Response:** Note metadata (id, intake_id, created_at).

3. **POST /api/longevity/review/release**
   - **Input:** `{ intake_id: string, patient_visible_summary: string, review_outcome?: string }`.
   - **Auth:** Trichologist only.
   - **Behavior:** Updates intake: `patient_visible_summary`, `patient_visible_released_at`, `last_reviewed_at`, `review_status = review_complete`, optional `review_outcome`. Writes audit event `patient_summary_released`. Intake must be in review queue.
   - **Response:** Updated intake (id, review_status, review_outcome, patient_visible_summary, patient_visible_released_at, last_reviewed_at).

---

## Queue changes

- **GET /api/longevity/review/queue**
  - Response items now include **`triaged_at`** and **`triage_version`** (from intake row).
  - Trichologist auth, oldest-first ordering, optional `review_status` filter, and flag recomputation unchanged.
