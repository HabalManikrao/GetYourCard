"""Asset uploads with validation + listing. Secure local file handling."""
from __future__ import annotations

import io
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from PIL import Image
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import get_settings
from ..database import get_db

router = APIRouter(prefix="/api/assets", tags=["assets"])
settings = get_settings()

_EXT = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/svg+xml": ".svg"}


def _safe_name(original: str) -> str:
    stem = Path(original).stem[:60]
    stem = "".join(c for c in stem if c.isalnum() or c in ("-", "_")) or "image"
    return stem


@router.get("", response_model=list[schemas.AssetOut])
def list_assets(db: Session = Depends(get_db), asset_type: str | None = None):
    stmt = select(models.Asset).order_by(models.Asset.created_at.desc())
    if asset_type:
        stmt = stmt.where(models.Asset.asset_type == asset_type)
    return db.scalars(stmt).all()


@router.post("/upload", response_model=schemas.AssetOut, status_code=201)
async def upload_asset(
    file: UploadFile = File(...),
    asset_type: str = "upload",
    db: Session = Depends(get_db),
):
    if file.content_type not in settings.allowed_image_types:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")

    raw = await file.read()
    if len(raw) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB limit")
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")

    meta: dict = {"size": len(raw), "content_type": file.content_type}

    # Verify raster images are genuinely decodable (reject corrupt/masquerading files).
    if file.content_type != "image/svg+xml":
        try:
            img = Image.open(io.BytesIO(raw))
            img.verify()
            img2 = Image.open(io.BytesIO(raw))
            meta["width"], meta["height"] = img2.size
        except Exception:
            raise HTTPException(status_code=400, detail="File is not a valid image")
    else:
        head = raw[:512].lstrip().lower()
        if b"<svg" not in head and b"<?xml" not in head:
            raise HTTPException(status_code=400, detail="File is not a valid SVG")
        if b"<script" in raw.lower():
            raise HTTPException(status_code=400, detail="SVG contains script content and was rejected")

    ext = _EXT[file.content_type]
    fname = f"{_safe_name(file.filename or 'image')}-{uuid.uuid4().hex[:8]}{ext}"
    dest = settings.uploads_dir / fname
    dest.write_bytes(raw)

    asset = models.Asset(
        asset_name=file.filename or fname,
        asset_type=asset_type,
        asset_path=f"/api/assets/file/{fname}",
        license="User upload",
        meta=meta,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.get("/file/{filename}")
def serve_asset(filename: str):
    safe = Path(filename).name  # strip any path components
    path = settings.uploads_dir / safe
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="Asset not found")
    return FileResponse(path)


@router.delete("/{asset_id}", status_code=204)
def delete_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = db.get(models.Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    # Remove the stored file if present.
    fname = asset.asset_path.rsplit("/", 1)[-1]
    fpath = settings.uploads_dir / Path(fname).name
    if fpath.exists():
        fpath.unlink()
    db.delete(asset)
    db.commit()
