# Authentication Test Report

All tests executed this cycle. Backend auth is tested at the **API level** (the authoritative
layer); the frontend flow is tested in a real browser.

## Totals
- Backend **Pytest: 38 passed** (25 prior + 13 auth).
- Frontend **Vitest: 36 passed** (unchanged).
- **Playwright: 20 passed** (19 prior + 1 shared‑mode auth flow).
- `tsc -b` clean · `vite build` ok.

## Backend auth tests (`backend/tests/test_auth.py`, 13)

| Test | Verifies |
|------|----------|
| `test_password_hashing_roundtrip` | scrypt hash/verify; plaintext never present |
| `test_password_min_length` | password policy enforced |
| `test_token_roundtrip_and_expiry` | HS256 sign/verify; bad‑signature & expiry rejected |
| `test_auth_config_reports_guest` | default = guest mode |
| `test_guest_projects_work_without_token` | **backward compat**: guest CRUD, no token |
| `test_register_login_me` | register, login, /me; wrong password → 401; duplicate email → 409; no password in response |
| `test_invalid_token_rejected` | malformed token → 401 |
| `test_password_reset_flow` | request → token → confirm → login with new password |
| `test_rate_limit_on_login` | brute force → 429 |
| `test_shared_mode_requires_auth` | shared mode: no token → 401 on list/create |
| `test_cross_user_project_isolation` | **A's project is 404 to B** on read/update/delete/duplicate/export; A retains control; lists are scoped |
| `test_admin_sees_all_and_can_transfer` | role separation (non‑admin → 403 on admin endpoints) |
| `test_deactivated_or_missing_user_token_rejected` | token for unknown user → 401 |

## Frontend auth test (`frontend/e2e/auth.spec.ts`, 1)
Shared mode (config mocked `auth_required:true`): unauthenticated `/` → redirect to `/login`;
register → dashboard with account menu; **session persists across reload**; logout → `/login`;
protected route gated again after logout.

## Backward‑compatibility checks (guest mode, default)
- Full existing suite re‑run green: smoke, flows (validation/undo/persistence), export (PNG/JPG/
  PDF incl. selectable text), layout, multilingual visual + certification, occasions, crop,
  offline — **20 Playwright all pass** with no login required.
- Existing wedding and universal‑occasion backend tests (25) pass unchanged.

## What was explicitly verified about authorization
> One user cannot read, modify, export, or delete another user's projects.

Confirmed by `test_cross_user_project_isolation` via **direct API calls** (bearer tokens for
two distinct users) — not merely frontend route hiding. All cross‑user operations return 404.

## Not covered (documented)
- Multi‑instance rate limiting; token revocation; email delivery for reset; dependency CVE scan
  (`pip-audit`/`npm audit`); httpOnly‑cookie token transport. See
  `SECURITY_IMPLEMENTATION_REPORT.md`.
