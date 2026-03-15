# Hair Longevity Institute — Full System Audit Report

**Date:** 2025-03-16  
**Scope:** Landing → Start Assessment → Signup/Auth → Intake → Photo/Blood Uploads → Patient Portal → Summary/Report → Follow-up

---

## 1. Critical system errors

### 1.1 Resume flow requires session cookie (403 blocks completion)

**Location:** `GET /api/longevity/intakes/[id]` + `LongevityStartFlow.tsx` (resume via `?resume=` or `?intakeId=`)

**Issue:** Loading a draft by link (e.g. from email or another device) calls `GET /api/longevity/intakes/:id`. That route requires `getLongevitySessionFromRequest()` (the `hli_longevity_session` cookie). If the user has no cookie (new device, incognito, cleared cookies), `profileId` is null and `ownedBySession(null, intake)` is false → **403 "Not authorized."** The client shows `json.error ?? "Failed to load intake."` ("Not authorized."), and the user cannot resume.

**Impact:** Patient cannot resume an intake from a different device or after clearing cookies without first creating a session (e.g. by starting again with the same email or logging in). No in-flow guidance to “Sign in with this email to resume” or “Use the same browser where you started.”

**Evidence:**  
- `lib/longevityAuth.ts`: `getLongevitySessionFromRequest()` returns cookie value or null.  
- `app/api/longevity/intakes/[id]/route.ts`: `ownedBySession(profileId, intake)` → 403 when `profileId` is null.  
- `LongevityStartFlow.tsx`: `loadResume(id)` runs on `resume`/`intakeId` query params; no fallback when 403.

---

### 1.2 Duplicate profiles possible (email case sensitivity)

**Location:** `POST /api/longevity/intakes` (profile lookup)

**Issue:** New profile lookup uses `.eq("email", email)` with `email = String(body.email ?? "").trim()` — **no normalization to lowercase**. So `User@Example.com` and `user@example.com` can create two profiles. Intakes and documents then live under different profiles; logging in or resuming with a different email casing can show “no intakes” or the wrong set.

**Impact:** Split identity, duplicate profiles, and confused “resume” / portal experience when email casing differs.

**Evidence:**  
- `app/api/longevity/intakes/route.ts` (lines 62–67): `const email = String(body.email ?? "").trim();` then `supabase.from("hli_longevity_profiles").select("id").eq("email", email)`.

---

### 1.3 Portal profile creation can fail silently when auth user has no email

**Location:** `ensurePortalProfile()` used by `/portal/dashboard`

**Issue:** `ensurePortalProfile` returns `null` when `(authUser.email ?? "").trim().toLowerCase()` is empty. The dashboard then does `redirect("/portal/login?error=profile")`. Users (e.g. some OAuth flows without email scope) see a redirect with no clear explanation.

**Impact:** User cannot reach the dashboard; error messaging is minimal (“error=profile” only).

**Evidence:**  
- `lib/longevity/portalAuth.ts`: `const email = (authUser.email ?? "").trim().toLowerCase(); if (!email) return null;` and linking/creation depend on it.

---

## 2. Potential patient blockers

### 2.1 Cookie-only dashboard: no way to “resume” by intake ID

**Location:** `/longevity/dashboard` (cookie-only flow)

**Issue:** If the user has no session cookie, the dashboard shows “Start an intake to see your submissions here” and a “Start intake” CTA. There is no option to enter an intake ID (or magic link) to resume. The “I have a draft” button on the start flow goes to `/longevity/dashboard`, which does not help when the cookie is missing.

**Impact:** Users who lost the cookie cannot recover a draft from the dashboard; they must start again with the same email (creating a new intake if they don’t remember the resume link) or log in to the portal.

---

### 2.2 Letter download shows JSON on session expiry

**Location:** `BloodRequestLetterCard.tsx` — link to `GET /api/longevity/blood-requests/[id]/letter-download`

**Issue:** The card uses `<a href={...}>` to the letter-download API. If the session has expired, the API returns 401 with JSON `{ ok: false, error: "Session required." }`. The user navigates to that response and sees raw JSON instead of a redirect to login or a friendly message.

**Impact:** Poor UX and confusion when the session has expired.

---

### 2.3 No server-side consent validation on submit

**Location:** `POST /api/longevity/intakes/[id]/submit` + questionnaire schema

**Issue:** The “About you” step includes consent checkboxes (health data, AI assist, document generation), but the submit API does not validate that required consents (e.g. health data) are true. Submission is allowed with any questionnaire state.

**Impact:** Compliance risk if consent is legally required before processing; no technical “block” but possible policy/legal blocker.

**Evidence:**  
- `lib/longevity/schema.ts`: `consents` optional.  
- Submit route: no check of `responses.aboutYou?.consents?.healthData` or similar.

---

### 2.4 Auth callback OTP type may not match URL

**Location:** `app/portal/auth/callback/page.tsx`

