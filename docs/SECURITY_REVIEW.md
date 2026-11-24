# Security Review

## Upload handling (`routers/assets.py`)
- **Type allow-list**: only `image/png|jpeg|webp|svg+xml` (else 415).
- **Size limit**: 10 MB (else 413); empty files rejected (400).
- **Content verification**: raster files are decoded with Pillow (`verify` + reopen) to
  reject corrupt files and files masquerading by extension (400).
- **SVG sanitisation**: SVGs must look like SVG and must not contain `<script>` (400);
  blocks stored-XSS via uploaded vectors.
- **Safe filenames**: original names are stripped to alphanumerics + `-_`, truncated, and
  suffixed with a random token — no path components survive.
- **Path-traversal**: file-serving endpoints reduce the path to its basename
  (`Path(name).name`) so `../` cannot escape the uploads/exports directory.

## Export handling (`routers/exports.py`)
- Base64 is decoded with validation (`validate=True`) — malformed payloads → 400.
- Export size capped (40 MB). Stored files are served by sanitised basename only.

## Input validation
- All request bodies are Pydantic-validated; unexpected fields ignored, lengths bounded.
- `export_format` constrained by regex; project/asset ids are opaque strings.

## CORS & transport
- CORS origins are configured via `SM_CORS_ORIGINS` (env), not wildcarded in production.
- No secrets in code: AI provider/key come from env (`SM_AI_*`); the app runs fully with
  none set. `.env` is git-ignored; `.env.example` documents the knobs.

## Error handling & disclosure
- A global exception handler logs the stack trace server-side and returns a generic
  `{"detail": "Internal server error"}` — no internals leaked to clients.
- The frontend wraps routes in an `ErrorBoundary` for graceful recovery.

## Data & privacy
- Guest/local-first: uploaded photographs and invitation data stay in local storage / the
  local DB; nothing is sent to third parties unless the user configures an AI provider.
- Passwords (when auth is enabled) are stored only as `password_hash` — never plaintext.

## Known limitations / hardening backlog
- No authentication/authorization yet (local-first, single-user assumption). Add before any
  multi-tenant deployment; scope projects by `user_id`.
- SVG sanitisation is heuristic (`<script>` + shape check); for untrusted multi-user
  uploads, add a full sanitiser (e.g. DOMPurify server-side) and/or rasterise SVGs.
- Rate limiting and auth tokens are out of scope for the local release.
- Introduce Alembic migrations and object storage before production.
