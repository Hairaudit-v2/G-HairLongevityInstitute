# Patient Journey Audit — Flow Blockers & Case Completion

**Focus:** Concerns that **stop the flow** for the patient or **prevent a case from being completed**.  
**Scope:** Full patient journey from first visit through to receiving and viewing the clinician summary.  
**Date:** March 2025.

---

## Executive summary

The journey is **completable** for a typical patient (same device, same browser, email available at sign-in). Several conditions can **block completion or hide the completed case** from the patient: session/cookie loss, portal sign-in without email, non-JSON API responses, and feature flag or environment failures. The clinician-side dependency (trichologist must review and release) is assumed; this audit focuses on **product/technical** blockers, not operational backlog.

**Critical flow-stoppers identified:**

1. **Resume without session** — Draft started on one device/browser cannot be resumed without signing in; cookie dashboard shows “Start intake” and does not list the draft.
2. **Portal login with no email** — OAuth/sign-in that does not provide email prevents profile creation; patient cannot reach portal dashboard.
3. **Session expiry mid-flow** — Submit and document list depend on longevity session; if cookie is lost, submit fails and the patient may not know they must sign in.
4. **API disabled or non-JSON errors** — Longevity API disabled or server returning HTML/500 can leave the user with a generic error and no recovery path.
5. **Case “complete” not visible to patient** — Relies on email + portal; if email is missing or not sent, the patient may never see the released summary.

---

## Journey stages and flow-stopping concerns

### 1. Entry and feature availability

| Step | What happens | Flow-stopper? |
|------|----------------|---------------|
| User opens `/longevity` or `/longevity/start` | If `isLongevityEnabled()` is false, start page shows “This feature is not currently available” with link back to `/longevity`. | **Yes.** Patient cannot start an intake at all. No alternate path. |
| User has no cookie, clicks “Begin” → Identify | Enters email (required), optional name → “Create draft & continue”. POST `/api/longevity/intakes` creates profile (or finds by email), sets longevity session cookie, creates draft intake + questionnaire row. | **No.** Only blocker: invalid/empty email returns “Email is required.”; API disabled returns 404 with message. |

**Recommendation:** Document or surface when longevity is disabled (e.g. env) so support knows why patients see “not available.”

---

### 2. Identify and create draft

| Step | What happens | Flow-stopper? |
|------|----------------|---------------|
| Create draft | POST creates profile (or links to existing by email), sets cookie, creates intake + questionnaire. Returns `intakeId`. Frontend replaces URL with `?intakeId=`. | **Yes if:** API returns 500, DB failure, or “Longevity API is disabled.” User sees error string; no automatic retry. |
| Duplicate email | Same email creates/uses same profile; new intake is created. No conflict. | **No.** |

**Recommendation:** On create failure, suggest “Try again” and “If this keeps happening, contact us” with a clear path (e.g. support link).

---

### 3. Resume flow (cross-device or after cookie cleared)

| Step | What happens | Flow-stopper? |
|------|----------------|---------------|
| User opens `/longevity/start?resume=<id>` with **no cookie** | Frontend calls GET `/api/longevity/intakes/<id>`. API returns **401** with `requiresAuth: true`, `redirectTo: /portal/login?redirect=/longevity/intake/<id>`. Frontend sets error message and does `window.location.href = redirectTo`. | **No.** User is sent to portal login; after login they are redirected to `/longevity/intake/<id>`, which (with session) redirects to `/longevity/start?resume=<id>`. Flow completes. |
| User opens `/longevity/dashboard` with **no cookie** | No profileId; page shows “Start an intake to see your submissions here” and “Start intake” → `/longevity/start`. | **Yes.** Any draft that existed only in the lost cookie session is **invisible**. There is no “resume by email” or “send me a link.” The draft still exists in DB but the patient has no way to get back to it without signing in at `/portal/login` and then going to portal dashboard or knowing the intake URL. |
| “I have a draft” from welcome step | Links to `/longevity/dashboard`. If no cookie, same as above: no intakes listed. | **Yes.** Same as above; user may think they have no draft. |

**Recommendation:** On cookie dashboard when there is no session, add a line: “If you started an assessment on another device, sign in with the same email to see it,” with primary CTA “Open secure portal” (login). Consider “Resume by email” (magic link to `/longevity/intake/<id>` or dashboard after login) so draft is recoverable without the user guessing the portal.

---

### 4. Questionnaire (About You → Review)

