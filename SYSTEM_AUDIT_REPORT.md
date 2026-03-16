# Hair Longevity Institute — Full System Audit Report

**Date:** 2025-03-16 (updated)  
**Scope:** Landing → Start Assessment → Signup/Auth → Intake → Photo/Blood Uploads → Patient Portal → Summary/Report → Follow-up

---

## Status: fixes applied

The following items from the original audit have been **resolved** in the codebase:

| Issue | Fix |
|-------|-----|
| Resume flow 403 when no session | GET intakes/[id] returns 401 with `requiresAuth`, `redirectTo`, `message`; frontend redirects to login; `/longevity/intake/[id]` page; login/callback/dashboard preserve redirect and set longevity cookie. |
| Duplicate profiles (email case) | `normalizeEmail()` helper; used in portal auth and POST intakes; profile lookup uses `.ilike("email", normalized)`; new profiles stored with normalized email. |
| Portal profile no-email silent fail | `ensurePortalProfile` returns `EnsurePortalProfileResult`; dashboard redirects to `?error=no-email`; login page shows: "We could not create your profile because your sign-in provider did not provide an email address. Please sign in using an email-based login." |
| Letter download shows JSON on 401 | Letter download is client-side fetch; on 401 redirect to login with `?error=session-expired`; login page shows: "Your session expired. Please sign in to continue." |
| goNext advances despite save failure | `saveProgress()` returns `{ ok: true } \| { ok: false, error }`; `goNext` awaits and only calls `setStep` when `result.ok`; shows "We couldn't save your progress. Please try again." and logs error. |
| Upload path collision | `buildLongevityStoragePath` uses unique segment: `{intakeId}_{timestamp}_{random}_{safeFilename}`; `shortRandom()` for collision resistance. |

---

## 1. Critical system errors (remaining)

*None identified.* The previous critical items (resume, email normalization, portal no-email) have been addressed.

---

## 2. Potential patient blockers

### 2.1 No server-side consent validation on submit

**Location:** `POST /api/longevity/intakes/[id]/submit` + questionnaire schema

**Issue:** The "About you" step includes consent checkboxes (health data, AI assist, document generation). The submit API does not validate that required consents (e.g. health data) are true. Submission is allowed with any questionnaire state.

**Impact:** Compliance risk if consent is legally required before processing; no technical block but possible policy/legal blocker.

**Evidence:**  
- `lib/longevity/schema.ts`: `consents` optional.  
- Submit route: no check of `responses.aboutYou?.consents?.healthData` or similar.

---

### 2.2 Auth callback OTP type may not match URL

**Location:** `app/portal/auth/callback/page.tsx`

**Issue:** `type` is taken from the URL as `searchParams.get("type") ?? "magiclink"` and passed to `verifyOtp({ token_hash, type: type as "magiclink" | "email" })`. Supabase may send other values (e.g. `recovery`, `signup`). If `verifyOtp` rejects the type, sign-in fails with a generic error.

**Impact:** Some magic-link or recovery links could fail depending on Supabase’s `type` value.

---

### 2.3 Cookie-only dashboard: no “resume by link” when no session

**Location:** `/longevity/dashboard` (cookie-only flow)

**Issue:** If the user has no session cookie, the dashboard shows “Start an intake to see your submissions here” and a “Start intake” CTA. There is no option to enter an intake ID or open a resume link. The resume flow works when the user has a direct link to `/longevity/start?resume=id` (then they get 401 and are sent to login); but if they only remember “dashboard” they cannot recover a draft from there without starting again or logging in.

**Impact:** Users who lost the cookie and don’t have the resume link must start a new intake or log in to the portal.

---

## 3. Stability risks

### 3.1 Unhandled JSON parse or non-JSON response in start flow

**Location:** `LongevityStartFlow.tsx` — `loadResume`, `createDraft`, `saveProgress`, `submitIntake` all use `await res.json()`.

**Issue:** If an API returns non-JSON (e.g. 502 HTML or error page), `await res.json()` can throw. The flow uses try/catch and sets `setError(e instanceof Error ? e.message : "…")`, but the message may be unhelpful (e.g. “Unexpected token < in JSON”).

**Impact:** User sees a confusing error instead of a clear “Something went wrong. Please try again.”

---

### 3.2 Document list refresh on dashboard without session

**Location:** `LongevityDocumentsSection.tsx` — `refresh()` on mount

**Issue:** On the cookie-based longevity dashboard, `refresh()` calls `GET /api/longevity/documents`. If the cookie expired between server render and client hydration, the API returns 401. The component only updates state when `res.ok && json.ok && Array.isArray(json.documents)`, so it keeps the initial list and does not show an error. The user may see stale or empty documents without knowing the session expired.

**Impact:** Silent staleness; no “Session expired, please sign in again” for the documents section.

---

### 3.3 submitIntake does not check save result

**Location:** `LongevityStartFlow.tsx` — `submitIntake` calls `await saveProgress()` then proceeds to POST submit.

