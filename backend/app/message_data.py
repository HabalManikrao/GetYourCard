"""Localized default message strings for the language-independent content model.

Templates reference tokens ({{invocation}}, {{invite_line}}, {{connector}}, ...);
these defaults populate a new language layer when a locale is added. English is
the base; language-specific entries override it, so partial translations degrade
gracefully (untranslated fields fall back to English, never to tofu).
All strings are editable in the studio.
"""
from __future__ import annotations

_BASE_EN = {
    "invocation": "|| Shree Ganeshaya Namaha ||",
    "invite_line": "request the honour of your presence at the wedding ceremony of",
    "connector": "weds",
    "invitation_message": "With the blessings of our elders, we warmly invite you and your family to grace this auspicious occasion with your presence.",
    "invited_by": "Invited by",
    "rsvp_label": "RSVP",
    "reception": "Reception to follow",
}

_OVERRIDES: dict[str, dict[str, str]] = {
    "en": {},
    "kn": {
        "invocation": "ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ",
        "invite_line": "ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ತಾವು ಕುಟುಂಬ ಸಮೇತರಾಗಿ ಆಗಮಿಸಬೇಕೆಂದು ಪ್ರೀತಿಪೂರ್ವಕವಾಗಿ ಆಹ್ವಾನಿಸುತ್ತೇವೆ",
        "invitation_message": "ಹಿರಿಯರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ನಡೆಯುವ ಈ ಶುಭ ಸಮಾರಂಭಕ್ಕೆ ತಾವು ಕುಟುಂಬ ಸಮೇತರಾಗಿ ಆಗಮಿಸಬೇಕಾಗಿ ಪ್ರೀತಿಪೂರ್ವಕವಾಗಿ ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ.",
        "invited_by": "ಆಹ್ವಾನಿಸುವವರು",
        "rsvp_label": "ದಯವಿಟ್ಟು ತಿಳಿಸಿ",
        "reception": "ಆಶೀರ್ವಾದ ಸಮಾರಂಭ",
    },
    "hi": {
        "invocation": "॥ श्री गणेशाय नमः ॥",
        "invite_line": "सादर आमंत्रित करते हैं विवाह समारोह में",
        "invitation_message": "बड़ों के आशीर्वाद से आयोजित इस शुभ अवसर पर सपरिवार पधारने की हार्दिक प्रार्थना है।",
        "invited_by": "आमंत्रणकर्ता",
        "rsvp_label": "कृपया उत्तर दें",
        "reception": "स्वागत समारोह",
    },
    "te": {
        "invocation": "శ్రీ గణేశాయ నమః",
        "invite_line": "వివాహ మహోత్సవానికి సకుటుంబ సమేతంగా విచ్చేయవలసిందిగా ప్రార్థన",
        "invitation_message": "పెద్దల ఆశీర్వాదంతో జరుగు ఈ శుభ సందర్భానికి సకుటుంబంగా విచ్చేసి ఆశీర్వదించమని ప్రార్థన.",
        "invited_by": "ఆహ్వానించువారు",
        "reception": "ఆశీర్వచన సభ",
    },
    "ta": {
        "invocation": "ஸ்ரீ கணேசாய நமஹ",
        "invite_line": "திருமண விழாவிற்கு தங்கள் குடும்பத்துடன் வருகை தர அன்புடன் அழைக்கிறோம்",
        "invitation_message": "பெரியோர்களின் ஆசியுடன் நடைபெறும் இந்த நல்ல நிகழ்விற்கு தாங்கள் குடும்பத்துடன் வருகை தந்து வாழ்த்த வேண்டுகிறோம்.",
        "invited_by": "அழைப்பவர்கள்",
        "reception": "வரவேற்பு விழா",
    },
    "ml": {
        "invocation": "ശ്രീ ഗണേശായ നമഃ",
        "invite_line": "വിവാഹ മംഗല്യ ചടങ്ങിലേക്ക് സകുടുംബം ക്ഷണിക്കുന്നു",
        "invitation_message": "മുതിർന്നവരുടെ അനുഗ്രഹത്തോടെ നടക്കുന്ന ഈ ശുഭ മുഹൂർത്തത്തിലേക്ക് സകുടുംബം എത്തിച്ചേരണമെന്ന് സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു.",
        "invited_by": "ക്ഷണിക്കുന്നവർ",
        "reception": "സ്വീകരണം",
    },
    "mr": {
        "invocation": "॥ श्री गणेशाय नमः ॥",
        "invite_line": "विवाह सोहळ्यास सहपरिवार उपस्थित राहण्याची विनंती",
        "invitation_message": "वडीलधाऱ्यांच्या आशीर्वादाने होणाऱ्या या मंगल प्रसंगी सहपरिवार उपस्थित राहावे ही विनंती.",
        "invited_by": "निमंत्रक",
        "reception": "स्वागत समारंभ",
    },
    "bn": {
        "invocation": "শ্রী গণেশায় নমঃ",
        "invite_line": "বিবাহ অনুষ্ঠানে সপরিবারে উপস্থিত থাকার জন্য সনির্বন্ধ অনুরোধ",
        "invitation_message": "গুরুজনদের আশীর্বাদে অনুষ্ঠিত এই শুভ অনুষ্ঠানে সপরিবারে উপস্থিত থেকে আশীর্বাদ করার জন্য সাদর আমন্ত্রণ।",
        "invited_by": "আমন্ত্রণকর্তা",
        "reception": "সংবর্ধনা",
    },
    "gu": {
        "invocation": "શ્રી ગણેશાય નમઃ",
        "invite_line": "લગ્ન પ્રસંગે સપરિવાર પધારવા હાર્દિક નિમંત્રણ",
        "invitation_message": "વડીલોના આશીર્વાદથી યોજાતા આ શુભ પ્રસંગે સપરિવાર પધારવા વિનંતી.",
        "invited_by": "આમંત્રક",
        "reception": "સ્વાગત સમારંભ",
    },
    "ar": {
        "invocation": "بسم الله الرحمن الرحيم",
        "invite_line": "يتشرفون بدعوتكم لحضور حفل زفاف",
        "connector": "و",
        "invitation_message": "بمباركة من أهلنا الكرام، يسعدنا دعوتكم مع عائلتكم لمشاركتنا فرحتنا في هذه المناسبة المباركة.",
        "invited_by": "الداعون",
        "rsvp_label": "الرجاء تأكيد الحضور",
        "reception": "حفل الاستقبال",
    },
    "ur": {
        "invocation": "بسم اللہ الرحمٰن الرحیم",
        "invite_line": "تقریبِ عقد میں بمع اہلِ خانہ تشریف لانے کی دعوت ہے",
        "connector": "و",
        "invitation_message": "بزرگوں کی دعاؤں سے منعقد ہونے والی اس تقریب میں بمع اہلِ خانہ شرکت کی پرخلوص دعوت ہے۔",
        "invited_by": "دعوت دہندگان",
        "rsvp_label": "براہِ کرم اطلاع دیں",
        "reception": "تقریبِ استقبالیہ",
    },
}


def base_lang(locale: str) -> str:
    return locale.split("-")[0].lower()


def default_content(locale: str) -> dict[str, str]:
    lang = base_lang(locale)
    merged = dict(_BASE_EN)
    merged.update(_OVERRIDES.get(lang, {}))
    return merged
