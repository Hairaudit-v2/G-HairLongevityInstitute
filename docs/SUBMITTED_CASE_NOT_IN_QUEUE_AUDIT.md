# Audit: Why a submitted longevity case is not visible in the trichologist review queue

**Observed:** Queue health shows Submitted: 1, In queue: 0, Assigned: 0, Completed: 1, and the queue list shows “No cases in queue.”

---

## 1. How the trichologist queue list is built

**File:** `app/api/longevity/review/queue/route.ts`

- The workspace calls **GET `/api/longevity/review/queue`** with query params: `limit`, `offset`, optional `review_status`, `priority`, `assigned_to_me`, `include_released`.
- The API queries **`hli_longevity_intakes`** with:
  - **`review_status IN statusList`** (see below)
  - Optional filters: `review_priority`, `assigned_trichologist_id` (when “My cases”).
- **statusList** is built as:
  - If `review_status` query param is one of the allowed in-queue values → use that single status.
  - Else → **baseStatusList = REVIEW_STATUS_IN_QUEUE** (all three in-queue statuses).
  - If **`include_released=1`** → append **`REVIEW_STATUS.REVIEW_COMPLETE`** to the list.
- So **by default** the list is exactly: intakes whose **`review_status`** is in **REVIEW_STATUS_IN_QUEUE**. No other statuses are included unless “Include released” is checked.

**File:** `components/longevity/TrichologistReviewWorkspace.tsx`

- **fetchQueue** (e.g. line 575) calls `/api/longevity/review/queue?${params}`.
- **buildQueueParams** (552–560) sets `limit`, optional `review_status`, `priority`, `assigned_to_me`, and **`include_released`** when the “Include released” checkbox is on.
- The rendered list is **data.items** from that response; when empty, the UI shows “No cases in queue” (or “No cases assigned to you” in “My cases” mode).

---

## 2. Which review_status values are included in the visible queue

**File:** `lib/longevity/reviewConstants.ts`

```ts
export const REVIEW_STATUS_IN_QUEUE: ReviewStatus[] = [
  REVIEW_STATUS.HUMAN_REVIEW_REQUIRED,    // "human_review_required"
  REVIEW_STATUS.UNDER_TRICHOLOGIST_REVIEW, // "under_trichologist_review"
  REVIEW_STATUS.AWAITING_PATIENT_DOCUMENTS, // "awaiting_patient_documents"
];
```

- **Default list:** Only these three statuses. Any other **review_status** (e.g. **`submitted`**, **`ai_review_pending`**, **`review_complete`**, **`follow_up_recommended`**) is **excluded** from the default queue list.
- **With “Include released”:** The API adds **`review_complete`** to the filter, so released cases appear in the list.

So a case is **visible in the queue** if and only if its **review_status** is one of the three in-queue values (or `review_complete` when “Include released” is on).

---

## 3. How the “Submitted” metric is calculated

**File:** `app/api/longevity/review/metrics/route.ts` (lines 28–30)

```ts
supabase
  .from("hli_longevity_intakes")
  .select("id", { count: "exact", head: true })
  .neq("status", "draft")
```

- **“Submitted”** = count of rows where **`status != 'draft'`**.
- So “Submitted” means **“ever submitted”** (any non-draft intake). It does **not** mean “review_status = submitted” and does **not** mean “currently in the queue.”
- One intake can therefore count in **Submitted** and in **Completed** at the same time (non-draft and `review_status = review_complete`).

---

## 4. Are submitted cases expected to appear in the visible queue immediately?

**No — only if their review_status is “in queue”.**

Flow when a patient submits:

**File:** `app/api/longevity/intakes/[id]/submit/route.ts`

1. Intake is updated to **`status: "submitted"`** (and no longer draft).
2. **Triage** runs (**`lib/longevity/triage.ts`**):
   - **computeTriage(responses)** sets:
     - **needsHumanReview = flags.manualReviewRecommended**
     - **review_status = needsHumanReview ? HUMAN_REVIEW_REQUIRED : SUBMITTED**
   - So right after submit, **review_status** is either:
     - **`human_review_required`** → **in REVIEW_STATUS_IN_QUEUE** → **appears in the queue**, or
     - **`submitted`** → **not in REVIEW_STATUS_IN_QUEUE** → **does not appear in the queue**.

So:

- **Expected to appear immediately:** Only when triage sets **`human_review_required`** (or later when status becomes **`under_trichologist_review`** or **`awaiting_patient_documents`**).
- **Not expected to appear:** When triage sets **`submitted`** (no human review recommended). By current design those cases never enter the trichologist queue.

Your numbers (**Submitted: 1, In queue: 0, Completed: 1**) mean:

- There is **one** non-draft intake.
- That intake has **review_status = review_complete** (so it is “Completed” and not “In queue”).
- So that **one** case is already **released**; it is not “waiting” in the queue. It will not appear in the default list by design. It will appear if “Include released” is checked.