**Issue:** `saveProgress()` now returns `{ ok: true } | { ok: false, error }`. `submitIntake` does not check the return value; it always proceeds to call the submit API. If the save failed, the submit might still succeed (server has previous state), but the latest unsaved edits could be lost.

**Impact:** Minor; submit often succeeds anyway. For consistency and to avoid confusion, consider only calling submit when `saveProgress()` returns `ok: true`, or surface a warning.

---

## 4. Database and API

### 4.1 Documents table: profile_id not set on upload

**Location:** `lib/longevity/documents.ts` — `createDocumentRecord`

**Issue:** Insert does not set `profile_id`; only `intake_id`, `doc_type`, etc. The schema allows `profile_id` null (parent check: `intake_id` or `profile_id`). Listing uses intake IDs for the profile, so behaviour is correct.

**Impact:** None for current flows.

---

### 4.2 No RLS on longevity tables

**Location:** Supabase migrations

**Issue:** Longevity tables do not use RLS. All access is via service-role and server-side checks (`getLongevitySessionFromRequest()`, `getTrichologistFromRequest()`). If the front end or a bug ever called Supabase from the client with anon key and table names, there would be no RLS to block access.

**Impact:** Defence-in-depth gap; current design relies on server-only Supabase usage.

---

### 4.3 API response shape and routes

**Finding:** Success responses use `{ ok: true, ... }`; failures use `{ ok: false, error: string }`. Client code checks `res.ok` and `json.ok`. All patient-facing longevity API routes called from the app exist (intakes, documents, documents/upload, documents/[id]/signed-url, blood-requests/[id]/letter-download, blood-requests/[id]/generate-letter, progress). No missing routes or unexpected shapes identified for the patient journey.

---

## 5. Form validation and empty states

- **Identify step:** Email required; validated in `createDraft`.  
- **About you:** Email required in UI; no server-side validation of required fields or consents on PATCH or submit.  
- **Review step:** No pre-submit validation (e.g. consent or required fields).  
- **Empty states:** Dashboard and longevity dashboard show “No intakes yet” and “Start intake”; documents section shows empty list when applicable. No crashes on empty arrays/objects in the intake flow.

---

## 6. Suggested fixes (ranked by severity)

### High (compliance / UX)

1. **Consent validation (2.1)**  
   If policy requires it: in `POST /api/longevity/intakes/[id]/submit`, require e.g. `responses?.aboutYou?.consents?.healthData === true` (and any other mandatory consents) and return 400 with a clear message if not.

2. **Auth callback OTP type (2.2)**  
   Map known Supabase types to a supported type before calling `verifyOtp`, e.g. map `recovery` and `signup` to `"magiclink"` or `"email"` if the API accepts it, or handle `recovery` explicitly.

3. **Documents refresh 401 (3.2)**  
   In `LongevityDocumentsSection`, when `res.status === 401` (or `json.ok === false` with a session-related message), set a user-visible message, e.g. “Your session may have expired. Sign in again to refresh,” and optionally link to portal login.

### Medium (clarity and edge cases)

4. **Non-JSON API response (3.1)**  
   In LongevityStartFlow, in catch blocks after `res.json()`, detect non-JSON (e.g. check `res.headers.get("content-type")` or catch `SyntaxError`) and set a generic message: “Something went wrong. Please try again or sign in if you have an account.”

5. **submitIntake save result (3.3)**  
   In `submitIntake`, check `saveProgress()` return value; only call the submit API when `result.ok`, or show a warning and allow the user to retry save then submit.

6. **Dashboard “resume by link” (2.3)**  
   On `/longevity/dashboard`, when there is no session, add an option such as “I have a draft — open by link” that directs the user to `/longevity/start` with a hint to use the link they were sent (or to sign in to the portal).

### Lower priority

7. **RLS (4.2)**  
   Plan RLS policies for longevity tables so that if client-side Supabase access is ever introduced, access is restricted by profile/trichologist.

---

## 7. Summary table

| ID   | Severity  | Issue | Status / Impact |
|------|-----------|--------|------------------|
| 1.1  | —         | Resume requires cookie → 403 | **FIXED** (401 + redirect + login flow) |
| 1.2  | —         | Email case → duplicate profiles | **FIXED** (normalizeEmail + ilike) |
| 1.3  | —         | No email → profile null | **FIXED** (no_email result + login message) |
| 2.1  | High      | No consent validation on submit | Open; compliance risk |
| 2.2  | High      | Auth callback OTP type | Open; some links may fail |
| 2.3  | Medium    | No “resume by link” on dashboard when no session | Open; recoverable via login + resume link |
| 2.4  | —         | Letter download JSON on 401 | **FIXED** (client fetch + redirect + message) |
| 3.1  | Medium    | Non-JSON response handling | Open; confusing error possible |
| 3.2  | Medium    | Documents refresh 401 not surfaced | Open; silent staleness |
| 3.3  | Low       | submitIntake ignores save result | Open; minor consistency |
| 3.4  | —         | Upload path collision | **FIXED** (unique path segment) |
| 4.x  | Low       | Documents profile_id, RLS | Informational |

---

*End of audit report.*
