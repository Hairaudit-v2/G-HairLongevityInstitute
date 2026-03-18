# HLI Longevity — Production-Readiness Hardening Audit

**Purpose:** Identify highest-priority technical, operational, and UX hardening tasks before scale. Based on actual code only; does not restate the stage implementation audit.

**Audit date:** 2025-03-18

---

## Executive Summary

Stages I–VIII are implemented. Before scale, **two critical** issues must be fixed: (1) unauthenticated intake creation can attach to another user’s profile when the same email exists (profile lookup does not exclude linked accounts), and (2) portal sign-out does not clear the longevity session cookie, so the user can continue to act as that profile on `/longevity/start`. **High**-priority items include non-atomic letter generation (orphaned storage/rows on partial failure), summary-released email with no retry, and session cookie fixed 24h expiry with no sliding window. **Medium** and **low** items cover unused APIs, unused feature flag, cookie-dashboard clarity, and smaller failure-handling improvements. Recommended order: fix critical auth/profile behaviour, then session cleanup on sign-out, then letter-generation consistency and notification reliability.

---

## Critical Issues

### C1. Profile lookup by email can attach to another user’s account

**What:** When creating a draft intake with no longevity session, the API looks up a profile by email and reuses it. The lookup does **not** restrict to *unlinked* profiles (`auth_user_id` null). So if profile A exists and is already linked to auth user Alice, and Bob (no session) submits the same email, the API can return A’s profile, set the longevity cookie to A’s profile, and create the new intake under A. Bob then operates as Alice’s profile for longevity flows.

**Why it matters:** Cross-account data and wrong attribution (intakes/documents under the wrong profile). Regulatory and trust impact.

**Evidence:**
- `app/api/longevity/intakes/route.ts` (POST): when `!profileId`, it does:
  - `supabase.from("hli_longevity_profiles").select("id").ilike("email", email).limit(1).maybeSingle()`
  - No filter on `auth_user_id`; no use of `getProfileByEmail(..., { onlyUnlinked: true })`.
- `lib/longevity/portalAuth.ts`: `getProfileByEmail(supabase, email, { onlyUnlinked: true })` exists and is used in `ensurePortalProfile` to avoid linking a profile that belongs to another auth user.

**Recommended fix:** When there is no session, resolve profile by email **only among unlinked profiles**. Use a helper that queries with `auth_user_id` IS NULL (or call `getProfileByEmail(..., { onlyUnlinked: true })`). If an unlinked profile exists, use it and set the session. If not, if a **linked** profile exists for that email, return 409 with a message like “An account already exists for this email. Sign in to continue.” and do not set a cookie or create an intake. If no profile exists, create a new (unlinked) profile and set the session. Do not reuse a profile that already has `auth_user_id` set.

---

### C2. Portal sign-out does not clear longevity session cookie

**What:** Signing out of the portal only calls Supabase `auth.signOut()` and redirects to `/portal/login`. The longevity session cookie (`hli_longevity_session`) is never cleared. The user can then open `/longevity/start` or `/longevity/dashboard` and still be identified as the same profile via the cookie.

**Why it matters:** Users expect “Sign out” to end all access. Retaining the cookie allows continued access to longevity flows and can confuse shared-device or security reviews.

**Evidence:**
- `components/longevity/PortalSignOut.tsx`: `signOut()` calls `supabase.auth.signOut()` then `router.replace("/portal/login")`. No call to any longevity session clear.
- `lib/longevityAuth.ts`: `clearLongevitySession()` exists and deletes the cookie but is **never called** anywhere in the repo (only defined).

**Recommended fix:** On portal sign-out, clear the longevity session so the cookie is removed. Options: (1) Call a small API route (e.g. `POST /api/longevity/session/clear`) that runs `clearLongevitySession()` and have the client call it before or after `auth.signOut()`, or (2) implement a server action that clears the cookie and invoke it from the sign-out handler. Then ensure the sign-out flow (e.g. in `PortalSignOut`) calls that clear step before redirecting.

---

## High Priority Issues

### H1. Letter generation is not atomic; partial failure leaves inconsistent state

**What:** GP letter generation does: upload file to storage → create document row → update `hli_longevity_blood_requests` with `letter_document_id` and status. There is no transaction or compensating logic. If `createBloodRequestLetterDocument` fails after a successful upload, the object remains in storage with no document row. If the `blood_requests` update fails after the document is created, the letter is not linked and the patient will not see it.

**Why it matters:** Orphaned storage objects and “missing” letters that exist in DB/storage but are not visible, leading to support burden and possible re-generation/duplication.

