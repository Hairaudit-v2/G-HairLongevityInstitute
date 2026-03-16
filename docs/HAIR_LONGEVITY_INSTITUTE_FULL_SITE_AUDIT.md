# Hair Longevity Institute — Full Site Audit

## 1. Executive verdict

**Verdict: Promising but incomplete — not ready for beta.**

The platform has a **solid architectural base**: clear longevity namespace isolation, a coherent longitudinal model (profile → intakes → questionnaire, documents, blood requests), rule-based triage, a rich clinician workspace, and an event/signal outbox that supports future analytics and FI. The **weakness** is that several flows are half-built, key promises to users are not kept, and operational readiness is low. The system will not yet support a real trichologist working through a real queue day-in/day-out without friction, and patients are told they will receive an email when their summary is ready — **that email does not exist**. Clinical logic is serious and defensible where it exists; the gap is completeness and hardening, not fundamental design.

- **Structurally**: Not fragile. The longevity lane is well isolated; no need for a total rebuild.
- **Commercially**: Underbuilt. No payment, no follow-up monetisation surface, no clear premium upsell in the product.
- **Operationally**: Weak. No post-release notification, no admin tooling for trichologist provisioning, no SLA or queue metrics.
- **Clinically**: Strong where implemented (triage rules, derived flags, blood eligibility, release workflow). Gaps: no formal “summary approved by” audit, no versioning of released summary text.
- **UX**: Mixed. Onboarding and questionnaire are clear; post-submit and “waiting” experience are thin; two dashboards (cookie vs portal) create confusion.

**Bottom line**: Continue current direction; **harden clinician workflow and patient communication first**, then add commercial and scale layers. Do not add more advanced analytics or FI integration until the core loop (submit → review → release → notify) is complete and reliable.

---

## 2. What is already strong

- **Longevity namespace isolation**  
  Clean separation from legacy HLI: `lib/longevity/`, `app/longevity/*`, `app/portal/*`, `app/api/longevity/*`, `components/longevity/*`. Feature flags (`HLI_ENABLE_LONGEVITY`, `HLI_ENABLE_LONGEVITY_API`) allow safe rollout. No coupling to `hli_intakes`, `hli_reports`, or referral tables.

- **Longitudinal data model**  
  One profile, many intakes (additive). Submit does not overwrite; “resume” is draft-only. Documents and blood requests are tied to intakes; audit events and integration outbox support a clear timeline. Schema is consistent (`hli_longevity_*`), and migrations are additive.

- **Rule-based triage and derived flags**  
  `lib/longevity/triage.ts` and `derivedFlags.ts`: deterministic, questionnaire-driven flags (iron, thyroid, hormonal, inflammatory, androgen, stress, postpartum, bloods needed, manual review). Triage runs on submit and sets `review_status` / `review_priority`. No black box; easy to explain and extend.

- **Blood request workflow**  
  Eligibility engine, recommended tests from flags, GP letter generation (feature-flagged), `clinician_edited` and letter document storage. Rule- and trichologist-initiated blood requests are both supported. Status lifecycle is clear (e.g. `results_uploaded` in migrations and UI).

- **Trichologist review workspace**  
  Single-page workspace: queue list, case panel, claim/unassign, notes, outcome, summary release, blood request, blood markers, scalp image analysis/comparison, care plan, follow-up cadence, adherence context, protocol assessment. Rich and workflow-complete in structure.

- **Release and integration pipeline**  
  Summary release updates `patient_visible_summary`, `patient_visible_released_at`, `review_status`, optionally creates blood request, writes audit event, stages outbox events/signals (e.g. `REVIEW_COMPLETED`, `CARE_PLAN_GENERATED`), and stages reminders. Single place to extend for FI or other consumers.

- **Patient portal handoff**  
  Cookie-only flow (identify by email → create profile → set session cookie) and portal login (Supabase Auth) are reconciled: `ensurePortalProfile` links by `auth_user_id` or matches unlinked profile by email so prior intakes and documents appear after first login. Resume from `/longevity/intake/[id]` redirects to login then back correctly.

- **Questionnaire and intake UX**  
  Multi-step flow with progress, save-on-navigate, clear required vs optional (e.g. About You consent, optional details). Sex-specific and lifestyle/treatment sections are well structured. Upload step allows bloods, scalp photos, medical letters with clear doc types.