| Step | What happens | Flow-stopper? |
|------|----------------|---------------|
| About You | Required: first name, last name, email, date of birth, sex at birth, health-data consent. “Save & continue” is **disabled** until `canContinue` is true. `goNext` calls `saveProgress()` then moves step. | **No.** Design correctly blocks progress until required fields and consent are set. |
| Later steps | No required-field gate; user can advance with minimal data. PATCH `/api/longevity/intakes/<id>` accepts questionnaire payload; only draft and ownership are enforced. | **No.** |
| Save progress failure | On PATCH failure, `saveProgress` returns `{ ok: false }`, `goNext` sets error to “We couldn't save your progress. Please try again.” and does **not** advance step. | **No.** User can retry or fix (e.g. network). |
| Non-JSON response | If server returns HTML (e.g. 500) or non-JSON, `res.json()` throws. Caught in catch; error state set (e.g. “Save failed.”). | **Partial.** User sees a generic error; they are not stuck on a blank screen, but they get no guidance (e.g. “Try again or sign in to portal”). |

**Recommendation:** In catch blocks after `res.json()`, detect non-JSON (e.g. `Content-Type` or `SyntaxError`) and show: “Something went wrong. Please try again. If you have an account, try signing in to the portal and resuming from there.”

---

### 5. Upload step

| Step | What happens | Flow-stopper? |
|------|----------------|---------------|
| No intakeId | Message: “Save your intake first to upload documents.” User can still go to review and submit. | **No.** |
| Session expired during upload step | `fetchStepDocuments` calls GET `/api/longevity/documents?intakeId=`. If 401, response is not `ok`; code does not set error, just returns `[]`. User sees empty “Uploaded for this intake” and can still upload. Upload POST requires session; 401 returns “Session required.” and `setUploadError` shows it. | **Partial.** User sees “Upload failed” / “Session required.” but may not understand they need to sign in. They can still proceed to review and submit **if** they still have cookie for submit. If cookie is gone, submit will also fail (see below). |
| File validation failure | Upload API validates type/size; returns 400 with message. Shown in upload error state. | **No.** |

**Recommendation:** When documents API or upload returns 401, show a clear line: “Your session may have expired. Sign in to the portal to continue, then return here or resume from the portal.”

---

### 6. Submit

| Step | What happens | Flow-stopper? |
|------|----------------|---------------|
| Submit click | `submitIntake`: calls `saveProgress()` then POST `/api/longevity/intakes/<id>/submit`. On success, sets step to “done.” | — |
| No session (cookie lost) | GET session returns null. Submit API returns **403** “Not authorized.” Frontend sets error “Submission failed.” (from `json.error`). | **Yes.** Patient has completed the form but cannot submit. No in-UI hint to sign in and retry. |
| Intake not draft | API returns 400 “Only draft intakes can be submitted.” | **No.** Normal if they double-submit or refreshed; message is clear. |
| Intake not found / not owned | 404 or 403. Frontend shows “Submission failed.” | **Yes.** Same as no session: no guidance to sign in. |
| Non-JSON or 500 | `res.json()` can throw; catch sets “Submission failed.” | **Partial.** Same as save: generic error, no recovery path. |

**Recommendation:** On 401/403 from submit, show: “We couldn’t submit your assessment. Your session may have expired. Please sign in to the portal, then return to this page and try submitting again,” with button/link to `/portal/login?redirect=/longevity/start?resume=<id>`.

---

### 7. Done step and post-submit

| Step | What happens | Flow-stopper? |
|------|----------------|---------------|
| Done step | Message: “Your assessment has been received”, “You will receive an email when your summary is ready”, “Open secure portal” → `/portal/login?redirect=/portal/dashboard`. | **No.** Clear next step. |
| Email on release | When trichologist releases summary, implementation **does** send “summary ready” email (per prior work). If email send fails, release still succeeds; patient can still see summary in portal. | **No.** Case is complete; only notification is at risk. |
| Patient never signs in | They only have cookie dashboard. Cookie dashboard shows “Your review is in progress” and “Open secure portal.” When summary is released, cookie dashboard shows “Your Hair Longevity review is ready” and same CTA. | **No.** As long as they revisit the same browser/cookie, they see status and are steered to portal. If they cleared cookie, they lose dashboard context and must sign in to see anything (see §3). |

---

### 8. Portal access and dashboard

| Step | What happens | Flow-stopper? |
|------|----------------|---------------|
| Portal login (magic link or password) | Supabase Auth. On success, redirect to `redirect` param (e.g. `/portal/dashboard` or `/longevity/intake/<id>`). | — |
| **No email from auth provider** | `ensurePortalProfile` needs email to link or create profile. If `user.email` is null/empty (e.g. some OAuth), returns `no_email` → redirect to `/portal/login?error=no-email`. Login page shows message that sign-in must provide email. | **Yes.** Patient cannot access portal at all. No way to “complete” portal profile without email from auth. |
| ensurePortalProfile other failure | Redirect to `?error=profile`. Generic profile error. | **Yes.** No clear recovery (e.g. contact support). |
| Dashboard load (intakes, documents) | If DB/query fails, dashboard shows “Unable to load intakes.” with “Back” to portal. | **Partial.** User can retry by refreshing; no infinite loop. |