**Evidence:**
- `app/api/longevity/blood-requests/[id]/generate-letter/route.ts`: sequence is upload → createBloodRequestLetterDocument → update blood_requests. Each step returns 500 on failure with no rollback of prior steps.
- `lib/longevity/documents.ts`: `createBloodRequestLetterDocument` only inserts a document row; no profile_id on the row (ownership is via intake).

**Recommended fix:** Prefer a single transactional boundary if the DB supports it (e.g. create document row and update blood_requests in one transaction; then upload to storage and, if upload fails, mark document as failed or delete the row). If not, add compensating actions: e.g. if document create or blood_requests update fails after upload, delete the uploaded object from storage; or run a periodic job to attach “orphan” letter documents to the correct blood_request by storage path / metadata. At minimum, document the failure modes and add logging for orphaned objects/rows so ops can reconcile.

---

### H2. Summary-released email is best-effort with no retry or visibility

**What:** When a trichologist releases a summary, the release route calls `sendLongevitySummaryReleasedEmail`. Failure is caught and only logged; release still returns success. There is no retry, no dead-letter, and no in-app indication that the email failed. If `LONGEVITY_EMAIL_PROVIDER` is unset or the provider fails, the patient is never notified by email.

**Why it matters:** Patients are told “typically 48 hours” and may expect an email; if it never arrives, they may not know to check the portal, leading to confusion and support load.

**Evidence:**
- `app/api/longevity/review/release/route.ts` (lines 308–341): try/catch around `sendLongevitySummaryReleasedEmail`; on failure only `console.warn`; release response is still 200.
- `lib/longevity/notifications/summaryReleasedEmail.ts`: returns `{ ok, error, provider }`; no retry inside.
- `lib/longevity/reminderEmail.ts`: `getProvider()` defaults to `"none"` when `LONGEVITY_EMAIL_PROVIDER` is not set; `.env.example` has provider commented out.

**Recommended fix:** (1) Ensure production env sets `LONGEVITY_EMAIL_PROVIDER` and required keys (e.g. `RESEND_API_KEY`); document in runbooks. (2) Add a retry (e.g. 2 retries with backoff) or enqueue a job to send the summary-released email so transient failures can succeed later. (3) Optionally record email send outcome (e.g. in `hli_longevity_audit_events` or a small table) so support can see whether the patient was emailed. (4) Consider a lightweight in-app notice on next portal visit (“Your summary was released on …”) so email is not the only channel.

---

### H3. Session cookie has fixed 24h expiry with no sliding window

**What:** The longevity session cookie is set with `maxAge: 60 * 60 * 24` (24h). It is not refreshed on activity. After 24h the cookie disappears and the user loses session without an explicit “session expired” message in the intake flow.

**Why it matters:** Long forms or multi-day completion can hit the 24h limit; the user may get 401/403 on save or submit and see a generic error or “sign in to continue” without understanding it was expiry.

**Evidence:**
- `lib/longevityAuth.ts`: `setLongevitySession` uses `maxAge: 60 * 60 * 24`; no sliding window; cookie is only set on login/dashboard and on first draft creation, not on every API call.

**Recommended fix:** Either (1) extend the cookie on each longevity API request that uses the session (e.g. in a middleware or in the API handlers that call `getLongevitySessionFromRequest`), or (2) set a longer maxAge and add explicit “session expired” handling in the UI when APIs return 401 (e.g. in `LongevityStartFlow` and portal) so the user is told to sign in again. Prefer (1) for better UX if the same cookie is used for long-lived intake flows.

---

## Medium Priority Issues

### M1. GET /api/longevity/progress is never used by the frontend

**What:** The progress API exists and returns progress for the session profile. All dashboards that need progress call `getPatientProgressForProfile` server-side; no component fetches `GET /api/longevity/progress`.

**Why it matters:** Dead or redundant API surface; if never used, it can drift or confuse future maintainers.

**Evidence:**
- `app/api/longevity/progress/route.ts`: implements GET.
- Grep for `fetch(...progress)` or `/api/longevity/progress`: no matches in components. `app/longevity/dashboard/page.tsx` and `app/portal/dashboard/page.tsx` use `getPatientProgressForProfile(supabase, profileId)` directly.

**Recommended fix:** Either use the progress API from a client component (e.g. for periodic refresh) or remove the route and document that progress is server-rendered only. If kept, add a short comment in the route that it is for future client use.

---

### M2. GET /api/longevity/intakes (list) is never used by the frontend