- **Document type alignment**  
  `LONGEVITY_DOC_TYPE` in code and DB constraint (`blood_test_upload`, `scalp_photo`, `medical_letter`, `blood_request_letter`, `other`) are aligned. Upload API uses these types.

- **Analytics and benchmarking foundation**  
  Outbox consumption, cohort adherence/driver/treatment/discordance summaries, treatment-effectiveness and predictive-readiness helpers, and benchmark metrics are implemented and wired. Single source of derived state (`computeDerivedReportingStates`, `computeAdherenceStates`) avoids duplicate rules.

---

## 3. Major weaknesses

1. **No email when summary is released**  
   The “done” step and landing copy say “You will receive an email when your summary is ready.” There is no implementation: no `sendEmail`, no notification on release. This is a **broken promise** and the highest-impact gap.

2. **Two patient dashboards with different capabilities**  
   `/longevity/dashboard` (cookie session) shows a simple progress checklist and intake list. `/portal/dashboard` (logged-in) shows care journey, blood request letters, clinician summary, case comparison, follow-up cadence, next steps. Cookie users are not clearly steered to “Sign in for full dashboard” and may never see summaries or letters.

3. **Intake `status` vs `review_status` confusion**  
   Schema allows `status in ('draft','submitted','in_review','complete')` but the app only ever sets `status = 'submitted'`. Release sets `review_status = 'review_complete'` but does not set `status = 'complete'`. Patients see “Status: submitted” forever. Either use `status` for patient-facing state or stop showing it; currently it’s misleading.

4. **No trichologist provisioning path**  
   Trichologists are identified via `hli_longevity_trichologists` (auth_user_id). There is no UI or documented flow to create/invite trichologists. Going live requires manual DB or script usage.

5. **Review queue ordering and filters**  
   Queue is ordered by `created_at` ascending only. No “priority then date” ordering, no filter by “my cases,” no pagination. At scale the list will be unwieldy.

6. **No post-submit patient email**  
   Beyond “summary ready,” there is no “We’ve received your submission” or “Your case is in the queue” email. Patients have no reassurance except what they see in the app.

7. **Cookie session security and UX**  
   Session is profile_id in a cookie. Anyone with the cookie can act as that profile. No re-auth for sensitive actions. Cookie-only users who clear cookies lose “identity” until they log in with the same email (profile linking works, but the path is not obvious).

8. **Analytics and benchmarking not yet actionable in UI**  
   Cohort and benchmark APIs exist; the analytics page redirects unauthenticated users but the trichologist-facing value (e.g. “how many in queue,” “average time to release”) is not surfaced in the review workspace. Risk of “built for later” without near-term use.

9. **Optional steps not clearly optional in copy**  
   In the flow, “Uploads and next steps” is optional but the step title doesn’t say “Optional.” Some users may think they must upload before submitting. Review step could state “You can submit without uploads and add documents later in the portal.”

10. **No versioning or audit of released summary text**  
    Release overwrites `patient_visible_summary`. There is no history of what was released when or by whom (audit has “patient_summary_released” but not the previous text). For medico-legal defensibility, a versioned copy or immutable release record would be stronger.

---

## 4. Patient journey weaknesses

- **Landing (`/longevity`)**  
  Strong value prop and pathway steps. “Usually 48 hours to your summary” sets expectation; no email on release makes this fragile. “Patient portal” link is clear; “Start assessment” goes to `/longevity/start`. Good.

- **Identify / start**  
  Email + optional name → create draft + set cookie. Clear. “I have a draft” goes to `/longevity/dashboard` (cookie dashboard). If the user actually has a draft in another device/browser they won’t see it unless same cookie; no “resume by email” flow.

- **Questionnaire**  
  Steps are well ordered; progress bar and “Saved” feedback work. Consent (health data, AI, document generation) is explicit. Friction: long flow with no mid-flow “you can save and return later” reminder after step 1.

- **Uploads**  
  Optional but not labelled “Optional” in the step header. Copy says “You can upload … now, or add them later in the patient portal” — good. Cookie users may not know what “patient portal” is or that they need to sign in to get the full experience.

- **Review and submit**  
  Review step shows a short summary; submit is clear. “Done” step says “You will receive an email when your summary is ready” and “Sign in to portal.” If they don’t sign in, they only have cookie dashboard and no email — double gap.

- **Cookie dashboard (`/longevity/dashboard`)**  
  Shows progress checklist (blood results uploaded, follow-up completed, scalp images reviewed, clinician summary released) and intake list with Resume. Does not show clinician summary text, blood request letters, or care journey. No prominent “Sign in for full dashboard and summary.”

