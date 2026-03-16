# Patient Journey Simulation & Friction Analysis

**Hair Longevity Institute platform**  
Simulated patient journeys and identified friction points that could cause abandonment.

---

## Journey map (actual flow)

| Stage | Route / action | Notes |
|-------|----------------|-------|
| **Landing** | `/longevity` | Hero, “Start assessment” → `/longevity/start`; “Patient portal” → `/portal` (then login if unauthenticated). |
| **Signup / identify** | `/longevity/start` → step “identify” | Email (required) + full name (optional). Creates draft; no separate signup. Portal: magic link or password at `/portal/login`. |
| **Intake questionnaire** | `LongevityStartFlow` | welcome → identify → aboutYou → mainConcern → timelineTriggers → medicalHistory → sexSpecific → lifestyleTreatments → uploadsNextSteps → review → done. |
| **Uploads** | Step “uploadsNextSteps” + portal | Blood (PDF/image), scalp photos, medical letters. One file per input; can skip. Post-submit: blood request letter → upload returned results in portal. |
| **Portal** | `/portal` → `/portal/login` or `/portal/dashboard` | Dashboard: next step, follow-up cadence, care plan, timeline, blood requests, clinician summary (when released), intake history, documents. |
| **Report delivery** | Dashboard “Clinician summary” | When trichologist releases: `patient_visible_summary` + `patient_visible_released_at`. No in-app “report ready” notification or email mentioned in longevity flow. |

---

## Scenario 1: Male, early male pattern hair loss, no blood tests

### Simulated path

1. **Landing**  
   Clicks “Start assessment” → `/longevity/start`.

2. **Identify**  
   Enters email, optional name → “Create draft & continue”. Progress bar appears only after this step (0% before).

3. **About you**  
   Long form: first name, last name, email, mobile, DOB, sex at birth, country, state, city, postcode, GP (name, clinic, email, phone), three consent checkboxes. **No “save and continue later” visible on this step**; only “Save & continue”.  
   **Friction:** Feels like a big commitment; no indication that most fields are optional. Mobile: lots of scrolling and small taps.

4. **Main concern**  
   Multi-select primary concerns (11 options), first noticed, onset pattern, affected areas, symptoms (10 options), free text.  
   **Friction:** “Receding hairline / temples” and “Temple recession” feel similar; “frontal hairline recession” vs “temple recession” unclear. No guidance that one is enough.

5. **Timeline & triggers**  
   Triggers (13), past year events (6), shedding trend.  
   **Friction:** “None” in triggers vs “None” in past year can be misread as “skip section”.

6. **Medical history**  
   Diagnoses (13), current symptoms (9), family history (5), prior blood tests, “Do you want to upload blood results in this intake?” (Yes / No / Skip).  
   **Friction:** He has no bloods. Chooses “No” or “Skip”. No reassurance that **no bloods is OK** and that a GP letter can be requested later. No copy like “You can still get a useful assessment; we may recommend blood tests and a letter for your GP.”

7. **Sex-specific (male)**  
   Therapies (e.g. finasteride, TRT), associated changes.  
   **Friction:** Early MPB patient may not be on anything; “None” is clear.

8. **Lifestyle & treatments**  
   Diet, protein, stress 1–10, sleep, current treatments (16 options), helpful?, response, meds free text.  
   **Friction:** Form fatigue; many options. Stress slider with no label except number.

9. **Uploads**  
   File inputs: blood test, scalp photos, medical letters. “What do you have available?” and “Current blood work status” (uploading now / upload later / not done / unsure).  
   **Friction:** He has no bloods and may have no photos yet. No explicit “You can submit with no uploads; you can add them later in your portal.” Upload area looks mandatory. One file per input; no multi-file feedback. “Uploading…” only; no % or success toast.

10. **Review**  
    Name, email, primary concerns, prior blood tests, current blood status. No summary of uploads or “you’re submitting with 0 documents” confirmation.

11. **Submit → Done**  
    “Go to dashboard” → `/longevity/dashboard`. Dashboard is cookie-based; if he never signs in, he may not discover `/portal` and never see “Sign in to view full portal” or released summary.

12. **Portal / report**  
    To see clinician summary he must go to `/portal`, sign in (magic link). No post-submit message like “We’ll email you when your summary is ready” or “Sign in to the portal to check status.”

### Drop-off risk (Scenario 1)

- **About you:** Form length and optional vs required unclear; mobile form fatigue.  
- **Medical history:** “No bloods” path not reassured; feels like assessment might be worthless.  
- **Uploads:** Looks mandatory; no “submit without uploads and add later” messaging.  
- **Post-submit:** “Go to dashboard” vs “Sign in to portal” confusion; no expectation set for when/how report arrives.

