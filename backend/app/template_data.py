"""Builders for the 15 original invitation templates.

Each template is a full design document the frontend editor renders onto a
Fabric.js canvas. Templates differ by *layout archetype*, decoration set,
palette, and typography - not merely by background colour.

Element schema (shared with the editor and project persistence):
  common: id, type, x, y, width, height, rotation, opacity, locked
  text:   text, fontFamily, fontSize, fill, fontWeight, fontStyle,
          textAlign, lineHeight, charSpacing, field(optional binding key)
  decoration: asset (key into the frontend SVG registry), fill
  shape:  shape(rect|line), fill, stroke, strokeWidth, rx
Placeholder tokens like {{groom_name}} are substituted from wizard data.
"""
from __future__ import annotations

from typing import Any

# Canonical digital-portrait page size (9:16). Print templates scale from this.
W, H = 1080, 1920


def _id(prefix: str, n: int) -> str:
    return f"{prefix}{n}"


def text(
    eid: str,
    value: str,
    y: int,
    *,
    size: int,
    fill: str,
    font: str = "Cormorant Garamond",
    weight: str = "normal",
    style: str = "normal",
    x: int = W // 2,
    width: int = 900,
    align: str = "center",
    line_height: float = 1.25,
    char_spacing: int = 0,
    field: str | None = None,
    rotation: float = 0.0,
) -> dict[str, Any]:
    el: dict[str, Any] = {
        "id": eid,
        "type": "text",
        "x": x,
        "y": y,
        "width": width,
        "rotation": rotation,
        "opacity": 1,
        "locked": False,
        "text": value,
        "fontFamily": font,
        "fontSize": size,
        "fill": fill,
        "fontWeight": weight,
        "fontStyle": style,
        "textAlign": align,
        "lineHeight": line_height,
        "charSpacing": char_spacing,
    }
    if field:
        el["field"] = field
    return el


def deco(eid: str, asset: str, x: int, y: int, w: int, h: int, fill: str, *, rotation: float = 0.0, opacity: float = 1.0) -> dict[str, Any]:
    return {
        "id": eid,
        "type": "decoration",
        "asset": asset,
        "x": x,
        "y": y,
        "width": w,
        "height": h,
        "rotation": rotation,
        "opacity": opacity,
        "locked": False,
        "fill": fill,
    }


def line(eid: str, x: int, y: int, w: int, color: str, thickness: int = 3) -> dict[str, Any]:
    return {
        "id": eid,
        "type": "shape",
        "shape": "line",
        "x": x,
        "y": y,
        "width": w,
        "height": thickness,
        "rotation": 0,
        "opacity": 1,
        "locked": False,
        "stroke": color,
        "strokeWidth": thickness,
    }


def rect(eid: str, x: int, y: int, w: int, h: int, *, fill: str = "", stroke: str = "", stroke_width: int = 0, rx: int = 0, opacity: float = 1.0) -> dict[str, Any]:
    return {
        "id": eid,
        "type": "shape",
        "shape": "rect",
        "x": x,
        "y": y,
        "width": w,
        "height": h,
        "rotation": 0,
        "opacity": opacity,
        "locked": False,
        "fill": fill,
        "stroke": stroke,
        "strokeWidth": stroke_width,
        "rx": rx,
    }