**What:** The list-intakes API returns intakes for the session profile. Cookie and portal dashboards load intakes via direct Supabase in server components; no client calls `GET /api/longevity/intakes`.

**Why it matters:** Same as M1: unused surface can drift or confuse.

**Evidence:**
- `app/api/longevity/intakes/route.ts`: GET returns `{ ok, intakes }`.
- No component fetches `/api/longevity/intakes` (no query params); LongevityStartFlow uses POST and GET `intakes/${id}` only.

**Recommended fix:** Either add a client that uses this (e.g. “My intakes” list) or document/remove. Prefer keeping and documenting for future client use if you plan a SPA-style dashboard.

---

### M3. HLI_ENABLE_LONGEVITY_LETTERS / isLongevityLettersEnabled() is never used

**What:** Feature flag and helper exist to toggle letter workflows. No route or UI checks them; letter generation and download are gated only by `isLongevityApiEnabled()`.

**Why it matters:** Cannot turn off letters independently of the rest of longevity; flag in .env.example suggests letters were intended to be toggled.

**Evidence:**
- `lib/features.ts`: `isLongevityLettersEnabled()` defined.
- `.env.example`: `# HLI_ENABLE_LONGEVITY_LETTERS=1`.
- No grep hit for `isLongevityLettersEnabled` in app or components (only in features and in the implementation audit doc).

**Recommended fix:** If product requires independent letter toggle: in `app/api/longevity/blood-requests/[id]/generate-letter/route.ts` and `letter-download/route.ts`, return 404 when `!isLongevityLettersEnabled()`, and in the portal hide or disable the blood-request letter section when the flag is off. If not needed, remove the flag and document that letters are tied to longevity API.

---

### M4. Cookie dashboard does not explicitly state that summaries are only in the portal

**What:** Cookie dashboard says “Your secure portal is where you view your review and documents” and “Open secure portal,” but does not explicitly say “Your clinician summary and letters are only visible after you sign in to the portal.”

**Why it matters:** Cookie-only users may think the “Next steps” page should show their summary; clearer copy reduces confusion and support.

**Evidence:**
- `app/longevity/dashboard/page.tsx`: copy focuses on “next steps,” “Open secure portal,” and “Resume draft” / “New intake.” When `summaryReleased` is true it says “Your Hair Longevity review is ready” and “View … in your secure portal.”

**Recommended fix:** Add one short line when the user has submitted intakes but no released summary yet, e.g. “Your clinician summary and any letters will appear only after you sign in to the secure portal.” When summary is released, keep the existing “view in your secure portal” message.

---

### M5. Duplicate profiles possible when same email used from two sessions without auth

**What:** If two browser sessions (no auth) both create a draft with the same email, the first creates a profile and intake; the second, with no cookie, does a lookup by email. Current code can reuse the first profile (so only one profile), but after fixing C1 we will only reuse *unlinked* profiles. Then the second request would create a *new* profile (same email, unlinked). So we can end up with two profiles for the same email until one of them signs in and `ensurePortalProfile` links one. Until then, intakes are split across two profiles.

**Why it matters:** Data split and “I don’t see my other intake” until they sign in and get one profile linked; the other profile stays unlinked with the other intake.

**Evidence:**
- `app/api/longevity/intakes/route.ts`: when no session and no existing profile (or after C1 fix, no *unlinked* profile), we insert a new profile.
- `lib/longevity/portalAuth.ts`: `ensurePortalProfile` links by auth first, then by unlinked email; only one profile is linked per auth user.

**Recommended fix:** After C1, consider: when creating a new profile by email, check if a *linked* profile already exists for that email; if yes, return 409 “Sign in to use your existing account” and do not create a second profile. Optionally add a periodic job or admin tool to merge duplicate unlinked profiles for the same email (with care for data ownership). Document the “one linked profile per email” and “unlinked profiles may duplicate email until first login” behaviour.

---

## Low Priority Issues

### L1. LongevityStartFlow fetch calls do not pass credentials: "include"

**What:** Requests to `/api/longevity/intakes` and `/api/longevity/intakes/${id}` etc. do not set `credentials: "include"`. Same-origin requests in browsers typically send cookies by default.

**Why it matters:** In edge cases (e.g. cross-origin or strict CORS) cookies might not be sent; low risk for same-origin Next.js app.

**Evidence:**
- `components/longevity/LongevityStartFlow.tsx`: `fetch("/api/longevity/intakes", { method: "POST", headers, body })` etc. No `credentials: "include"`.
- Other longevity client components (e.g. TrichologistReviewWorkspace, BloodRequestLetterCard) use `credentials: "include"` for longevity APIs.

