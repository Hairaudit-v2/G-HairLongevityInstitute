# Longevity intake triage (Phase B)

This document describes how **rule-based triage** works for longevity intakes so that **Phase C (Trichologist dashboard)** can rely on it. Triage is additive and does not change patient-facing behavior.

## When triage runs

- **On submit:** When a patient submits an intake (`POST /api/longevity/intakes/:id/submit`), the server:
  1. Updates intake `status` to `submitted` (unchanged from pre–Phase B).
  2. Inserts an audit event `intake_submitted`.
  3. **Runs triage:** loads the latest questionnaire for that intake, runs `computeTriage(responses)` from `lib/longevity/triage.ts`, and updates the intake with `review_status`, `review_priority`, and `review_decision_source = 'rules'`.
- Triage is **best-effort.** If the questionnaire is missing or triage throws, the submit still succeeds; `review_status` / `review_priority` / `review_decision_source` remain null (backward compatible).

## Triage logic (rules only)

- **Source:** `lib/longevity/triage.ts` → `computeTriage(responses)`.
- **Input:** Questionnaire `responses` (same shape as `LongevityQuestionnaireResponses` in `lib/longevity/schema.ts`).
- **Output:** `review_status`, `review_priority`, `review_decision_source`, and a `flags` object.

### review_status

- **`human_review_required`** when `manualReviewRecommended(responses)` is true (atypical or complex presentation: patchy loss, burning/tenderness, autoimmune, or ≥3 risk domains).
- **`submitted`** otherwise (no human review required by rules).

Other review statuses (`under_trichologist_review`, `awaiting_patient_documents`, `review_complete`, etc.) are **not** set by triage; they are set later by Trichologist actions or Phase C+ workflow.

### review_priority

- **`high`** when `review_status === human_review_required`.
- **`normal`** when `review_status === submitted`.

Finer priority (e.g. `urgent` for specific patterns) can be added later in the same module without changing the contract.

### review_decision_source

- Always **`rules`** for Phase B (rule-based triage only). Future AI or mixed source can set `ai` or `mixed` elsewhere.

### Derived flags (for queue and dashboard)

`computeTriage` returns a `flags` object used by the review queue API and, in Phase C, the Trichologist dashboard:

| Flag | Source (lib/longevity/derivedFlags.ts) | Meaning |
|------|----------------------------------------|--------|
| `manualReviewRecommended` | `manualReviewRecommended(r)` | Patchy loss, burning/tenderness, autoimmune, or ≥3 risk domains → human review |
| `bloodsLikelyNeeded` | `bloodsLikelyNeeded(r)` | No recent bloods (or unsure) and at least one risk flag |
| `possibleIronRisk` | `possibleIronRisk(r)` | Diet/history/symptoms suggest iron relevance |
| `possibleThyroidRisk` | `possibleThyroidRisk(r)` | Thyroid history or symptoms |
| `possibleHormonalPattern` | `possibleHormonalPattern(r)` | Female-specific hormonal pattern |
| `possibleInflammatoryPattern` | `possibleInflammatoryPattern(r)` | Scalp/skin inflammation |
| `possibleAndrogenPattern` | `possibleAndrogenPattern(r)` | Distribution + family/onset pattern |
| `possibleStressTrigger` | `possibleStressTrigger(r)` | Stress/trigger-driven shedding |
| `postpartumFlag` | `postpartumFlag(r)` | Postpartum-related |

Flags are **read-only** from the clinician’s perspective (computed from questionnaire). Phase C can display them in the queue and case detail to explain why a case was escalated.

## Internal API: review queue (Phase B)

- **Endpoint:** `GET /api/longevity/review/queue`
- **Auth:** Trichologist only (`getTrichologistFromRequest()`). Returns 401 if not a Trichologist.
- **Scope:** Longevity only; no HLI intake/report/referral data.

**Query (optional):**

- `review_status` — filter by one of: `human_review_required`, `under_trichologist_review`, `awaiting_patient_documents`. If omitted, all three are included (full queue).

**Response:**

- `ok: true`, `items: ReviewQueueItem[]`
- Each item: `id`, `review_status`, `review_priority`, `created_at`, `assigned_trichologist_id`, `flags` (same shape as triage flags).
- Flags are **recomputed** from the latest questionnaire per intake (no separate stored flags table in Phase B).
- Order: `created_at` ascending (oldest first).

Phase C dashboard should use this API to render the queue and optionally filter by `review_status` or use `flags` for badges/filters.

## Database columns (additive)

Triage only **writes** to existing Phase A columns on `hli_longevity_intakes`:

- `review_status`
- `review_priority`
- `review_decision_source`

It does not create or change any other tables. Patient-facing `status` is unchanged.

## Summary for Phase C

1. **Queue source:** Intakes with `review_status` in `{ human_review_required, under_trichologist_review, awaiting_patient_documents }`; use `GET /api/longevity/review/queue` (Trichologist auth).
2. **Why a case is in queue:** If it was triaged at submit, `review_decision_source === 'rules'` and `flags.manualReviewRecommended` drove `human_review_required`; show `flags` in the UI.
3. **Priority:** Use `review_priority` for sort/display; triage sets `high` when human review is required, `normal` otherwise.
4. **Extending triage:** Add rules or AI in `lib/longevity/triage.ts` (or a separate step that updates the same columns); keep `review_decision_source` and optional payload in audit if needed.