def _body_block(start_id: int, palette: dict[str, str], lang: str, *, y0: int, kn_font: str, en_font: str) -> list[dict[str, Any]]:
    """Centre invitation text block built from language-independent tokens.

    No message text is hardcoded to a language: {{invocation}}, {{invite_line}}
    and {{connector}} are filled from the invitation's language layer, so one
    template serves every language.
    """
    p = palette
    n = start_id
    mf = kn_font  # message font (primary script); names use en_font
    els: list[dict[str, Any]] = []

    els.append(text(_id("t", n), "{{invocation}}", y0, size=40, fill=p["accent"], font=mf, weight="bold", char_spacing=20)); n += 1
    els.append(deco(_id("t", n), "ganesha", W // 2 - 110, y0 + 60, 220, 220, p["accent"])); n += 1
    y = y0 + 320
    els.append(text(_id("t", n), "{{invite_line}}", y, size=32, fill=p["text"], font=mf, line_height=1.4, width=840)); n += 1
    y += 200
    els.append(text(_id("t", n), "{{groom_name}}", y, size=88, fill=p["primary"], font=en_font, weight="bold")); n += 1
    y += 120
    els.append(text(_id("t", n), "{{connector}}", y, size=40, fill=p["accent"], font=mf, style="italic")); n += 1
    y += 90
    els.append(text(_id("t", n), "{{bride_name}}", y, size=88, fill=p["primary"], font=en_font, weight="bold")); n += 1
    y += 160
    els.append(line(_id("t", n), W // 2 - 120, y, 240, p["accent"], 2)); n += 1
    y += 60
    els.append(text(_id("t", n), "{{wedding_date}}  ·  {{muhurtham_time}}", y, size=38, fill=p["text"], font=en_font)); n += 1
    y += 80
    els.append(text(_id("t", n), "{{venue}}", y, size=34, fill=p["text"], font=mf, line_height=1.35, width=840)); n += 1
    return els


def _background(palette: dict[str, str]) -> dict[str, Any]:
    return {"type": "color", "color": palette["bg"]}


# ---- Layout archetypes -----------------------------------------------------

def layout_symmetric_border(palette, lang, decorations, fonts) -> list[dict[str, Any]]:
    """Ornate full border + top & bottom central motif."""
    p = palette
    els = [
        rect("b0", 48, 48, W - 96, H - 96, stroke=p["accent"], stroke_width=4, rx=12),
        rect("b1", 70, 70, W - 140, H - 140, stroke=p["accent"], stroke_width=1, rx=8, opacity=0.6),
        deco("b2", decorations[0], W // 2 - 160, 90, 320, 120, p["accent"]),
        deco("b3", decorations[1], 60, 60, 160, 160, p["accent"]),
        deco("b4", decorations[1], W - 220, 60, 160, 160, p["accent"], rotation=90),
        deco("b5", decorations[1], 60, H - 220, 160, 160, p["accent"], rotation=-90),
        deco("b6", decorations[1], W - 220, H - 220, 160, 160, p["accent"], rotation=180),
        deco("b7", decorations[2], W // 2 - 140, H - 300, 280, 180, p["accent"]),
    ]
    els += _body_block(10, p, lang, y0=360, kn_font=fonts["kn"], en_font=fonts["en"])
    return els


def layout_temple_arch(palette, lang, decorations, fonts) -> list[dict[str, Any]]:
    """Temple gopuram arch framing the content."""
    p = palette
    els = [
        rect("b0", 0, 0, W, 360, fill=p["accent"], opacity=0.12),
        deco("b1", "temple_arch", W // 2 - 360, 60, 720, 420, p["accent"]),
        deco("b2", decorations[1], 80, 520, 150, 420, p["accent"]),
        deco("b3", decorations[1], W - 230, 520, 150, 420, p["accent"], rotation=0),
        deco("b4", "mango_leaves", W // 2 - 300, 420, 600, 120, p["primary"]),
        line("b5", 140, H - 260, W - 280, p["accent"], 2),
        deco("b6", decorations[2], W // 2 - 120, H - 230, 240, 150, p["accent"]),
    ]
    els += _body_block(10, p, lang, y0=560, kn_font=fonts["kn"], en_font=fonts["en"])
    return els


def layout_floral_corners(palette, lang, decorations, fonts) -> list[dict[str, Any]]:
    """Large organic floral corners, airy centre, no hard border."""
    p = palette
    els = [
        deco("b1", decorations[0], -40, -40, 420, 420, p["accent"], opacity=0.9),
        deco("b2", decorations[0], W - 380, -40, 420, 420, p["accent"], rotation=90, opacity=0.9),
        deco("b3", decorations[0], -40, H - 380, 420, 420, p["accent"], rotation=-90, opacity=0.9),
        deco("b4", decorations[0], W - 380, H - 380, 420, 420, p["accent"], rotation=180, opacity=0.9),
        deco("b5", decorations[1], W // 2 - 90, 120, 180, 180, p["primary"]),
    ]
    els += _body_block(10, p, lang, y0=420, kn_font=fonts["kn"], en_font=fonts["en"])
    return els


def layout_minimal_lines(palette, lang, decorations, fonts) -> list[dict[str, Any]]:
    """Minimalist: thin rules, generous whitespace, single small motif."""
    p = palette
    els = [
        line("b1", W // 2 - 60, 180, 120, p["accent"], 2),
        deco("b2", decorations[1], W // 2 - 70, 230, 140, 140, p["accent"]),
        line("b3", 160, H - 240, W - 320, p["accent"], 1),
        text("b4", "{{native_place}}", H - 200, size=28, fill=p["text"], font=fonts["en"], char_spacing=60),
    ]
    els += _body_block(10, p, lang, y0=440, kn_font=fonts["kn"], en_font=fonts["en"])
    return els


def layout_banner_top(palette, lang, decorations, fonts) -> list[dict[str, Any]]:
    """Solid decorative banner header with motif, content below on light panel."""
    p = palette
    els = [
        rect("b0", 0, 0, W, 520, fill=p["primary"]),
        deco("b1", decorations[0], W // 2 - 300, 60, 600, 160, p["bg"]),
        deco("b2", decorations[2], W // 2 - 110, 250, 220, 220, p["bg"]),
        rect("b3", 70, 600, W - 140, H - 740, fill="", stroke=p["accent"], stroke_width=2, rx=16),
        deco("b4", decorations[1], W // 2 - 150, H - 220, 300, 120, p["accent"]),
    ]
    els += _body_block(10, p, lang, y0=640, kn_font=fonts["kn"], en_font=fonts["en"])
    return els


LAYOUTS = {
    "symmetric_border": layout_symmetric_border,
    "temple_arch": layout_temple_arch,
    "floral_corners": layout_floral_corners,
    "minimal_lines": layout_minimal_lines,
    "banner_top": layout_banner_top,
}


# ---- The 15 templates ------------------------------------------------------
# (name, category, layout, palette, decorations[3], fonts, languages)
_SPECS: list[dict[str, Any]] = [
    dict(id="royal-traditional", name="Royal Traditional", category="Royal Traditional",
         layout="symmetric_border",
         palette=dict(bg="#fbf3e4", primary="#7a1226", accent="#b8860b", text="#4a2c12"),
         decorations=["royal_crest", "paisley", "kalash"],
         fonts=dict(en="Cormorant Garamond", kn="Noto Serif Kannada"), langs=["en", "kn", "kn-en", "hi"]),
    dict(id="south-indian-traditional", name="South Indian Traditional", category="South Indian Traditional",
         layout="temple_arch",
         palette=dict(bg="#fff7ec", primary="#a81e2e", accent="#c99700", text="#5a3410"),
         decorations=["kalash", "mango_leaves", "lotus"],
         fonts=dict(en="Cormorant Garamond", kn="Noto Serif Kannada"), langs=["en", "kn", "kn-en"]),
    dict(id="karnataka-wedding", name="Karnataka Wedding", category="Karnataka Wedding",
         layout="symmetric_border",
         palette=dict(bg="#fdf1e7", primary="#8c1d18", accent="#d4a017", text="#4d2e13"),
         decorations=["mysore_gandhabérunda", "paisley", "garland"],
         fonts=dict(en="Playfair Display", kn="Noto Serif Kannada"), langs=["kn", "kn-en", "en"]),
    dict(id="kannada-heritage", name="Kannada Heritage", category="Kannada Heritage",
         layout="banner_top",
         palette=dict(bg="#fbf4ec", primary="#6b2737", accent="#bf9b30", text="#3f2418"),
         decorations=["mandala", "garland", "diya"],
         fonts=dict(en="Cormorant Garamond", kn="Noto Serif Kannada"), langs=["kn", "kn-en"]),
    dict(id="temple-wedding", name="Temple Wedding", category="Temple Wedding",
         layout="temple_arch",
         palette=dict(bg="#fff4e0", primary="#9e3b1f", accent="#caa24a", text="#56351a"),
         decorations=["temple_pillar", "bells", "lotus"],
         fonts=dict(en="Cormorant Garamond", kn="Noto Serif Kannada"), langs=["en", "kn", "kn-en"]),
    dict(id="luxury-gold", name="Luxury Gold", category="Luxury Gold",
         layout="minimal_lines",
         palette=dict(bg="#13110c", primary="#e8c877", accent="#d4af37", text="#e6dcc2"),
         decorations=["gold_ornament", "mandala", "paisley"],
         fonts=dict(en="Playfair Display", kn="Noto Serif Kannada"), langs=["en", "kn-en"]),
    dict(id="red-and-gold", name="Red and Gold", category="Red and Gold",
         layout="symmetric_border",
         palette=dict(bg="#7a0e1f", primary="#ffe9b0", accent="#e8c877", text="#ffe9b0"),
         decorations=["gold_ornament", "paisley", "kalash"],
         fonts=dict(en="Cormorant Garamond", kn="Noto Serif Kannada"), langs=["en", "kn", "kn-en", "hi"]),
    dict(id="floral-wedding", name="Floral Wedding", category="Floral Wedding",
         layout="floral_corners",
         palette=dict(bg="#fff6f3", primary="#b23a5b", accent="#e07a9a", text="#5e2a3a"),
         decorations=["floral_spray", "rose", "lotus"],
         fonts=dict(en="Cormorant Garamond", kn="Noto Sans Kannada"), langs=["en", "kn-en"]),
    dict(id="pastel-wedding", name="Pastel Wedding", category="Pastel Wedding",
         layout="floral_corners",
         palette=dict(bg="#f3f6f4", primary="#5b7a72", accent="#c6a0a8", text="#3f4f4a"),
         decorations=["eucalyptus", "rose", "floral_spray"],
         fonts=dict(en="Cormorant Garamond", kn="Noto Sans Kannada"), langs=["en", "kn-en"]),
    dict(id="minimalist-wedding", name="Minimalist Wedding", category="Minimalist Wedding",
         layout="minimal_lines",
         palette=dict(bg="#faf9f6", primary="#2b2b2b", accent="#9a7b4f", text="#3a3a3a"),
         decorations=["sprig", "dot_motif", "sprig"],
         fonts=dict(en="Cormorant Garamond", kn="Noto Sans Kannada"), langs=["en", "kn-en"]),
    dict(id="modern-elegant", name="Modern Elegant", category="Modern Elegant",
         layout="banner_top",
         palette=dict(bg="#f6f1ea", primary="#1f3b4d", accent="#b08d57", text="#2a3b44"),
         decorations=["art_deco", "sprig", "dot_motif"],
         fonts=dict(en="Playfair Display", kn="Noto Serif Kannada"), langs=["en", "kn-en"]),
    dict(id="peacock-theme", name="Peacock Theme", category="Peacock Theme",
         layout="symmetric_border",
         palette=dict(bg="#f3fbfa", primary="#0d6b63", accent="#1b998b", text="#0b3b36"),
         decorations=["peacock", "peacock_feather", "lotus"],
         fonts=dict(en="Cormorant Garamond", kn="Noto Serif Kannada"), langs=["en", "kn", "kn-en"]),
    dict(id="lotus-theme", name="Lotus Theme", category="Lotus Theme",
         layout="floral_corners",
         palette=dict(bg="#fff4f6", primary="#a3315b", accent="#d98cae", text="#5a2338"),
         decorations=["lotus_mandala", "lotus", "sprig"],
         fonts=dict(en="Cormorant Garamond", kn="Noto Serif Kannada"), langs=["en", "kn", "kn-en"]),
    dict(id="antique-vintage", name="Antique Vintage", category="Antique Vintage",
         layout="symmetric_border",
         palette=dict(bg="#efe6d2", primary="#5b4327", accent="#8a6d3b", text="#451f0a"),
         decorations=["vintage_frame", "paisley", "garland"],
         fonts=dict(en="Playfair Display", kn="Noto Serif Kannada"), langs=["en", "kn-en"]),
    dict(id="premium-designer", name="Premium Designer", category="Premium Designer",
         layout="banner_top",
         palette=dict(bg="#101418", primary="#d9c9a3", accent="#c0a062", text="#e8e0cf"),
         decorations=["art_deco", "mandala", "gold_ornament"],
         fonts=dict(en="Playfair Display", kn="Noto Serif Kannada"), langs=["en", "kn-en"]),
]


def _inside_page(palette: dict[str, str], lang: str, fonts: dict[str, str]) -> dict[str, Any]:
    """A simple editable inside page (family invitation + RSVP)."""
    p = palette
    kn = lang in ("kn", "kn-en")
    fam_font = fonts["kn"] if kn else fonts["en"]
    els = [
        rect("i0", 60, 60, W - 120, H - 120, stroke=p["accent"], stroke_width=2, rx=10),
        deco("i1", "mango_leaves", W // 2 - 240, 110, 480, 110, p["accent"]),
        text("i2", "{{invocation}}", 320, size=38, fill=p["primary"], font=fam_font, weight="bold"),
        text("i3", "{{invitation_message}}", 460, size=34, fill=p["text"], font=fam_font, line_height=1.5, width=840),
        text("i4", "{{invited_by}}", 1120, size=36, fill=p["accent"], font=fam_font, weight="bold"),
        text("i5", "{{family_members}}", 1200, size=32, fill=p["text"], font=fam_font, line_height=1.4, width=840),
        line("i6", W // 2 - 140, 1480, 280, p["accent"], 2),
        text("i7", "{{rsvp_label}}  ·  {{contact}}", 1540, size=32, fill=p["text"], font=fam_font),
        deco("i8", "diya", W // 2 - 120, 1660, 240, 160, p["accent"]),
    ]
    return {"name": "Inside", "width": W, "height": H, "background": _background(p), "elements": els}


WEDDING_OCCASIONS = ["marriage", "engagement", "reception", "save-the-date", "anniversary"]


def _uni_front(p: dict[str, str], fonts: dict[str, str], deco_key: str, lines: list[dict[str, Any]], *, border: bool = True) -> list[dict[str, Any]]:
    """Occasion-neutral centred card. `lines` = [{token,size,role,y}] laid top→bottom."""
    en = fonts["en"]
    els: list[dict[str, Any]] = []
    if border:
        els.append(rect("b0", 48, 48, W - 96, H - 96, stroke=p["accent"], stroke_width=3, rx=14))
    els.append(deco("b1", deco_key, W // 2 - 150, 120, 300, 200, p["accent"]))
    n = 10
    for ln in lines:
        role = ln.get("role", "body")
        fill = {"heading": p["primary"], "accent": p["accent"], "body": p["text"]}.get(role, p["text"])
        weight = "bold" if role == "heading" else "normal"
        style = "italic" if role == "accent" else "normal"
        els.append(text(_id("t", n), ln["token"], ln["y"], size=ln["size"], fill=fill, font=en,
                        weight=weight, style=style, line_height=1.35, width=ln.get("width", 860)))
        n += 1
    els.append(deco("b2", deco_key, W // 2 - 130, H - 300, 260, 180, p["accent"], rotation=180))
    return els


# Universal, occasion-neutral templates (distinct layouts; neutral/occasion tokens).
_UNIVERSAL: list[dict[str, Any]] = [
    dict(id="festive-birthday", name="Festive Birthday", category="Birthday",
         occasions=["birthday", "kids-birthday", "milestone-birthday"],
         palette=dict(bg="#fff8f0", primary="#d1456b", accent="#f2a93b", text="#5a2a3a"),
         deco="floral_spray", fonts=dict(en="Playfair Display", kn="Noto Serif Kannada"),
         langs=["en", "kn-en", "hi"], card_types=["invitation"],
         lines=[
             {"token": "You're Invited", "size": 44, "role": "accent", "y": 360},
             {"token": "{{celebrant_name}}", "size": 100, "role": "heading", "y": 520},
             {"token": "turns {{age}}", "size": 48, "role": "accent", "y": 680},
             {"token": "{{event_date}}  ·  {{event_time}}", "size": 40, "role": "body", "y": 820},
             {"token": "{{venue}}", "size": 36, "role": "body", "y": 920},
         ]),
    dict(id="event-modern", name="Modern Event", category="Event",
         occasions=["baby-shower", "naming-ceremony", "retirement", "graduation", "reunion", "farewell",
                    "festival-celebration", "temple-event", "anniversary", "satyanarayana-pooja"],
         palette=dict(bg="#f6f1ea", primary="#1f3b4d", accent="#b08d57", text="#2a3b44"),
         deco="mandala", fonts=dict(en="Cormorant Garamond", kn="Noto Serif Kannada"),
         langs=["en", "kn", "kn-en", "hi", "ta", "te"], card_types=["invitation", "event"],
         lines=[
             {"token": "{{title}}", "size": 80, "role": "heading", "y": 400},
             {"token": "{{subtitle}}", "size": 40, "role": "accent", "y": 540},
             {"token": "{{event_date}}  ·  {{event_time}}", "size": 42, "role": "body", "y": 700},
             {"token": "{{venue}}", "size": 36, "role": "body", "y": 800},
             {"token": "{{contact}}", "size": 30, "role": "body", "y": 900},
         ]),
    dict(id="corporate-modern", name="Corporate Modern", category="Corporate",
         occasions=["business-launch", "product-launch", "conference", "award-ceremony"],
         palette=dict(bg="#0f1621", primary="#d9c9a3", accent="#4a90d9", text="#cdd6e0"),
         deco="art_deco", fonts=dict(en="Playfair Display", kn="Noto Serif Devanagari"),
         langs=["en", "kn-en", "hi"], card_types=["invitation", "announcement", "event"],
         lines=[
             {"token": "{{organization}}", "size": 40, "role": "accent", "y": 360},
             {"token": "{{title}}", "size": 76, "role": "heading", "y": 500, "width": 900},
             {"token": "{{event_date}}  ·  {{event_time}}", "size": 40, "role": "body", "y": 720},
             {"token": "{{venue}}", "size": 36, "role": "body", "y": 820},
             {"token": "{{registration_url}}", "size": 28, "role": "accent", "y": 920},
         ]),
    dict(id="housewarming-warm", name="Housewarming", category="Family",
         occasions=["housewarming"],
         palette=dict(bg="#fdf3e7", primary="#9e5b22", accent="#caa24a", text="#56351a"),
         deco="kalash", fonts=dict(en="Cormorant Garamond", kn="Noto Serif Kannada"),
         langs=["en", "kn", "kn-en", "te", "ta", "hi"], card_types=["invitation"],
         lines=[
             {"token": "Gruha Pravesham", "size": 48, "role": "accent", "y": 360},
             {"token": "{{family_name}}", "size": 76, "role": "heading", "y": 500},
             {"token": "{{new_address}}", "size": 34, "role": "body", "y": 660, "width": 820},
             {"token": "{{event_date}}  ·  {{event_time}}", "size": 40, "role": "body", "y": 820},
             {"token": "{{hosts}}", "size": 34, "role": "body", "y": 920},
         ]),
    dict(id="greeting-warm", name="Warm Greeting", category="Greeting",
         occasions=["birthday-greeting", "anniversary-greeting", "congratulations", "thank-you", "festival-greeting"],
         palette=dict(bg="#fff6f3", primary="#b23a5b", accent="#e07a9a", text="#5e2a3a"),
         deco="rose", fonts=dict(en="Cormorant Garamond", kn="Noto Serif Kannada"),
         langs=["en", "kn", "kn-en", "hi", "ta", "te", "ml", "bn"], card_types=["greeting", "thank-you"],
         lines=[
             {"token": "{{title}}", "size": 64, "role": "accent", "y": 380},
             {"token": "Dear {{recipient}}", "size": 48, "role": "heading", "y": 540},
             {"token": "{{message}}", "size": 38, "role": "body", "y": 700, "width": 820},
             {"token": "— {{sender}}", "size": 40, "role": "accent", "y": 1100},
         ]),
    dict(id="announcement-minimal", name="Minimal Announcement", category="Announcement",
         occasions=["custom", "save-the-date"],
         palette=dict(bg="#faf9f6", primary="#2b2b2b", accent="#9a7b4f", text="#3a3a3a"),
         deco="dot_motif", fonts=dict(en="Cormorant Garamond", kn="Noto Sans Kannada"),
         langs=["en", "kn-en", "hi", "ar"], card_types=["announcement", "save-the-date", "invitation"],
         lines=[
             {"token": "{{title}}", "size": 84, "role": "heading", "y": 500},
             {"token": "{{subtitle}}", "size": 42, "role": "accent", "y": 660},
             {"token": "{{message}}", "size": 36, "role": "body", "y": 820, "width": 820},
             {"token": "{{event_date}}", "size": 40, "role": "body", "y": 1020},
         ]),
]


def build_templates() -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for spec in _SPECS:
        p = spec["palette"]
        lang_primary = spec["langs"][0]
        front_els = LAYOUTS[spec["layout"]](p, lang_primary, spec["decorations"], spec["fonts"])
        config = {
            "orientation": "portrait",
            "pageFormat": "digital-portrait",
            "width": W,
            "height": H,
            "palette": p,
            "fonts": spec["fonts"],
            "layout": spec["layout"],
            "decorations": spec["decorations"],
            "occasion_compatibility": WEDDING_OCCASIONS,
            "card_types": ["invitation", "save-the-date"],
            "customization": {"colors": True, "fonts": True, "decorations": True, "wording": True},
            "pages": [
                {"name": "Front", "width": W, "height": H, "background": _background(p), "elements": front_els},
                _inside_page(p, lang_primary, spec["fonts"]),
            ],
        }
        out.append({
            "id": spec["id"],
            "template_name": spec["name"],
            "category": spec["category"],
            "preview_path": f"/api/templates/{spec['id']}/preview.svg",
            "configuration": config,
            "supported_languages": spec["langs"],
        })

    # Universal, occasion-neutral templates.
    for spec in _UNIVERSAL:
        p = spec["palette"]
        front_els = _uni_front(p, spec["fonts"], spec["deco"], spec["lines"])
        config = {
            "orientation": "portrait",
            "pageFormat": "digital-portrait",
            "width": W,
            "height": H,
            "palette": p,
            "fonts": spec["fonts"],
            "layout": f"universal:{spec['id']}",
            "decorations": [spec["deco"]],
            "occasion_compatibility": spec["occasions"],
            "card_types": spec["card_types"],
            "customization": {"colors": True, "fonts": True, "decorations": True, "wording": True},
            "pages": [
                {"name": "Front", "width": W, "height": H, "background": _background(p), "elements": front_els},
            ],
        }
        out.append({
            "id": spec["id"],
            "template_name": spec["name"],
            "category": spec["category"],
            "preview_path": f"/api/templates/{spec['id']}/preview.svg",
            "configuration": config,
            "supported_languages": spec["langs"],
        })
    return out