- **Portal dashboard (`/portal/dashboard`)**  
  Full experience: next step, follow-up cadence, care plan, case comparison, blood requests, clinician summary, intake history, documents. Strong. But users who never sign in never see this.

- **Waiting state**  
  No “Your case is in the specialist queue” or “Typical wait 48 hours” on the dashboard. Portal next step and timeline help; cookie dashboard is minimal. No in-app or email “your summary is ready” — only if they revisit the portal.

- **Resume flow**  
  `/longevity/intake/[id]` → login if no session → redirect to `/longevity/start?resume=id`. Works. Link from portal dashboard “Resume” uses same resume param. Good.

- **Follow-up**  
  “Start follow-up intake” creates a new intake; longitudinal message is clear. Blood request letter and “upload results later” are well explained. Missing: clear call-to-action to re-upload bloods after GP test and then “request re-review” or “follow-up intake” to close the loop.

---

## 5. Clinician workflow weaknesses

- **Queue**  
  Single list by `created_at` ascending. No “urgent first” or “high priority first” ordering. No “only my assigned” filter. No pagination or “load more.” At 50+ cases the page will be slow and hard to scan.

- **Case detail load**  
  GET review/intakes/[id] does a lot: questionnaire, documents, notes, triage, complexity, blood results, markers, extraction drafts, scalp analysis drafts, case comparison, care plan, follow-up cadence, adherence, treatment continuity, outcome correlation, protocol assessment. One slow dependency can delay the whole panel. No obvious caching or incremental load.

- **Claim / unassign**  
  Claim and unassign APIs exist and are used. No “return to queue” or “reassign to colleague” workflow. Unassign leaves the case in queue; no handoff note.

- **Notes**  
  Internal notes are stored and shown. No edit/delete; append-only is fine. No “pin” or “template” for common notes.

- **Outcome and release**  
  Outcome dropdown and summary textarea work. Release requires non-empty summary — good. Missing: “Preview as patient” before release; no confirmation step (“Release this summary to the patient?”). Audit event is written but the exact summary text is not stored in an immutable release record.

- **Blood request from case**  
  Blood request can be created/updated from the workspace; letter generation and download are feature-flagged. `clinician_edited` is stored. Missing: clear “Recommend bloods” from outcome and one-click “Use rule-based tests” vs “Edit tests” so the clinician can override without re-entering everything.

- **Follow-up and reminders**  
  Adherence and reminder tools exist at `/portal/trichologist/adherence` and `.../reminders`. Not integrated into the main review workspace; clinician has to switch context to see reminder state or send a reminder. Reminder “run” is manual (sweep); no visibility into “next due” in the case panel.

- **No SLA or queue metrics**  
  No “submitted X hours ago” or “average time to first review” in the queue. No dashboard for “cases completed today” or “oldest in queue.” Hard to manage workload or promise “48 hours.”

- **Trichologist identity**  
  No self-service or admin UI to add a trichologist. Must insert into `hli_longevity_trichologists` and ensure the user has an Auth account. No “invite trichologist” or role-based access.

---

## 6. Data / backend weaknesses

- **Intake `status` never set to `in_review` or `complete`**  
  Migration allows four values; only `draft` and `submitted` are used. Either retire `in_review`/`complete` and document “patient-facing status is draft vs submitted” or start setting them from review workflow (e.g. on claim → in_review, on release → complete). Right now the column is underused and confusing.

- **Document `doc_type` legacy value `upload`**  
  Constraint allows `upload` and also `blood_test_upload`, `scalp_photo`, etc. New code uses specific types. Any legacy rows with `upload` are ambiguous. Prefer migrating or deprecating `upload` and using only the specific types.

- **Profile creation without auth**  
  POST /api/longevity/intakes creates a profile by email if no session. Same email can create multiple profiles if sessions differ (e.g. different browsers) because “existing profile” is looked up by session first, then by email only when session is null. Edge case: first request from A creates profile; second request from B with same email (no session) creates another profile. Normal flow (same browser, cookie set) is fine.

- **No unique constraint on (profile_id, email)**  
  Profiles are identified by id; email is not unique. Linking and “find by email” use `ilike` and limit 1. Duplicate emails across profiles are possible if logic elsewhere creates them. Consider unique constraint on normalized email for longevity profiles.

