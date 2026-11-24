# Universal Occasion Platform

Shubha Muhurta Studio is a universal invitation/greeting/event card platform. Weddings are
one category among many; no occasion is hardcoded into the editor.

## Occasion registry (`backend/app/occasion_data.py`)

28 built-in occasions across 8 categories (Wedding, Birthday, Family, Religious, Corporate,
Social, Greeting, Custom). Each occasion declares:

```json
{ "id": "birthday", "name": "Birthday Party", "category": "Birthday",
  "card_types": ["invitation"],
  "fields": [ { "key": "celebrant_name", "label": "Birthday person",
               "type": "text", "required": true, "group": "Details" }, ... ] }
```

Field types: text, multiline, date, time, datetime, address, phone, email, image, url,
select, boolean, list. Served at `GET /api/occasions`, `/api/occasions/{id}`,
`/api/occasions/{id}/fields`.

Adding an occasion is a data change — the editor needs no changes.

## Dynamic form engine (`frontend/src/pages/Wizard.tsx`)

The wizard reads an occasion's fields, groups them into steps by `group`, renders each field
by `type`, validates required fields, and writes values into the project's generic `details`
map. The **wedding** occasion's field schema reproduces the original wedding wizard exactly
(same keys, placeholders, and step groups), so saved wedding projects and all wedding tests
remain fully compatible.

## Build Your Own (`frontend/src/pages/BuildYourOwn.tsx`)

Users define a custom occasion: name, card type, and their own fields (label + type +
required). Saved via `POST /api/occasions/custom` (CRUD in `routers/occasions.py`, stored in
`custom_occasions`), then usable like any occasion.

## Content model & backward compatibility

- Generic project store: `details` holds structured values keyed by occasion field keys
  (wedding keeps `groom_name`/`bride_name`/…; birthday uses `celebrant_name`/`age`/…).
- `Project` gained additive columns `occasion_id` (default `marriage`), `project_type`
  (default `invitation`), `schema_version` — applied to existing SQLite DBs via
  `database._migrate_sqlite()` (ALTER TABLE ADD COLUMN if missing). Old projects load with
  `occasion_id=marriage` and are untouched. Use Alembic for production migrations.

## Templates across occasions

Templates carry `occasion_compatibility` and `card_types` in their configuration; the gallery
filters via `GET /api/templates?occasion=<id>`. 15 wedding templates use wedding tokens; 6
universal templates (birthday, event, corporate, housewarming, greeting, announcement) use
occasion/neutral tokens. One template serves every language.

## Editor is occasion-agnostic

The canvas renders generic elements with token substitution. Editor chrome no longer assumes
wedding: the properties panel shows the project's actual fields (derived from `details`), and
left-panel field inserts use neutral tokens. Acceptance #15 ("no wedding-specific assumptions
in the universal editor") is met.