**Recommendation:** For `no_email`, already have specific message. For `error=profile`, add short copy: “We couldn’t set up your account. Please try again or contact support.”

---

### 9. Viewing the released summary

| Step | What happens | Flow-stopper? |
|------|----------------|---------------|
| Summary released | Intake has `patient_visible_summary` and `patient_visible_released_at`; status set to `complete`. Portal shows “Your review is ready” and summary content. Cookie dashboard shows “Your Hair Longevity review is ready” and “Open secure portal.” | **No.** |
| Patient never returns | No in-app push; they rely on email and/or revisiting the site. | **Design choice.** Email + clear CTAs mitigate. |

---

## API and server logic that can block completion

| API / condition | Effect if it fails | Severity |
|------------------|--------------------|----------|
| POST `/api/longevity/intakes` (create draft) | No intakeId; user stuck on Identify with error. | **High** |
| GET `/api/longevity/intakes/<id>` (resume) | 401 → redirect to login (OK). 404/403 → “Failed to load intake” / “Not authorized”; user cannot resume that intake. | **Medium** (401 path is OK; 403/404 need clearer copy) |
| PATCH `/api/longevity/intakes/<id>` (save) | Save fails; user sees “We couldn’t save your progress.” Can retry. | **Low** |
| POST `/api/longevity/intakes/<id>/submit` | 403/401 → “Submission failed.” with no sign-in guidance. | **High** |
| GET `/api/longevity/documents` | 401 → empty list in upload step; no explicit “session expired” message. | **Medium** |
| POST `/api/longevity/documents/upload` | 401 → “Session required.”; user may not know to sign in. | **Medium** |
| Longevity API disabled (`HLI_ENABLE_LONGEVITY_API=0`) | All longevity APIs return 404 “Longevity API is disabled.” Create draft and submit both fail. | **High** (environment) |
| ensurePortalProfile (no email) | Portal dashboard unreachable. | **High** for OAuth-without-email users |

---

## Summary: what can prevent a case from being completed

1. **Environment / feature flag** — Longevity disabled or API disabled → patient cannot start or submit.
2. **Resume without session** — Draft created on another device or after cookie cleared: no way to see or resume that draft without signing in; cookie dashboard shows “Start intake” only.
3. **Session lost before submit** — Submit returns 403; user sees “Submission failed.” with no sign-in or resume guidance.
4. **Portal sign-in without email** — Profile cannot be created/linked; portal is inaccessible; patient cannot see dashboard or summary.
5. **Server/API returning non-JSON or 500** — User sees generic “Save failed.” / “Submission failed.” with no recovery path.
6. **DB or backend failure on create draft** — User stuck on Identify with error; no structured retry or support path.

---

## Recommended fixes (priority order)

1. **Submit 401/403** — When submit returns 401 or 403, show specific message and link: “Your session may have expired. Sign in to the portal, then return here and try submitting again,” with CTA to `/portal/login?redirect=/longevity/start?resume=<id>`.
2. **Cookie dashboard when no session** — Add line: “If you started an assessment on another device, sign in with the same email to see it,” and make “Open secure portal” the primary CTA.
3. **Save/load non-JSON errors** — In LongevityStartFlow catch blocks (loadResume, createDraft, saveProgress, submitIntake), detect non-JSON or 5xx and show: “Something went wrong. Please try again. You can also sign in to the portal and resume from there.”
4. **Documents 401** — When documents list or upload returns 401, show a short line: “Sign in to the portal to continue; you can then return here or resume from the portal.”
5. **Create draft failure** — On create failure, add secondary line: “If this keeps happening, please contact us,” with link if available.
6. **Portal `error=profile`** — Add copy: “We couldn’t set up your account. Please try again or contact support.”

---

## References

- Patient journey and friction: `docs/PATIENT_JOURNEY_FRICTION_ANALYSIS.md`
- Full system audit: `docs/HAIR_LONGEVITY_INSTITUTE_FULL_SITE_AUDIT.md`
- Start flow: `components/longevity/LongevityStartFlow.tsx`
- APIs: `app/api/longevity/intakes/`, `app/api/longevity/intakes/[id]/`, `app/api/longevity/documents/`
- Portal auth: `lib/longevity/portalAuth.ts`
- Cookie dashboard: `app/longevity/dashboard/page.tsx`
