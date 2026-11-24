"""Editable invitation wording library (8 styles, bilingual where relevant)."""
from __future__ import annotations

from typing import Any

WORDINGS: list[dict[str, Any]] = [
    {
        "id": "traditional-hindu",
        "title": "Traditional Hindu Wedding",
        "language": "en",
        "category": "traditional",
        "body": (
            "|| Shree Ganeshaya Namaha ||\n\n"
            "With the blessings of the Almighty and our beloved elders, we cordially "
            "invite you to celebrate the auspicious wedding ceremony of\n\n"
            "{{groom_name}}\nweds\n{{bride_name}}\n\n"
            "on {{wedding_date}} at {{muhurtham_time}}\n{{venue}}"
        ),
    },
    {
        "id": "kannada-traditional",
        "title": "Kannada Traditional",
        "language": "kn",
        "category": "traditional",
        "body": (
            "ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ\n\n"
            "ಭಗವಂತನ ಕೃಪೆ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ನಮ್ಮ ಕುಟುಂಬದ ಶುಭ ಸಮಾರಂಭವಾದ "
            "ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ತಾವು ಕುಟುಂಬ ಸಮೇತರಾಗಿ ಆಗಮಿಸಿ ವಧು-ವರರನ್ನು ಆಶೀರ್ವದಿಸಬೇಕಾಗಿ "
            "ಪ್ರೀತಿಪೂರ್ವಕವಾಗಿ ಆಹ್ವಾನಿಸುತ್ತೇವೆ.\n\n"
            "ವರ: {{groom_name}}\nವಧು: {{bride_name}}\n\n"
            "ದಿನಾಂಕ: {{wedding_date}}  •  ಮುಹೂರ್ತ: {{muhurtham_time}}\n{{venue}}"
        ),
    },
    {
        "id": "south-indian",
        "title": "South Indian Wedding",
        "language": "en",
        "category": "traditional",
        "body": (
            "Shubhamastu\n\n"
            "Together with their families\n\n{{groom_name}}\n&\n{{bride_name}}\n\n"
            "joyfully request the pleasure of your company as they begin their new "
            "life together on {{wedding_date}}, {{muhurtham_time}}, at {{venue}}."
        ),
    },
    {
        "id": "modern-wedding",
        "title": "Modern Wedding",
        "language": "en",
        "category": "modern",
        "body": (
            "We're getting married!\n\n{{groom_name}}  &  {{bride_name}}\n\n"
            "Join us to celebrate on {{wedding_date}} at {{venue}}.\n"
            "Your presence is the only present we need."
        ),
    },
    {
        "id": "formal-family",
        "title": "Formal Family Invitation",
        "language": "en",
        "category": "formal",
        "body": (
            "Mr. & Mrs. {{groom_parents}}\nrequest the honour of your presence\n"
            "at the marriage of their son\n\n{{groom_name}}\n\nto\n\n{{bride_name}}\n\n"
            "daughter of Mr. & Mrs. {{bride_parents}}\n\n"
            "on {{wedding_date}} at {{muhurtham_time}}\n{{venue}}"
        ),
    },
    {
        "id": "simple-elegant",
        "title": "Simple & Elegant",
        "language": "en",
        "category": "modern",
        "body": (
            "{{groom_name}}\n&\n{{bride_name}}\n\n"
            "request the honour of your presence\n"
            "{{wedding_date}}  •  {{muhurtham_time}}\n{{venue}}"
        ),
    },
    {
        "id": "english-classic",
        "title": "English Classic",
        "language": "en",
        "category": "formal",
        "body": (
            "With great pleasure and the blessings of our elders, we invite you to "
            "share in our joy as we celebrate the wedding of\n\n"
            "{{groom_name}}\nand\n{{bride_name}}\n\n"
            "on {{wedding_date}} at {{muhurtham_time}}.\n{{venue}}\n\n"
            "Reception to follow."
        ),
    },
    {
        "id": "bilingual-kn-en",
        "title": "Bilingual (Kannada + English)",
        "language": "kn-en",
        "category": "bilingual",
        "body": (
            "ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ  |  Shree Ganeshaya Namaha\n\n"
            "ನಮ್ಮ ಕುಟುಂಬದ ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ತಮ್ಮನ್ನು ಸಾದರವಾಗಿ ಆಹ್ವಾನಿಸುತ್ತೇವೆ.\n"
            "We warmly invite you to the wedding celebration of\n\n"
            "{{groom_name}}  —  {{bride_name}}\n\n"
            "ದಿನಾಂಕ / Date: {{wedding_date}}   ಮುಹೂರ್ತ / Muhurtham: {{muhurtham_time}}\n{{venue}}"
        ),
    },
]


def by_id(wid: str) -> dict[str, Any] | None:
    return next((w for w in WORDINGS if w["id"] == wid), None)