- **Outbox is append-only**  
  No consumption watermark or “processed” flag. Analytics read the table as a log. If multiple consumers run, they all see the same rows. For true “consumption” (e.g. FI) you may want a separate processed table or watermark to avoid reprocessing. Current use (cohort aggregation) is read-only so fine for now.

- **Review case API requires intake in queue**  
  GET review/intakes/[id] returns 403 if intake is not in `REVIEW_STATUS_IN_QUEUE`. After release, `review_status` is `review_complete`, so the case disappears from the queue and the trichologist can’t reopen the same case to view “what did I send?” Only audit and DB still have the data. Consider “view-only past case” for released intakes.

- **Blood request status enum**  
  Migrations add `results_uploaded` and `completed`; code and UI use them. Ensure all code paths (letter generation, patient upload) update status consistently so “results_uploaded” is set when patient uploads blood results document.

---

## 7. UX / conversion weaknesses

- **Trust**  
  “48 hours” and “email when ready” are not kept without implementation. “Your information is kept confidential” is good; no visible security or compliance copy (e.g. data handling, retention) on the intake or portal.

- **Clarity**  
  Two dashboards (cookie vs portal) and “Patient portal” vs “Longevity dashboard” are easy to confuse. One clear “Your dashboard” entry (portal) with “Sign in to see everything” when not logged in would simplify.

- **Calls to action**  
  After submit, primary CTA is “Sign in to portal.” If the user dismisses or skips, they have no other prompt. No email means no second touch. “Add documents later” is mentioned but not surfaced as a clear task on the cookie dashboard (e.g. “You can add more documents to this intake”).

- **Loading and empty states**  
  Review workspace fetches queue and then case; loading states exist but the case panel can feel slow when many dependencies load. Empty queue state is handled; “no documents” and “no blood markers” in case view are shown. Some sections could have clearer “No X yet” with a short explanation.

- **Mobile**  
  Layouts use responsive classes (e.g. grid, flex). File inputs and long forms may be harder on small screens; no dedicated mobile test or touch targets called out.

- **Instructional copy**  
  Questionnaire steps have short descriptions. “Optional” could be more visible (e.g. “Step 7 (optional): Uploads”). Review step could say “You can go back to edit any step, or submit as is and add documents later in the portal.”

---

## 8. Clinical safety / quality concerns

- **Summary release is final**  
  No “draft summary” or “approve summary” step. Trichologist types and releases. For defensibility, consider: (1) storing a snapshot of the released summary and timestamp in an immutable structure (e.g. release history table), (2) “Released by [trichologist] at [time]” in audit and optionally in patient view.

- **Triage is rules-only**  
  All cases that need human review get the same initial priority (high) from `manualReviewRecommended`. No escalation path (e.g. “urgent” for specific patterns). Fine for now; document that triage is decision support and the clinician is responsible for final priority.

- **Blood recommendation**  
  Rule-based and trichologist-based recommendations are clear (`recommended_by`). `clinician_edited` is stored. Letter states it’s for GP information only, not a pathology order. Good. Ensure any patient-facing text never implies “we order tests.”

- **No explicit “summary approved by”**  
  Audit has actor_type trichologist and event “patient_summary_released.” The released text itself is not versioned. Adding a “released_summary_version” or a `hli_longevity_summary_releases` table (intake_id, released_at, released_by, summary_text) would strengthen defensibility.

- **Longitudinal interpretation**  
  Case comparison, treatment response, scalp image comparison, and outcome correlation are built for longitudinal care. They are clinician-facing and clearly framed as support, not replacement, for judgment. Patient-facing summaries (e.g. “Progress since your previous review”) are appropriately caveated (“Your clinician will interpret the full picture with you”).

---

## 9. Scalability concerns

- **Queue and case API**  
  Queue returns all intakes in queue statuses; case detail does many parallel reads. As intake count grows, queue should be paginated and ordered by priority + date. Case detail could lazy-load some sections (e.g. protocol assessment, outcome correlation) or cache per intake.

- **Outbox growth**  
  Every submit and release writes events and signals. Table will grow. Analytics queries use `limit` and optional `since`. For very large scale, consider partitioning by `created_at` or moving old rows to cold storage; not urgent.

- **Trichologist concurrency**  
  Two trichologists can open the same case; claim is optional. No locking. Risk of duplicate work or conflicting release (second release overwrites summary). Consider “soft lock” when a case is claimed (e.g. “Under review by [name]”) and block or warn on release by another user.