---

## 5. Can the case be opened via direct intake deep link if not listed?

**File:** `app/api/longevity/review/intakes/[id]/route.ts` (lines 59–63)

```ts
const inQueue = REVIEW_STATUS_IN_QUEUE.includes(intake.review_status as ...);
const isReleased = intake.review_status === REVIEW_STATUS.REVIEW_COMPLETE;
if (!inQueue && !isReleased) {
  return NextResponse.json({ ok: false, error: "Intake is not in the review queue or released." }, { status: 403 });
}
```

- **Deep link:** `/portal/trichologist/review?intake=<intake_id>` (see **`app/portal/trichologist/review/page.tsx`** → **initialIntakeId** → workspace loads that case).
- **GET `/api/longevity/review/intakes/[id]`** allows access only if:
  - **inQueue** (review_status is one of the three in-queue values), **or**
  - **isReleased** (review_status is **review_complete**).

So:

- **Completed case (review_complete):** Not in the default queue list, but **can** be opened via deep link **`/portal/trichologist/review?intake=<id>`**.
- **Triage “submitted” (review_status = submitted):** Not in the queue list and **cannot** be opened by this API; the trichologist gets **403** “Intake is not in the review queue or released.”

---

## 6. Exact files, query logic, and status values

| Concern | File | Logic / values |
|--------|------|-----------------|
| Queue list source | `app/api/longevity/review/queue/route.ts` | `.in("review_status", statusList)` with **statusList** = REVIEW_STATUS_IN_QUEUE (default) or + REVIEW_COMPLETE if include_released |
| In-queue statuses | `lib/longevity/reviewConstants.ts` | **REVIEW_STATUS_IN_QUEUE** = [human_review_required, under_trichologist_review, awaiting_patient_documents] |
| “Submitted” metric | `app/api/longevity/review/metrics/route.ts` | Count where **status != 'draft'** |
| Triage at submit | `lib/longevity/triage.ts` | **review_status** = manualReviewRecommended ? **human_review_required** : **submitted** |
| Submit persistence | `app/api/longevity/intakes/[id]/submit/route.ts` | Sets **status: "submitted"**, then **review_status** (and priority) from triage |
| Case detail / deep link | `app/api/longevity/review/intakes/[id]/route.ts` | Allow only if **inQueue** or **isReleased** (review_complete) |
| Review page + deep link | `app/portal/trichologist/review/page.tsx` | **?intake=ID** → **initialIntakeId** → workspace fetches that intake |

---

## 7. Direct answers

### Where should the trichologist review the patient report?

- **If the case is in the queue (human_review_required / under_trichologist_review / awaiting_patient_documents):** In the **Queue** list; select the case to open the review panel.
- **If the case is already completed (review_complete):** Either turn on **“Include released”** and select it from the list, or open it via **direct link:**  
  **`/portal/trichologist/review?intake=<intake_id>`**.

### Why is the current submitted case not appearing?

- With **Submitted: 1, In queue: 0, Completed: 1**, the **one** intake is in **review_complete**.
- The **queue list** only shows intakes whose **review_status** is in **REVIEW_STATUS_IN_QUEUE** (by default it does not show **review_complete**).
- So the case is **not missing**: it is **already completed** and therefore no longer in the “work to do” queue. The UI is behaving as designed.

### What exact fix is needed if this is a mismatch?

- **If the desired behaviour is “trichologist can always open any submitted (non-draft) case”:**
  - **Option A (recommended):** Allow GET **`/api/longevity/review/intakes/[id]`** for any non-draft intake (e.g. allow when **status !== 'draft'** instead of only inQueue || isReleased). Then the deep link **`/portal/trichologist/review?intake=<id>`** works for every submitted case, including those with **review_status = submitted** or **review_complete**.
  - **Option B:** Include **review_status = submitted** (and optionally **review_complete**) in the queue list so they appear in the list; then the same API and list logic would need to allow those statuses in the queue request and in the case-detail access check.

- **If the desired behaviour is “every submitted case should appear in the queue until released”:**
  - Change triage so that **every** submission gets an in-queue status (e.g. always set **human_review_required** at submit, or introduce a “new” status that is in **REVIEW_STATUS_IN_QUEUE**). Today, triage can set **submitted**, which by design never enters the queue.

- **If the desired behaviour is only “I want to see my one completed case in the list”:**
  - No code change: use the **“Include released”** checkbox so the list includes **review_complete**, or use the deep link **`/portal/trichologist/review?intake=<id>`**.

Summary: the current metrics and queue list are consistent. The “submitted” case not appearing is because that one case is **completed**; it is excluded from the default queue by design. To review it, use “Include released” or the intake deep link. If product wants all submitted cases (including triage-“submitted” or completed) to be openable or listable, apply one of the fixes above.
