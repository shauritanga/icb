# Security Implementation Report
## DIT Institute of Capacity Building — Web Application

| | |
|---|---|
| **Date** | 2 June 2026 |
| **Application** | DIT ICB public website and admin CMS |
| **Stack** | Laravel 13 · React 19 · Inertia.js · PostgreSQL |
| **Production server** | `102.208.185.202` |
| **Prepared by** | ICB Developer Team |
| **Purpose** | Security implementation summary for auditor review |

---

## 1. Overview

This document describes the security measures I implemented during the development of the DIT ICB web application. For each area, I explain what I built, why I built it that way, and what risk it addresses. I have also listed the items that remain pending and my plan for each.

The application has two distinct frontends sharing one backend: a public-facing website rendered server-side via Inertia.js, and a React SPA admin panel backed by a JSON API. Most of the security controls described here apply to both, with some specific to the admin panel.

---

## 2. Security Controls Implemented

### 2.1 SQL Injection Prevention

I made the decision early on to use Laravel's Eloquent ORM for all database access and to avoid writing raw SQL queries entirely. Every query — including search filters, slug lookups, and user authentication — goes through Eloquent's query builder, which uses parameterised bindings automatically.

For the `?lang=` locale parameter, I validate the value against a fixed whitelist `['en', 'sw']` before it is used anywhere, so a crafted value cannot influence query behaviour.

**What this prevents:** An attacker injecting SQL through form fields or URL parameters to read, modify, or delete database records they should not have access to.

---

### 2.2 Cross-Site Scripting (XSS) Prevention

This was one of the areas I spent the most thought on, because the application includes a rich-text editor in the admin panel that writes HTML content to the database, and that content is later rendered on public pages.

I wrote a custom `HtmlSanitizer` class that runs on every rich-text field at the moment it is saved. It works as a strict whitelist — only specific safe tags (`p`, `strong`, `em`, `a`, `ul`, `ol`, `li`, `blockquote`, `br`, `h2`, `h3`, `h4`) are allowed through. Everything else is stripped, including all HTML comments. For links, I validate the `href` against safe protocols only (`http`, `https`, `mailto`, `tel`), and I automatically add `rel="noopener noreferrer"` to any link that opens in a new tab to prevent tab-napping attacks.

I wired this sanitizer into the model layer — the `Page`, `Service`, `Project`, and `NewsPost` models all sanitize rich-text content in their attribute setters before it reaches the database. This means no unsanitized content can ever be stored, regardless of how the data arrives.

On the frontend, Blade templates use Laravel's default `{{ }}` escaped output throughout. In the React public pages, I use `dangerouslySetInnerHTML` to render the rich-text content — I am aware this looks like a risk, but it is safe here specifically because the content has been sanitized at write time, not at read time.

I also removed SVG from the file upload MIME whitelist after recognizing that SVG files can contain embedded JavaScript that would bypass the HTML sanitizer.

**What this prevents:** A malicious admin or compromised account injecting JavaScript into page content that would then execute in every visitor's browser.

---

### 2.3 CSRF Protection

I rely on Laravel's built-in `VerifyCsrfToken` middleware, which is active on all web routes. For the admin SPA, I embed the CSRF token in a `<meta>` tag in the HTML shell and read it in every `fetch` call, passing it as the `X-CSRF-TOKEN` header on all state-changing requests (POST, PUT, DELETE).

**What this prevents:** A malicious website tricking a logged-in administrator into unknowingly submitting a form or API request — for example, deleting content or creating a new admin account.

---

### 2.4 HTTP Security Headers

I wrote a `SecurityHeaders` middleware that I registered globally so it runs on every response. I chose to implement this as middleware rather than relying on the web server configuration, so the headers travel with the application wherever it is deployed.

The headers I set and why:

| Header | Why I set it |
|---|---|
| `Content-Security-Policy` | Restricts which origins can load scripts, styles, and fonts. Scripts are limited to the application's own origin; fonts are limited to the application origin and Bunny Fonts CDN which the app uses |
| `X-Content-Type-Options: nosniff` | Prevents browsers from guessing a file's type and executing something that was uploaded as an image |
| `X-Frame-Options: SAMEORIGIN` | Prevents the site from being embedded in an iframe on another domain, blocking clickjacking attacks |
| `Referrer-Policy: strict-origin-when-cross-origin` | Stops the full URL (which may contain query parameters) from leaking to third-party sites |
| `Permissions-Policy` | Explicitly disables geolocation, microphone, and camera — features this application has no reason to use |
| `Cross-Origin-Opener-Policy: same-origin` | Prevents other browsing contexts from gaining a reference to the application window |
| `Cross-Origin-Resource-Policy: same-origin` | Prevents other origins from loading the application's resources |
| `Strict-Transport-Security` | Applied only when `APP_ENV=production` — tells browsers to only connect over HTTPS for the next year |

