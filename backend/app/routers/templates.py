"""Templates API + on-the-fly SVG preview thumbnails."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[schemas.TemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    category: str | None = None,
    occasion: str | None = Query(default=None, description="filter to templates compatible with this occasion id"),
    language: str | None = Query(default=None, description="filter to templates supporting this locale/lang"),
):
    stmt = select(models.Template).order_by(models.Template.template_name)
    if category:
        stmt = stmt.where(models.Template.category == category)
    rows = db.scalars(stmt).all()
    if occasion:
        rows = [r for r in rows if occasion in ((r.configuration or {}).get("occasion_compatibility") or [])]
    if language:
        rows = [r for r in rows if language in (r.supported_languages or [])]
    return rows


@router.get("/{template_id}", response_model=schemas.TemplateOut)
def get_template(template_id: str, db: Session = Depends(get_db)):
    tpl = db.get(models.Template, template_id)
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")
    return tpl


@router.get("/{template_id}/preview.svg")
def template_preview(template_id: str, db: Session = Depends(get_db)):
    """Lightweight SVG preview derived from the template palette/layout.

    A compact representation used for gallery cards; the real design is rendered
    by the editor. Kept server-side so cards work before the editor loads.
    """
    tpl = db.get(models.Template, template_id)
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")
    cfg = tpl.configuration or {}
    p = cfg.get("palette", {})
    bg = p.get("bg", "#fbf3e4")
    primary = p.get("primary", "#7a1226")
    accent = p.get("accent", "#b8860b")
    text = p.get("text", "#4a2c12")
    name = tpl.template_name
    svg = f"""<svg xmlns='http://www.w3.org/2000/svg' width='300' height='420' viewBox='0 0 300 420'>
  <rect width='300' height='420' fill='{bg}'/>
  <rect x='14' y='14' width='272' height='392' fill='none' stroke='{accent}' stroke-width='2' rx='6'/>
  <rect x='22' y='22' width='256' height='376' fill='none' stroke='{accent}' stroke-width='0.8' opacity='0.6' rx='4'/>
  <circle cx='150' cy='88' r='30' fill='none' stroke='{accent}' stroke-width='2'/>
  <path d='M135 92 q15 -26 30 0 q-15 14 -30 0 z' fill='{accent}' opacity='0.85'/>
  <text x='150' y='168' text-anchor='middle' font-family='Georgia, serif' font-size='13' fill='{accent}'>Shubha Muhurta</text>
  <text x='150' y='214' text-anchor='middle' font-family='Georgia, serif' font-size='26' fill='{primary}' font-weight='bold'>Groom</text>
  <text x='150' y='244' text-anchor='middle' font-family='Georgia, serif' font-size='15' fill='{accent}' font-style='italic'>weds</text>
  <text x='150' y='278' text-anchor='middle' font-family='Georgia, serif' font-size='26' fill='{primary}' font-weight='bold'>Bride</text>
  <line x1='110' y1='300' x2='190' y2='300' stroke='{accent}' stroke-width='1.5'/>
  <text x='150' y='332' text-anchor='middle' font-family='Georgia, serif' font-size='12' fill='{text}'>{name}</text>
  <path d='M60 372 q90 -34 180 0' fill='none' stroke='{accent}' stroke-width='1.5'/>
</svg>"""
    return Response(content=svg, media_type="image/svg+xml", headers={"Cache-Control": "public, max-age=3600"})
