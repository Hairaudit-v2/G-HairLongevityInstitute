# Ecosystem Diagram — Implementation Across All Sites

The **animated ecosystem diagram** (Follicle Intelligence™ at centre; IIOHR™, HairAudit™, Hair Longevity Institute™ around it) is the shared hero visual for the Hair Intelligence ecosystem. It should be implemented consistently on **Hair Longevity Institute (HLI)**, **HairAudit**, **Follicle Intelligence**, and **IIOHR**.

---

## 1. Source of truth

- **Canonical implementation:** Hair Longevity Institute repo  
  - Component: `components/EcosystemDiagramAnimated.tsx`  
  - No extra assets (SVG and styles are inline).
- **Design:** Clean, premium, medical-tech; light and dark theme support; respects `prefers-reduced-motion`.

---

## 2. Prerequisites (per site)

Each site that embeds the diagram must have:

- **React** 18+
- **framer-motion** (e.g. `^12.x` or compatible)

```bash
npm install framer-motion
# or
yarn add framer-motion
pnpm add framer-motion
```

---

## 3. How to add the diagram to another site

Sites are separate codebases (HLI, HairAudit, Follicle Intelligence, IIOHR). Use one of the following.

### Option A — Copy the component (recommended for now)

1. **Copy the file**
   - From HLI: copy `components/EcosystemDiagramAnimated.tsx` into the target site (e.g. `components/EcosystemDiagramAnimated.tsx` or `components/ecosystem/EcosystemDiagramAnimated.tsx`).
   - Adjust the import path if the target site uses path aliases (e.g. `@/components/...`).

2. **Install dependency**
   - Ensure `framer-motion` is in the project’s `package.json` (see Prerequisites).

3. **Use on a page**
   - Example: hero or “The Hair Intelligence Ecosystem” section.

```tsx
import { EcosystemDiagramAnimated } from "@/components/EcosystemDiagramAnimated";

// In your JSX (e.g. hero or ecosystem section):
<section className="…" aria-labelledby="ecosystem-diagram-heading">
  <h2 id="ecosystem-diagram-heading" className="sr-only">
    Surgical Intelligence Ecosystem
  </h2>
  <div className="mx-auto max-w-[min(1000px,100%)]">
    <EcosystemDiagramAnimated
      theme="dark"
      expandable
      title="Surgical Intelligence Ecosystem: Follicle Intelligence at the center, with IIOHR, HairAudit, and Hair Longevity Institute"
    />
  </div>
</section>
```

4. **Per-site props**
   - **theme:** Use `"dark"` for dark hero (HLI, HairAudit, Follicle Intelligence). Use `"light"` if the page has a light background. Use `"auto"` to follow system preference.
   - **static:** Set `static` for a non-animated version (e.g. mobile fallback or low-motion).
   - **expandable:** Optional; set to `true` to allow click-to-expand on outer nodes.

### Option B — Shared package (future)

If you introduce a shared UI package (e.g. `@hair-intelligence/ecosystem-ui` or a private npm package):

1. Publish a package that exports `EcosystemDiagramAnimated` (and optionally `HairEcosystemSection`, `SurgicalIntelligenceEcosystemBand`).
2. In each site:  
   `npm install @hair-intelligence/ecosystem-ui`  
   (or use a workspace/file reference if in a monorepo.)
3. Import and use as in the example above; keep the same props and placement guidance.

---

## 4. Placement and consistency

- **Where:** Hero or first scroll (e.g. just below hero copy), or in the “Hair Intelligence Ecosystem” section. Design philosophy: “3D Global Hair Intelligence Network as central visual anchor” (see `.cursor/rules/design-philosophy.mdc`).
- **Accessibility:** Pass a descriptive `title` prop for the diagram’s `aria-label`. Keep the section heading (visible or `sr-only`) for context.
- **Performance:** The component uses Framer Motion and respects `prefers-reduced-motion`; use `static` when you want a non-animated version everywhere (e.g. a “simple” mode).

---

## 5. Cursor / multi-repo workflow

- **When working in HLI:** The component lives at `components/EcosystemDiagramAnimated.tsx`; use it directly.
- **When working in HairAudit, Follicle Intelligence, or IIOHR:**  
  - Either open the HLI repo in the same Cursor workspace and copy `components/EcosystemDiagramAnimated.tsx` into the current project, or  
  - Follow this doc: copy the component file, add `framer-motion` if needed, then embed with the same props and placement as in HLI.
- The Cursor rule **“Shared ecosystem UI”** (`.cursor/rules/shared-ecosystem-ui.mdc`) reminds the AI to use this doc and the HLI implementation when adding or updating the diagram on any ecosystem site.

---

## 6. Related shared UI

For consistency across sites, also consider:

- **HairEcosystemSection** — Three cards (HLI, HairAudit, Follicle Intelligence) with `site` and `currentPlatform` (copy from HLI: `components/public/HairEcosystemSection.tsx`).
- **SurgicalIntelligenceEcosystemBand** — Footer band with links to all four platforms; pass `currentSite` and `currentSiteInternalHref` (copy from HLI: `components/public/SurgicalIntelligenceEcosystemBand.tsx`).

These follow the same “copy to each site” or “shared package” approach as the diagram.
