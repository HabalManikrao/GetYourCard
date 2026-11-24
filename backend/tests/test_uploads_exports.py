"""Upload validation, export persistence, and security tests."""
from __future__ import annotations

import base64
import io

from PIL import Image


def _png_bytes(w=32, h=32, color=(200, 40, 60)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (w, h), color).save(buf, format="PNG")
    return buf.getvalue()


def test_upload_valid_png(client):
    files = {"file": ("photo.png", _png_bytes(), "image/png")}
    r = client.post("/api/assets/upload", files=files)
    assert r.status_code == 201
    body = r.json()
    assert body["asset_path"].startswith("/api/assets/file/")
    assert body["meta"]["width"] == 32
    # File is actually served back.
    served = client.get(body["asset_path"])
    assert served.status_code == 200


def test_upload_rejects_wrong_type(client):
    files = {"file": ("evil.exe", b"MZ\x90\x00", "application/octet-stream")}
    r = client.post("/api/assets/upload", files=files)
    assert r.status_code == 415


def test_upload_rejects_corrupt_image(client):
    # Claims to be PNG but isn't a decodable image.
    files = {"file": ("fake.png", b"not-a-real-image-payload", "image/png")}
    r = client.post("/api/assets/upload", files=files)
    assert r.status_code == 400


def test_upload_rejects_scripted_svg(client):
    svg = b"<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>"
    files = {"file": ("x.svg", svg, "image/svg+xml")}
    r = client.post("/api/assets/upload", files=files)
    assert r.status_code == 400


def test_export_roundtrip(client):
    design = {"version": 1, "pages": [{"name": "Front", "elements": []}], "languages": [], "details": {}}
    pid = client.post("/api/projects", json={"project_name": "E", "project_data": {"design": design}}).json()["id"]
    data_url = "data:image/png;base64," + base64.b64encode(_png_bytes(64, 64)).decode()
    exp = client.post(
        "/api/exports",
        json={"project_id": pid, "export_format": "png", "resolution": "64x64", "data": data_url},
    )
    assert exp.status_code == 201
    eid = exp.json()["id"]
    # Download the stored export file.
    dl = client.get(f"/api/exports/{eid}/download")
    assert dl.status_code == 200
    assert dl.content[:4] == b"\x89PNG"


def test_export_rejects_bad_base64(client):
    design = {"pages": []}
    pid = client.post("/api/projects", json={"project_name": "E2", "project_data": {"design": design}}).json()["id"]
    r = client.post("/api/exports", json={"project_id": pid, "export_format": "png", "data": "!!!not-valid-base64-data!!!@@@###"})
    assert r.status_code == 400


def test_export_unknown_project(client):
    data_url = "data:image/png;base64," + base64.b64encode(_png_bytes()).decode()
    r = client.post("/api/exports", json={"project_id": "nope", "export_format": "png", "data": data_url})
    assert r.status_code == 404


def test_asset_path_traversal_blocked(client):
    # Attempt to escape the uploads directory is sanitised to a basename.
    r = client.get("/api/assets/file/..%2f..%2f..%2fetc%2fpasswd")
    assert r.status_code in (404, 400)