- **File storage**  
  Documents in Supabase Storage with longevity paths. No retention or lifecycle policy mentioned. Large volume of high-res photos could increase cost; consider size limits and format guidance (already have file validation; ensure it’s enforced server-side).

- **No rate limiting or abuse controls**  
  API routes check session or trichologist but do not rate-limit. A bot could create many drafts or hit review APIs. Consider rate limiting for public-facing and auth endpoints.

---

## 10. Commercial gaps

- **No payment or pricing in flow**  
  No checkout, plan, or “premium summary” upsell. The product is built as if “assessment + review + summary” is the core; monetisation (one-off fee, subscription, follow-up package) is not implemented. Revenue is left on the table until a payment layer is added.

- **Follow-up and continuity**  
  Follow-up intake and “next review timing” are in the product; there is no “book follow-up consultation” or “follow-up care plan” paid option. Natural place for recurring revenue.

- **Blood work**  
  Blood request and letter support the pathway; there is no “order through us” or partner lab revenue. Letter is “for your GP” only. Acceptable; any future paid blood pathway would need clear compliance.

- **Subscription / membership**  
  No membership or subscription tier. “Return for reassessments anytime” is stated but not tied to a paid membership. Could link to existing `app/membership` or a longevity-specific tier later.

- **HairAudit / FI cross-link**  
  Positioned for future FI integration (outbox, signals). No in-app link to HairAudit or “upgrade to full audit” yet. Strategy doc may define this; product does not yet surface it.

---

## 11. Immediate priority fixes

1. **Implement “summary released” notification**  
   When a trichologist releases a summary, send an email to the profile email (or auth user email) with a short message and link to the portal. Use existing email infra or a small longevity-specific sender. Remove or soften “You will receive an email” only after this works.

2. **Unify patient dashboard entry**  
   Make `/portal` (or a single “Dashboard” link) the canonical patient destination. When not logged in, show a clear “Sign in to see your summaries, letters, and full journey” and one CTA to sign in. Optionally redirect `/longevity/dashboard` to portal login with return URL to portal dashboard so cookie users are guided to sign in.

3. **Clarify intake status for patients**  
   Either: (a) stop showing raw `status` and show a derived state (e.g. “Submitted”, “In review”, “Summary ready”) from `review_status` and `patient_visible_released_at`, or (b) set `status = 'complete'` when summary is released and show “Complete.” Prefer (a) so one source of truth is review/release.

4. **Add “Your case is in the queue” / “Summary ready” in-app state**  
   On portal dashboard, show a clear banner or next-step when the latest intake is submitted but not yet released (“Your specialist will review your case — typically within 48 hours”) and when summary is released (“Your summary is ready” with link to expand or scroll to summary). Reduces reliance on email alone.

5. **Document or implement trichologist provisioning**  
   Either: (a) add an admin-only page (e.g. under existing admin) to create/link trichologist (email → invite or link auth user), or (b) document the exact SQL and auth steps and put them in a runbook. Do not rely on “we’ll do it manually” without a script or UI.

6. **Queue: order by priority then created_at**  
   In GET review/queue, order by `review_priority` (urgent, high, normal, low) and then `created_at` ascending so urgent/high cases appear first. Use a stable sort (e.g. same priority → older first).

7. **Optional step label**  
   In LongevityStartFlow, label “Uploads and next steps” as “Step 7 (optional)” or add one line: “This step is optional — you can add documents later in the portal.”

8. **Release confirmation**  
   In TrichologistReviewWorkspace, before calling release API, show a confirmation: “Release this summary to the patient? They will be able to see it in the portal.” and “Send email notification” (if you add a toggle later). Reduces accidental release.

9. **Audit: store released summary snapshot**  
   When releasing, insert a row into a small table (e.g. `hli_longevity_summary_releases`: intake_id, released_at, released_by_trichologist_id, summary_text_snapshot) or append to audit payload. Do not overwrite history when re-reading; keep intake.patient_visible_summary as “current” for display.

10. **Cookie dashboard: add “Sign in for full dashboard”**  
    On `/longevity/dashboard`, add a prominent card or banner: “Sign in to see your clinician summary, blood test letters, and full care journey” with button to `/portal/login?redirect=/portal/dashboard`. Use same CTA when they have submitted intakes but no released summary yet.

---

## 12. Recommended next build phases

