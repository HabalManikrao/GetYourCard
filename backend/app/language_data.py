"""Extensible language registry for the universal multilingual engine.

No language is special-cased in the editor. Adding a language = adding an entry
here (and, if a new script, a font in font_data.py). Each entry:
  locale        BCP-47 locale tag
  name          English name
  native_name   endonym (shown in the picker, rendered in its own script)
  direction     "ltr" | "rtl"
  script        ISO 15924-ish script key (matches font_data coverage keys)
  fonts         ordered recommended font families (first = default)
"""
from __future__ import annotations

from typing import Any

# script -> default serif/sans Noto families used when building entries
_S = {
    "Latin": ["Cormorant Garamond", "Playfair Display", "Noto Serif", "Noto Sans"],
    "Devanagari": ["Noto Serif Devanagari", "Noto Sans Devanagari"],
    "Kannada": ["Noto Serif Kannada", "Noto Sans Kannada"],
    "Telugu": ["Noto Serif Telugu", "Noto Sans Telugu"],
    "Tamil": ["Noto Serif Tamil", "Noto Sans Tamil"],
    "Malayalam": ["Noto Serif Malayalam", "Noto Sans Malayalam"],
    "Bengali": ["Noto Serif Bengali", "Noto Sans Bengali"],
    "Gujarati": ["Noto Sans Gujarati", "Noto Serif Gujarati"],
    "Gurmukhi": ["Noto Sans Gurmukhi", "Noto Serif Gurmukhi"],
    "Odia": ["Noto Sans Oriya", "Noto Serif Oriya"],
    "Arabic": ["Noto Naskh Arabic", "Noto Sans Arabic"],
    "Nastaliq": ["Noto Nastaliq Urdu", "Noto Naskh Arabic"],
    "Hebrew": ["Noto Serif Hebrew", "Noto Sans Hebrew"],
    "HanSC": ["Noto Serif SC", "Noto Sans SC"],
    "HanTC": ["Noto Serif TC", "Noto Sans TC"],
    "Japanese": ["Noto Serif JP", "Noto Sans JP"],
    "Korean": ["Noto Serif KR", "Noto Sans KR"],
    "Thai": ["Noto Serif Thai", "Noto Sans Thai"],
    "Greek": ["Noto Serif", "Noto Sans"],
    "Cyrillic": ["Noto Serif", "Noto Sans"],
    "MeeteiMayek": ["Noto Sans Meetei Mayek"],
    "OlChiki": ["Noto Sans Ol Chiki"],
}


def _lang(locale: str, name: str, native: str, script: str, direction: str = "ltr") -> dict[str, Any]:
    return {
        "locale": locale,
        "name": name,
        "native_name": native,
        "direction": direction,
        "script": script,
        "fonts": list(_S[script]),
    }


# Indian languages
_INDIAN = [
    _lang("kn-IN", "Kannada", "ಕನ್ನಡ", "Kannada"),
    _lang("en-IN", "English", "English", "Latin"),
    _lang("hi-IN", "Hindi", "हिन्दी", "Devanagari"),
    _lang("te-IN", "Telugu", "తెలుగు", "Telugu"),
    _lang("ta-IN", "Tamil", "தமிழ்", "Tamil"),
    _lang("ml-IN", "Malayalam", "മലയാളം", "Malayalam"),
    _lang("mr-IN", "Marathi", "मराठी", "Devanagari"),
    _lang("bn-IN", "Bengali", "বাংলা", "Bengali"),
    _lang("gu-IN", "Gujarati", "ગુજરાતી", "Gujarati"),
    _lang("pa-IN", "Punjabi", "ਪੰਜਾਬੀ", "Gurmukhi"),
    _lang("or-IN", "Odia", "ଓଡ଼ିଆ", "Odia"),
    _lang("as-IN", "Assamese", "অসমীয়া", "Bengali"),
    _lang("ur-IN", "Urdu", "اردو", "Nastaliq", direction="rtl"),
    _lang("sa-IN", "Sanskrit", "संस्कृतम्", "Devanagari"),
    _lang("kok-IN", "Konkani", "कोंकणी", "Devanagari"),
    _lang("tcy-IN", "Tulu", "ತುಳು", "Kannada"),
    _lang("ks-IN", "Kashmiri", "کٲشُر", "Nastaliq", direction="rtl"),
    _lang("sd-IN", "Sindhi", "سنڌي", "Arabic", direction="rtl"),
    _lang("mni-IN", "Manipuri", "ꯃꯤꯇꯩ ꯂꯣꯟ", "MeeteiMayek"),
    _lang("ne-NP", "Nepali", "नेपाली", "Devanagari"),
    _lang("brx-IN", "Bodo", "बर'", "Devanagari"),
    _lang("sat-IN", "Santali", "ᱥᱟᱱᱛᱟᱲᱤ", "OlChiki"),
    _lang("mai-IN", "Maithili", "मैथिली", "Devanagari"),
    _lang("doi-IN", "Dogri", "डोगरी", "Devanagari"),
]

# International languages
_INTL = [
    _lang("ar-SA", "Arabic", "العربية", "Arabic", direction="rtl"),
    _lang("zh-CN", "Chinese (Simplified)", "简体中文", "HanSC"),
    _lang("zh-TW", "Chinese (Traditional)", "繁體中文", "HanTC"),
    _lang("ja-JP", "Japanese", "日本語", "Japanese"),
    _lang("ko-KR", "Korean", "한국어", "Korean"),
    _lang("fr-FR", "French", "Français", "Latin"),
    _lang("de-DE", "German", "Deutsch", "Latin"),
    _lang("es-ES", "Spanish", "Español", "Latin"),
    _lang("pt-PT", "Portuguese", "Português", "Latin"),
    _lang("it-IT", "Italian", "Italiano", "Latin"),
    _lang("ru-RU", "Russian", "Русский", "Cyrillic"),
    _lang("tr-TR", "Turkish", "Türkçe", "Latin"),
    _lang("fa-IR", "Persian", "فارسی", "Arabic", direction="rtl"),
    _lang("th-TH", "Thai", "ไทย", "Thai"),
    _lang("id-ID", "Indonesian", "Bahasa Indonesia", "Latin"),
    _lang("vi-VN", "Vietnamese", "Tiếng Việt", "Latin"),
    _lang("sw-KE", "Swahili", "Kiswahili", "Latin"),
    _lang("nl-NL", "Dutch", "Nederlands", "Latin"),
    _lang("el-GR", "Greek", "Ελληνικά", "Greek"),
    _lang("he-IL", "Hebrew", "עברית", "Hebrew", direction="rtl"),
]

LANGUAGES: list[dict[str, Any]] = _INDIAN + _INTL


def by_locale(locale: str) -> dict[str, Any] | None:
    return next((l for l in LANGUAGES if l["locale"] == locale), None)
