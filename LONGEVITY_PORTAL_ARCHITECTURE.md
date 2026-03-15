# Longevity Patient Portal — Architecture

This document describes the **persistent patient portal** for the Hair Longevity Institute longevity module. The design keeps the portal **isolated** from existing HLI report, referral, and intake flows (`hli_intakes`, `hli_reports`, `hli_medical_referrals`).

## Goals

- **Login-based patient portal**: users can sign in, return, update information, upload documents, and complete follow-up assessments over time.
- **One profile per auth user**: each patient has one `hli_longevity_profiles` row, optionally linked to Supabase Auth via `auth_user_id`.
- **Multiple intakes per profile**: intakes are never overwritten; each submission is a new row in `hli_longevity_intakes`.
- **Documents** attach to profiles and/or intakes (`profile_id` or `intake_id` on `hli_longevity_documents`).
- **Backward compatibility**: the existing cookie-based longevity intake flow continues to work without login.

## Data Model (additive)

- **`hli_longevity_profiles.auth_user_id`** (nullable, unique when set): references `auth.users(id)`. Enables “one profile per logged-in user.” Null for cookie-only (anonymous) sessions.
- **`hli_longevity_documents.profile_id`** (nullable): allows documents to be attached at profile level (e.g. uploads not tied to a specific intake). Constraint: each row has at least one of `intake_id`, `blood_request_id`, or `profile_id`.

No new tables reference `hli_intakes`, `hli_reports`, or referral tables.

## Auth and Session

- **Supabase Auth**: used only for the **portal** (login at `/portal/login`). **Magic link** is the primary method (email only); password sign-in is available as a fallback. Implemented with `@supabase/ssr`: server client reads session from cookies; browser client used for sign-in/sign-out.
- **Magic link redirect**: Add `https://your-domain.com/portal/auth/callback` (and for local dev `http://localhost:3000/portal/auth/callback`) to Supabase Auth **Redirect URLs** (Dashboard → Authentication → URL Configuration).
- **Longevity session cookie** (`hli_longevity_session`): still used for the **anonymous** flow and for **portal users** after login. When a user opens the portal dashboard, the server resolves their profile from `auth_user_id`, then calls `setLongevitySession(profileId)` so that:
  - `/longevity/start` and `/api/longevity/*` use the same profile.
  - “Resume” and “New intake” work without duplicating logic.
- **Profile resolution on first portal login**:
  1. Look up profile by `auth_user_id`; if found, use it.
  2. Else look up profile by **email** (auth user’s email) among profiles **not yet linked** to any auth user; if found, **link** it via `auth_user_id` and use it (avoids binding another account’s profile).
  3. Else **create** a new profile with that email and `auth_user_id`, then use it.
- **No duplicate profile in normal flow**: we only create a new profile when the auth user has no linked profile and no unlinked profile matches their email. One profile per portal user; clinician workflows can assume stable `profile_id` for a patient’s intakes and documents.

So returning cookie-only users who later sign up with the same email get their existing intakes and documents linked to their account.

## Longitudinal case model (stable for clinicians)

This model is **stable** so future Trichologist or clinician workflows can rely on it without rework:

- **Profile** is the durable patient identity; one row per patient (linked to auth when they use the portal).
- **Intakes** are **additive**: each “Start new intake” or POST to create intake creates a **new row**. Submitted intakes are never overwritten or replaced. “Resume” continues an **existing draft** (same row); it does not create a new intake.
- **Questionnaire** edits are allowed only while status is `draft`; after **submit**, the questionnaire is locked. Document uploads remain allowed for that intake after submission (longitudinal document continuity).
- **Documents** attach to an intake (or profile); listing is per profile across all intakes. Patients can add documents during a draft or after submitting an intake.

Future clinician (Trichologist) features should treat **profile → many intakes (additive), documents per intake/profile** as the source of truth. See `docs/TRICHOLOGIST_PORTAL_SPEC.md`.

## Routes

| Route | Auth | Purpose |
|-------|------|--------|
| `/longevity` | None | Longevity landing; links to Start intake, Patient portal, Dashboard (session). |
| `/longevity/start` | Cookie (or set by portal) | Start or resume intake; same as before. |
| `/longevity/dashboard` | Cookie | Cookie-based dashboard (no login). Unchanged. |
| `/portal` | Redirect | Redirects to `/portal/dashboard` if logged in, else `/portal/login`. |
| `/portal/login` | None | Sign in: magic link (primary) or password. |
| `/portal/auth/callback` | None | Handles magic link redirect; exchanges token for session, then redirects to dashboard. |
| `/portal/dashboard` | Supabase Auth | Portal dashboard: next step, intake history, documents, “New intake”, “Resume”, Sign out. Sets longevity cookie so start/resume use the same profile. |

## Isolation

- **Longevity module** code lives under `app/portal/*`, `app/longevity/*`, `lib/longevity/*`, `components/longevity/*`, and longevity API routes under `app/api/longevity/*`.
- **No changes** to `hli_intakes`, `hli_reports`, `hli_medical_referrals`, or to admin/doctor/referral flows.
- Feature flags: `HLI_ENABLE_LONGEVITY` controls longevity and portal; API is gated by `HLI_ENABLE_LONGEVITY_API`.

## Environment

- **Portal auth** requires:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for Supabase Auth in the browser and server session).
- Existing: `SUPABASE_SERVICE_ROLE_KEY` for server-side DB access.

## Migrations

- `20250316000002_hli_longevity_portal_auth.sql`: adds `auth_user_id` to `hli_longevity_profiles`, adds `profile_id` to `hli_longevity_documents`, and relaxes the document parent constraint.

## Related

- **Trichologist portal (future):** See **`docs/TRICHOLOGIST_PORTAL_SPEC.md`** for planning and specification of a dedicated Trichologist login and dashboard. No implementation required until patient portal is stable.

## Summary

The safest approach is **additive**: bind `auth.users` to `hli_longevity_profiles`, add profile-level documents, and introduce a login-based `/portal` that reuses the same intake and document APIs by syncing the longevity session cookie. The existing longevity lane and all HLI report/referral behavior remain unchanged.