**Phase 1 — Core loop and trust (4–6 weeks)**  
- Summary-released email and in-app “summary ready” state.  
- Single dashboard entry (portal-first; cookie dashboard redirects or surfaces “Sign in for full dashboard”).  
- Patient-facing status derived from review/release; no misleading “submitted” forever.  
- Trichologist provisioning (admin UI or runbook + script).  
- Queue order by priority then date.  
- Release confirmation and optional release snapshot table.

**Phase 2 — Clinician efficiency and safety (3–4 weeks)**  
- “My cases” filter and/or “unassigned” filter in queue.  
- Case panel: “Submitted X hours ago” and optional “View released case” for past intakes.  
- Reminder/follow-up snippet in case panel (e.g. “Reminder sent / due / overdue”).  
- Summary release history (read-only) for medico-legal.

**Phase 3 — Commercial and retention (4+ weeks)**  
- Payment for “assessment + summary” or first consultation (stripe or existing payment).  
- “Book follow-up” or “Follow-up care plan” product with clear pricing.  
- Optional: membership or subscription tier that includes N reassessments per year.

**Later**  
- FI integration (consume outbox, send to FI pipeline).  
- Advanced analytics in trichologist UI (queue age, completion rate).  
- Rate limiting and abuse controls.  
- Mobile-specific tweaks and accessibility pass.

---

## 13. Risk register

| Issue | Severity | Why it matters | Recommended fix |
|-------|----------|----------------|-----------------|
| No email on summary release | **Critical** | Promise broken; trust and retention drop | Implement email on release; use profile/auth email |
| Two dashboards, underused portal | **High** | Users miss summaries and letters; confusion | Single dashboard entry; redirect cookie dashboard to sign-in CTA |
| Intake status never “complete” | **Medium** | Patient sees “submitted” forever; looks broken | Derive display status from review_status + released_at; or set status on release |
| No trichologist provisioning path | **High** | Cannot onboard clinicians without DB access | Admin UI or documented script + runbook |
| Queue not ordered by priority | **Medium** | Urgent cases buried; clinician inefficiency | Order by review_priority then created_at |
| No release confirmation | **Medium** | Accidental release; no undo | Confirm modal before calling release API |
| No immutable release record | **Medium** | Weaker medico-legal trail | Add summary_releases table or audit payload snapshot |
| Duplicate profiles by email (edge case) | **Low** | Rare; can cause duplicate intakes | Unique constraint on normalized email; or merge flow |
| Case panel heavy load | **Medium** | Slow when many cases; poor UX | Paginate queue; lazy-load or cache parts of case detail |
| No rate limiting | **Low** | Abuse or cost from bots | Add rate limiting to public and auth APIs |

---

## 14. Final recommendation

- **Continue current direction.** The architecture is sound; do not rebuild.

- **Harden clinician workflow first.** Before adding more analytics or FI: fix queue ordering, add trichologist provisioning, add release confirmation and summary snapshot, and optionally “my cases” and “view released case.”

- **Improve patient UX next.** Implement summary-released email and in-app “summary ready”; unify dashboard entry and clarify status. Then optional-step labelling and “your case is in the queue” messaging.

- **Defer** broad analytics UI, FI integration, and advanced benchmarking until the submit → review → release → notify loop is complete and the product is used in production.

- **Do not pause** blood request workflow, longitudinal model, or outbox — they are differentiators and ready for use once the loop is closed.

---

## Recommended build order from here

1. **Summary-released email** — On release, send email to profile email (or auth user) with link to portal.  
2. **Portal-first dashboard** — Redirect or strongly prompt cookie users to sign in; single “Your dashboard” = portal dashboard.  
3. **Patient-facing status** — Derive “In review” / “Summary ready” from review_status and patient_visible_released_at; show that instead of raw intake status.  
4. **Trichologist provisioning** — Admin page or runbook + script to create/link trichologist.  
5. **Queue order** — Sort by review_priority (urgent → high → normal → low), then created_at ascending.  
6. **Release confirmation + snapshot** — Confirm modal before release; write released summary + trichologist + timestamp to audit or summary_releases table.  
7. **“Summary ready” in-app** — On portal dashboard, when latest intake has patient_visible_released_at, show prominent “Your summary is ready” and scroll/expand to summary.  
8. **Optional step label** — “Step 7 (optional): Uploads and next steps” and one line that documents can be added later in the portal.

After these eight, re-evaluate: add “My cases” filter, reminder in case panel, then payment and follow-up product.
