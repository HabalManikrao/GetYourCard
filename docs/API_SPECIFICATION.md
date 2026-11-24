# API Specification

Base URL: `/api`. Interactive docs at `/docs` (Swagger) when the backend runs.
All request/response bodies are JSON unless noted. Errors use standard HTTP status codes
with `{ "detail": "..." }`.

## Health
- `GET /api/health` → `{ status, app, ai_enabled }`

## Projects
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/projects` | `?q=` (name/bride/groom), `?language=`, `?wedding_date=`, `?limit=` |
| POST | `/api/projects` | create; body = project fields + `project_data.design` |
| GET | `/api/projects/{id}` | full project incl. design JSON |
| PUT | `/api/projects/{id}` | partial update; bumps `version` when `project_data` changes |
| DELETE | `/api/projects/{id}` | 204 |
| POST | `/api/projects/{id}/duplicate` | deep-copies the design into a new project |

## Templates
| GET | `/api/templates` | `?category=`, `?language=` |
| GET | `/api/templates/{id}` | full template configuration |
| GET | `/api/templates/{id}/preview.svg` | gallery thumbnail (SVG) |

## Languages, fonts, wordings, messages
| GET | `/api/languages` | `?q=` search; registry of 44 locales |
| GET | `/api/fonts` | `?script=` → covering fonts + fallback |
| GET | `/api/wordings` | `?language=`, `?category=` |
| GET | `/api/wordings/{id}` | one wording |
| GET | `/api/message-defaults/{locale}` | default localized content for a language layer |

## Assets (uploads)
| GET | `/api/assets` | `?asset_type=` |
| POST | `/api/assets/upload` | multipart `file`; validates type/size/decodability |
| GET | `/api/assets/file/{filename}` | serve an uploaded file |
| DELETE | `/api/assets/{id}` | removes record + file |

Upload rules: ≤ 10 MB; `image/png|jpeg|webp|svg+xml`; raster files are decoded to confirm
validity; SVGs with `<script>` are rejected; filenames are sanitised.

## Exports
| POST | `/api/exports` | body `{ project_id, export_format, resolution?, data }` where
`data` is a base64 / data-URL payload of the rendered file |
| GET | `/api/exports` | `?project_id=`, `?limit=` |
| GET | `/api/exports/{id}` | one export record |
| GET | `/api/exports/{id}/download` | download the stored file |

## AI (optional, disabled unless configured)
| GET | `/api/ai/status` | `{ enabled, provider, image_generation }` |
| GET | `/api/ai/palettes` | `?mood=` curated palette suggestions (offline) |
| POST | `/api/ai/wording` | offline-capable wording; marks AI results unverified |
| POST | `/api/ai/image` | `503` unless an image provider is configured (never faked) |

## Status code conventions
`200` OK · `201` Created · `204` No Content · `400` bad input · `404` not found ·
`413` too large · `415` unsupported media type · `422` validation · `500` server error
(logged, generic body).
