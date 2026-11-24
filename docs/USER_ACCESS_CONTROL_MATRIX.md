# User Access Control Matrix

Roles: **Guest** (no auth; local mode only), **User** (authenticated owner), **Admin**
(authenticated, elevated). Ownership is enforced server‑side in both modes.

## Endpoint access

| Endpoint | Guest (local mode) | User | Admin | Other user's resource |
|----------|--------------------|------|-------|-----------------------|
| `GET /api/auth/config` | ✅ | ✅ | ✅ | n/a |
| `POST /api/auth/register` | ✅ (creates account) | ✅ | ✅ | n/a |
| `POST /api/auth/login` | ✅ | ✅ | ✅ | n/a |
| `GET /api/auth/me` | 401 (no session) | ✅ self | ✅ self | n/a |
| `POST /api/auth/refresh` | 401 | ✅ | ✅ | n/a |
| `POST /api/auth/password-reset/*` | ✅ | ✅ | ✅ | no enumeration |
| `GET /api/projects` (list) | ✅ NULL‑owner only | ✅ own only | ✅ all | filtered out |
| `POST /api/projects` | ✅ (owner=NULL) | ✅ (owner=self) | ✅ | n/a |
| `GET/PUT/DELETE /api/projects/{id}` | ✅ own (NULL) | ✅ own | ✅ any | **404** |
| `POST /api/projects/{id}/duplicate` | ✅ own | ✅ own (copy→self) | ✅ any | **404** |
| `POST /api/exports` | ✅ own project | ✅ own project | ✅ any | **404** |
| `GET /api/exports/{id}` · `/download` · `/file/{name}` | ✅ own | ✅ own | ✅ any | **404** |
| `GET /api/exports` (list) | ✅ own projects | ✅ own projects | ✅ all | filtered out |
| `GET /api/templates`, `/languages`, `/fonts`, `/wordings`, `/occasions`, `/message-defaults` | ✅ public | ✅ | ✅ | n/a (reference data) |
| `POST/PUT/DELETE /api/occasions/custom` | ✅ (local) | ✅ | ✅ | — |
| `GET /api/admin/users` | 403 | 403 | ✅ | n/a |
| `POST /api/admin/projects/{id}/transfer` | 403 | 403 | ✅ | n/a |
| `POST /api/assets/upload`, `GET /api/assets/file/{name}` | ✅ | ✅ | ✅ | n/a (validated) |

Notes:
- In **shared mode** (`SM_AUTH_REQUIRED=true`), every row that shows "Guest ✅" instead
  requires a valid token (guest is disabled); 401 otherwise.
- "Other user's resource" = **404** everywhere (existence not disclosed), verified by
  `test_cross_user_project_isolation`.

## Ownership model
- `Project.user_id`: `NULL` = guest/legacy; else the owning user.
- Scope: Guest → `user_id IS NULL`; User → `user_id = self`; Admin → all.
- Create assigns `user_id = caller` (NULL for guest). Update never changes ownership.
  Duplicate assigns the copy to the caller. Transfer is admin‑only.

## Role assignment
- The **first** registered user becomes **admin** (bootstrap); subsequent users are **User**.
- `is_active=false` disables login and invalidates the session (token → 401).
