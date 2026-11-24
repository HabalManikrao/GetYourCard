"""Dynamic font registry.

Each font declares which scripts it covers so the editor can:
  1. detect a text element's script,
  2. check whether the chosen font covers it,
  3. offer compatible fonts / a fallback chain,
  4. warn when coverage is missing (never silently render tofu boxes).

`source=google` fonts are loaded on demand from the Google Fonts CSS2 API by
the frontend font loader; `weights` feed the `wght@` axis. Custom uploaded
fonts are appended to this registry at runtime (source=custom).
"""
from __future__ import annotations

from typing import Any


def f(family: str, scripts: list[str], weights: list[int], *, serif: bool, license: str = "SIL Open Font License 1.1", source: str = "google", styles: list[str] | None = None) -> dict[str, Any]:
    return {
        "family": family,
        "scripts": scripts,
        "weights": weights,
        "styles": styles or ["normal"],
        "serif": serif,
        "source": source,
        "license": license,
        "available": True,
    }


FONTS: list[dict[str, Any]] = [
    # Latin display/body (also cover Greek/Cyrillic/Vietnamese/Turkish via Noto)
    f("Cormorant Garamond", ["Latin"], [400, 500, 600, 700], serif=True, styles=["normal", "italic"]),
    f("Playfair Display", ["Latin"], [400, 500, 600, 700, 800], serif=True, styles=["normal", "italic"]),
    f("Noto Serif", ["Latin", "Greek", "Cyrillic"], [400, 600, 700], serif=True),
    f("Noto Sans", ["Latin", "Greek", "Cyrillic"], [400, 500, 600, 700], serif=False),
    # Indic
    f("Noto Serif Kannada", ["Kannada"], [400, 500, 600, 700], serif=True),
    f("Noto Sans Kannada", ["Kannada"], [400, 500, 600, 700], serif=False),
    f("Noto Serif Devanagari", ["Devanagari"], [400, 500, 600, 700], serif=True),
    f("Noto Sans Devanagari", ["Devanagari"], [400, 500, 600, 700], serif=False),
    f("Noto Serif Telugu", ["Telugu"], [400, 600, 700], serif=True),
    f("Noto Sans Telugu", ["Telugu"], [400, 600, 700], serif=False),
    f("Noto Serif Tamil", ["Tamil"], [400, 600, 700], serif=True),
    f("Noto Sans Tamil", ["Tamil"], [400, 600, 700], serif=False),
    f("Noto Serif Malayalam", ["Malayalam"], [400, 600, 700], serif=True),
    f("Noto Sans Malayalam", ["Malayalam"], [400, 600, 700], serif=False),
    f("Noto Serif Bengali", ["Bengali"], [400, 600, 700], serif=True),
    f("Noto Sans Bengali", ["Bengali"], [400, 600, 700], serif=False),
    f("Noto Sans Gujarati", ["Gujarati"], [400, 600, 700], serif=False),
    f("Noto Serif Gujarati", ["Gujarati"], [400, 600, 700], serif=True),
    f("Noto Sans Gurmukhi", ["Gurmukhi"], [400, 600, 700], serif=False),
    f("Noto Serif Gurmukhi", ["Gurmukhi"], [400, 600, 700], serif=True),
    f("Noto Sans Oriya", ["Odia"], [400, 600, 700], serif=False),
    f("Noto Serif Oriya", ["Odia"], [400, 600, 700], serif=True),
    # RTL / Arabic family
    f("Noto Naskh Arabic", ["Arabic"], [400, 600, 700], serif=True),
    f("Noto Sans Arabic", ["Arabic"], [400, 600, 700], serif=False),
    f("Noto Nastaliq Urdu", ["Nastaliq", "Arabic"], [400, 600, 700], serif=True),
    f("Noto Serif Hebrew", ["Hebrew"], [400, 600, 700], serif=True),
    f("Noto Sans Hebrew", ["Hebrew"], [400, 600, 700], serif=False),
    # CJK
    f("Noto Serif SC", ["HanSC"], [400, 600, 700], serif=True),
    f("Noto Sans SC", ["HanSC"], [400, 500, 700], serif=False),
    f("Noto Serif TC", ["HanTC"], [400, 600, 700], serif=True),
    f("Noto Sans TC", ["HanTC"], [400, 500, 700], serif=False),
    f("Noto Serif JP", ["Japanese"], [400, 600, 700], serif=True),
    f("Noto Sans JP", ["Japanese"], [400, 500, 700], serif=False),
    f("Noto Serif KR", ["Korean"], [400, 600, 700], serif=True),
    f("Noto Sans KR", ["Korean"], [400, 500, 700], serif=False),
    # SE Asian / other scripts
    f("Noto Serif Thai", ["Thai"], [400, 600, 700], serif=True),
    f("Noto Sans Thai", ["Thai"], [400, 600, 700], serif=False),
    f("Noto Sans Meetei Mayek", ["MeeteiMayek"], [400, 700], serif=False),
    f("Noto Sans Ol Chiki", ["OlChiki"], [400, 700], serif=False),
]

# Per-script fallback chain (first available font that covers the script).
FALLBACK_SANS = {
    "Latin": "Noto Sans",
    "Greek": "Noto Sans",
    "Cyrillic": "Noto Sans",
    "Kannada": "Noto Sans Kannada",
    "Devanagari": "Noto Sans Devanagari",
    "Telugu": "Noto Sans Telugu",
    "Tamil": "Noto Sans Tamil",
    "Malayalam": "Noto Sans Malayalam",
    "Bengali": "Noto Sans Bengali",
    "Gujarati": "Noto Sans Gujarati",
    "Gurmukhi": "Noto Sans Gurmukhi",
    "Odia": "Noto Sans Oriya",
    "Arabic": "Noto Sans Arabic",
    "Nastaliq": "Noto Nastaliq Urdu",
    "Hebrew": "Noto Sans Hebrew",
    "HanSC": "Noto Sans SC",
    "HanTC": "Noto Sans TC",
    "Japanese": "Noto Sans JP",
    "Korean": "Noto Sans KR",
    "Thai": "Noto Sans Thai",
    "MeeteiMayek": "Noto Sans Meetei Mayek",
    "OlChiki": "Noto Sans Ol Chiki",
}


def fonts_for_script(script: str) -> list[dict[str, Any]]:
    return [ft for ft in FONTS if script in ft["scripts"]]
