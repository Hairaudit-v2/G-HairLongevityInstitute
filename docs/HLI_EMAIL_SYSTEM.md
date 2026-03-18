# HLI Unified Email Communication System

All outgoing Hair Longevity Institute™ emails use the same **premium, clinical** template system. This aligns with the GP support letter and PDF styling.

## Design principles

- **Premium, clinical, modern** — clean spacing, charcoal text, soft gold accents
- **Short paragraphs** — max 2–3 lines; no dense blocks
- **Professional tone** — confident, human, not sales-driven
- **Consistent structure** — Header → Greeting → Intro → Sections → CTA (optional) → Closing → Sign-off → Footer

## Template structure

Every email is built from:

| Component   | Purpose |
|------------|---------|
| **EmailHeader** | Hair Longevity Institute™, optional tagline, subtle divider |
| **EmailBody**   | Greeting, intro, sections (heading + paragraphs/bullets), optional CTA, closing, sign-off |
| **EmailFooter** | Business name, website, email, phone (optional address) |

CTA style: simple, professional (e.g. "View Your Report", "Access Your Portal"). No aggressive marketing copy.

## Files

### Core layout and types

| File | Purpose |
|------|---------|
| `lib/email/types.ts` | `EmailBodyContent`, `EmailSection`, `EmailCTA` |
| `lib/email/hliEmailLayout.ts` | `buildHliEmailHtml()`, `buildHliEmailText()`, `buildHliEmailHtmlFromPlainBody()`, `getHliEmailFooterPlain()` |

### Templates (subject + html + text)

| File | Email type | Subject (default) |
|------|------------|-------------------|
| `lib/email/templates/assessmentComplete.ts` | Assessment / summary released | Your Hair Longevity Assessment — Now Available |
| `lib/email/templates/gpLetter.ts` | GP letter ready | Your Clinical Support Letter for GP Review |
| `lib/email/templates/reminder.ts` | Reminders | Continue Your Hair Assessment |
| `lib/email/templates/followUp.ts` | Next steps | Your Next Steps |
| `lib/email/templates/welcome.ts` | Onboarding | Welcome to Hair Longevity Institute™ |

### Integration

| File | Change |
|------|--------|
| `lib/longevity/reminderEmail.ts` | `SendReminderEmailParams` accepts optional `html`; Resend sends multipart when `html` is set; reminders get HTML via `buildHliEmailHtmlFromPlainBody(bodyText)` and footer via `getHliEmailFooterPlain()` |
| `lib/longevity/notifications/summaryReleasedEmail.ts` | Uses `buildAssessmentCompleteEmail()` and sends both `html` and `bodyText` |

## Branding (where to edit)

- **Business name, tagline, contact details** — `lib/hliBranding.ts` (`HLI_BRAND`) and env: `HLI_BUSINESS_NAME`, `HLI_TAGLINE`, `HLI_ADDRESS`, `HLI_EMAIL`, `HLI_WEBSITE`, `HLI_PHONE`, `HLI_ABN`
- **Colors** — `lib/hliBranding.ts` (`HLI_COLORS`). Layout uses these in `lib/email/hliEmailLayout.ts` for header, body, footer, CTA
- **Layout** — `lib/email/hliEmailLayout.ts`: header/footer HTML, body font size, line height, max-width (600px)

## Sending an email

1. **Structured content** — Use a template builder, then pass `html` and `bodyText` to the adapter:
   ```ts
   const { subject, html, text } = buildAssessmentCompleteEmail({ fullName, portalUrl });
   await adapter.send({ to, subject, bodyText: text, html });
   ```
2. **Pre-composed plain text** (e.g. reminders) — Keep building `bodyText` as today; the adapter wraps it in the HLI layout and sends multipart (HTML + text) automatically.

## Preview (dev only)

- **Assessment:** `GET /api/dev/email-preview?type=assessment`
- **GP letter:** `GET /api/dev/email-preview?type=gp-letter`
- **Reminder:** `GET /api/dev/email-preview?type=reminder`
- **Follow-up:** `GET /api/dev/email-preview?type=follow-up`
- **Welcome:** `GET /api/dev/email-preview?type=welcome`

Open in a browser to check layout and mobile rendering. Use a narrow viewport to test spacing.

## Constraints

- Current email **sending logic** is unchanged: same adapter, same `sendLongevityReminderEmail` and `sendLongevitySummaryReleasedEmail` APIs.
- **Business logic** (when to send, what to send) is unchanged; only **structure and styling** are unified.
- Reminders continue to be staged with `subject` and `body_text`; at send time the body is wrapped in the branded HTML.
