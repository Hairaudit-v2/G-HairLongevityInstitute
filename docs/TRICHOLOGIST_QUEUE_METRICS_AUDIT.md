# Audit: Trichologist review queue — Submitted 1, In queue 0, Assigned 0, Completed 1, “No cases in queue”

## 1. How each queue health metric is calculated

**File:** `app/api/longevity/review/metrics/route.ts`

All metrics are **counts** from `hli_longevity_intakes`:

| UI label   | Metric key         | Query logic |
|-----------|--------------------|-------------|
| **Submitted** | `total_submitted` | `status != 'draft'` (any intake that has ever been submitted) |
| **In queue**  | `in_queue`        | `review_status IN (human_review_required, under_trichologist_review, awaiting_patient_documents)` |
| **Assigned**  | `assigned`        | Same as In queue **and** `assigned_trichologist_id IS NOT NULL` |
| **Completed** | `completed`       | `review_status = 'review_complete'` |

Relevant constant:

**File:** `lib/longevity/reviewConstants.ts`

```ts
export const REVIEW_STATUS_IN_QUEUE: ReviewStatus[] = [
  REVIEW_STATUS.HUMAN_REVIEW_REQUIRED,   // "human_review_required"
  REVIEW_STATUS.UNDER_TRICHOLOGIST_REVIEW, // "under_trichologist_review"
  REVIEW_STATUS.AWAITING_PATIENT_DOCUMENTS, // "awaiting_patient_documents"
];
```

So:

- **Submitted** = total non-draft intakes (cumulative).
- **In queue** = intakes currently in one of the three “in-queue” workflow statuses.
- **Assigned** = subset of In queue that has an assigned trichologist.
- **Completed** = intakes that have been released (`review_complete`).

---

## 2. Which review_status values are included in the visible queue list

**File:** `app/api/longevity/review/queue/route.ts`

- **Default list:** Only intakes whose `review_status` is in **`REVIEW_STATUS_IN_QUEUE`**:
  - `human_review_required`
  - `under_trichologist_review`
  - `awaiting_patient_documents`
- **Optional:** If the UI sends `include_released=1`, the API adds `review_complete` to the filter, so released/completed cases can appear in the list.

So by default the **visible queue list** shows exactly the same set of statuses as **“In queue”** in the metrics. No other `review_status` values (e.g. `submitted`, `ai_review_pending`, `follow_up_recommended`) are included unless `include_released` is used for `review_complete`.

---

## 3. Are “submitted” cases excluded from the queue? Why?

**Terminology:**

- **“Submitted” metric** = intakes with `status != 'draft'` (i.e. ever submitted). This is **not** the same as `review_status = 'submitted'`.
- **“In queue” / queue list** = intakes with `review_status IN REVIEW_STATUS_IN_QUEUE` (the three statuses above).

So:

- **Submitted (metric):** Counts **all** non-draft intakes, including the one that is now completed. So “Submitted: 1” is correct for one intake that was submitted and later completed.
- **Queue list:** Only shows intakes that are **currently** in one of the three in-queue statuses. An intake that has moved to `review_complete` is no longer in that set, so it is **excluded from the default queue list** (and from “In queue” / “Assigned” counts).

So “submitted” (non-draft) cases are **not** excluded by some extra rule; the list simply only includes intakes whose **current** `review_status` is one of the three in-queue values. Once an intake becomes `review_complete`, it is no longer in the queue list and no longer in “In queue” or “Assigned,” but it still counts in “Submitted” and “Completed.”

**Triage and `review_status = 'submitted'`:**  
**File:** `lib/longevity/triage.ts`

On submit, triage sets:

- `review_status = human_review_required` if human review is needed, **or**
- `review_status = submitted` if not.

`submitted` is **not** in `REVIEW_STATUS_IN_QUEUE`, so intakes that are triaged to `submitted` (no human review) never appear in the trichologist queue. That is by design: they are not meant for the review queue.

---

