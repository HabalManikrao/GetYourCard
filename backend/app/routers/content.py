"""Languages, fonts, and wordings - the data powering the multilingual engine."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from .. import schemas
from ..font_data import FALLBACK_SANS, FONTS, fonts_for_script
from ..language_data import LANGUAGES, by_locale
from ..message_data import default_content
from ..wording_data import WORDINGS, by_id

router = APIRouter(prefix="/api", tags=["content"])


@router.get("/languages")
def list_languages(q: str | None = Query(default=None, description="search by name/native/locale")):
    if not q:
        return LANGUAGES
    ql = q.lower()
    return [
        l for l in LANGUAGES
        if ql in l["name"].lower() or ql in l["native_name"].lower() or ql in l["locale"].lower()
    ]


@router.get("/fonts")
def list_fonts(script: str | None = None):
    if script:
        return {"fonts": fonts_for_script(script), "fallback": FALLBACK_SANS.get(script)}
    return {"fonts": FONTS, "fallback": FALLBACK_SANS}


@router.get("/message-defaults/{locale}")
def message_defaults(locale: str):
    """Default localized content for a language layer (new-language scaffolding)."""
    lang = by_locale(locale)
    return {
        "locale": locale,
        "languageName": lang["name"] if lang else locale,
        "direction": lang["direction"] if lang else "ltr",
        "content": default_content(locale),
    }


@router.get("/wordings", response_model=list[schemas.WordingOut])
def list_wordings(language: str | None = None, category: str | None = None):
    rows = WORDINGS
    if language:
        rows = [w for w in rows if w["language"] == language]
    if category:
        rows = [w for w in rows if w["category"] == category]
    return rows


@router.get("/wordings/{wording_id}", response_model=schemas.WordingOut)
def get_wording(wording_id: str):
    w = by_id(wording_id)
    if not w:
        raise HTTPException(status_code=404, detail="Wording not found")
    return w
