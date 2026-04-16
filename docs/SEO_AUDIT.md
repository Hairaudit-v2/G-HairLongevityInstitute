# Full SEO Audit — Hair Longevity Institute

**Audit date:** March 2025  
**Scope:** Public-facing site (Next.js 14 App Router), metadata, technical SEO, content structure, and discoverability.

---

## Executive summary

The site has a solid base: consistent page-level titles and descriptions on most public pages, clear H1s, and semantic structure. **Critical gaps:** no sitemap or robots.txt, no Open Graph/Twitter cards, no structured data (JSON-LD), and some pages (homepage, `/start`, `/longevity`, `/longevity/start`) rely only on root layout metadata or have none. Image `alt` attributes are missing or empty in several components. Addressing these will improve indexing, sharing, and perceived quality.

---

## 1. Site structure and crawlability

### 1.1 Sitemap — **Missing (high priority)**

- **Finding:** No `sitemap.xml` or `app/sitemap.ts` exists. Search engines have no explicit list of URLs to crawl.
- **Impact:** Slower or incomplete discovery of pages, especially secondary pages (How it works, Science, For professionals, Book, Membership).
- **Recommendation:** Add `app/sitemap.ts` and return a `MetadataRoute.Sitemap` array. Include public indexable URLs:
  - `/`, `/about`, `/how-it-works`, `/science`, `/for-professionals`, `/book`, `/membership`, `/start` (or `/longevity/start` when enabled), `/longevity` (when enabled), `/privacy`, `/terms`, `/disclaimer`, `/login/trichologist`. Exclude portal, admin, doctor, dynamic intake/audit routes, and the legacy `/login/patient` redirect from the sitemap.

### 1.2 Robots.txt — **Missing (high priority)**

- **Finding:** No `robots.txt` or `app/robots.ts`. Crawlers use default behavior and are not pointed to a sitemap.
- **Recommendation:** Add `app/robots.ts` returning `MetadataRoute.Robots` with:
  - `allow: '/'` for general crawling.
  - `disallow` for `/portal`, `/admin`, `/doctor`, `/longevity/dashboard`, `/longevity/analytics`, `/longevity/intake`, `/audits`, `/login`, and the legacy `/login/patient` redirect. If any login page should stay indexable, keep that decision explicit per route rather than treating `/login/patient` as a public destination.
  - `sitemap: 'https://<your-domain>/sitemap.xml'`.

### 1.3 Canonical URLs

- **Finding:** No explicit `metadataBase` or `alternates.canonical` in layout or pages. Next.js can infer URL from request; for multi-domain or duplicate-content cases, canonicals are important.
- **Recommendation:** In `app/layout.tsx`, set `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hairlongevityinstitute.com')` (or your production URL). Add page-level `alternates: { canonical: '/about' }` etc. only if you have duplicate content or multiple domains.

---

## 2. Meta tags and document head

### 2.1 Root layout (`app/layout.tsx`)

- **Present:** `title`, `description`, `icons` (icon + apple).
- **Missing:** `metadataBase`, `openGraph`, `twitter`, `robots`, `viewport` (Next.js has defaults; optional to set explicitly).

### 2.2 Open Graph and Twitter Cards — **Missing (high priority)**

- **Finding:** No `openGraph` or `twitter` in any layout or page. Shared links will not show rich previews (image, title, description).
- **Impact:** Weaker click-through from social and messaging; less control over how the brand appears.
- **Recommendation:**
  - In root layout (or a shared metadata helper), add default Open Graph and Twitter fields: `title`, `description`, `url` (use `metadataBase` + path), `siteName`, `type: 'website'`.
  - Add a default OG image (e.g. `/brand/og-default.png`, 1200×630) and reference it in `openGraph.images` and `twitter.images`. Ensure all pages inherit or override as needed.

### 2.3 Page-level metadata

| Page / Route              | Title / description | Notes |
|---------------------------|---------------------|--------|
| `/` (home)                | Uses layout only    | No page-level `metadata` export; consider adding a dedicated homepage description. |
| `/about`                  | ✅                  | Good. |
| `/how-it-works`           | ✅                  | Good. |
| `/science`                | ✅                  | Good. |
| `/for-professionals`      | ✅                  | Good. |
| `/book`                   | ✅                  | Good. |
| `/membership`             | ✅                  | Good. |
| `/privacy`, `/terms`, `/disclaimer` | ✅ | Good. |
| `/login/patient` | Legacy redirect only | Do not treat as a public landing page or index target; canonical returning-patient entry is `/portal`. |
| `/login/trichologist` | ✅ | Good. |
| `/start`                  | Inherits layout only| Client component; cannot export `metadata`. Use layout for `/start` or a parent layout to set title/description. |
| `/longevity`              | ❌ None             | No `metadata` export. |
| `/longevity/start`        | ❌ None             | No `metadata` export. |

- **Recommendations:**
  - Add `app/page.tsx` metadata with a homepage-specific title and description (can still use layout as fallback via template if desired).
  - Add `metadata` to `app/longevity/page.tsx` and `app/longevity/start/page.tsx` (e.g. “Hair Longevity | Biology-First Hair Analysis” and “Start Your Hair Analysis | Hair Longevity Institute”).
  - For `/start`: add a layout under `app/start/layout.tsx` that exports metadata (e.g. “Start My Hair Analysis | Hair Longevity Institute™”) so the client page gets a proper title/description.

---

## 3. Structured data (JSON-LD)

