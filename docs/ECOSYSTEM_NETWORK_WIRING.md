# Global Hair Intelligence Network — Wiring Across All Ecosystem Sites

This doc describes how to use the shared **GlobalHairIntelligenceNetwork** component and **GlobalHairIntelligenceSection** wrapper on each ecosystem site. The same component is used on HLI, HairAudit, Follicle Intelligence, and IIOHR with site-specific props and copy.

---

## 1. Shared component location (HLI repo)

- **Network component:** `components/ecosystem/GlobalHairIntelligenceNetwork.tsx`
- **Section wrapper:** `components/ecosystem/GlobalHairIntelligenceSection.tsx`
- **Canonical node links:** `components/ecosystem/constants.ts` (`GLOBAL_NETWORK_NODE_LINKS`)

**Dependencies:** React 18+, `framer-motion`.

To use on HairAudit, Follicle Intelligence, or IIOHR: copy the `components/ecosystem` folder (all three files) into the target repo and ensure `framer-motion` is installed. Adjust imports if the project uses a different path alias (e.g. `@/components/...`).

---

## 2. Site-specific props

| Site | variant | highlightNode |
|------|--------|----------------|
| **Hair Longevity Institute** | `"hli"` | `"hli"` |
| **HairAudit** | `"hairaudit"` | `"hairaudit"` |
| **Follicle Intelligence** | `"fi"` | `"fi"` |
| **IIOHR** | `"iiohr"` | `"iiohr"` |

Use the same value for both so the current site’s node is emphasised.

---

## 3. Node links (canonical)

Use these URLs for clickable nodes. They are defined in `components/ecosystem/constants.ts` and passed by default when using `GlobalHairIntelligenceSection`.

| Node | URL |
|------|-----|
| **hli** | https://hairlongevityinstitute.com |
| **hairaudit** | https://hairaudit.com |
| **fi** | https://follicleintelligence.ai |
| **iiohr** | https://iiohr.com |

---

## 4. Placement

- **Homepage:** One large hero/feature section with the network (`size="hero"`). Do not render the full network twice on the same page.
- **Secondary pages:** Optional single compact section (`size="compact"`) if needed; still only one network instance per page.

---

## 5. Section wrapper (reusable)

Use **GlobalHairIntelligenceSection** so layout and behaviour are consistent:

- Soft light background (e.g. `bg-subtle` or equivalent)
- Generous vertical spacing
- Heading + short supporting copy (site-specific)
- Network component centered below, no extra boxed background (`showBackground={false}`)

Copy stays **outside** the component (heading + description props). The network component itself stays brand-neutral; only highlight styling is driven by `variant` / `highlightNode`.

---

## 6. Copy examples by site

Pass **heading** and **description** from the page; the component does not hardcode site name.

### Hair Longevity Institute (HLI)

- **Heading:** `Global Hair Intelligence Network`
- **Description:** `A connected system for biology, treatment, and surgical transparency.`

### HairAudit

- **Heading:** `Global Hair Intelligence Network`
- **Description:** `A connected system for surgical audit, biology, and clinical intelligence.` (or similar)

### Follicle Intelligence

- **Heading:** `Global Hair Intelligence Network`
- **Description:** `The analysis engine at the centre of biology, treatment, and surgical outcomes.` (or similar)

### IIOHR

- **Heading:** `Global Hair Intelligence Network`
- **Description:** `Education, standards, and certification within the hair intelligence ecosystem.` (or similar)

---

## 7. Usage examples

### Using the section wrapper (recommended)

```tsx
import { GlobalHairIntelligenceSection } from "@/components/ecosystem/GlobalHairIntelligenceSection";

// HairAudit homepage
<GlobalHairIntelligenceSection
  variant="hairaudit"
  heading="Global Hair Intelligence Network"
  description="A connected system for surgical audit, biology, and clinical intelligence."
  size="hero"
  theme="light"
/>

// Follicle Intelligence homepage
<GlobalHairIntelligenceSection
  variant="fi"
  heading="Global Hair Intelligence Network"
  description="The analysis engine at the centre of biology, treatment, and surgical outcomes."
  size="hero"
  theme="light"
/>

// IIOHR homepage
<GlobalHairIntelligenceSection
  variant="iiohr"
  heading="Global Hair Intelligence Network"
  description="Education, standards, and certification within the hair intelligence ecosystem."
  size="hero"
  theme="light"
/>
```

### Using the network only (e.g. custom layout)

```tsx
import { GlobalHairIntelligenceNetwork } from "@/components/ecosystem/GlobalHairIntelligenceNetwork";
import { GLOBAL_NETWORK_NODE_LINKS } from "@/components/ecosystem/constants";

<GlobalHairIntelligenceNetwork
  variant="hairaudit"
  highlightNode="hairaudit"
  interactive
  theme="light"
  showBackground={false}
  size="hero"
  nodeLinks={GLOBAL_NETWORK_NODE_LINKS}
/>
```

---

## 8. Verify on each site

- No broken imports (path alias matches the copied `ecosystem` folder).
- `framer-motion` in dependencies; no runtime errors from missing package.
- No hydration warnings (component is `"use client"`; use inside client tree or let the section be client).
- No boxed background mismatch: use `showBackground={false}` (default in the section) so the parent section controls background.
- Mobile: single network per page, responsive container; text remains readable with `size="hero"` or `size="compact"`.