## 4. Are completed / released / awaiting-docs cases excluded? Why?

- **Completed / released** (`review_status = review_complete`):
  - **Excluded from the default queue list** (and from “In queue” / “Assigned”).
  - **Included** in the “Completed” metric.
  - **Included in the queue list only if** the user checks “Include released” (then the API adds `review_complete` to the status filter).

- **Awaiting patient documents** (`review_status = awaiting_patient_documents`):
  - **Included** in the queue: it is one of `REVIEW_STATUS_IN_QUEUE`. So these cases **do** appear in the queue list and in “In queue” (and “Assigned” if they have an assignee).

So: completed/released are excluded from the default queue by design; awaiting-docs are in the queue.

---

## 5. Exact files and query logic

### Metrics (queue health numbers)

**File:** `app/api/longevity/review/metrics/route.ts` (lines 28–68)

```ts
// Submitted
.from("hli_longevity_intakes").select("id", { count: "exact", head: true }).neq("status", "draft")

// In queue
.from("hli_longevity_intakes").select("id", { count: "exact", head: true }).in("review_status", REVIEW_STATUS_IN_QUEUE)

// Assigned
.from("hli_longevity_intakes").select("id", { count: "exact", head: true })
  .in("review_status", REVIEW_STATUS_IN_QUEUE).not("assigned_trichologist_id", "is", null)

// Completed
.from("hli_longevity_intakes").select("id", { count: "exact", head: true })
  .eq("review_status", REVIEW_STATUS.REVIEW_COMPLETE)
```

### Queue list (visible rows)

**File:** `app/api/longevity/review/queue/route.ts` (lines 76–102)

- `baseStatusList` = query param `review_status` if it’s one of `REVIEW_STATUS_IN_QUEUE`, else **all of** `REVIEW_STATUS_IN_QUEUE`.
- `statusList` = `baseStatusList`, and if `include_released=1`, add `REVIEW_STATUS.REVIEW_COMPLETE`.
- Query: `.from("hli_longevity_intakes").select(...).in("review_status", statusList).order("created_at", { ascending: true }).limit(MAX_FETCH)` (+ optional priority and `assigned_to_me` filters).

### Constants

**File:** `lib/longevity/reviewConstants.ts`

- `REVIEW_STATUS` (all allowed values).
- `REVIEW_STATUS_IN_QUEUE` = `[human_review_required, under_trichologist_review, awaiting_patient_documents]`.

### UI

**File:** `components/longevity/TrichologistReviewWorkspace.tsx`

- Queue health: lines 1222–1276 (displays `queueMetrics` from `/api/longevity/review/metrics`).
- Queue list: `fetchQueue` (e.g. 575) calls `/api/longevity/review/queue` with `buildQueueParams()` (552–560); `includeReleased` sets `include_released=1`.
- “No cases in queue”: line 1368 when `displayList.length === 0`.

---

## 6. Is the current UI state correct or is there a mismatch?

**Conclusion: the current UI state is correct; there is no mismatch between metrics and queue listing.**

Interpretation of what you see:

- **Submitted: 1** — There is 1 non-draft intake (the one that was submitted and then completed).
- **In queue: 0** — No intake is currently in `human_review_required`, `under_trichologist_review`, or `awaiting_patient_documents`.
- **Assigned: 0** — No in-queue intake has an assignee (consistent with In queue 0).
- **Completed: 1** — That same intake has `review_status = review_complete`.
- **“No cases in queue”** — The queue list only shows intakes in `REVIEW_STATUS_IN_QUEUE`; there are 0 such intakes, so the list is empty.

So the single intake is counted in **Submitted** (because it’s not draft) and in **Completed** (because it’s released), and correctly **not** in **In queue** or **Assigned**, and correctly **not** in the default queue list. Metrics and queue list use the same definition of “in queue” and are consistent.

To see the completed case in the list, use the **“Include released”** checkbox; that adds `review_complete` to the queue API filter so released cases are returned in the list.
