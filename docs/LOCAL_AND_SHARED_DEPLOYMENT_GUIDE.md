# Local and Shared Deployment Guide

Shubha Muhurta Studio runs in two modes, controlled by one setting: `SM_AUTH_REQUIRED`.

## Mode A — Local / guest (default)

Zero‑config, single‑user, no login. Exactly the pre‑auth behavior.

- `SM_AUTH_REQUIRED=false` (default).
- No accounts needed; projects are stored as guest (`user_id = NULL`) and all visible locally.
- Existing/legacy projects remain fully accessible.
- Run:
  ```powershell
  scripts\setup.ps1
  scripts\start-dev.ps1     # backend :8000, frontend :5173
  ```
- Suitable for: a family/designer using the app on their own machine.
- **Do not expose this mode to the internet** — there is no access control in guest mode.

## Mode B — Shared / multi‑user (authenticated)

Accounts required; every user sees only their own projects.

1. Set environment (e.g. `backend/.env`):
   ```
   SM_AUTH_REQUIRED=true
   SM_SECRET_KEY=<a long random secret>     # REQUIRED in production; keep secret
   SM_CORS_ORIGINS=https://your-domain
   SM_DATABASE_URL=postgresql+psycopg://user:pass@host:5432/shubha   # recommended for prod
   ```
2. Start backend + serve the built frontend (Docker: `docker compose up --build`, then set the
   env on the backend service; or run uvicorn behind a TLS reverse proxy + nginx for the SPA).
3. The **first** account you register becomes **admin**.
4. **HTTPS is mandatory** — bearer tokens must only travel over TLS.

### Migrating an existing local install to shared mode
Legacy guest projects (`user_id = NULL`) are **not** auto‑assigned (prevents misassignment),
so they become invisible to normal users once auth is on. To claim them for an account:

```powershell
# after that user has registered
backend\.venv\Scripts\python -m scripts.claim_projects --email you@example.com --dry-run
backend\.venv\Scripts\python -m scripts.claim_projects --email you@example.com
```
(or, as admin, `POST /api/admin/projects/{id}/transfer?new_owner_id=<id>`).

To roll back: set `SM_AUTH_REQUIRED=false` — guest access to all projects is restored (the
added columns are additive and harmless).

## Security checklist for shared deployment
- [ ] `SM_SECRET_KEY` set to a strong random value (not the auto‑generated dev key).
- [ ] HTTPS/TLS enforced at the proxy; HSTS enabled.
- [ ] `SM_CORS_ORIGINS` restricted to your domain(s).
- [ ] PostgreSQL (not SQLite) for concurrency/durability; back it up.
- [ ] Rate limiting backed by a shared store (Redis) if running multiple instances.
- [ ] Email provider wired for password reset (currently returns the token only in local mode).
- [ ] Consider httpOnly refresh cookie + short‑lived access token (hardening over localStorage).
- [ ] Run `pip-audit` and `npm audit` in CI.
- [ ] Vendor offline fonts if offline rendering is needed (`OFFLINE_FONT_COMPLETION_REPORT.md`).

## Configuration reference
| Env var | Default | Meaning |
|---------|---------|---------|
| `SM_AUTH_REQUIRED` | `false` | `true` enables shared/authenticated mode |
| `SM_SECRET_KEY` | auto (persisted) | token signing secret — set in production |
| `SM_ACCESS_TTL_MIN` | `720` | access‑token lifetime (minutes) |
| `SM_LOGIN_RATE_LIMIT` | `10` | attempts per window per IP+identifier |
| `SM_LOGIN_RATE_WINDOW_SEC` | `300` | rate‑limit window (seconds) |
| `SM_CORS_ORIGINS` | localhost | comma‑separated allowed origins |
| `SM_DATABASE_URL` | SQLite | set to PostgreSQL for production |
