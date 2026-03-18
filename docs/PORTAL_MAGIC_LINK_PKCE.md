# HLI Portal — Magic Link PKCE Setup

This doc describes the PKCE-aligned magic-link flow and the exact Supabase email template to use.

---

## 1. Flow summary

- **Login:** User requests magic link at `/portal/login` → `signInWithOtp({ email, options: { emailRedirectTo: getRedirectUrl(redirect) } })`.
- **Email:** Supabase sends an email. The link must point to our callback **with** `token_hash` and `type` (PKCE); the default ConfirmationURL goes to Supabase `/auth/v1/verify` and does not land on our callback with those params, so we use a **custom** Magic Link template.
- **Callback:** User hits `/portal/auth/callback?token_hash=...&type=email` (and optional `&redirect=...`). Callback reads from `window.location.search` (and hash for legacy implicit), calls `verifyOtp({ token_hash, type })`, then redirects to dashboard or `?redirect=` target.

---

## 2. Code changes (done)

| File | Change |
|------|--------|
| `app/portal/auth/callback/page.tsx` | Prefer PKCE: read `token_hash` and `type` from URL (query) first, call `verifyOtp()`. Fallback: read `access_token` and `refresh_token` from hash and `setSession()`. Read from `window.location.search` / `.hash` so params are not lost on first paint. Map `type` to `"email"` \| `"magiclink"` (and map `recovery` / `signup` to `email`). |

No changes to login page or `getRedirectUrl()`; we still pass `emailRedirectTo` so Supabase has the correct redirect base and allow-list.

---

## 3. Supabase Magic Link email template

Configure the **Magic Link** template in Supabase Dashboard → **Authentication** → **Email Templates** → **Magic Link**.

### Option A — No redirect in link (simplest)

Use this when you do not need to preserve a post-login redirect in the link. The callback URL is your Site URL + path with `token_hash` and `type=email`:

**Subject (optional):** e.g. `Sign in to Hair Longevity Institute`

**Body (HTML):** paste the following. Replace `{{ .SiteURL }}` with your actual site URL in the template if needed; Supabase injects `{{ .SiteURL }}` automatically.

```html
<h2>Sign in to your account</h2>
<p>Click the link below to sign in. This link can only be used once and expires in 10 minutes.</p>
<p><a href="{{ .SiteURL }}/portal/auth/callback?token_hash={{ .TokenHash }}&type=email">Sign in</a></p>
<p>If you didn't request this email, you can ignore it.</p>
```

So the **exact URL** used in the link is:

```
{{ .SiteURL }}/portal/auth/callback?token_hash={{ .TokenHash }}&type=email
```

### Option B — Preserve redirect (when user had a ?redirect= target)

If the app sends `emailRedirectTo` with a query param (e.g. `https://yoursite.com/portal/auth/callback?redirect=%2Flongevity%2Fstart`), then `{{ .RedirectTo }}` already contains `?`. You must append `&token_hash=...&type=email` (not `?`), so the link should be:

```html
<h2>Sign in to your account</h2>
<p>Click the link below to sign in.</p>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Sign in</a></p>
```

Use **Option B** only if you always pass a callback URL that already includes a query string (e.g. `?redirect=...`). If sometimes you pass a bare callback URL with no query, Option B would produce an invalid URL (e.g. `.../callback&token_hash=...`). In that case use **Option A** and omit redirect from the link; users will land on the dashboard and can navigate from there.

---

## 4. Supabase URL configuration

- **Redirect URLs** must include your callback (and any variant with query if you use Option B), e.g.:
  - `https://your-domain.com/portal/auth/callback`
  - `http://localhost:3000/portal/auth/callback`
- **Site URL** should be your app origin (e.g. `https://your-domain.com` or `http://localhost:3000`).

---

## 5. Backward compatibility

- **PKCE (primary):** Callback first looks for `token_hash` (+ `type`) in the URL and uses `verifyOtp()`. This matches Supabase’s documented PKCE magic-link flow.
- **Implicit (fallback):** If no `token_hash`, callback looks for `access_token` and `refresh_token` in the URL hash and uses `setSession()`. So old links or OAuth flows that use the hash still work.
