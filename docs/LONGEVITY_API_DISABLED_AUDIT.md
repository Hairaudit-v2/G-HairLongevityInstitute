# Audit: “Longevity API is disabled” in Trichologist Review Workspace

## 1. Exact code path that produces the message

1. **Trichologist workspace** loads and calls the review queue API:
   - **File:** `components/longevity/TrichologistReviewWorkspace.tsx`
   - **Calls:** `GET /api/longevity/review/queue` (and `/api/longevity/review/metrics`, `/api/longevity/review/intakes/[id]`, etc.)
   - **Lines:** e.g. 575 (`fetch(\`/api/longevity/review/queue?${params}\`)`), 544 (metrics), 616 (intake detail).

2. **API route** runs the feature-flag check and returns the message:
   - **File:** `app/api/longevity/review/queue/route.ts` (and every other route under `app/api/longevity/*`)
   - **Lines:** 64–66 in queue route:
     ```ts
     if (!isLongevityApiEnabled()) {
       return NextResponse.json({ ok: false, error: "Longevity API is disabled." }, { status: 404 });
     }
     ```

3. **Feature flag** is evaluated here:
   - **File:** `lib/features.ts`
   - **Function:** `isLongevityApiEnabled()` → calls `envFlag("HLI_ENABLE_LONGEVITY_API")`
   - **Lines:** 7–9 (`envFlag`), 18–19 (`isLongevityApiEnabled`).

4. **Frontend** shows the API response error:
   - **File:** `components/longevity/TrichologistReviewWorkspace.tsx`
   - When `!data.ok`, it does `setError(data.error ?? "Failed to load queue")`, so the user sees `data.error` = **"Longevity API is disabled."**

---

## 2. Feature flag / env that controls the state

- **Function:** `isLongevityApiEnabled()` in `lib/features.ts`.
- **Env variable:** `HLI_ENABLE_LONGEVITY_API` (exact name; case-sensitive).
- **Behavior:** If `envFlag("HLI_ENABLE_LONGEVITY_API")` returns `false`, every `/api/longevity/*` route returns 404 with `{ ok: false, error: "Longevity API is disabled." }`.

No other env or feature-flag layer controls this message; the workspace is not reading a different variable—it just displays whatever `error` the API returns.

---

## 3. Flag parser: what it accepts

**File:** `lib/features.ts`, function `envFlag(key: string): boolean`

**Current logic:**
```ts
const v = process.env[key];
return v === "1" || v === "true" || v === "yes";
```

- **Accepted:** exactly `"1"`, `"true"`, or `"yes"` (case-sensitive).
- **Not accepted:**
  - `"True"`, `"TRUE"`, `"YES"` (case-sensitive comparison).
  - `" 1"`, `"1 "`, `" 1 "` (no trimming).
  - Empty string, `"0"`, `"false"` → treated as disabled.

So the parser does **not** accept both `"1"` and `"true"` in a case-insensitive way, and it does **not** trim whitespace. Platform or copy-paste can easily provide `" true"` or `"True"`, which would keep the API “disabled”.

---

## 4. Is the workspace reading a different env variable?

**No.** The trichologist workspace does not read any env variable. It only:

- Calls `/api/longevity/review/queue`, `/api/longevity/review/metrics`, `/api/longevity/review/intakes/[id]`, etc.
- Shows `data.error` when the API returns `ok: false`.

The only place that reads `HLI_ENABLE_LONGEVITY_API` is **server-side**: `lib/features.ts` → `envFlag("HLI_ENABLE_LONGEVITY_API")`. So the workspace is not using a different env variable; it only reflects the API response, which is gated by that single flag.

**Note:** You listed `Longevity_module=1`. That name is **not** used anywhere in this codebase. The code only looks for `HLI_ENABLE_LONGEVITY` and `HLI_ENABLE_LONGEVITY_API`. So `Longevity_module=1` has no effect on the “Longevity API is disabled” message.

---

## 5. Stale / cached / static behavior?

- **API routes** use `process.env` at **request time** (no in-app caching of the flag). Each request to `/api/longevity/review/queue` runs `isLongevityApiEnabled()` again.
- **Next.js** does not inline server `process.env` for API routes in a way that would freeze the value at build time for this check; the value is read at runtime on the server.
- So the message is **not** due to stale client cache or static build of the flag in our code. If the env is correctly set and available to the Node process that serves the API, the next request should see it.

The remaining possibility is **deployment/platform**: the environment where the app runs (e.g. Vercel) may not have `HLI_ENABLE_LONGEVITY_API` set, or may set it with a typo, wrong case, or extra spaces. In that case the Node process never sees a valid value, so the flag stays false.

---

## 6. Output summary

### Exact cause

The message appears because **at runtime, in the environment that serves the API, `isLongevityApiEnabled()` is false.** That happens when:

- `process.env.HLI_ENABLE_LONGEVITY_API` is **undefined** (e.g. not set in Vercel Project → Settings → Environment Variables for the deployed environment), or
- The value is **not** exactly one of `"1"`, `"true"`, or `"yes"` (e.g. `"True"`, `" true "`, or `"1 "`), because the parser is strict and does not trim or normalize case.

So the most likely **exact cause** is one or both of:

1. **Env not available in deployment** – e.g. `HLI_ENABLE_LONGEVITY_API` not configured in Vercel (or only in a different environment than the one you’re hitting).
2. **Value format** – value has leading/trailing spaces or different casing (e.g. `True`), so the current parser rejects it.

### File paths involved

| Role | Path |
|------|------|
| Flag parsing | `lib/features.ts` |
| API route (example) | `app/api/longevity/review/queue/route.ts` |
| All longevity API routes | `app/api/longevity/**/*.ts` (each checks `isLongevityApiEnabled()`) |
| Workspace UI (shows message) | `components/longevity/TrichologistReviewWorkspace.tsx` |
| Health check (for debugging) | `app/api/longevity/health/route.ts` |

### Exact fix required

**1. Deployment (required)**  
- In **Vercel** (or your host): Project → Settings → Environment Variables.  
- Ensure **`HLI_ENABLE_LONGEVITY_API`** exists for the environment you use (Production/Preview).  
- Set value to **`1`** or **`true`** with **no leading/trailing spaces**.  
- Redeploy after changing env so the new value is applied.

**2. Code (recommended)**  
- In **`lib/features.ts`**, make `envFlag` tolerant of:
  - leading/trailing whitespace (e.g. `.trim()`), and  
  - case-insensitive `"true"` and `"yes"` (e.g. compare lowercased).  
- Then values like `" True "` or `"TRUE"` will still enable the API.

**3. Verify**  
- Call `GET /api/longevity/health`. If the API is enabled it returns `{ ok: true, module: "longevity" }`. If disabled it returns 404 with `{ ok: false, error: "Longevity API is disabled." }`.  
- Use the same host/URL as the trichologist workspace (e.g. `https://g-hair-longevity-institute-ekwfhm55x.vercel.app/api/longevity/health`).
