# HLI Longevity System — Full Implementation Audit

**Purpose:** Map the codebase to the defined product stages and report COMPLETE, PARTIALLY IMPLEMENTED, or NOT IMPLEMENTED based on actual code only.

**Audit date:** 2025-03-18

---

## Stage Summary

| Stage | Status |
|-------|--------|
| Stage I — Patient entry and intake creation | **COMPLETE** |
| Stage II — Questionnaire and save flow | **COMPLETE** |
| Stage III — Document upload system | **COMPLETE** |
| Stage IV — Patient dashboard and recovery | **COMPLETE** |
| Stage V — Trichologist review workspace | **COMPLETE** |
| Stage VI — Review actions and summary release (Phase C) | **COMPLETE** |
| Stage VII — Blood request workflow | **COMPLETE** |
| Stage VIII — GP support letter generation | **COMPLETE** |

---

## Detailed Findings

### Stage I — Patient entry and intake creation

**Status: COMPLETE**

| Requirement | Evidence |
|-------------|----------|
| `/longevity/start` | `app/longevity/start/page.tsx` — page exists; renders `LongevityStartFlow` when `isLongevityEnabled()`. |
| Create draft intake | `app/api/longevity/intakes/route.ts` — `POST` creates `hli_longevity_intakes` row (status `draft`) and `hli_longevity_questionnaires` row; returns `intakeId`, `profileId`. |
| Identify step (email, name) | `components/longevity/LongevityStartFlow.tsx` — step `identify`: email (required), full name (optional); `createDraft()` sends `email`, `full_name` to POST intakes. |
| Session cookie handling | `lib/longevityAuth.ts` — `setLongevitySession(profileId)`, `getLongevitySessionFromRequest()`; cookie `hli_longevity_session`, 24h, httpOnly, sameSite lax. POST intakes sets session when no existing session (after resolving/creating profile by email). |

**Feature flags:** `lib/features.ts` — `isLongevityEnabled()`, `isLongevityApiEnabled()` (env `HLI_ENABLE_LONGEVITY`, `HLI_ENABLE_LONGEVITY_API`).

---

### Stage II — Questionnaire and save flow

**Status: COMPLETE**

| Requirement | Evidence |
|-------------|----------|
| Multi-step intake form | `LongevityStartFlow.tsx` — steps: welcome, identify, aboutYou, mainConcern, timelineTriggers, medicalHistory, sexSpecific (femaleHistory/maleHistory), lifestyleTreatments, uploadsNextSteps, review, done. |
| Save progress (PATCH) | `app/api/longevity/intakes/[id]/route.ts` — `PATCH` accepts `questionnaire` (and optional `full_name`); merges by section into `hli_longevity_questionnaires.responses`; only for `status === "draft"`. |
| Validation and consent gating | AboutYouStep: `canContinue` requires email, firstName, lastName, dateOfBirth, sexAtBirth, `consents.healthData === true`. Optional consents: aiAssist, documentGeneration. |
| Resume via intakeId | `loadResume(id)` in LongevityStartFlow: `GET /api/longevity/intakes/${id}`; URL params `resume` or `intakeId` trigger load. `app/longevity/intake/[id]/page.tsx` — no session → redirect to portal login with redirect back to `/longevity/intake/${id}`; with session and ownership → redirect to `/longevity/start?resume=${id}`. |
| Session required for GET intake | `app/api/longevity/intakes/[id]/route.ts` — if no `profileId` from session, returns 401 with `requiresAuth: true`, `redirectTo: /portal/login?redirect=...`. |

---

### Stage III — Document upload system

**Status: COMPLETE**

| Requirement | Evidence |
|-------------|----------|
| Upload step | LongevityStartFlow steps `uploadsNextSteps` and `review`: `fetchStepDocuments()`, `handleDocumentUpload()`; file input and doc type selection. |
| Document storage | `lib/longevity/storage.ts` — `buildLongevityStoragePath`, `uploadLongevityFile`; `app/api/longevity/documents/upload/route.ts` uploads to storage then `createDocumentRecord`. |
| File validation | `lib/longevity/fileValidation.ts` — `validateLongevityUpload(docType, { name, type, size })`; MIME and extension allowlists per `LONGEVITY_DOC_TYPE`; max 10 MB; unsafe extensions rejected. |
| Document listing per intake | `GET /api/longevity/documents?intakeId=` — `listDocumentsForProfile(supabase, profileId, intakeId)` in `lib/longevity/documents.ts`. |