**Issue:** `type` is taken from the URL as `searchParams.get("type") ?? "magiclink"` and passed to `verifyOtp({ token_hash, type: type as "magiclink" | "email" })`. Supabase may send other values (e.g. `recovery`, `signup`). If `verifyOtp` rejects the type, sign-in fails with a generic error.

**Impact:** Some magic-link or recovery links could fail depending on Supabase’s `type` value.

---

## 3. Stability risks

### 3.1 Unhandled JSON parse or non-JSON response in start flow

**Location:** `LongevityStartFlow.tsx` — all `fetch` then `res.json()`

**Issue:** If an API returns non-JSON (e.g. 502 HTML), `await res.json()` can throw. The flow uses `try/catch` and sets `setError(e instanceof Error ? e.message : "…")`, but the message may be unhelpful (e.g. “Unexpected token < in JSON”).

**Impact:** User sees a generic or confusing error instead of “Something went wrong. Please try again.”

---

### 3.2 Document list refresh on dashboard without session

**Location:** `LongevityDocumentsSection.tsx` — `refresh()` on mount

**Issue:** On the cookie-based longevity dashboard, `refresh()` calls `GET /api/longevity/documents`. If the cookie expired between server render and client hydration, the API returns 401. The component only updates state when `res.ok && json.ok && Array.isArray(json.documents)`, so it keeps the initial list and does not show an error. User may see stale or empty documents without knowing the session expired.

**Impact:** Silent staleness; no “Session expired, please sign in again” for documents.

---

### 3.3 goNext saves then advances (race)

**Location:** `LongevityStartFlow.tsx` — `goNext(nextStep)` calls `saveProgress().then(() => setStep(nextStep))`

**Issue:** If `saveProgress()` fails, the client still calls `setStep(nextStep)` because the rejection is not handled. The user moves to the next step while the previous step’s data may not be saved.

**Impact:** Possible data loss if save fails; user believes progress was saved.

**Evidence:**  
- `goNext = (nextStep) => saveProgress().then(() => setStep(nextStep));` — no `.catch()`.

---

### 3.4 Storage upload: no explicit idempotency / overwrite policy

**Location:** `lib/longevity/storage.ts` — `uploadLongevityFile(..., { upsert: false })`

**Issue:** Duplicate filenames (same path) cause upload to fail. The UI does not deduplicate by filename; multiple “blood_test_upload” uploads can collide on path if timestamps align or sanitized names match.

**Impact:** Rare but possible upload failure when the same user uploads the same filename twice in quick succession (path = `…/timestamp-safeFilename`).

---

### 3.5 Release route uses `snapshot` after best-effort catch

**Location:** `app/api/longevity/review/release/route.ts`

**Issue:** Inside `if (intake.profile_id) { try { const snapshot = await getLongevityWorkflowSnapshotForIntake(...); ... } catch { ... } }`. If `getLongevityWorkflowSnapshotForIntake` throws, integration staging is skipped but release still returns 200. No bug in flow; just confirming that release is not blocked by snapshot failures (by design).

**Impact:** None for patient completion; only integration/analytics may be incomplete.

---

## 4. Database and API shape

### 4.1 Documents table: `profile_id` not set on upload

**Location:** `lib/longevity/documents.ts` — `createDocumentRecord`

**Issue:** Insert does not set `profile_id`; only `intake_id`, `doc_type`, etc. The schema allows `profile_id` null (parent check: `intake_id` or `profile_id`). Listing uses intake IDs for the profile, so behavior is correct.

**Impact:** None for current flows; listing and ownership work via intake → profile.

---

### 4.2 No RLS on longevity tables

**Location:** Supabase migrations

**Issue:** Longevity tables do not use RLS. All access is via service-role and server-side checks (`getLongevitySessionFromRequest()`, `getTrichologistFromRequest()`). If the front end or a bug ever called Supabase from the client with anon key and table names, there would be no RLS to block access.

**Impact:** Defense-in-depth gap; current design relies on server-only Supabase usage.

---

### 4.3 API response shape consistency

**Location:** Various `/api/longevity/*` routes

**Issue:** Success responses use `{ ok: true, ... }`. Failures use `{ ok: false, error: string }`. Client code checks `res.ok && json.ok`. A few routes return 404/401 with JSON; LongevityStartFlow and documents section handle `!json.ok` and show `json.error`. No inconsistent shapes found that would break the patient journey.

---

## 5. Form validation and empty states

### 5.1 Required fields

- **Identify step:** Email is required; `createDraft` checks `identifyEmail.trim()` and sets error.  
- **About you:** Email required in UI; no server-side validation of required fields on PATCH or submit.  
- **Review step:** No pre-submit validation (e.g. “Please complete consent” or “Email required”).

**Impact:** User can submit with minimal or inconsistent data; no technical “block” but possible data quality/compliance issues.

---

### 5.2 Empty states

