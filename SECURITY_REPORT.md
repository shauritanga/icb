# Security Audit Report — DIT ICB Website

**Date:** 2026-06-02  
**Project:** DIT Institute of Capacity Building — Laravel 13 / React 19 / Inertia.js  
**Auditor:** Claude Code (automated static analysis)  
**Scope:** Full codebase — authentication, authorization, input handling, output encoding, file uploads, secrets management, rate limiting, HTTP headers, dependencies

---

## Executive Summary

The application implements **solid foundational security** with proper output encoding, ORM-backed data access, comprehensive HTTP security headers, and a well-designed admin middleware stack. However, **two critical pre-production blockers** exist (credentials in version control and debug mode enabled), plus several high/medium issues that must be resolved before going live.

---

## Findings at a Glance

| Area | Rating | Blocker? |
|---|---|---|
| SQL Injection Prevention | Excellent | No |
| XSS Prevention | Strong | No |
| CSRF Protection | Strong | No |
| Security Headers | Excellent | No |
| Authentication Design | Strong | No |
| Authorization (Admin) | Strong | No |
| Audit Logging | Excellent | No |
| Input Validation | Strong | No |
| Session Configuration | Strong | No |
| HTTPS Enforcement | Adequate | No |
| File Upload Security | Strong | No |
| Rate Limiting | Strong | No |
| Secrets Management | **Critical** | **Yes** |
| Debug Mode | Resolved | No |
| Dependencies | Good | No |

---

## 1. SQL Injection Prevention — Excellent

**What is in place:**  
All database access uses the Eloquent ORM with parameterized bindings. No raw SQL strings with user input were found anywhere in the codebase. `LIKE` searches use Eloquent's `where()` builder which automatically binds the wildcard value. Locale input from the `?lang=` query parameter is whitelisted against `['en', 'sw']` before use.

**Risk prevented:** SQL injection — an attacker crafting malicious input to read, modify, or delete arbitrary database rows.

**No further action needed.**

---

## 2. XSS (Cross-Site Scripting) Prevention — Strong

**What is in place:**

- **`app/Support/HtmlSanitizer.php`** — a custom whitelist-based HTML sanitizer runs on every rich-text field before it is persisted. Allowed tags are `a`, `blockquote`, `br`, `em`, `h2`–`h4`, `li`, `ol`, `p`, `strong`, `ul`. All other tags and HTML comments are stripped. Anchor `href` values are validated to `http`, `https`, `mailto`, and `tel` protocols only. All `target="_blank"` links are automatically given `rel="noopener noreferrer"` to prevent tab-napping.
- **Model setters** on `Page`, `Service`, `Project`, and `NewsPost` all call the sanitizer before persisting. Content is never stored un-sanitized.
- **Blade templates** use `{{ }}` (auto-escaped) throughout. No `{!! !!}` (raw output) usage was found in the public templates.
- **React JSX** escapes all interpolated values by default. The four public pages that render rich-text (`Page.jsx`, `Post.jsx`, `Project.jsx`, `Services.jsx`) use `dangerouslySetInnerHTML`, which is appropriate here **because the content has been sanitized at the write path** — an attacker cannot store malicious HTML in the first place.

**Risk prevented:** Stored XSS — an attacker injecting JavaScript via the admin CMS that executes in a visitor's browser.

**Remaining concerns:**

| # | Issue | Risk | Action |
|---|---|---|---|
| 2a | ~~SVG files are in the upload MIME whitelist~~ | ~~SVG can contain inline `<script>` or `onload` attributes, bypassing the HTML sanitizer~~ | **Fixed** — `svg` removed from MIME whitelist in `AdminApiController` |
| 2b | Admin rich-text editor writes raw `innerHTML` into `contentEditable` | Limited to authenticated admins; content is re-sanitized by the backend on save | Low priority, but consider using a library-managed editor to eliminate the class of risk entirely |

---

## 3. CSRF Protection — Strong