**Doc types:** `lib/longevity/documentTypes.ts` — BLOOD_TEST_UPLOAD, SCALP_PHOTO, MEDICAL_LETTER, PRESCRIPTIONS, OTHER (and BLOOD_REQUEST_LETTER for system-generated letters).

---

### Stage IV — Patient dashboard and recovery

**Status: COMPLETE**

| Requirement | Evidence |
|-------------|----------|
| `/longevity/dashboard` | `app/longevity/dashboard/page.tsx` — cookie-based; uses `getLongevitySessionFromRequest()`; no session → CTA to portal login; with session lists intakes, first draft resume link, “Open secure portal”. |
| Session-based dashboard | Cookie dashboard shows progress via `getPatientProgressForProfile(supabase, profileId)`; resume draft link to `/longevity/start?resume=${firstDraft.id}`. |
| Recovery via portal login | `lib/longevity/portalAuth.ts` — `ensurePortalProfile()` links profile by `auth_user_id` or matches unlinked profile by email. Portal dashboard calls `setLongevitySession(profileResult.profileId)` so longevity routes see same profile. Redirects: `/portal/login?redirect=/portal/dashboard`, `/portal/login?redirect=/longevity/start?resume=...`. |
| Resume flows across devices | After login, profile is linked by email; dashboard shows intakes and “Resume draft”. `CareJourneyTimeline` (portal) and cookie dashboard both link to `/longevity/start?resume=${id}`. |

**Portal dashboard:** `app/portal/dashboard/page.tsx` — auth required; `getPortalUser()`, `ensurePortalProfile()`, `setLongevitySession()`; lists intakes with `patient_visible_summary`, `patient_visible_released_at`, documents, blood requests, care journey, next steps.

---

### Stage V — Trichologist review workspace

**Status: COMPLETE**

| Requirement | Evidence |
|-------------|----------|
| Review queue | `GET /api/longevity/review/queue` — `app/api/longevity/review/queue/route.ts`; trichologist auth; selects from `hli_longevity_intakes` with `review_status` in queue; returns items with flags, complexity. |
| Filtering and priority | Query params: `review_status`, `priority`, `assigned_to_me`, `include_released`, `limit`, `offset`. Order: priority rank (urgent → high → normal → low) then `created_at` asc. |
| Case detail view | `GET /api/longevity/review/intakes/[id]` — intake, questionnaire, documents, notes, released summary snapshot, reminders, blood_request, blood_results, complexity, case_comparison, etc. |
| Intake + documents visible | `app/api/longevity/review/intakes/[id]/route.ts` returns `documents`; `TrichologistReviewWorkspace.tsx` fetches case detail and renders questionnaire snapshot and documents. |

**UI:** `app/portal/trichologist/review/page.tsx` — trichologist-only; renders `TrichologistReviewWorkspace` with optional `?intake=` deep link.

---

### Stage VI — Review actions and summary release (Phase C)

**Status: COMPLETE**