- Dashboard (portal and longevity): “No intakes yet” and “Start intake” are present.  
- Documents section: “No documents” when list is empty.  
- Intake flow: All steps render with optional fields defaulting to empty; no crashes on empty arrays/objects.

---

## 6. Suggested fixes (ranked by severity)

### Critical (blocks or severely confuses completion)

1. **Resume without session (1.1)**  
   - **Option A:** Allow `GET /api/longevity/intakes/[id]` when no session by requiring a one-time token (e.g. in query or header) sent by email when the draft is created or requested “email my link”.  
   - **Option B:** Keep session-only access but in the UI: when loadResume returns 403, show a clear message: “This link only works in the browser where you started, or sign in with the same email in the Patient portal to resume,” with links to `/portal/login` and `/longevity/start`.

2. **Email normalization (1.2)**  
   - In `POST /api/longevity/intakes`, normalize: `const email = String(body.email ?? "").trim().toLowerCase();` and use this for profile lookup and creation.  
   - Ensure `getProfileByEmail` and any other profile-by-email lookups use the same normalization (already done in `portalAuth.ts` with `normalized = email.trim().toLowerCase()`).

3. **Portal profile without email (1.3)**  
   - In the portal dashboard, when `ensurePortalProfile` returns null, redirect to login with a stable error code and show a user-facing message, e.g. “We couldn’t find or create your profile. Please ensure your account has a verified email,” and optionally link to support or re-auth.

### High (patient-facing blockers or bad UX)

4. **Letter download on 401 (2.2)**  
   - Make letter-download return `302` to `/portal/login?redirect=/portal/dashboard` (or a dedicated “letter download” return URL) when `profileId` is null, instead of JSON. Alternatively, serve a small HTML page that says “Session expired. Please sign in again to download the letter” with a login link.

5. **goNext save failure (3.3)**  
   - Change to: `saveProgress().then(() => setStep(nextStep)).catch(() => setError("Save failed. Please try again."))` (and optionally keep the user on the current step until save succeeds or they retry).

6. **Auth callback type (2.4)**  
   - Map known Supabase types to a supported type before calling `verifyOtp`, e.g. map `recovery` and `signup` to `"magiclink"` or `"email"` if the API accepts it, or handle `recovery` explicitly if required.

### Medium (stability and clarity)

7. **Resume/draft discovery (2.1)**  
   - On `/longevity/dashboard`, when there is no session, add an option “I have a draft — open by link” that either prompts for the intake ID or redirects to `/longevity/start` with a hint to use the link they were sent (if you add email-your-link).

8. **Consent validation (2.3)**  
   - If policy requires it: in `POST .../submit`, require `responses?.aboutYou?.consents?.healthData === true` (and any other mandatory consents) and return 400 with a clear message if not.

9. **Documents refresh session expiry (3.2)**  
   - In `LongevityDocumentsSection`, when `res.status === 401` (or `json.ok === false` with a session-related message), set a user-visible message, e.g. “Your session may have expired. Sign in again to refresh,” and optionally a link to portal login or longevity start.

10. **Non-JSON API response (3.1)**  
    - In LongevityStartFlow, in the catch block after `res.json()`, detect non-JSON (e.g. `res.headers.get("content-type")` or catch `SyntaxError`) and set a generic message: “Something went wrong. Please try again or sign in if you have an account.”

### Lower priority

11. **Upload path collision (3.4)**  
    - Keep `upsert: false` for auditability but add a short random suffix (or ensure timestamp + sanitized name is unique) in `buildLongevityStoragePath` to reduce collision risk.

12. **RLS (4.2)**  
    - Plan RLS policies for longevity tables so that if client-side Supabase access is ever introduced, access is restricted by profile/trichologist.

---

## 7. Summary table

| ID   | Severity  | Issue                                      | Patient impact                          |
|------|-----------|--------------------------------------------|-----------------------------------------|
| 1.1  | Critical  | Resume requires cookie → 403               | Cannot resume from other device/link    |
| 1.2  | Critical  | Email case → duplicate profiles            | Split identity, wrong/missing intakes   |
| 1.3  | Critical  | No email → profile null                    | Cannot use portal                       |
| 2.1  | High     | No “resume by ID” on dashboard             | Cannot recover draft without cookie     |
| 2.2  | High     | Letter download shows JSON on 401          | Confusing when session expired          |
| 2.3  | Medium   | No consent validation on submit            | Compliance risk                         |
| 2.4  | Medium   | Auth callback OTP type                     | Some magic links may fail               |
| 3.1  | Medium   | Non-JSON response handling                 | Unclear error message                    |
| 3.2  | Medium   | Documents refresh 401 not surfaced          | Silent stale list                       |
| 3.3  | High     | goNext doesn’t catch save failure           | Possible data loss                      |
| 3.4  | Low      | Upload path collision                      | Rare upload failure                     |

---

*End of audit report.*