**Recommended fix:** For consistency and future-proofing, add `credentials: "include"` to all longevity API fetches in LongevityStartFlow (and any other client that calls longevity APIs).

---

### L2. Letter-download 404 when letter not yet generated

**What:** When `letter_document_id` is null, the letter-download route returns 404 with JSON `{ ok: false, error: "No letter generated yet." }`. The UI shows the error string; no specific “Generate your letter first” CTA in the error state.

**Why it matters:** Minor UX; user may already have a “Generate letter” button; error message is already clear.

**Evidence:**
- `app/api/longevity/blood-requests/[id]/letter-download/route.ts`: `if (!br.letter_document_id) return NextResponse.json({ ok: false, error: "No letter generated yet." }, { status: 404 });`
- `components/longevity/BloodRequestLetterCard.tsx`: on !res.ok, `setError((data as { error?: string }).error ?? "Download failed.")`.

**Recommended fix:** Optionally in BloodRequestLetterCard, when the API error is “No letter generated yet,” show that message and emphasize the “Generate letter” button (e.g. “Generate your letter first, then you can download it.”).

---

### L3. HLI_APP_URL not set makes summary-released email link-less

**What:** Summary-released email body uses `appBaseUrl` (from `HLI_APP_URL`) to build the portal link. If `HLI_APP_URL` is empty, the email says “Please sign in to your secure portal” without a URL.

**Why it matters:** In production, missing URL reduces clarity; users must remember or search for the portal.

**Evidence:**
- `app/api/longevity/review/release/route.ts`: `appBaseUrl: process.env.HLI_APP_URL?.trim() || undefined`.
- `lib/longevity/notifications/summaryReleasedEmail.ts`: `portalUrl = params.appBaseUrl ? ... : null`; if null, signInLine is generic.

**Recommended fix:** Document in deployment/runbook that `HLI_APP_URL` must be set for production. Optionally add a build-time or runtime check that longevity is not enabled in production without `HLI_APP_URL`, or log a warning when sending the email without it.

---

## Top 5 Hardening Priorities

1. **Fix profile lookup when creating draft without session (C1)**  
   Use only unlinked profiles by email; return 409 when email belongs to a linked profile; never attach to another user’s profile.

2. **Clear longevity session on portal sign-out (C2)**  
   Call `clearLongevitySession()` (via API or server action) in the sign-out flow so the longevity cookie is removed.

3. **Harden letter generation consistency (H1)**  
   Make letter generation atomic or add compensating actions and logging so partial failures do not leave orphaned storage or unlinked documents.

4. **Improve summary-released notification reliability (H2)**  
   Set and document email provider in production; add retry or queue for sending; optionally record send outcome and/or in-app “summary released” notice.

5. **Session cookie behaviour (H3)**  
   Either refresh cookie on activity (sliding window) or extend maxAge and ensure 401 responses are clearly explained as “session expired” in the UI.

---

## Top 3 Operational Risks

1. **Email not configured or failing silently**  
   If `LONGEVITY_EMAIL_PROVIDER` (and e.g. `RESEND_API_KEY`) are not set or the provider fails, patients never get “your summary is ready” emails. Mitigation: runbook to verify env; consider retry/queue and logging send outcome.

2. **Letter generation partial failure**  
   Upload success + document or DB update failure can leave orphaned objects or “missing” letters. Mitigation: atomic or compensatory handling (H1) and monitoring for orphaned letter documents/storage paths.

3. **Duplicate or split profiles for same email**  
   After fixing C1, two unauthenticated sessions with same email can create two unlinked profiles and split intakes until one user signs in. Mitigation: document behaviour; consider 409 when a linked profile already exists for that email and optional merge tooling.

---

## Top 3 Quick Wins

1. **Call clearLongevitySession on portal sign-out (C2)**  
   Add an API route or server action that clears the longevity cookie and invoke it from `PortalSignOut` before redirect. Small, contained change; removes critical auth gap.

2. **Restrict profile lookup to unlinked when no session (C1)**  
   In POST `/api/longevity/intakes`, when resolving profile by email without a session, use `getProfileByEmail(supabase, email, { onlyUnlinked: true })`. If no unlinked profile but a linked one exists, return 409 with “Sign in to continue with your existing account.” Prevents cross-account attachment.

3. **Use or document GET /api/longevity/progress and GET /api/longevity/intakes (M1, M2)**  
   Either add a one-line comment in each route (“Reserved for future client use” / “Currently used server-side only”) or remove the progress route if there is no planned client use. Reduces confusion and keeps the codebase aligned with actual usage.