| Requirement | Evidence |
|-------------|----------|
| Assign case | `POST /api/longevity/review/claim` — sets `assigned_trichologist_id`, `assigned_at`, `review_status: UNDER_TRICHOLOGIST_REVIEW`. |
| Unassign case | `POST /api/longevity/review/unassign` — clears `assigned_trichologist_id`, `assigned_at`; only assigned trichologist; status reverts to HUMAN_REVIEW_REQUIRED if was UNDER_TRICHOLOGIST_REVIEW. |
| Internal notes | `POST /api/longevity/review/notes` — inserts into `hli_longevity_review_notes` (intake_id, trichologist_id, body). |
| Review outcome | `POST /api/longevity/review/outcome` — sets `review_outcome`, `last_reviewed_at` on intake; allowed values from `REVIEW_OUTCOME` in `lib/longevity/reviewConstants.ts`. |
| patient_visible_summary | Stored on `hli_longevity_intakes`. Draft save: `POST /api/longevity/review/summary` (no release). |
| Release action (patient_visible_released_at) | `POST /api/longevity/review/release` — sets `patient_visible_summary`, `patient_visible_released_at`, `review_status: REVIEW_COMPLETE`, `status: complete`; optional `review_outcome`; inserts `hli_longevity_summary_releases` snapshot; triggers summary-released email (best-effort). |
| Patient portal visibility | `app/portal/dashboard/page.tsx` — selects `patient_visible_summary`, `patient_visible_released_at`; filters `intakesWithReleasedSummary`; renders “Clinician summary” with summary text and release date. |

---

### Stage VII — Blood request workflow

**Status: COMPLETE**

| Requirement | Evidence |
|-------------|----------|
| Clinician selects required blood tests | Trichologist: `POST /api/longevity/review/blood-request` — body `intake_id`, `recommended_tests` (array of codes), `reason`; creates or updates `hli_longevity_blood_requests`. Rules: on submit (`intakes/[id]/submit/route.ts`) and on release with outcome BLOODS_RECOMMENDED call `ensureBloodRequest` with `recommendedTestsFromFlags(responses)` or eligibility from `getEligibility`. |
| Eligibility logic | `lib/longevity/bloodRequestEligibility.ts` — `ruleBasedEligible`, `recommendedTestsFromFlags`, `reasonFromFlags`, `getEligibility(responses, review_outcome)`; `isValidBloodTestCodes`; BLOOD_TEST_CODES, ALL_BLOOD_TEST_CODES. |
| Patient-visible “next steps” for bloodwork | Portal dashboard: “Recommended blood tests” section; `BloodRequestLetterCard` per blood request — generate letter, download letter, upload returned results (doc type blood_test_upload with bloodRequestId). |

**APIs:** `GET /api/longevity/blood-requests` (list for profile), `POST /api/longevity/blood-requests/[id]/generate-letter`, `GET /api/longevity/blood-requests/[id]/letter-download`.

---

### Stage VIII — GP support letter generation

**Status: COMPLETE**

| Requirement | Evidence |
|-------------|----------|
| Structured letter output | `lib/longevity/gpLetterGenerator.ts` — `generateGpSupportLetterPdf({ patientName, generationDate, reason, recommendedTests })`; PDF with title, patient, date, reason, recommended tests list, disclaimer. |
| Export/download | `POST .../blood-requests/[id]/generate-letter` — generates PDF, uploads to storage, creates document record, updates blood request `letter_document_id`, status `letter_generated`. `GET .../letter-download` — redirects to signed URL for the letter document. |
| GP-ready format | Disclaimer text: “This letter is for information and support only. Final pathology selection and any referral for testing are at the discretion of the patient's GP.” |

**Note:** `HLI_ENABLE_LONGEVITY_LETTERS` exists in `lib/features.ts` but is not used to gate any route or UI in the scanned code; letter routes rely on `isLongevityApiEnabled()` only.

---

## Gaps / Risks

1. **GET /api/longevity/progress** — Implemented but not called by any frontend. Dashboards use server-side `getPatientProgressForProfile()` only. Risk: dead API or future client dashboard could use it; no functional gap today.

2. **GET /api/longevity/intakes (list)** — Returns intakes for session profile. Cookie dashboard and portal dashboard fetch intakes server-side (Supabase direct). No client component found that calls this GET. Risk: API is available for future client use; not dead but currently unused by UI.

3. **Duplicate profile by email** — If two requests with the same email arrive without a session (e.g. different browsers), the second can create a new profile because “existing profile” is looked up by session first, then by email only when session is null. Documented in `docs/HAIR_LONGEVITY_INSTITUTE_FULL_SITE_AUDIT.md`. Mitigation: portal login and `ensurePortalProfile` link by email when linking unlinked profiles.

