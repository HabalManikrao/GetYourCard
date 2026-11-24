# Database Design

SQLite for local development; the schema is PostgreSQL-compatible (string UUID PKs, JSON
columns, timezone-aware timestamps). Tables are created at startup via SQLAlchemy
`create_all`; templates are seeded idempotently.

## Entities

### users
| column | type | notes |
|--------|------|-------|
| id | str(32) PK | uuid hex |
| name | str(120) | |
| email | str(255) unique | |
| password_hash | str(255) nullable | **never plaintext** (bcrypt/argon2 when auth added) |
| created_at | datetime tz | |

Guest usage is allowed for the local-first release (no mandatory auth); `projects.user_id`
is nullable.

### projects
| column | type | notes |
|--------|------|-------|
| id | str(32) PK | |
| user_id | FK users nullable | |
| project_name | str(200) | |
| bride_name / groom_name | str(200) nullable | denormalised for search |
| wedding_date | str(32) nullable | |
| language | str(32) | primary locale |
| template_id | str(64) nullable | |
| project_data | JSON | **full editable `DesignDocument`** (pages, elements, languages, details) |
| thumbnail_path | str(500) nullable | |
| version | int | bumped on design update |
| created_at / updated_at | datetime tz | `updated_at` auto-updates |

Indexes: `updated_at`, `language`, `wedding_date`.

### templates
| id str(64) PK · template_name · category · preview_path · configuration JSON ·
supported_languages JSON · created_at |

### assets
| id str(32) PK · asset_name · asset_type (upload/decoration/photo) · asset_path ·
license · metadata JSON · created_at |

### exports
| id str(32) PK · project_id FK · export_format (png/jpg/pdf) · export_path ·
resolution · created_at | — indexed on `project_id`; cascade-deleted with the project.

## Relationships
- `User 1—* Project`
- `Project 1—* Export` (cascade delete)
- `Project *—1 Template` (soft reference by id)

## Persistence guarantees
- Projects store **structured JSON**, not a flattened image — text, positions, styles,
  decorations, and all language layers survive save/reopen and duplication.
- Duplication deep-copies `project_data` so edits to a copy never affect the original.
- Deleting a project removes its export rows (cascade) and could be extended to purge
  export files.

## Migration path to PostgreSQL
Set `SM_DATABASE_URL=postgresql+psycopg://…`. JSON columns map to `JSONB`. For production,
introduce Alembic migrations (the current build uses metadata create for simplicity) and
move file storage to object storage (S3-compatible) behind the same `asset_path` abstraction.
