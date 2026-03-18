# HLI Longevity C1 & C2 — Minimal-Risk Implementation Plan

**Scope:** Two critical hardening fixes only. Additive, low-risk; no system redesign.

- **C1** — Prevent no-session intake creation from attaching to a linked profile by email.
- **C2** — Ensure portal sign-out clears the longevity session cookie.

---

## C1 — Prevent no-session intake from attaching to linked profile

### Current behavior (before)

- **POST /api/longevity/intakes** (no session): Resolves profile by email with `.ilike("email", email)` and **no filter on `auth_user_id`**.
- If any profile row matches the email (linked or unlinked), that profile is reused, session is set, and a new intake is created under it.
- **Risk:** User B (no session) enters User A’s email → B gets A’s profile_id in cookie and new intake under A’s profile.

### Target behavior (after)

- When there is **no** longevity session:
  - Resolve profile by email **only among unlinked** profiles (`auth_user_id` IS NULL). Use existing `getProfileByEmail(supabase, email, { onlyUnlinked: true })`.
  - If an **unlinked** profile exists → use it, set session, create intake (unchanged UX for cookie-only / first-time users).
  - If **no unlinked** profile but a **linked** profile exists for that email → **do not** attach. Return **409** with a stable message so the client can show “Sign in to continue.”
  - If **no** profile exists → create new (unlinked) profile, set session, create intake (unchanged).
- When there **is** a session: behavior unchanged (profileId from cookie; no email lookup).

### Files to change

| File | Change |
|------|--------|
| `app/api/longevity/intakes/route.ts` | Replace raw Supabase email lookup with `getProfileByEmail(..., { onlyUnlinked: true })`. If no unlinked but linked exists, return 409. |
| `lib/longevity/portalAuth.ts` | No change (already exports `getProfileByEmail` with `onlyUnlinked`). |
| `components/longevity/LongevityStartFlow.tsx` | In `createDraft`, handle `res.status === 409`: show API `error` message (or fixed “Sign in to continue”) and optionally surface link to portal login. |

### Exact code changes (C1)

**1. `app/api/longevity/intakes/route.ts`**

- Add import: `import { getProfileByEmail } from "@/lib/longevity/portalAuth";`
- Replace the no-session block (lines 61–91) so that:
  - `profileId` is resolved via `getProfileByEmail(supabase, email, { onlyUnlinked: true })`.
  - If that returns a profile → use it, optionally update `full_name`, then `setLongevitySession(profileId)`.
  - If it returns null, check for **any** profile with that email via `getProfileByEmail(supabase, email)` (no `options`). If that returns a profile it must be linked (unlinked was already tried), so **return 409** with body e.g. `{ ok: false, error: "An account already exists for this email. Sign in to continue." }`. Do **not** set cookie or create intake.
  - If still no profile → create new profile (current insert), then `setLongevitySession(profileId)`.

**2. `components/longevity/LongevityStartFlow.tsx`**

- In `createDraft`, after `parseLongevityResponse(res)`:
  - If `status === 409`: set error to `(json?.error as string) || "An account already exists for this email. Sign in to continue."` (and optionally set a `signInHref` for portal login so the message can be a link). Do not treat 409 as generic failure.

### Migration / compatibility (C1)

- **API contract:** New 409 response for “email already linked to an account.” Clients that do not handle 409 will see a non-2xx and should show a generic error; adding 409 handling in LongevityStartFlow improves UX and is backward compatible.
- **Data:** No DB migrations. Existing profiles and intakes unchanged.
- **Cookie-only flow:** Unchanged when the email has no profile or only an unlinked profile. Only the “email belongs to a linked account” path changes (reject instead of attach).

---

## C2 — Portal sign-out clears longevity session cookie

### Current behavior (before)

- User clicks “Sign out” in portal → `PortalSignOut` calls `supabase.auth.signOut()` then `router.replace("/portal/login")`.
- Cookie `hli_longevity_session` is **not** cleared. User can still hit `/longevity/start` or `/longevity/dashboard` and be identified as the same profile.

### Target behavior (after)

- On portal sign-out: clear the longevity session cookie **then** redirect (or redirect after auth sign-out; clear must happen before user can make another request as “logged out”).
- **Implementation:** Call an API that runs `clearLongevitySession()` (server-side cookie delete). Client calls this API in the sign-out flow (e.g. before or after `auth.signOut()`), then redirects.

### Files to change