4. **Cookie-only users never see summaries** — Released summaries and letters are only visible on `/portal/dashboard` (auth). Cookie dashboard steers users to “Open secure portal” but does not show summary content. By design per existing docs; risk is UX if users never sign in.

5. **No “resume by email” flow** — Resume is only via existing session (same device) or portal login (same email → profile linked). User with draft on device A and no account cannot resume on device B without signing up and signing in with same email.

6. **Summary release notification** — `sendLongevitySummaryReleasedEmail` is called from release route (best-effort). If email send fails, release still succeeds; no in-app notification for “your summary is ready” other than next portal visit.

7. **HLI_ENABLE_LONGEVITY_LETTERS** — Defined and documented in `.env.example` but not used to gate letter generation or download. If letters should be toggled independently, routes or UI should check `isLongevityLettersEnabled()`.

---

## Recommended Next Build Priority

(Only addressing gaps and risks from the audit; no new feature design.)

1. **Optional: Wire or remove GET /api/longevity/progress** — Either use it from a client (e.g. dashboard refresh) or document as internal/future and leave as-is; or remove if no planned use.

2. **Optional: Use or document GET /api/longevity/intakes** — If a client list view (e.g. “My intakes”) is planned, use this API; otherwise document as available for clients.

3. **Harden profile creation** — Consider resolving profile by email (and optionally linking session) when creating a new intake so same email from different devices does not create a second profile. Balance with “no login” flow and existing ensurePortalProfile behaviour.

4. **Optional: HLI_ENABLE_LONGEVITY_LETTERS** — If product requires a separate letters feature flag, gate letter generation and letter-download routes (or portal blood-request section) on `isLongevityLettersEnabled()`.

5. **Cookie dashboard UX (existing recommendation)** — Keep or reinforce prominent “Sign in to see your clinician summary and letters” on `/longevity/dashboard` so cookie-only users know where to go (already present as “Open secure portal”).

---

## Evidence Index (key files)

- **Routes:** `app/longevity/start/page.tsx`, `app/longevity/intake/[id]/page.tsx`, `app/longevity/dashboard/page.tsx`, `app/portal/dashboard/page.tsx`, `app/portal/trichologist/review/page.tsx`
- **APIs:** `app/api/longevity/intakes/route.ts`, `app/api/longevity/intakes/[id]/route.ts`, `app/api/longevity/intakes/[id]/submit/route.ts`, `app/api/longevity/documents/route.ts`, `app/api/longevity/documents/upload/route.ts`, `app/api/longevity/documents/[id]/signed-url/route.ts`, `app/api/longevity/review/queue/route.ts`, `app/api/longevity/review/intakes/[id]/route.ts`, `app/api/longevity/review/claim/route.ts`, `app/api/longevity/review/unassign/route.ts`, `app/api/longevity/review/notes/route.ts`, `app/api/longevity/review/outcome/route.ts`, `app/api/longevity/review/summary/route.ts`, `app/api/longevity/review/release/route.ts`, `app/api/longevity/review/blood-request/route.ts`, `app/api/longevity/blood-requests/route.ts`, `app/api/longevity/blood-requests/[id]/generate-letter/route.ts`, `app/api/longevity/blood-requests/[id]/letter-download/route.ts`
- **Session/auth:** `lib/longevityAuth.ts`, `lib/longevity/portalAuth.ts`
- **Schema/validation:** `lib/longevity/schema.ts`, `lib/longevity/fileValidation.ts`, `lib/longevity/documentTypes.ts`
- **Storage/documents:** `lib/longevity/storage.ts`, `lib/longevity/documents.ts`
- **Review/letters:** `lib/longevity/reviewConstants.ts`, `lib/longevity/bloodRequestEligibility.ts`, `lib/longevity/bloodRequests.ts`, `lib/longevity/gpLetterGenerator.ts`
- **UI:** `components/longevity/LongevityStartFlow.tsx`, `components/longevity/TrichologistReviewWorkspace.tsx`, `components/longevity/BloodRequestLetterCard.tsx`, `components/longevity/LongevityDocumentsSection.tsx`, `components/longevity/PortalNextStep.tsx`, `components/longevity/CareJourneyTimeline.tsx`
