# GP Support Letter & HLI Document Branding

## Overview

The GP support letter PDF is a **premium, clinical, branded** Hair Longevity Institute™ document. The same branding and template patterns are reused for future blood letters, clinician summary PDFs, and aligned with HLI emails (summary released, reminders).

**Design direction:** Premium clinical, modern. Clean white/ivory background, charcoal text, restrained soft-gold accents, strong hierarchy, spacious layout (~1.5–1.7 line height, 24pt section spacing). No dense blocks or “raw generated PDF” feel.

## GP Letter Structure (Template)

1. **Header** — Logo (if available), **Hair Longevity Institute™**, optional tagline *Clinical Hair & Scalp Science*, address, email · website · phone · ABN, thin divider.
2. **Document title** — GP SUPPORT LETTER — SUGGESTED INVESTIGATIONS
3. **Date** — Professional format (e.g. 18 March 2026)
4. **Patient details** — Structured block: Patient name, Date of letter
5. **Introduction** — “To the Treating General Practitioner,” thank you, context (HLI review, suggested investigations for systemic influences)
6. **Clinical Considerations** — Short intro line + bullet list (from `reason` input)
7. **Suggested Investigations** — Short intro line + bullet list (from `recommendedTests` input)
8. **Clinical Note** — Fixed copy: collaborative approach, all at GP discretion
9. **Disclaimer** — Heading + body in smaller muted text (not a formal pathology request; GP determines all decisions)
10. **Sign-off** — “Kind regards,” Hair Longevity Institute™ Clinical Team, Hair Longevity Institute™
11. **Footer** — Same disclaimer in fine print

## Files

| File | Purpose |
|------|---------|
| `lib/hliBranding.ts` | HLI business identity (env), tagline, typography (section gap 24pt, line height ~1.6), color palette (charcoal, soft gold, muted) |
| `lib/longevity/pdfBranding.ts` | PDF header/footer, `drawSectionHeading`, `drawBodyParagraph`, `drawBulletList`, `wrapText`, `bodyLineHeight`, PDF colors & layout |
| `lib/longevity/gpLetterGenerator.ts` | GP letter with premium copy and template structure above |
| `app/api/dev/gp-letter-sample/route.ts` | Dev-only GET → sample PDF |
| `.env.example` | Optional `HLI_*` and `HLI_TAGLINE` |

## Config (Company Details & Logo)

Optional env (see `.env.example`). Unset values use defaults so the letter still renders.

- **HLI_BUSINESS_NAME** — Letterhead (default: `Hair Longevity Institute™`)
- **HLI_TAGLINE** — e.g. `Clinical Hair & Scalp Science`
- **HLI_ADDRESS** — Single or multi-line
- **HLI_EMAIL**, **HLI_WEBSITE**, **HLI_PHONE**, **HLI_ABN**

**Logo:** `lib/longevity/pdfBranding.ts` tries `public/brand/hli-logo.png`, then `Print_Transparent.svg` or `Print.svg` (via sharp). Add `hli-logo.png` in `public/brand/` for production letterhead.

## Legal / Clinical

- Document is for clinical support only; not a formal pathology request.
- All investigations, interpretation, and management at the treating GP’s discretion.
- Wording is preserved in the new layout; only presentation and hierarchy were upgraded.

## Reuse for Other PDFs & Emails

- **PDFs:** Use `drawHliLetterHeader`, `drawHliLetterFooter`, `drawSectionHeading`, `drawBodyParagraph`, `drawBulletList` from `pdfBranding.ts`; same `PDF_COLORS`, `PDF_LAYOUT`, `HLI_TYPOGRAPHY`.
- **Emails:** Use `HLI_BRAND`, `HLI_COLORS` (hex), `HLI_TYPOGRAPHY` for header/footer and spacing. Align tone: premium clinic, Hair Longevity Institute™, clean spacing. (Transactional email templates can be updated in a follow-up to match this identity.)

## Verification

1. `npx tsc --noEmit`
2. `npm run dev` → open or curl `http://localhost:3000/api/dev/gp-letter-sample` (use 3001 if that’s the port shown) → save as PDF and confirm it looks like a real clinic letter.