| File | Change |
|------|--------|
| `app/api/longevity/session/clear/route.ts` | **New.** POST (or DELETE) handler that calls `clearLongevitySession()` and returns 200. |
| `components/longevity/PortalSignOut.tsx` | In `signOut()`, call the new clear endpoint (e.g. `fetch("/api/longevity/session/clear", { method: "POST" })`), then `auth.signOut()`, then redirect. Fire-and-forget for clear is acceptable (best effort). |

### Exact code changes (C2)

**1. New: `app/api/longevity/session/clear/route.ts`**

- Export `dynamic = "force-dynamic"`.
- `POST` (and optionally `DELETE`): `await clearLongevitySession(); return NextResponse.json({ ok: true });`
- No auth check required: clearing the cookie is safe for any caller; if there was no cookie, delete is a no-op.

**2. `components/longevity/PortalSignOut.tsx`**

- In `signOut()`: before or after `supabase.auth.signOut()`, call `fetch("/api/longevity/session/clear", { method: "POST" })` (no need to await; best-effort clear). Then `router.replace("/portal/login"); router.refresh();` as today.

### Migration / compatibility (C2)

- **Behavior:** Signing out will now clear the longevity cookie. Users who “sign out then continue on longevity” will no longer be in the same profile session (intended).
- **No DB or schema changes.** `clearLongevitySession()` already exists in `lib/longevityAuth.ts` and is unused; we only wire it.

---

## Implementation order

1. **C2 first** (session clear on sign-out)  
   - Single new route + one call in `PortalSignOut`. No change to intake creation or profile resolution. Easiest to test and roll back.
2. **C1 second** (no-session intake cannot attach to linked profile)  
   - Touches intake API and one client component. Depends only on existing `getProfileByEmail`; no dependency on C2.

---

## Acceptance criteria

### C1

- [ ] With **no** longevity session, POST `/api/longevity/intakes` with an email that has **only a linked** profile returns **409** and body `{ ok: false, error: "..." }`; no cookie set; no new intake created.
- [ ] With no session, same POST with an email that has **no** profile creates a new (unlinked) profile, sets cookie, creates intake (unchanged).
- [ ] With no session, same POST with an email that has **only an unlinked** profile uses that profile, sets cookie, creates intake (unchanged).
- [ ] With an **existing** session, POST behavior unchanged (profile from cookie; no email lookup).
- [ ] In LongevityStartFlow, submitting an email that triggers 409 shows the API error message (or “Sign in to continue”) and does not advance to the next step.

### C2

- [ ] After clicking “Sign out” in the portal, the `hli_longevity_session` cookie is absent (or cleared) for the site.
- [ ] After sign-out, visiting `/longevity/start` or `/longevity/dashboard` does not identify the user as the previously signed-in profile (no session).
- [ ] Sign-in and normal portal + longevity flows still work; dashboard still sets the longevity cookie when a user opens it.

---

## Regression checks

- **Anonymous (cookie-only) start:** No session → enter email (never used before) → create draft → complete flow. Expect success and one new unlinked profile.
- **Anonymous resume:** Start draft in one browser, copy resume link, open in incognito (no cookie) → open link → expect redirect to login or “sign in to resume”; after login with same email, resume works.
- **Portal login → dashboard:** Sign in → open portal dashboard → “New intake” / “Resume” → longevity routes use same profile (cookie set by dashboard). No change.
- **Portal sign-out then longevity:** Sign in → open dashboard → sign out → open `/longevity/start` → expect no pre-filled profile (new session); opening `/longevity/dashboard` should not show previous user’s intakes.
- **409 path:** Create linked profile (e.g. sign up with alice@example.com, open dashboard once). In another browser/incognito (no session), POST create intake with alice@example.com → expect 409 and no cookie/intake; UI shows “Sign in to continue” (or API message).
- **Feature flag:** With longevity API disabled, POST intakes still returns 404; sign-out still clears cookie if C2 is deployed (no impact on feature flag).

---

## Summary

| Issue | Main files | Risk | Revert |
|-------|------------|------|--------|
| C1 | `app/api/longevity/intakes/route.ts`, `LongevityStartFlow.tsx` | Low: additive logic and new 409 path; existing helpers used | Revert both files |
| C2 | New `app/api/longevity/session/clear/route.ts`, `PortalSignOut.tsx` | Low: new route + one fetch in sign-out | Remove route file and one fetch |

No migrations, no redesign, patient journey preserved except: (1) linked-email no-session create is rejected with 409 and “Sign in to continue,” and (2) sign-out clears the longevity cookie so post–sign-out longevity usage is unauthenticated.
