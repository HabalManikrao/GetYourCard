"""API tests: health, templates, languages/fonts, wordings, projects CRUD."""
from __future__ import annotations


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_templates_seeded(client):
    r = client.get("/api/templates")
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 20  # 15 wedding + universal occasion templates
    ids = {t["id"] for t in data}
    assert "royal-traditional" in ids
    # Templates are language-independent: front text uses tokens, not baked language.
    tpl = client.get("/api/templates/royal-traditional").json()
    texts = [e["text"] for p in tpl["configuration"]["pages"] for e in p["elements"] if e["type"] == "text"]
    assert any("{{invocation}}" in t for t in texts)
    assert any("{{groom_name}}" in t for t in texts)


def test_template_preview_svg(client):
    r = client.get("/api/templates/royal-traditional/preview.svg")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("image/svg+xml")
    assert b"<svg" in r.content


def test_languages_registry(client):
    r = client.get("/api/languages")
    langs = r.json()
    assert len(langs) >= 40
    locales = {l["locale"] for l in langs}
    assert {"kn-IN", "en-IN", "ar-SA", "ja-JP", "ta-IN"} <= locales
    # RTL correctly flagged.
    arabic = next(l for l in langs if l["locale"] == "ar-SA")
    assert arabic["direction"] == "rtl"


def test_language_search(client):
    r = client.get("/api/languages", params={"q": "tamil"})
    data = r.json()
    assert len(data) == 1 and data[0]["locale"] == "ta-IN"


def test_fonts_coverage(client):
    r = client.get("/api/fonts", params={"script": "Kannada"})
    data = r.json()
    families = {f["family"] for f in data["fonts"]}
    assert "Noto Serif Kannada" in families
    assert data["fallback"] == "Noto Sans Kannada"


def test_message_defaults_localized(client):
    kn = client.get("/api/message-defaults/kn-IN").json()
    assert kn["direction"] == "ltr"
    assert "ಗಣೇಶ" in kn["content"]["invocation"]
    ar = client.get("/api/message-defaults/ar-SA").json()
    assert ar["direction"] == "rtl"
    # Unknown locale falls back to English base, never empties.
    xx = client.get("/api/message-defaults/zz-ZZ").json()
    assert xx["content"]["invite_line"]


def test_wordings(client):
    r = client.get("/api/wordings")
    assert len(r.json()) >= 8
    kn = client.get("/api/wordings", params={"language": "kn"}).json()
    assert all(w["language"] == "kn" for w in kn)


def test_project_crud_and_persistence(client):
    design = {"version": 1, "pages": [{"name": "Front", "elements": []}], "languages": [], "details": {}}
    created = client.post(
        "/api/projects",
        json={"project_name": "Test Wedding", "groom_name": "A", "bride_name": "B", "language": "kn-IN", "project_data": {"design": design}},
    ).json()
    pid = created["id"]
    assert created["version"] == 1

    # Read back the full editable design (not a flattened image).
    got = client.get(f"/api/projects/{pid}").json()
    assert got["project_data"]["design"]["pages"][0]["name"] == "Front"

    # Update bumps version and persists design changes.
    design["pages"][0]["elements"].append({"id": "x", "type": "text"})
    upd = client.put(f"/api/projects/{pid}", json={"project_data": {"design": design}}).json()
    assert upd["version"] == 2
    assert len(upd["project_data"]["design"]["pages"][0]["elements"]) == 1

    # Search + language filter.
    found = client.get("/api/projects", params={"q": "Test Wedding"}).json()
    assert any(p["id"] == pid for p in found)
    assert client.get("/api/projects", params={"language": "kn-IN"}).json()

    # Duplicate creates an independent copy.
    dup = client.post(f"/api/projects/{pid}/duplicate").json()
    assert dup["id"] != pid
    assert dup["project_name"].endswith("(Copy)")

    # Delete.
    assert client.delete(f"/api/projects/{pid}").status_code == 204
    assert client.get(f"/api/projects/{pid}").status_code == 404


def test_missing_project_404(client):
    assert client.get("/api/projects/does-not-exist").status_code == 404


def test_ai_status_disabled_by_default(client):
    r = client.get("/api/ai/status").json()
    assert r["enabled"] is False
    # Image generation must not pretend to work when unconfigured.
    assert client.post("/api/ai/image").status_code == 503
