"""Export engine. Receives the rendered artwork (base64) from the editor,
persists it, records an export row, and serves the file for download.

The editor rasterizes the live Unicode canvas at the requested resolution
(complex scripts & RTL already shaped by the browser), so every language that
renders in the canvas is preserved byte-for-byte in the exported file.
"""
from __future__ import annotations

import base64
import binascii
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import get_settings
from ..database import get_db
from ..deps import Principal, get_principal, owns

router = APIRouter(prefix="/api/exports", tags=["exports"])
settings = get_settings()

_EXT = {"png": ".png", "jpg": ".jpg", "jpeg": ".jpg", "pdf": ".pdf"}
_MEDIA = {".png": "image/png", ".jpg": "image/jpeg", ".pdf": "application/pdf"}
_MAX_EXPORT_BYTES = 40 * 1024 * 1024  # 40 MB (print-res PDFs can be large)


def _decode(data: str) -> bytes:
    if data.startswith("data:"):
        _, _, b64 = data.partition(",")
    else:
        b64 = data
    try:
        return base64.b64decode(b64, validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(status_code=400, detail="Invalid base64 export payload")


def _owned_project_or_404(db: Session, project_id: str, principal: Principal) -> models.Project:
    project = db.get(models.Project, project_id)
    if not project or not owns(principal, project.user_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _owned_export_or_404(db: Session, export_id: str, principal: Principal) -> models.Export:
    exp = db.get(models.Export, export_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Export not found")
    _owned_project_or_404(db, exp.project_id, principal)
    return exp


@router.post("", response_model=schemas.ExportOut, status_code=201)
def create_export(payload: schemas.ExportCreate, db: Session = Depends(get_db), principal: Principal = Depends(get_principal)):
    project = _owned_project_or_404(db, payload.project_id, principal)

    raw = _decode(payload.data)
    if len(raw) > _MAX_EXPORT_BYTES:
        raise HTTPException(status_code=413, detail="Export payload too large")

    ext = _EXT[payload.export_format.lower()]
    fname = f"{project.id}-{uuid.uuid4().hex[:8]}{ext}"
    dest = settings.exports_dir / fname
    dest.write_bytes(raw)

    exp = models.Export(
        project_id=project.id,
        export_format=payload.export_format.lower().replace("jpeg", "jpg"),
        export_path=f"/api/exports/file/{fname}",
        resolution=payload.resolution,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.get("/{export_id}", response_model=schemas.ExportOut)
def get_export(export_id: str, db: Session = Depends(get_db), principal: Principal = Depends(get_principal)):
    return _owned_export_or_404(db, export_id, principal)


@router.get("/{export_id}/download")
def download_export(export_id: str, db: Session = Depends(get_db), principal: Principal = Depends(get_principal)):
    exp = _owned_export_or_404(db, export_id, principal)
    fname = Path(exp.export_path.rsplit("/", 1)[-1]).name
    path = settings.exports_dir / fname
    if not path.exists():
        raise HTTPException(status_code=404, detail="Export file missing")
    media = _MEDIA.get(path.suffix, "application/octet-stream")
    return FileResponse(path, media_type=media, filename=fname)


@router.get("/file/{filename}")
def serve_export(filename: str, db: Session = Depends(get_db), principal: Principal = Depends(get_principal)):
    safe = Path(filename).name
    # Resolve the export record to enforce ownership before serving the file.
    exp = db.scalar(select(models.Export).where(models.Export.export_path == f"/api/exports/file/{safe}"))
    if not exp:
        raise HTTPException(status_code=404, detail="Export not found")
    _owned_project_or_404(db, exp.project_id, principal)
    path = settings.exports_dir / safe
    if not path.exists():
        raise HTTPException(status_code=404, detail="Export not found")
    return FileResponse(path, media_type=_MEDIA.get(path.suffix, "application/octet-stream"))


@router.get("", response_model=list[schemas.ExportOut])
def list_exports(db: Session = Depends(get_db), principal: Principal = Depends(get_principal), project_id: str | None = None, limit: int = 50):
    stmt = select(models.Export).order_by(models.Export.created_at.desc())
    # Only exports of projects the caller owns.
    if principal.role != "admin":
        owned = select(models.Project.id)
        owned = owned.where(models.Project.user_id.is_(None)) if principal.is_guest else owned.where(models.Project.user_id == principal.id)
        stmt = stmt.where(models.Export.project_id.in_(owned))
    if project_id:
        stmt = stmt.where(models.Export.project_id == project_id)
    return db.scalars(stmt.limit(limit)).all()
