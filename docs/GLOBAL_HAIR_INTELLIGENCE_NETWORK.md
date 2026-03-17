# Global Hair Intelligence Network — Reusable Component

**Component:** `components/GlobalHairIntelligenceNetwork.tsx`

Core brand visual for the connected ecosystem. Use on **HLI**, **HairAudit**, and **Follicle Intelligence** homepages (and optionally IIOHR) for a consistent, premium diagram.

---

## 1. Purpose

- **Core brand visual** across all platforms
- **Represents the connected ecosystem**: central node (Follicle Intelligence™) and connected nodes (Hair Longevity Institute™, HairAudit™, plus dimmed “Coming soon” placeholders for future expansion)
- **Lightweight**: CSS + SVG only (no Framer Motion or 3D libs)
- **Interactive**: optional mouse parallax and hover tooltips (name + one-line function)

---

## 2. Design

- **Central node:** Follicle Intelligence™ (AI Analysis Engine)
- **Connected nodes:** Hair Longevity Institute™ (biology), HairAudit™ (surgery), plus future expansion nodes (dimmed)
- **Visual style:** Clean, premium, slightly futuristic
- **Themes:** Light (default) and dark

---

## 3. Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"hli" \| "hairaudit" \| "fi"` | `"hli"` | Which platform is rendering; used to default `highlightNode` when not set. |
| `highlightNode` | `string` | from `variant` | Node id to emphasise: `"fi"`, `"hli"`, `"hairaudit"`, `"future1"`. |
| `interactive` | `boolean` | `true` | Enable mouse parallax and hover tooltips. |
| `theme` | `"light" \| "dark"` | `"light"` | Light or dark background. |
| `className` | `string` | `""` | Optional wrapper class. |
| `title` | `string` | (default label) | Accessibility: `aria-label` for the diagram. |

---

## 4. Usage

### HLI homepage

```tsx
import { GlobalHairIntelligenceNetwork } from "@/components/GlobalHairIntelligenceNetwork";

<GlobalHairIntelligenceNetwork
  variant="hli"
  highlightNode="hli"
  interactive
  theme="light"
  title="Global Hair Intelligence Network: Hair Longevity (biology), HairAudit (surgery), Follicle Intelligence (AI engine)"
/>
```

### HairAudit homepage

```tsx
<GlobalHairIntelligenceNetwork
  variant="hairaudit"
  highlightNode="hairaudit"
  interactive
  theme="light"
  title="Global Hair Intelligence Network: HairAudit (surgery), Hair Longevity (biology), Follicle Intelligence (AI engine)"
/>
```

### Follicle Intelligence homepage

```tsx
<GlobalHairIntelligenceNetwork
  variant="fi"
  highlightNode="fi"
  interactive
  theme="light"
  title="Global Hair Intelligence Network: Follicle Intelligence at the center"
/>
```

### Static / non-interactive (e.g. print or low-motion)

```tsx
<GlobalHairIntelligenceNetwork variant="hli" interactive={false} theme="dark" />
```

---

## 5. Behaviour

- **Mouse parallax:** When `interactive` is true and the user has not set `prefers-reduced-motion: reduce`, moving the mouse over the diagram applies a subtle 3D tilt (perspective + rotateX/rotateY) for a “slightly futuristic” feel.
- **Hover tooltips:** Hovering a node shows a tooltip with the node **name** and **one-line function**.
- **Highlight:** The `highlightNode` node is drawn slightly larger (scale 1.06) to show “you are here” on each platform.

---

## 6. Adding to another site (HairAudit, Follicle Intelligence)

1. Copy `components/GlobalHairIntelligenceNetwork.tsx` from the HLI repo into the target site.
2. No extra dependencies: React 18+ only (no Framer Motion).
3. Use one of the usage snippets above and pass the correct `variant` and `highlightNode` for that site.

---

## 7. Related

- **EcosystemDiagramAnimated** — Alternative diagram with orbiting animation and Framer Motion; see `docs/ECOSYSTEM_DIAGRAM_IMPLEMENTATION.md`.
- **Design philosophy** — `.cursor/rules/design-philosophy.mdc` (Global Hair Intelligence Network as central visual anchor).