---

## Scenario 2: Female, diffuse hair thinning, has blood tests but no photos

### Simulated path

1. **Landing → Identify → About you**  
   Same as Scenario 1; female selects “Female” at sex at birth.

2. **Main concern**  
   Selects “Diffuse thinning”, “Widening part”, etc. First noticed, onset, affected areas, symptoms.

3. **Timeline & triggers**  
   May select postpartum, menopause, stress, etc.

4. **Medical history**  
   Prior blood tests: “In the last 3 months” or “Older than 3 months”. “Do you want to upload blood results in this intake?” → “Yes”.  
   **Friction:** No reminder here that she’ll upload in the next step; expectation set but step is several screens away.

5. **Sex-specific (female)**  
   Cycles, features, life stage.  
   **Friction:** Many options; “Prefer not to say” for cycles is easy to miss.

6. **Lifestyle & treatments**  
   Same form fatigue as Scenario 1.

7. **Uploads**  
   She has bloods (PDF/images) but no scalp photos.  
   **Friction:**  
   - Only one file per input; she has multiple blood PDFs → must upload one, go back, upload again (no “add another” or multi-select).  
   - No guidance on “which bloods to upload” (e.g. FBC, ferritin, thyroid, hormones).  
   - Scalp photos: no guidance that “no photos is OK” or “we can still proceed; photos help with follow-up.” She may think she must have photos and abandon or delay.  
   - No success state per file (“Blood results uploaded ✓”); only list “Uploaded for this intake” after refresh.

8. **Review / Submit**  
   Review doesn’t list “Documents: 2 blood, 0 photos” so she’s not sure what’s included.

9. **Portal**  
   If blood request is created by clinician, she may see “Recommended blood tests” and “Generate GP support letter” even though she already uploaded—confusing.

### Drop-off risk (Scenario 2)

- **Uploads:** One-file-at-a-time and no “you can skip photos” reassurance; multi-PDF users hit repeated uploads.  
- **Clarity:** No “what we need” vs “what’s optional” for bloods vs photos.  
- **Portal:** Blood request CTA when she already has bloods creates doubt.

---

## Scenario 3: Patient on TRT with accelerated hair loss

### Simulated path

1. **Landing → Identify → About you**  
   Male, same long About you form.

2. **Main concern**  
   May select “Increased shedding”, “Frontal/temple recession”, “Crown thinning”.

