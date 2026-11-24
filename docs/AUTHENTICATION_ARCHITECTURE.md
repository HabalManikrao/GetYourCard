# Authentication & Authorization Architecture

## 1. Inspection of the existing implementation
- **Backend:** FastAPI + SQLAlchemy 2 + SQLite (`backend/app`). Routers: projects, templates,
  assets, exports, content, occasions, ai. Additive SQLite migrations in
  `database._migrate_sqlite()`.
- **Models:** `User(id, name, email, password_hash, created_at)` already defined but unused;
  `Project.user_id` already **nullable** (FK to users); `CustomOccasion.user_id` nullable.
- **Frontend:** React SPA; `src/api.ts` fetch client (no auth header/state); routes for
  dashboard/wizard/editor/templates/build.
- **Security today:** upload validation, path‑traversal protection, CORS, generic error
  handler, no secrets in code. **No authentication; all data is global (guest).**

## 2. Design (built around the existing app, not a rewrite)

### Two explicit modes (one config flag)
`SM_AUTH_REQUIRED` (default **false**):
- **Guest / local mode (default):** behaves exactly as today. Requests resolve to an implicit
  guest owner; projects with `user_id IS NULL` are fully accessible; **no login required**.
  Existing installs and the full regression suite are unaffected.
- **Shared mode (`SM_AUTH_REQUIRED=true`):** every project/export/custom‑occasion endpoint
  requires a valid token; data is scoped to the authenticated user.

This satisfies: "authentication must not become a mandatory internet dependency for local
operation unless explicitly configured."

### Authentication
- **Password hashing:** `hashlib.scrypt` (stdlib, modern memory‑hard KDF) with a per‑user
  random salt; stored as `scrypt$n$r$p$salt$hash`. No new dependency; never plaintext.
- **Tokens:** stateless **HS256** signed tokens (JWT‑compatible structure) built with stdlib
  `hmac`/`hashlib`/`base64url`, with `sub`, `role`, `iat`, `exp`. Signing secret from
  `SM_SECRET_KEY` (env); if unset, a random key is generated once and persisted to
  `storage/.secret_key` (stable across restarts in dev; set the env var in prod). Constant‑time
  signature comparison. Access TTL configurable (`SM_ACCESS_TTL_MIN`, default 720 min).
- **Refresh:** sliding `/api/auth/refresh` re‑issues a token while the current one is valid;
  expired tokens require re‑login. (Rotating refresh tokens + revocation list = documented
  future hardening.)
- **Password reset:** token‑based `/api/auth/password-reset/request` → returns a reset token
  (no email dependency locally; wire an email provider for production) and
  `/api/auth/password-reset/confirm`.
- **Rate limiting:** in‑memory sliding window on login/register/reset per IP+identifier
  (`ratelimit.py`); documented that multi‑instance needs a shared store.

### Authorization
- `role` on `User` (`user` | `admin`), `is_active` flag.
- Dependencies: `get_current_user` (guest‑aware), `require_user`, `require_admin`.
- **Ownership enforced server‑side** in every data router: list/get/update/delete/duplicate
  of projects, export create/download, custom‑occasion mutation. Accessing another user's
  project returns **404** (does not reveal existence). Verified by direct API tests, not just
  frontend routing.
- Admin: may view all projects and transfer ownership (minimal separation).

### Frontend
- `store/auth.ts` (token+user, persisted in `localStorage`), auth header in `api.ts`, 401 →
  clear session + redirect to `/login` (shared mode only). `Login`/`Register` pages,
  protected‑route wrapper (no‑op in guest mode), account info + logout in the header.

## 3. Migration‑risk assessment (before implementation)

| Change | Risk | Mitigation |
|--------|------|-----------|
| Add `role`, `is_active` to `users` | Low — table is empty on existing installs (auth was unused) | Additive `ALTER TABLE ADD COLUMN` with defaults via `_migrate_sqlite()` |
| `Project.user_id` ownership | None — column already exists (nullable) | No schema change; semantics added only in shared mode |
| Existing projects (`user_id` NULL) | **Must not be misassigned** | Left as guest‑owned. In shared mode they are **invisible** to normal users (no cross‑user leak); never auto‑assigned to an arbitrary user |
| Enabling shared mode on an existing install | Legacy projects become invisible | Documented **claim/transfer** path: admin endpoint `POST /api/admin/projects/{id}/transfer` and `scripts/claim_projects.ps1` to assign legacy projects to a chosen user |
| Default behavior | **Zero change** — `SM_AUTH_REQUIRED=false` | Guest mode = today's behavior; all 80 existing tests unaffected |
| Rollback | Setting `SM_AUTH_REQUIRED=false` restores full guest access; columns are additive | Rollback‑safe |

**Conclusion:** the change is additive and default‑off. No existing data is reassigned or
lost; backward compatibility is preserved by construction. Implementation proceeds
incrementally with regression + new security tests.
