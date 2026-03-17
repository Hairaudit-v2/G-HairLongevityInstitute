# Ecosystem linking rules

Standardised cross-linking across **Hair Longevity Institute (HLI)**, **HairAudit**, and **Follicle Intelligence** so the ecosystem reads as one story, not fragmented products.

## Rules by platform

| Platform | Links to | When / purpose |
|----------|----------|-----------------|
| **Hair Longevity Institute** | Follicle Intelligence | Always — as the **analysis engine** behind HLI. |
| **Hair Longevity Institute** | HairAudit | **Only when discussing surgery** (e.g. book page “Considering surgery?”, for-professionals “If surgery becomes relevant”). |
| **HairAudit** | HLI | Biology and treatment understanding. |
| **HairAudit** | Follicle Intelligence | Scoring / analysis engine. |
| **Follicle Intelligence** | HLI + HairAudit | Positioned as the **core engine** powering both. |

## UI

- Use a **consistent card layout** for cross-links (title, short description, CTA).
- Include **short descriptions** that match the rules above.
- **Avoid random linking** — only show links that fit the current context (e.g. no HairAudit on HLI unless surgery is in scope).

## Implementation on HLI

### Component: `EcosystemCrossLinks`

- **Path:** `components/public/EcosystemCrossLinks.tsx`
- **Props:**
  - `currentSite`: `"hli" | "hairaudit" | "follicleintelligence"`
  - `showSurgeryLink?: boolean` — HLI only; when `true`, show HairAudit card (surgery context).
  - `includeIIOHR?: boolean` — When `true` (e.g. for-professionals), add IIOHR as first card (training).
  - `theme?: "light" | "dark"`
  - `heading?`, `id?`, `className?`

### Where it’s used

| Page | Usage |
|------|--------|
| **Book** (`app/book/page.tsx`) | `currentSite="hli"` `showSurgeryLink={true}` `theme="dark"` — “Considering hair transplant surgery?” (FI + HairAudit cards). |
| **For professionals** (`app/for-professionals/page.tsx`) | `currentSite="hli"` `includeIIOHR={true}` `showSurgeryLink={true}` `theme="light"` — “If surgery becomes relevant” (IIOHR + HairAudit + FI cards). |
| **Footer** | Platform captions aligned to rules; cross-links in footer are via `SurgicalIntelligenceEcosystemBand` and the “Hair Intelligence Network” column (HLI, HairAudit, FI with short descriptions). |

### Footer copy (aligned to rules)

- **HLI:** “Understand biology and treatment options before or alongside any procedure”
- **HairAudit:** “Surgical audit and transparency — when surgery is part of the picture”
- **Follicle Intelligence:** “The analysis engine powering HLI and HairAudit”

## HairAudit and Follicle Intelligence (other repos)

When implementing the same rules on HairAudit or Follicle Intelligence:

1. Reuse or copy `EcosystemCrossLinks` (or equivalent) and pass `currentSite="hairaudit"` or `currentSite="follicleintelligence"`.
2. On HairAudit: show HLI + FI cards with the descriptions from this doc.
3. On Follicle Intelligence: show HLI + HairAudit cards; position FI as the engine powering both.

## Related

- **HairEcosystemSection** — Legacy three-platform cards; for new content prefer `EcosystemCrossLinks` with the rules above.
- **SurgicalIntelligenceEcosystemBand** — Footer band; set `currentSite` per platform.
- **GlobalHairIntelligenceNetwork** — Diagram (FI centre, HLI/HairAudit outer); supports variant and theme.
