# Trichologist access and review flow

## Setup (Task A)

### Create trichologist account

1. Ensure env has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. Run (idempotent):
   ```bash
   npx tsx scripts/setup-trichologist.ts
   ```
3. Optional: set `TRICHOLOGIST_INITIAL_PASSWORD` so the script uses a known password; otherwise it prints a one-time password.
4. Email used: **trichologist@evolvedhair.com.au**. The script creates the Supabase Auth user (if missing) and a row in `hli_longevity_trichologists` linked by `auth_user_id`. Role is implicit: presence in `hli_longevity_trichologists` with `is_active = true`.

### Access control

- **Portal root (`/portal`)**: After sign-in, trichologists are redirected to `/portal/trichologist/review`; patients to `/portal/dashboard`.
- **Dashboard (`/portal/dashboard`)**: If the signed-in user is a trichologist, they are redirected to the review workspace (no patient data).
- **Auth callback**: Redirects to `/portal` so the server can choose destination by role.
- **Review workspace (`/portal/trichologist/review`)**: Requires trichologist auth; otherwise redirect to `/portal/login?redirect=/portal/trichologist/review`.

All review APIs (`/api/longevity/review/*`) use `getTrichologistFromRequest()` and return 401 if not a trichologist. Queue permissions are role-safe (trichologist-only routes).

---

## Verification (Task B — end-to-end)

1. **Sign in**  
   Go to `/portal/login`, sign in as **trichologist@evolvedhair.com.au**. You should land on **Review workspace** (`/portal/trichologist/review`), not the patient dashboard.

2. **Access queue**  
   The workspace loads the list from `GET /api/longevity/review/queue`. You should see intakes in review statuses (e.g. `human_review_required`, `under_trichologist_review`).

3. **Open a case**  
   Click an intake in the queue. `GET /api/longevity/review/intakes/[id]` returns case detail (questionnaire, documents, **internal notes**). Internal notes are only in this trichologist-only API.

4. **Assign to self**  
   Use “Assign to me”. `POST /api/longevity/review/claim` sets `assigned_trichologist_id` and `review_status = under_trichologist_review`. Audit event `review_claimed` with `actor_type: trichologist`.

5. **Internal notes**  
   Add a note in the case panel. `POST /api/longevity/review/notes` inserts into `hli_longevity_review_notes`. These are never returned by patient-facing APIs.

6. **Set review outcome**  
   Choose outcome and “Set outcome”. `POST /api/longevity/review/outcome` updates `review_outcome` and `last_reviewed_at`. Audit `review_outcome_set`, `actor_type: trichologist`.

7. **Patient summary and release**  
   Enter text in “Patient summary (release to patient)” and click “Release patient summary”. `POST /api/longevity/review/release` sets `patient_visible_summary`, `patient_visible_released_at`, and `review_status = review_complete`. Audit `patient_summary_released`. Only after release does the patient see the summary in the portal dashboard and in `GET /api/longevity/intakes/[id]` (as `released_summary`).

---

## Checks (Task C)

- **Queue permissions**: All `/api/longevity/review/*` handlers call `getTrichologistFromRequest()`; 401 if not trichologist. No patient session used for review.
- **Internal notes**: Stored in `hli_longevity_review_notes`; returned only by `GET /api/longevity/review/intakes/[id]` (trichologist-only). Patient dashboard and `GET /api/longevity/intakes/[id]` do not expose notes.
- **Released summaries only to patients**: Dashboard uses `patient_visible_released_at` and `patient_visible_summary`; patient intake API returns `released_summary` only when both are set.
- **Audit**: `hli_longevity_audit_events.actor_type` includes `'trichologist'` (migration `20250316000004`). Review actions use `actor_type: "trichologist"` and `trichologist_id` in payload where relevant.

---

## Run

```bash
npx tsc --noEmit
```

Then sign in as the trichologist and walk the steps above to confirm the full journey.