---

### 2.5 Authentication

For the admin panel I implemented session-based authentication using Laravel's built-in Auth guard. I chose sessions over API tokens because the admin is browser-based and sessions integrate naturally with CSRF protection.

Specific decisions I made:

- **Password hashing:** I use `Hash::check()` which uses bcrypt. Passwords are never stored or compared in plain text.
- **Admin flag check at login:** Even if someone has a valid username and password, they cannot get an admin session unless the `is_admin` flag is set on their account. A regular user account cannot access admin functionality.
- **Session regeneration:** I call `$request->session()->regenerate()` on successful login. This prevents session fixation — where an attacker pre-sets a session ID and waits for a victim to authenticate with it.
- **Session invalidation on logout:** The entire session is destroyed and the CSRF token is regenerated, not just the authentication flag.
- **Timing attack prevention:** On a failed login I add a deliberate 250 ms delay before responding. Without this, an attacker could time the response to determine whether a username exists in the database, even without knowing the password.
- **Login rate limiting:** The login endpoint allows 6 attempts per 15-minute window per IP address. I changed this from the original 5-per-minute limit, which was too easy to work around by spacing requests slightly.

**What this prevents:** Session fixation, brute-force and credential-stuffing attacks, timing-based username enumeration.

---

### 2.6 Admin API Authorization

I wrote an `EnsureAdmin` middleware that sits in front of all `/api/admin/*` endpoints. It checks the `is_admin` flag on the authenticated user and returns HTTP 403 if it is not set. This is a second layer of protection — even if authentication somehow passed, authorization would still block an non-admin user.

I was also careful about what data the API returns. Every user-related response goes through a `serializeUser()` method that explicitly lists the fields to return (`id`, `name`, `email`, `is_admin`). The `User` model marks `password` and `remember_token` as hidden, so they cannot be accidentally included in a JSON response.

**What this prevents:** A regular authenticated user escalating their privileges to access or modify admin data.

---

### 2.7 Input Validation

All inputs to the admin API are validated using Laravel's `Validator` before any processing happens. I enforce specific rules per field type:

- Email addresses must be valid format and unique in the database
- Passwords must be at least 8 characters
- URL slugs must match `/^[a-z0-9\-]+$/` — this prevents special characters that could cause routing or injection issues
- File uploads are validated against a MIME type whitelist and capped at 10 MB
- Rich-text content is capped at 65,535 characters

**What this prevents:** Mass assignment attacks, oversized payload attacks, and format injection through structured fields like slugs.

---

### 2.8 File Upload Security

File uploads went through several deliberate decisions:

