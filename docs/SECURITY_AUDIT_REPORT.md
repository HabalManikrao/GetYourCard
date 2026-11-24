# Security Audit (Phase J)

**Scope:** non-destructive review of `backend/app/*` + frontend. No penetration testing.
Distinguishes **local-only** risk (default deployment) from **internet-exposed** risk.

| Control | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Authentication | ❌ none | no auth routes; `User.password_hash` unused | By design (guest/local-first). **Blocker before any internet/multi-tenant deployment.** |
| Authorization boundaries | ❌ none | any client can read/modify/delete any project | Acceptable single-user local; **critical** if exposed |
| Guest mode restrictions | ⚠️ | `user_id` nullable; no scoping | all data is global |
| File upload type validation | ✅ verified | `assets.py` allow-list → 415; `test_upload_rejects_wrong_type` | |
| Corrupt-file rejection | ✅ verified | Pillow `verify()`; `test_upload_rejects_corrupt_image` | |
| Scripted-SVG rejection | ✅ verified | `<script>` check; `test_upload_rejects_scripted_svg` | heuristic only (no full sanitiser) |
| File size limit | ✅ | 10 MB → 413 | |
| Path traversal | ✅ verified | `Path(name).name` basename; `test_asset_path_traversal_blocked` | |
| Safe filename handling | ✅ | alnum+`-_`, random suffix | |
| Arbitrary file access | ✅ mitigated | serves only from uploads/exports by basename | |
| Font upload security | NA | feature not implemented | |
| CORS | ✅ | `SM_CORS_ORIGINS` configurable; not wildcard in compose | dev defaults localhost |
| Secret management | ✅ | AI keys via env; `.env` git-ignored; `.env.example` only | no secrets in source (grep clean) |
| SQL injection | ✅ low | SQLAlchemy ORM parameterizes; no raw SQL | |
| XSS | ⚠️ | React escapes by default; SVG uploads are a vector | SVG served as file; heuristic sanitiser; no `dangerouslySetInnerHTML` found |
| CSRF | NA/⚠️ | no cookies/sessions (stateless, no auth) | revisit when auth added |
| API input validation | ✅ | Pydantic schemas, bounded lengths, regex on format | |
| Sensitive data exposure | ✅ | global handler returns generic 500; stack logged server-side | `main.py` |
| Dependency vulnerabilities | ❓ not run | `npm audit` / `pip-audit` **not executed** (network) | recommend in CI |
| Rate limiting | ❌ | none | add before exposure |

## Key conclusions
- **Upload/file-handling security is genuinely implemented and tested** — the strongest
  security area.
- **No authentication/authorization** — explicitly acceptable for the stated local-first
  guest release, but this is the **#1 blocker** before any shared/internet deployment. The
  audit does **not** certify auth security because auth does not exist.
- SVG sanitisation is heuristic; for untrusted multi-user input, rasterise SVGs or run a
  real sanitiser.
- Dependency vulnerability scanning was **not performed** (would need registry access);
  flagged as a gap for CI.

**Status (local-first): IMPLEMENTED WITH LIMITATIONS. Status (internet-exposed): NOT READY.**