- **Finding:** No `application/ld+json` or schema.org markup (Organization, MedicalOrganization, WebSite, FAQPage, etc.).
- **Impact:** Missing opportunities for rich results (e.g. site links, organization panel, FAQ snippets) and clearer semantic signals for search engines.
- **Recommendation:** Add JSON-LD in layout or key pages:
  - **Organization** (or **MedicalOrganization**): name, url, logo, sameAs (HairAudit, Follicle Intelligence, etc.).
  - **WebSite**: name, url, description, potentialAction (e.g. “Start My Hair Analysis” → `/longevity/start` or `/start`).
  - **FAQPage** on the homepage if the FAQ section is marked up as Q&A.
  - Use Next.js `<script type="application/ld+json">` in layout or page components with sanitized JSON.

---

## 4. Headings and semantic structure

- **H1s:** All audited public pages have a single clear H1; conditional branches (e.g. longevity dashboard) only render one H1 per view. ✅
- **Hierarchy:** Sections use H2/H3 appropriately (e.g. homepage: H1 → H2 “How it works”, H3 step titles). ✅
- **Landmarks:** Use of `<main>`, `<section>`, `<nav>`, `<footer>`, `aria-label` / `aria-labelledby` (e.g. “How it works”) is good. ✅
- **Recommendation:** Keep one H1 per page and logical H2→H3 order; no changes required for current content.

---

## 5. Images and performance

### 5.1 Alt text

- **PublicHeader (logo):** `alt=""` with parent `<Link aria-label="Hair Longevity Institute — Home">`. Acceptable for decorative logo; optional to use `alt="Hair Longevity Institute"` for redundancy.
- **PublicFooter (mark):** `alt=""` — recommend `alt="Hair Longevity Institute"` or “Hair Longevity Institute logo” so the brand mark is described when the footer is read in isolation.
- **ResultsPreviewCard (mark):** `alt=""` — recommend `alt="Hair Longevity Institute"` or “Example report from Hair Longevity Institute.”
- **HairIntelligenceEcosystemIntro:** Uses Next/Image with a descriptive alt. ✅

### 5.2 Image optimization

- **Finding:** `next.config.js` has `images: { unoptimized: true }`. Next.js Image component will not optimize (no automatic WebP, sizing, lazy-loading benefits).
- **Impact:** Larger payloads and slower LCP on image-heavy pages; minor SEO impact (Core Web Vitals).
- **Recommendation:** Re-enable image optimization when possible (remove or set `unoptimized: false` and resolve any host/package issues). Use `next/image` for all content images with appropriate `width`/`height` or `fill`.

---

## 6. Internal linking

- **Header:** About, and in-page anchors (#how-it-works, #what-we-analyse, #results, #faq). Good for homepage flow; other key pages are not in the main nav.
- **Footer:** Legal (Privacy, Terms, Disclaimer) and “Hair Intelligence Network” (HLI, HairAudit, Follicle Intelligence). No footer links to How it works, Science, For professionals, Book, or Membership.
- **Impact:** Important content pages are discoverable via header CTA and in-page links but not from footer; adding them could improve crawl distribution and UX.
- **Recommendation:** Consider a “Main” or “Explore” column in the footer with links to About, How it works, Science, For professionals, Book, Membership (and Start My Hair Analysis), so crawlers and users can reach these from every page.

---

## 7. Other technical and content notes

- **Language:** Root `<html lang="en">` is set. ✅
- **Title format:** Consistent “Page Name | Hair Longevity Institute™” on pages that export metadata. ✅
- **Primary CTA:** “Start My Hair Analysis” is consistent with design rules. ✅
- **Patient entry model:** Preferred public entry points are `Start My Hair Analysis` for new patients and `Patient Portal` for returning patients. `/login/patient` should stay a legacy redirect only. ✅
- **Test / admin routes:** `/test` exists; ensure it’s excluded from sitemap and consider `noindex` or disallow in robots so it doesn’t appear in search.

---

## 8. Priority action list

| Priority | Action |
|----------|--------|
| **P0**   | Add `app/sitemap.ts` with all public indexable URLs. |
| **P0**   | Add `app/robots.ts` with allow/disallow rules and sitemap URL. |
| **P0**   | Add default Open Graph and Twitter metadata (and OG image) in root layout or shared metadata. |
| **P1**   | Add page-level metadata for homepage (`app/page.tsx`), `/start` (via layout), `/longevity`, `/longevity/start`. |
| **P1**   | Set `metadataBase` in root layout for correct absolute URLs and OG. |
| **P1**   | Add descriptive `alt` for footer logo and ResultsPreviewCard logo. |
| **P2**   | Add JSON-LD (Organization, WebSite, optionally FAQPage). |
| **P2**   | Consider footer links to main content pages (How it works, Science, For professionals, Book, Membership). |
| **P3**   | Re-enable Next.js image optimization when feasible; use `next/image` with dimensions. |
| **P3**   | Add explicit viewport in metadata if you need to lock scale or width. |

---

## 9. Quick reference — files to add or change

- **Add:** `app/sitemap.ts` — export default function returning sitemap entries.
- **Add:** `app/robots.ts` — export default function returning robots rules + sitemap.
- **Edit:** `app/layout.tsx` — add `metadataBase`, `openGraph`, `twitter`, default OG image.
- **Edit:** `app/page.tsx` — add `export const metadata` for homepage.
- **Add or edit:** `app/start/layout.tsx` — add metadata for Start flow.
- **Edit:** `app/longevity/page.tsx`, `app/longevity/start/page.tsx` — add `metadata`.
- **Edit:** `components/public/PublicFooter.tsx`, `components/public/ResultsPreviewCard.tsx` — add descriptive `alt` for logo/mark images.
- **Optional:** Shared JSON-LD component or inline script in layout for Organization/WebSite.

---

*End of SEO audit.*