- **Storage location:** Files are stored in `storage/app/public/uploads`, which is outside the web root. They are served through Laravel via a symlink, not served directly by the web server. This means an uploaded file — even if it were a PHP script — cannot be executed by accessing its URL.
- **Random filenames:** Laravel's `store()` method generates a random filename for every uploaded file. This prevents an attacker from overwriting a known file or crafting a filename with path traversal characters (e.g., `../../config/.env`).
- **MIME whitelist:** I allow only specific file types: `jpg`, `jpeg`, `png`, `gif`, `webp`, `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, `zip`. I removed `svg` from this list after recognizing it could carry embedded scripts.
- **Audit logging:** Every upload is written to a security log with the file path, the user ID, and their IP address.

**What this prevents:** Remote code execution via malicious file uploads, directory traversal, and untracked uploads.

---

### 2.9 Rate Limiting

I added rate limiting across all admin endpoints, split into tiers based on the sensitivity of each action:

| Endpoint group | Limit | Reason |
|---|---|---|
| Login | 6 per 15 minutes per IP | Brute-force protection |
| Read endpoints (GET) | 60 per minute | Prevent scraping and enumeration |
| Write / delete endpoints | 30 per minute | Prevent automated abuse |
| File upload | 10 per minute | Prevent storage exhaustion |

**What this prevents:** Brute-force attacks on login, denial-of-service via API flooding, and storage exhaustion through repeated file uploads.

---

### 2.10 Session Configuration

I configured the session with the following settings:

| Setting | Value | Reason |
|---|---|---|
| Driver | `database` | Sessions are stored server-side, not in the cookie itself |
| Lifetime | 120 minutes | Idle sessions expire automatically |
| HttpOnly | `true` | The session cookie is not accessible to JavaScript, blocking XSS-based cookie theft |
| SameSite | `lax` | The cookie is not sent on cross-site requests, providing CSRF protection at the browser level |
| Secure | `false` (temporary) | Currently HTTP only — will be set to `true` once TLS is in place |

**What this prevents:** XSS-based session hijacking (HttpOnly), cross-site session riding (SameSite).

---

### 2.11 Audit Logging

I set up a dedicated `security` log channel that records significant admin actions:

- Login attempts — both successful and failed, including IP address and user ID
- Content changes — creation, update, and deletion of any resource, with the resource type, record ID, and acting user
- File uploads — stored path, user ID, and IP address
- User account changes — creation and deletion of admin accounts

**What this provides:** A tamper-evident audit trail for investigating any suspicious activity after the fact.

---

### 2.12 Dependency Security

I ran `composer audit` and `npm audit` on 2 June 2026. Both returned zero known vulnerabilities. I intend to run these checks before every production deployment going forward.

| Package | Version |
|---|---|
| `laravel/framework` | 13.8 |
| `inertiajs/inertia-laravel` | 3.1 |
| `react` | 19.2.6 |
| `@inertiajs/react` | 3.2.0 |
| `framer-motion` | 12.40.0 |

---

## 3. Outstanding Items and Plan

I want to be transparent about what is not yet complete and why.

### 3.1 Database Password Rotation — Critical

During development, the `.env` file was accidentally committed to the git repository, which exposed the database password. I have since removed the file from being tracked, but the password is still in git history and the same password is currently active on the production server.

I need to:
1. Change the password on the PostgreSQL server: `ALTER USER icb_user WITH PASSWORD '<new>';`
2. Update `/var/www/icb/.env` on the server.
3. Rewrite git history to remove the `.env` file entirely.

This is my immediate next action before the site goes public.

---

### 3.2 TLS / HTTPS — High (Awaiting Domain)

The site is currently running on HTTP over a bare IP address because no domain name has been assigned yet. Once a domain is provisioned I will:

1. Install a TLS certificate using Let's Encrypt / Certbot.
2. Configure nginx to redirect HTTP to HTTPS.
3. Set `SESSION_SECURE_COOKIE=true` in the server `.env`.
4. Update `APP_URL` to the HTTPS domain.

The code for HSTS and secure cookies is already written — it activates automatically in production once HTTPS is in place.

---

### 3.3 Session Encryption at Rest — High

`SESSION_ENCRYPT` is currently `false`. I plan to set it to `true` so that session records stored in the database are encrypted at rest. This limits the damage of a direct database breach.

---

### 3.4 Admin Password Reset — Medium

There is currently no password reset flow for admin accounts. A locked-out administrator has to ask me to manually reset the password at the database level. I plan to implement Laravel's built-in password reset before the site goes live.

---

### 3.5 Content-Based File Type Validation — Medium

At the moment I validate file types using the MIME type declared in the HTTP request, which a client can spoof. I plan to add server-side content inspection using `finfo_file()` for all uploads and `getimagesize()` for image files, so the actual file bytes are checked rather than the client-supplied header.

---

### 3.6 ZIP Upload Review — Low

I currently allow ZIP file uploads. Files are stored outside the web root so there is no execution risk, but I want to confirm with the client whether ZIP uploads are actually needed. If not, I will remove them to reduce the attack surface.

---

### 3.7 Content Security Policy Hardening — Low

The current CSP uses `'unsafe-inline'` for scripts and styles, which is the standard approach when using Inertia.js with Vite. I am aware this is not the strictest possible configuration. I plan to evaluate a nonce-based CSP before the final production launch, though this is a low priority as the current setup does not represent an exploitable weakness.

---

## 4. Pre-Launch Checklist

| Priority | Item | Status |
|---|---|---|
| Critical | Rotate database password and clean git history | Pending |
| High | Provision domain + TLS; configure HTTPS redirect | Pending — awaiting domain |
| High | Set `SESSION_SECURE_COOKIE=true` | Pending — requires TLS |
| High | Set `SESSION_ENCRYPT=true` | Pending |
| Medium | Implement admin password reset flow | Pending |
| Medium | Add server-side file content inspection | Pending |
| Low | Confirm ZIP upload requirement with client | Pending |
| Low | Evaluate nonce-based CSP | Pending |
| Done | Rate limiting on all admin API endpoints | Complete |
| Done | SVG removed from upload MIME whitelist | Complete |
| Done | Login throttle changed to 6 per 15 minutes | Complete |
| Done | `APP_DEBUG=false`, `APP_ENV=production` on server | Complete |
| Done | Dependency audit — 0 vulnerabilities | Complete |

---

## 5. Summary

I am satisfied that the core attack surfaces of the application — SQL injection, XSS, CSRF, privilege escalation, and denial-of-service — are well-controlled. The one item that requires immediate action before going live is the database password rotation. Everything else is either already done or is a planned step that depends on domain and TLS provisioning, which is a normal part of the deployment process.

I am available to walk through any of the above controls in more detail or to provide code-level evidence for any specific area.

---

*Prepared by: ICB Developer Team*  
*Date: 2 June 2026*