3. **Timeline & triggers**  
   **Critical:** “TRT / hormone optimisation” is not in the triggers list in the longevity schema; triggers are stress, illness, postpartum, contraception, menopause, weight loss, medication, etc.  
   **Friction:** No “TRT / testosterone” trigger. He may choose “New medication” or “None”, and his main driver is missed. (Landing page says “You're on TRT or managing hormones and want DHT and androgen risk mapped properly” but the intake doesn’t capture “on TRT” in triggers.)

4. **Medical history**  
   Same as before.

5. **Sex-specific (male)**  
   “Therapies or medications” includes “Testosterone replacement therapy”.  
   **Friction:** TRT is in male therapies but not in timeline triggers; duplication and inconsistency. If he only fills triggers he may skip saying TRT here.

6. **Lifestyle & treatments**  
   “Current treatments” includes finasteride, dutasteride, TRT, etc.  
   **Friction:** TRT appears in male history and again in lifestyle; no single “Are you on TRT?” up front with clear “We’ll tailor DHT/androgen interpretation.”

7. **Uploads**  
   May have recent bloods (testosterone, DHT, etc.). Same one-file and guidance issues.

8. **Portal / report**  
   Expects summary to address TRT and DHT; if triage/review doesn’t flag TRT from therapies, summary may feel generic.

### Drop-off risk (Scenario 3)

- **Triggers:** TRT not in timeline triggers despite being a key persona on the landing page; trust drop.  
- **Redundancy:** TRT in male history and lifestyle; confusing which to use.  
- **Expectation:** Landing promises TRT/DHT mapping; intake doesn’t clearly collect “on TRT” early or explain how it’s used.

---

## Scenario 4: Returning for follow-up after initial summary

### Simulated path

1. **Landing**  
   Clicks “Patient portal” (returning user) → `/portal` → if not logged in → `/portal/login`.

2. **Login**  
   Magic link: enters email → “Check your email for a sign-in link.”  
   **Friction:** No “Didn’t get it? Resend” or “Check spam.” Link expires (no stated TTL). Password option is behind “Sign in with password instead”—returning users may not see it.

3. **Dashboard**  
   Sees “Current status”, “Start follow-up reassessment” or “Start follow-up intake”, FollowUpCadenceCard, “What to do next”, CareJourneyTimeline, blood requests, clinician summary (previous), intake history, documents.

4. **Starting follow-up**  
   Clicks “Start follow-up intake” → `/longevity/start`. No `resume` param, so it’s a new draft.  
   **Friction:** No pre-fill from previous intake (e.g. about you, sex). Message says “your previous data stays safe and is not overwritten” but doesn’t say “we’ll pre-fill what we can.” Full questionnaire again → form fatigue and “why am I re-entering everything?”

5. **Identify**  
   Must enter email again. If session exists, draft is created and linked to profile; if they use a different email, they get a second profile.

6. **Through questionnaire**  
   Re-answers all steps. No “Same as last time” for about you or “Only what’s changed” for concern/meds.

7. **Uploads**  
   Can add new bloods/photos. Old documents are in “Documents” on dashboard but not surfaced in the flow (“Your previous intake had 3 documents; add any new ones here”).

8. **Submit**  
   New intake submitted. Timeline shows “Follow-up intake”; clinician summary from first intake still visible. No clear “Your follow-up is with the specialist; we’ll release a new summary when ready.”

### Drop-off risk (Scenario 4)

- **Login:** Magic link only prominent; no resend, no clear expiry; password hidden.  
- **Follow-up flow:** No pre-fill or “update only what changed”; feels like starting from zero.  
- **Context:** In flow, no reminder of previous summary or “what to add for follow-up” (e.g. new bloods, new photos).

---

## 1. Drop-off risk points (summary)

| Stage | Risk | Who’s most affected |
|-------|-----|----------------------|
| **Landing** | “Patient portal” vs “Start assessment” unclear for new vs returning. | New users clicking portal; returning clicking start. |
| **Identify** | No progress before “Create draft”; feels like a wall. | Everyone. |
| **About you** | Long form; required vs optional unclear; no “save and return later” CTA. | Mobile, time-poor, privacy-sensitive. |
| **Main concern** | Overlapping options (recession/temples); no “pick one main” guidance. | Early MPB, diffuse. |
| **Timeline/triggers** | TRT not in triggers; “None” reads as skip. | TRT users; others. |
| **Medical history** | “No bloods” path not reassured. | No blood tests (Scenario 1). |
| **Sex-specific** | TRT in two places; female options many. | TRT (Scenario 3); female. |
| **Lifestyle** | Form fatigue; stress slider unlabeled. | All. |
| **Uploads** | One file per input; no “skip OK”; no “no photos OK”; no multi-file. | No bloods, no photos, multi-PDF. |
| **Review** | No upload summary; no “submitting with 0 documents” confirmation. | Anyone with no/many uploads. |
| **Submit → Done** | “Go to dashboard” = longevity dashboard; report is in portal; no “we’ll email when ready.” | Everyone. |
| **Portal login** | Magic link only prominent; no resend/expiry; password buried. | Returning (Scenario 4). |
| **Follow-up** | No pre-fill; full form again. | Returning (Scenario 4). |

---

## 2. UX improvements

- **Progress & commitment**  
  - Show a step indicator from step 1 (e.g. “Step 1 of 8”) and a clear progress bar from “identify” (e.g. “~8 min left”).  
  - On About you: mark optional fields (e.g. “Optional”) and add “Save and continue later” that persists draft and explains “We’ll email you a link to resume.”

- **Reassurance and clarity**  
  - Medical history: if “No” or “Skip” for upload bloods now → inline message: “That’s OK. You’ll still get an assessment. We may recommend blood tests and a GP letter you can use later.”  
  - Uploads step: “Bloods and photos are optional but help us. You can submit now and add more in your portal later.” For photos: “No photos? You can still submit; we can use photos at follow-up.”  
  - Review: show “Documents: X blood, Y photos” and if 0: “You’re submitting without documents; you can add them later in your portal.”

- **Triggers and TRT**  
  - Add “TRT / testosterone therapy” (and optionally “Stopping/starting TRT”) to timeline triggers.  
  - For male users, if “Testosterone replacement therapy” selected in therapies, show one line: “We’ll tailor interpretation for DHT and androgen-related hair changes.”

- **Upload UX**  
  - Allow multiple file selection (or “Add another”) for bloods and photos; show list with remove.  
  - After each upload: success state (“Added: filename”) and optional “Add another.”  
  - Short guidance: “Include FBC, ferritin, thyroid, hormones if you have them.”

- **Post-submit**  
  - On done: “Your summary will be ready in the next 48 hours. Sign in to your portal to see it when it’s released.”  
  - Single CTA: “Sign in to portal” (or “Go to portal”) that goes to `/portal/login` with return URL dashboard, and secondary “Go to dashboard” for cookie-based view.  
  - Optional: “We’ll email you at {email} when your summary is ready” (if feature exists).

- **Portal login**  
  - Add “Resend link” with cooldown; show “Link expires in 1 hour” (or actual TTL).  
  - Make “Sign in with password” visible (e.g. tabs: “Email link” | “Password”).  
  - After magic link sent: “Check spam if you don’t see it.”

- **Follow-up**  
  - Pre-fill About you (and optionally sex) from latest submitted intake; show “Update any that changed.”  
  - Optional “Quick follow-up” path: “What’s changed since last time?” (meds, triggers, new bloods/photos) then jump to uploads and review.  
  - In flow: “You’re doing a follow-up. Your previous summary is in your portal; we’ll create a new one after this review.”

- **Mobile**  
  - Larger tap targets for option chips; sticky “Save & continue” / “Back” on long steps.  
  - Consider collapsing “Optional” sections (e.g. GP, postcode) behind “Add optional details.”  
  - File inputs: clear “Tap to upload” and file size limits in the label.

---

## 3. Simplifications that increase completion rate

- **About you**  
  - Require only: email, first name, last name, DOB, sex at birth, one consent (health data).  
  - Move mobile, country, state, city, postcode, GP, and other consents to “Optional details” (expandable) or later.

- **Main concern**  
  - Reduce to one primary concern (single select) plus “When did you first notice?” and one multi-select for “Also relevant” (symptoms/areas).  
  - Or keep multi-select but add: “Pick the one that bothers you most; you can add others.”

- **Uploads**  
  - Make step explicitly “Optional: add documents now or later in your portal.”  
  - Single “Upload documents” area: type (blood / scalp photo / letter) + file picker; allow multiple files per type and show list.

- **Review**  
  - One-screen summary: name, email, main concern, “Documents: X” or “No documents (you can add later).”  
  - Explicit line: “You can submit now and add or change documents in your portal.”

- **Done**  
  - One primary button: “Sign in to portal” (or “Open portal”) and one line: “We’ll email you when your summary is ready” (if implemented).  
  - Remove or de-emphasise “Go to dashboard” to avoid two destinations.

- **Returning**  
  - Pre-fill from last intake for About you (and sex); show “Review and update” instead of empty form.  
  - Optional: “Skip to what’s new” (medications, uploads, notes) then review and submit.

---

## 4. Missing reassurance messages

- **After identify:**  
  “Your progress is saved as you go. You can close this and come back later.”

- **About you (optional block):**  
  “These help us tailor your summary and contact you if needed. You can skip and add later.”

- **Medical history – no bloods:**  
  “No problem. You’ll still receive an assessment. We may recommend blood tests and a letter for your GP that you can use when you’re ready.”

- **Uploads – none:**  
  “You can submit without documents and add bloods or photos later in your portal.”

- **Uploads – no photos:**  
  “Scalp photos are optional. They’re especially useful for follow-up comparisons.”

- **Uploads – multiple bloods:**  
  “You can add more files after this one. Include key results (e.g. FBC, ferritin, thyroid, hormones) if you have them.”

- **Review – no documents:**  
  “You’re submitting without documents. You can add them anytime in your portal after signing in.”

- **Review – submit:**  
  “By submitting, you confirm the information is accurate. Your case will be reviewed by a specialist; you’ll get a summary when it’s ready.”

- **Done:**  
  “Your summary will be ready in the next 48 hours. Sign in to your portal to see it and any next steps.”  
  “We’ll email you at {email} when your summary is ready.” (if implemented)

- **Portal login – magic link:**  
  “Check your inbox (and spam). The link expires in 1 hour. Didn’t get it? Resend.”

- **Follow-up start:**  
  “We’ve pre-filled your details from last time. Update anything that’s changed, then add any new documents or notes.”

---

## Implementation notes (for devs)

- **Longevity flow:** `components/longevity/LongevityStartFlow.tsx` (steps, progress, uploads, review).  
- **Schema:** `lib/longevity/schema.ts` (questionnaire sections). Add TRT to triggers in schema and in the flow’s trigger options.  
- **Portal dashboard:** `app/portal/dashboard/page.tsx` (next step, timeline, clinician summary, documents).  
- **Landing:** `app/longevity/page.tsx`; entry to start: `app/longevity/start/page.tsx`.  
- **Report delivery:** Trichologist releases via review release; patient sees summary in dashboard when `patient_visible_released_at` and `patient_visible_summary` are set. Consider adding “Summary ready” email or in-app notification.

---

*Document generated from codebase review. Simulated journeys reflect current UI and copy as of the review date.*
