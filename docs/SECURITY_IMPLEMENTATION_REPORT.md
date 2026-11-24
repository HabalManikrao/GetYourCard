# Security Implementation Report

Scope: authentication/authorization added to Shubha Muhurta Studio. Verified by tests, not
asserted. No security certification is claimed — this records what was implemented and checked.

## Controls implemented

| Area | Implementation | Evidence |
|------|----------------|----------|
| **Password storage** | `hashlib.scrypt` (memory‑hard, n=2¹⁴,r=8,p=1), per‑user 16‑byte salt, stored `scrypt$n$r$p$salt$hash`. Never plaintext. Min length 8. | `security.py`; `test_auth.test_password_hashing_roundtrip` / `_min_length` |
| **Token handling** | Stateless HS256 tokens (stdlib `hmac`), claims `sub/role/iat/exp`, constant‑time signature compare, expiry enforced. Secret from `SM_SECRET_KEY` or persisted random key. | `security.py`; `test_token_roundtrip_and_expiry` |
| **Session expiration** | Access TTL (default 12h); expired/invalid token → 401; sliding `/auth/refresh`; frontend clears token + redirects on 401. | `deps.get_principal`, `auth.refresh`, `api.ts`, `auth.ts` |
| **Authorization (server‑side)** | Ownership enforced on every project/export/custom‑occasion op; cross‑user access → 404 (no existence disclosure); admin role separation. | `deps.owns`, `projects.py`, `exports.py`; `test_cross_user_project_isolation` |
| **Rate limiting** | In‑memory sliding window on login/register/reset per IP+identifier (default 10/5min) → 429. | `ratelimit.py`, `auth._rate`; `test_rate_limit_on_login` |
| **Input validation** | Pydantic schemas (email/length bounds); email format check; password policy. | `schemas.py`, `auth.register` |
| **SQL injection** | SQLAlchemy ORM parameterizes all queries; no raw SQL with user input. | code review |
| **XSS** | React escapes by default; no `dangerouslySetInnerHTML`; uploaded SVGs rejected if they contain `<script>` and served as files, not inlined. | `assets.py`; `test_upload_rejects_scripted_svg` |
| **CSRF** | Bearer‑token auth (no cookies) → not CSRF‑applicable. (If switched to cookie sessions, add CSRF tokens — see deployment guide.) | design |
| **CORS** | `SM_CORS_ORIGINS` allow‑list (not wildcard in prod). | `main.py`, `config.py` |
| **Secret management** | No secrets in code; signing secret via env or persisted `.secret_key` (git‑ignored storage). AI keys via env. | `config.secret()`, `.gitignore` |
| **Error responses** | Generic login error ("Invalid email or password") avoids user enumeration; password‑reset request never reveals account existence; global 500 handler hides internals. | `auth.login`, `auth.password_reset_request`, `main.py` |
| **No sensitive logging** | Registration logs id+role only — never email/password/token. | `auth.register` |

## Verified attack resistances (tests)
- A user **cannot** read / update / delete / duplicate / export another user's project → all
  return **404** (`test_cross_user_project_isolation`), tested via **direct API**, not UI.
- A token for a non‑existent/removed user is rejected (`test_deactivated_or_missing_user_token_rejected`).
- Tampered/expired tokens rejected; wrong signing key rejected.
- Non‑admin users are refused admin endpoints (403).
- Brute‑force login is throttled (429).

## Residual risks / hardening backlog (documented, not fixed)
- **Token storage:** access token in `localStorage` (XSS‑readable). For shared deployment,
  move to an httpOnly refresh cookie + short‑lived in‑memory access token + CSRF tokens.
- **Token revocation:** stateless tokens can't be revoked before expiry; add a revocation
  list / rotating refresh tokens for high‑security deployments.
- **Rate limiter** is in‑memory (per instance); use Redis for multi‑instance.
- **Email delivery** for password reset is not wired (returns token locally); integrate an
  email provider for production.
- **SVG sanitiser** is heuristic; rasterize or use a full sanitiser for untrusted multi‑user input.
- **Dependency scanning** (`pip-audit`/`npm audit`) not run here (registry access); add to CI.
- **HTTPS/transport** must be enforced by the deployment (reverse proxy) — tokens must only
  travel over TLS.
