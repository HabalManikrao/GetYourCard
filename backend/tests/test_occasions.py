"""Universal occasion platform: registry, fields, custom occasions, backward-compat."""
from __future__ import annotations


def test_occasions_registry(client):
    data = client.get("/api/occasions").json()
    ids = {o["id"] for o in data}
    assert {"marriage", "birthday", "housewarming", "business-launch", "thank-you", "custom"} <= ids
    cats = {o["category"] for o in data}
    assert {"Wedding", "Birthday", "Corporate", "Greeting", "Family", "Religious"} <= cats


def test_wedding_fields_backward_compatible(client):
    fields = client.get("/api/occasions/marriage/fields").json()
    keys = {f["key"] for f in fields}
    assert {"groom_name", "bride_name", "wedding_date"} <= keys
    groom = next(f for f in fields if f["key"] == "groom_name")
    assert groom["required"] is True and groom["group"] == "Groom Details"
    assert groom["placeholder"] == "e.g. Arjun Kumar"


def test_greeting_occasion_has_no_wedding_fields(client):
    fields = client.get("/api/occasions/thank-you/fields").json()
    keys = {f["key"] for f in fields}
    assert "groom_name" not in keys and "bride_name" not in keys
    assert {"recipient", "message", "sender"} <= keys


def test_custom_occasion_crud(client):
    payload = {
        "name": "Village Festival",
        "category": "Custom",
        "card_types": ["invitation"],
        "field_schema": [
            {"key": "title", "label": "Title", "type": "text", "required": True, "group": "Details"},
            {"key": "host", "label": "Host", "type": "text", "required": False, "group": "Details"},
        ],
    }
    created = client.post("/api/occasions/custom", json=payload).json()
    oid = created["id"]
    # It is now listed and fetchable like any occasion.
    assert any(o["id"] == oid for o in client.get("/api/occasions").json())
    fetched = client.get(f"/api/occasions/{oid}").json()
    assert fetched["custom"] is True
    assert {f["key"] for f in fetched["fields"]} == {"title", "host"}
    # Update + delete.
    payload["name"] = "Village Mela"
    assert client.put(f"/api/occasions/custom/{oid}", json=payload).json()["name"] == "Village Mela"
    assert client.delete(f"/api/occasions/custom/{oid}").status_code == 204
    assert client.get(f"/api/occasions/{oid}").status_code == 404


def test_project_carries_occasion(client):
    design = {"pages": [], "languages": [], "details": {"celebrant_name": "Aarav"}}
    p = client.post("/api/projects", json={
        "project_name": "Aarav's Birthday", "occasion_id": "birthday", "project_type": "invitation",
        "project_data": {"design": design},
    }).json()
    assert p["occasion_id"] == "birthday"
    assert p["project_type"] == "invitation"
    assert p["schema_version"] == 1
    # Reopen preserves it.
    assert client.get(f"/api/projects/{p['id']}").json()["occasion_id"] == "birthday"


def test_universal_templates_present(client):
    tpls = client.get("/api/templates").json()
    assert len(tpls) >= 20
    # Birthday-compatible template exists and is distinct from wedding ones.
    bday = client.get("/api/templates?occasion=birthday").json()
    assert any(t["id"] == "festive-birthday" for t in bday)
