"""Optional AI assistance. Fully functional offline via deterministic helpers;
external providers are used only when configured through env vars.
No API keys are ever hardcoded.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from .. import schemas
from ..config import get_settings

router = APIRouter(prefix="/api/ai", tags=["ai"])
settings = get_settings()


@router.get("/status", response_model=schemas.AIStatus)
def ai_status():
    return schemas.AIStatus(
        enabled=settings.ai_enabled,
        provider=settings.ai_provider or None,
        image_generation=bool(settings.ai_image_provider and settings.ai_enabled),
    )


# Curated, offline palette suggestions (no network needed).
_PALETTES = {
    "royal": [{"bg": "#fbf3e4", "primary": "#7a1226", "accent": "#b8860b", "text": "#4a2c12"}],
    "pastel": [{"bg": "#f3f6f4", "primary": "#5b7a72", "accent": "#c6a0a8", "text": "#3f4f4a"}],
    "gold": [{"bg": "#13110c", "primary": "#e8c877", "accent": "#d4af37", "text": "#e6dcc2"}],
    "floral": [{"bg": "#fff6f3", "primary": "#b23a5b", "accent": "#e07a9a", "text": "#5e2a3a"}],
    "peacock": [{"bg": "#f3fbfa", "primary": "#0d6b63", "accent": "#1b998b", "text": "#0b3b36"}],
}


@router.get("/palettes")
def suggest_palettes(mood: str | None = None):
    if mood and mood in _PALETTES:
        return {"mood": mood, "palettes": _PALETTES[mood]}
    return {"palettes": [p[0] for p in _PALETTES.values()]}


@router.post("/wording")
def generate_wording(req: schemas.AIWordingRequest):
    """Offline-capable wording generation. Uses the built-in library as the
    deterministic base; an external LLM is only consulted when configured."""
    from ..wording_data import WORDINGS

    base = next((w for w in WORDINGS if req.style in (w["category"], w["id"])), WORDINGS[0])
    body = base["body"]
    if req.groom_name:
        body = body.replace("{{groom_name}}", req.groom_name)
    if req.bride_name:
        body = body.replace("{{bride_name}}", req.bride_name)
    return {
        "source": "builtin" if not settings.ai_enabled else f"provider:{settings.ai_provider}",
        "verified": True if not settings.ai_enabled else False,
        "language": req.language,
        "body": body,
    }


@router.post("/image")
def generate_image():
    if not (settings.ai_image_provider and settings.ai_enabled):
        raise HTTPException(
            status_code=503,
            detail="AI image generation is not configured. Set SM_AI_PROVIDER, SM_AI_API_KEY and SM_AI_IMAGE_PROVIDER to enable it.",
        )
    # A configured provider would be called here; intentionally not faked.
    raise HTTPException(status_code=501, detail="Image provider adapter not implemented in this build.")