**What is in place:**  
Laravel's `VerifyCsrfToken` middleware is active for all web routes. The admin SPA embeds the CSRF token in a `<meta>` tag (`{{ csrf_token() }}`). Every `fetch` call in `admin.tsx` reads that token and sends it as the `X-CSRF-TOKEN` header. All state-changing requests (POST, PUT, DELETE) are therefore protected.

**Risk prevented:** Cross-Site Request Forgery — a malicious website tricking a logged-in admin into unknowingly submitting a destructive request.

**No further action needed.**

---

## 4. Security Headers — Excellent

**What is in place:**  
`app/Http/Middleware/SecurityHeaders.php` is registered globally and sets the following headers on every response:

| Header | Value | Risk Prevented |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.bunny.net; img-src 'self' data: blob:; font-src fonts.bunny.net; connect-src 'self'` | Limits where scripts, styles, and resources can load from |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing attacks |
| `X-Frame-Options` | `SAMEORIGIN` | Blocks clickjacking via iframe embeds from other origins |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Prevents leaking full URLs to third-party sites |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disables browser features not used by the application |
| `Cross-Origin-Opener-Policy` | `same-origin` | Prevents cross-origin window access |
| `Cross-Origin-Resource-Policy` | `same-origin` | Restricts resource loading to same origin |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` (production only) | Forces HTTPS for 1 year once set |

**Risk prevented:** Clickjacking, MIME confusion attacks, cross-origin data leaks, protocol downgrade attacks.

**Remaining concern:**

| # | Issue | Action |
|---|---|---|
| 4a | CSP includes `'unsafe-inline'` for scripts and styles | Acceptable with Inertia/Vite but consider moving to nonce-based CSP for production to prevent any inline script execution in the event of a DOM injection |

---

## 5. Authentication — Strong

**What is in place:**

- Session-based authentication via Laravel's built-in `Auth` guard with a database session driver.
- `AdminApiController@login` verifies the password with `Hash::check()` (bcrypt) and additionally checks the `is_admin` flag before issuing a session.
- On successful login the session is regenerated (`$request->session()->regenerate()`) to prevent session fixation attacks.
- On logout, the session is fully invalidated and the CSRF token is regenerated.
- A deliberate `usleep(250000)` (250 ms) delay is applied on failed login responses to mitigate timing-based username enumeration.
- The login endpoint is rate-limited: `throttle:6,15` (6 attempts per 15 minutes per IP).

**Risk prevented:** Session fixation, brute-force credential stuffing, timing-based enumeration.

**Remaining concerns:**

| # | Issue | Action |
|---|---|---|
| 5a | ~~Login throttle of 5/minute is easy to saturate~~ | **Fixed** — changed to `throttle:6,15` in `routes/web.php` |
| 5b | No password reset flow | Implement Laravel's built-in `Password::sendResetLink()` before going live — without it a locked-out admin has no self-service recovery path |
| 5c | Email verification is commented out | Low priority for a CMS with manually created admin accounts, but consider enabling for self-registration if that is ever added |

---

## 6. Authorization (Admin API) — Strong

**What is in place:**  
`app/Http/Middleware/EnsureAdmin.php` is applied to all `/api/admin/*` endpoints (except login). It checks `$request->user()->is_admin` and returns HTTP 403 if the flag is not set. All protected routes are wrapped in a double middleware group: `['auth', 'admin']`.

The `serializeUser()` helper in `AdminApiController` explicitly lists the fields returned in API responses (`id`, `name`, `email`, `is_admin`). The `User` model marks `password` and `remember_token` as hidden, ensuring they are never accidentally serialized.

**Risk prevented:** Horizontal and vertical privilege escalation — authenticated non-admin users cannot access admin data or actions.

**No further action needed.**

---

## 7. Input Validation — Strong

**What is in place:**  
All admin API inputs are validated using Laravel's `Validator`. Field rules are generated dynamically from a field-type configuration map and include:

