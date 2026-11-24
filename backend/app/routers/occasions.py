"""Occasion registry API + user-defined custom occasions (Build Your Own)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..occasion_data import OCCASIONS, by_id

router = APIRouter(prefix="/api/occasions", tags=["occasions"])


def _custom_to_out(c: models.CustomOccasion) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "category": c.category,
        "card_types": c.card_types or ["invitation"],
        "fields": c.field_schema or [],
        "custom": True,
    }


@router.get("", response_model=list[schemas.OccasionOut])
def list_occasions(category: str | None = None, db: Session = Depends(get_db)):
    builtin = [{**o, "custom": False} for o in OCCASIONS]
    customs = [_custom_to_out(c) for c in db.scalars(select(models.CustomOccasion)).all()]
    out = builtin + customs
    if category:
        out = [o for o in out if o["category"] == category]
    return out


@router.get("/{occasion_id}", response_model=schemas.OccasionOut)
def get_occasion(occasion_id: str, db: Session = Depends(get_db)):
    o = by_id(occasion_id)
    if o:
        return {**o, "custom": False}
    c = db.get(models.CustomOccasion, occasion_id)
    if c:
        return _custom_to_out(c)
    raise HTTPException(status_code=404, detail="Occasion not found")


@router.get("/{occasion_id}/fields", response_model=list[schemas.OccasionField])
def get_occasion_fields(occasion_id: str, db: Session = Depends(get_db)):
    o = by_id(occasion_id)
    if o:
        return o["fields"]
    c = db.get(models.CustomOccasion, occasion_id)
    if c:
        return c.field_schema or []
    raise HTTPException(status_code=404, detail="Occasion not found")


@router.post("/custom", response_model=schemas.CustomOccasionOut, status_code=201)
def create_custom(payload: schemas.CustomOccasionCreate, db: Session = Depends(get_db)):
    c = models.CustomOccasion(
        name=payload.name,
        category=payload.category or "Custom",
        card_types=payload.card_types,
        field_schema=[fld.model_dump(exclude_none=True) for fld in payload.field_schema],
        configuration=payload.configuration,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.put("/custom/{occasion_id}", response_model=schemas.CustomOccasionOut)
def update_custom(occasion_id: str, payload: schemas.CustomOccasionCreate, db: Session = Depends(get_db)):
    c = db.get(models.CustomOccasion, occasion_id)
    if not c:
        raise HTTPException(status_code=404, detail="Custom occasion not found")
    c.name = payload.name
    c.category = payload.category or "Custom"
    c.card_types = payload.card_types
    c.field_schema = [fld.model_dump(exclude_none=True) for fld in payload.field_schema]
    c.configuration = payload.configuration
    db.commit()
    db.refresh(c)
    return c


@router.delete("/custom/{occasion_id}", status_code=204)
def delete_custom(occasion_id: str, db: Session = Depends(get_db)):
    c = db.get(models.CustomOccasion, occasion_id)
    if not c:
        raise HTTPException(status_code=404, detail="Custom occasion not found")
    db.delete(c)
    db.commit()