- `email` — format + database uniqueness
- `password` — minimum 8 characters
- `slug` — regex `/^[a-z0-9\-]+$/` (no special characters)
- `file` — MIME type whitelist + 10 MB size cap
- Rich-text `body` — max 65 535 characters

**Risk prevented:** Mass assignment, oversized payloads, format injection.

**Remaining concern:**

| # | Issue | Action |
|---|---|---|
| 7a | File MIME type checked via HTTP header, not file content | Supplement with `finfo_file()` or `getimagesize()` (for images) to verify actual file bytes, not the client-supplied header |

---

## 8. File Upload Security — Strong

**What is in place:**

- Uploaded files are stored in `storage/app/public/uploads` (outside the web root, served through Laravel's `storage:link` symlink — not directly executable).
- Laravel's `store()` method generates a random filename, preventing directory traversal or overwrite attacks via crafted filenames.
- Each upload is written to the security log channel with the file path, uploading user ID, and IP address.

**Risk prevented:** Remote code execution via uploaded PHP files, directory traversal, upload-path disclosure.

**Remaining concerns:**

| # | Issue | Action |
|---|---|---|
| 8a | ~~SVG in MIME whitelist~~ | **Fixed** — `svg` removed from `AdminApiController` MIME whitelist |
| 8b | ZIP files accepted with no content inspection | Not an execution risk given server-side storage, but consider whether ZIP upload is actually required by the use case; if not, remove it |
| 8c | No image dimension/content validation | Use `getimagesize()` to confirm image files are valid images before accepting |

---

## 9. Secrets Management — **CRITICAL (Pre-Production Blocker)**

**What is in place:**  
`.gitignore` correctly lists `.env`, `.env.backup`, and `.env.production` as excluded files.

**Critical issue:**  
The `.env` file was committed to the git repository at some point in the project history. The following secrets were exposed in version control:

- `DB_PASSWORD=ICBQwerty@123` — **still the active production password**
- `DB_USERNAME`, `DB_DATABASE`
- `APP_KEY`

The `.env` now lives only on the production server (correct), but the **password has not been rotated** — meaning anyone who ever cloned or forked the repo before the file was removed from history still holds a valid credential.

**Risk:** Unauthorized direct database access using the leaked password.

**Required actions — still outstanding:**

1. **Rotate `DB_PASSWORD`** on the PostgreSQL server:
   ```sql
   ALTER USER icb_user WITH PASSWORD 'new-strong-password';
   ```
   Then update `DB_PASSWORD` in `/var/www/icb/.env` on the server.
2. **Remove `.env` from git history** (prevents future clones from containing the old password):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
   Or use BFG Repo Cleaner for a simpler workflow.
3. Confirm `.env` is no longer tracked: `git ls-files .env` should return nothing.

---

## 10. Debug Mode — Resolved

**Current state on production server:**
```
APP_ENV=production
APP_DEBUG=false
```

Stack traces are suppressed in production. Unhandled exceptions return a generic error page with no internal detail exposed to visitors.

**No further action needed.**

---

## 11. Session Configuration — Strong

**What is in place:**

| Setting | Value | Meaning |
|---|---|---|
| `SESSION_DRIVER` | `database` | Sessions stored server-side, not in a client-readable cookie |
| `SESSION_LIFETIME` | `120` minutes | Reasonable idle timeout |
| `SESSION_SECURE_COOKIE` | `false` (temporary — no TLS yet) | Must be set to `true` once a domain + SSL certificate is attached |
| `SESSION_HTTP_ONLY` | `true` | Cookie inaccessible to JavaScript (blocks XSS-based session theft) |
| `SESSION_SAME_SITE` | `lax` | Protects against CSRF from cross-site navigations |

**Remaining concern:**

| # | Issue | Action |
|---|---|---|
| 11a | `SESSION_ENCRYPT=false` | Set to `true` to encrypt session data at rest in the database; mitigates risk if the database is ever directly accessed |

---

## 12. Rate Limiting — Strong

**What is in place:**  
All admin endpoints are now throttled in `routes/web.php` across three tiers:

| Tier | Endpoints | Limit |
|---|---|---|
| Login | `POST /login` | `throttle:6,15` — 6 attempts per 15 min |
| Read / session | `GET` endpoints, logout, me, dashboard | `throttle:60,1` — 60 req/min |
| Writes / deletes | POST, PUT, DELETE on resources and users | `throttle:30,1` — 30 req/min |
| File upload | `POST /upload` | `throttle:10,1` — 10 uploads/min |

**Risk prevented:** Brute-force credential stuffing, denial-of-service via API flooding, resource exhaustion via repeated file uploads.

**No further action needed.**

---

## 13. Audit Logging — Excellent

**What is in place:**  
A dedicated `security` log channel captures:

- Admin login attempts (success and failure, with IP and user ID)
- Admin resource creation, update, and deletion (with resource type, record ID, and user)
- File uploads (path, user, IP)
- User account creation and deletion

**Risk prevented:** Non-repudiation — any suspicious admin action has a timestamped audit trail for incident investigation.

**No further action needed.**

---

## 14. Dependencies — Good

All production dependencies are current. `npm audit` and `composer audit` both reported **0 vulnerabilities** (verified 2026-06-02).

| Package | Version | Status |
|---|---|---|
| `laravel/framework` | 13.8 | Current, maintained |
| `filament/filament` | 5.6 | Current, maintained |
| `inertiajs/inertia-laravel` | 3.1 | Current, maintained |
| `react` | 19.2.6 | Current |
| `@inertiajs/react` | 3.2.0 | Current |
| `framer-motion` | 12.40.0 | Current |

**Recommended ongoing practice:** re-run both audits before each deployment.

---

## 15. HTTPS Enforcement — Adequate

**Current state:**  
The site is currently served over HTTP on a bare IP address (`http://102.208.185.202`) — no domain or TLS certificate yet. This is a temporary deployment stage.

The HSTS header and `SESSION_SECURE_COOKIE` are correctly deferred until TLS is available (both are conditional on `APP_ENV=production` + HTTPS in the code).

**Actions required once a domain is attached:**

| # | Action |
|---|---|
| 15a | Obtain a TLS certificate (Let's Encrypt / Certbot is free) and configure nginx/Apache to serve HTTPS |
| 15b | Set `SESSION_SECURE_COOKIE=true` in `/var/www/icb/.env` |
| 15c | Update `APP_URL` from the bare IP to `https://yourdomain.com` |
| 15d | Add an HTTP → HTTPS redirect in the web server config (port 80 → 443) |

---

## Pre-Launch Checklist

### Blockers — must fix before going live

- [ ] Remove `.env` from git history and rotate all credentials (`DB_PASSWORD`, `APP_KEY`)
- [x] Set `APP_DEBUG=false`, `APP_ENV=production` — **done on production server**

### High priority

- [ ] Set `SESSION_ENCRYPT=true`
- [x] Add rate limiting to all admin API endpoints (especially `/upload`) — **done**
- [x] Remove `svg` from the file upload MIME whitelist — **done**
- [ ] Configure HTTP → HTTPS redirect at the server or middleware level
- [ ] Implement password reset flow for admin users

### Medium priority

- [ ] Add content-based file validation (`finfo_file()` / `getimagesize()`) in addition to MIME type checking
- [x] Tighten login throttle from `5,1` to `6,15` — **done**
- [x] Run `npm audit` and `composer audit` — **0 vulnerabilities found (2026-06-02)**

### Low priority

- [ ] Evaluate replacing `'unsafe-inline'` in CSP with nonce-based approach
- [ ] Remove ZIP from upload MIME whitelist if not required by the content workflow
- [ ] Enable email verification if self-registration is ever added

---

*Report generated by automated static analysis. Manual penetration testing is recommended before public launch, particularly for the admin API endpoints and file upload flow.*
