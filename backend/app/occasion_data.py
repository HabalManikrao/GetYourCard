"""Extensible occasion registry — turns Shubha Muhurta from a wedding-only app
into a universal invitation / greeting / event card platform.

No occasion is hardcoded into the editor; the editor renders generic elements.
An occasion defines *which content fields* its wizard form shows (the dynamic
form engine reads `fields`) and which card types it supports. Field values are
stored in the project's generic `details` map (backward-compatible: wedding keeps
its existing keys like groom_name/bride_name).

Field types: text, multiline, date, time, datetime, address, phone, email,
image, url, select, boolean, list.
"""
from __future__ import annotations

from typing import Any

CARD_TYPES = ["invitation", "greeting", "announcement", "event", "thank-you", "save-the-date"]


def f(key: str, label: str, ftype: str = "text", *, required: bool = False, group: str = "Details",
      placeholder: str = "", options: list[str] | None = None) -> dict[str, Any]:
    d: dict[str, Any] = {"key": key, "label": label, "type": ftype, "required": required, "group": group}
    if placeholder:
        d["placeholder"] = placeholder
    if options:
        d["options"] = options
    return d


# ---- Reusable field groups -------------------------------------------------
def _event_fields(group: str = "Event") -> list[dict[str, Any]]:
    return [
        f("event_date", "Date", "date", required=True, group=group),
        f("event_time", "Time", "time", group=group),
        f("venue", "Venue", "text", group=group),
        f("venue_address", "Address", "address", group=group),
        f("contact", "Contact / RSVP", "phone", group=group),
    ]


# Wedding reproduces the existing fields EXACTLY (keys + placeholders) so saved
# wedding projects, templates, and tests remain fully compatible.
_WEDDING_FIELDS = [
    f("groom_name", "Groom full name", required=True, group="Groom Details", placeholder="e.g. Arjun Kumar"),
    f("groom_parents", "Groom's parents", group="Groom Details", placeholder="Mr. & Mrs. ..."),
    f("groom_surname", "Family surname", group="Groom Details"),
    f("groom_native", "Native place", group="Groom Details"),
    f("bride_name", "Bride full name", required=True, group="Bride Details", placeholder="e.g. Meera Rao"),
    f("bride_parents", "Bride's parents", group="Bride Details", placeholder="Mr. & Mrs. ..."),
    f("bride_surname", "Family surname", group="Bride Details"),
    f("bride_native", "Native place", group="Bride Details"),
    f("wedding_date", "Wedding date", "text", required=True, group="Wedding Details", placeholder="12 Feb 2026"),
    f("wedding_day", "Wedding day", group="Wedding Details", placeholder="Thursday"),
    f("muhurtham_time", "Muhurtham time", group="Wedding Details", placeholder="10:30 AM"),
    f("venue", "Wedding venue", group="Wedding Details"),
    f("venue_address", "Venue address", "address", group="Wedding Details"),
    f("reception_date", "Reception date", "text", group="Wedding Details"),
    f("reception_time", "Reception time", group="Wedding Details"),
    f("maps_url", "Google Maps URL", "url", group="Wedding Details"),
    f("grandparents", "Grandparents' names", group="Family & Invitation"),
    f("invitation_message", "Invitation message", "multiline", group="Family & Invitation"),
    f("family_members", "Family members (inviting)", group="Family & Invitation"),
    f("contact", "Contact / RSVP", "phone", group="Family & Invitation"),
]


def _occ(oid: str, name: str, category: str, fields: list[dict[str, Any]], *,
         card_types: list[str] | None = None) -> dict[str, Any]:
    return {
        "id": oid,
        "name": name,
        "category": category,
        "card_types": card_types or ["invitation"],
        "fields": fields,
    }


OCCASIONS: list[dict[str, Any]] = [
    # --- Wedding ---
    _occ("marriage", "Marriage", "Wedding", _WEDDING_FIELDS,
         card_types=["invitation", "save-the-date"]),
    _occ("engagement", "Engagement", "Wedding", [
        f("groom_name", "Groom name", required=True, group="Couple", placeholder="e.g. Arjun"),
        f("bride_name", "Bride name", required=True, group="Couple", placeholder="e.g. Meera"),
        *_event_fields("Ceremony"),
    ], card_types=["invitation", "save-the-date"]),
    _occ("reception", "Reception", "Wedding", [
        f("groom_name", "Groom name", required=True, group="Couple"),
        f("bride_name", "Bride name", required=True, group="Couple"),
        *_event_fields("Reception"),
    ]),
    _occ("save-the-date", "Save the Date", "Wedding", [
        f("groom_name", "Name 1", required=True, group="Couple"),
        f("bride_name", "Name 2", required=True, group="Couple"),
        f("event_date", "Wedding date", "text", required=True, group="Date", placeholder="12 Feb 2026"),
        f("venue", "City / venue", group="Date"),
    ], card_types=["save-the-date"]),
    _occ("anniversary", "Anniversary", "Wedding", [
        f("title", "Couple names", required=True, group="Details", placeholder="Arjun & Meera"),
        f("years", "Years together", "text", group="Details", placeholder="25"),
        *_event_fields("Celebration"),
    ], card_types=["invitation", "greeting"]),

    # --- Birthday ---
    _occ("birthday", "Birthday Party", "Birthday", [
        f("celebrant_name", "Birthday person", required=True, group="Details", placeholder="e.g. Aarav"),
        f("age", "Turning (age)", "text", group="Details", placeholder="30"),
        *_event_fields("Party"),
    ]),
    _occ("kids-birthday", "Kids Birthday", "Birthday", [
        f("celebrant_name", "Child's name", required=True, group="Details"),
        f("age", "Turning", "text", group="Details"),
        f("theme", "Party theme", group="Details"),
        *_event_fields("Party"),
    ]),
    _occ("milestone-birthday", "Milestone Birthday", "Birthday", [
        f("celebrant_name", "Name", required=True, group="Details"),
        f("age", "Milestone age", "text", required=True, group="Details", placeholder="50"),
        *_event_fields("Celebration"),
    ]),

    # --- Family ---
    _occ("baby-shower", "Baby Shower", "Family", [
        f("parents", "Parents-to-be", required=True, group="Details"),
        *_event_fields("Event"),
    ]),
    _occ("naming-ceremony", "Naming / Cradle Ceremony", "Family", [
        f("baby_name", "Baby's name", group="Details"),
        f("parents", "Parents", required=True, group="Details"),
        *_event_fields("Ceremony"),
    ]),
    _occ("housewarming", "Housewarming / Griha Pravesh", "Family", [
        f("family_name", "Family name", required=True, group="Details", placeholder="The Sharma Family"),
        f("new_address", "New home address", "address", group="Details"),
        f("event_date", "Pooja date", "date", required=True, group="Ceremony"),
        f("event_time", "Ceremony time", "time", group="Ceremony"),
        f("hosts", "Hosts", group="Ceremony"),
        f("contact", "Contact / RSVP", "phone", group="Ceremony"),
    ]),
    _occ("retirement", "Retirement", "Family", [
        f("honoree", "Retiree name", required=True, group="Details"),
        *_event_fields("Event"),
    ]),
    _occ("graduation", "Graduation", "Family", [
        f("graduate", "Graduate name", required=True, group="Details"),
        f("institution", "Institution", group="Details"),
        *_event_fields("Ceremony"),
    ]),

    # --- Religious ---
    _occ("satyanarayana-pooja", "Satyanarayana Swamy Vratha", "Religious", [
        f("hosts", "Hosts", required=True, group="Details"),
        f("event_date", "Pooja date", "date", required=True, group="Pooja"),
        f("event_time", "Time", "time", group="Pooja"),
        f("venue", "Venue", group="Pooja"),
        f("contact", "Contact", "phone", group="Pooja"),
    ]),
    _occ("festival-celebration", "Festival Celebration", "Religious", [
        f("title", "Festival", required=True, group="Details", placeholder="Diwali / Ugadi"),
        f("hosts", "Hosts", group="Details"),
        *_event_fields("Event"),
    ], card_types=["invitation", "greeting"]),
    _occ("temple-event", "Temple Event", "Religious", [
        f("title", "Event title", required=True, group="Details"),
        f("temple", "Temple", group="Details"),
        *_event_fields("Event"),
    ]),

    # --- Corporate ---
    _occ("business-launch", "Business Launch", "Corporate", [
        f("organization", "Organization", required=True, group="Details"),
        f("title", "Event title", group="Details"),
        *_event_fields("Event"),
        f("registration_url", "Registration link", "url", group="Event"),
    ], card_types=["invitation", "announcement", "event"]),
    _occ("product-launch", "Product Launch", "Corporate", [
        f("organization", "Organization", required=True, group="Details"),
        f("title", "Product / title", required=True, group="Details"),
        *_event_fields("Event"),
        f("registration_url", "Registration link", "url", group="Event"),
    ], card_types=["invitation", "announcement", "event"]),
    _occ("conference", "Conference / Seminar", "Corporate", [
        f("organization", "Organization", required=True, group="Details"),
        f("title", "Conference title", required=True, group="Details"),
        f("speakers", "Speakers", "multiline", group="Program"),
        *_event_fields("Program"),
        f("registration_url", "Registration link", "url", group="Program"),
    ], card_types=["invitation", "event"]),
    _occ("award-ceremony", "Award Ceremony / Annual Day", "Corporate", [
        f("organization", "Organization", required=True, group="Details"),
        f("title", "Event title", group="Details"),
        *_event_fields("Event"),
    ], card_types=["invitation", "event"]),

    # --- Social & Cultural ---
    _occ("reunion", "Reunion", "Social", [
        f("title", "Reunion title", required=True, group="Details", placeholder="Class of 2005 Reunion"),
        *_event_fields("Event"),
    ]),
    _occ("farewell", "Farewell", "Social", [
        f("honoree", "For", required=True, group="Details"),
        *_event_fields("Event"),
    ]),

    # --- Greeting cards (no event) ---
    _occ("birthday-greeting", "Birthday Wishes", "Greeting", [
        f("recipient", "To (recipient)", required=True, group="Message"),
        f("message", "Greeting message", "multiline", group="Message"),
        f("sender", "From (sender)", group="Message"),
    ], card_types=["greeting"]),
    _occ("anniversary-greeting", "Anniversary Wishes", "Greeting", [
        f("recipient", "To", required=True, group="Message"),
        f("message", "Greeting message", "multiline", group="Message"),
        f("sender", "From", group="Message"),
    ], card_types=["greeting"]),
    _occ("congratulations", "Congratulations", "Greeting", [
        f("recipient", "To", required=True, group="Message"),
        f("message", "Message", "multiline", group="Message"),
        f("sender", "From", group="Message"),
    ], card_types=["greeting"]),
    _occ("thank-you", "Thank You", "Greeting", [
        f("recipient", "To", required=True, group="Message"),
        f("message", "Message", "multiline", group="Message"),
        f("sender", "From", group="Message"),
    ], card_types=["thank-you"]),
    _occ("festival-greeting", "Festival Greeting", "Greeting", [
        f("title", "Festival", required=True, group="Message", placeholder="Happy Diwali"),
        f("message", "Message", "multiline", group="Message"),
        f("sender", "From", group="Message"),
    ], card_types=["greeting"]),

    # --- Custom (template; real custom occasions are user-defined) ---
    _occ("custom", "Custom / Build Your Own", "Custom", [
        f("title", "Title", required=True, group="Details"),
        f("subtitle", "Subtitle", group="Details"),
        f("message", "Message", "multiline", group="Details"),
        *_event_fields("Details"),
    ], card_types=CARD_TYPES),
]

_BY_ID = {o["id"]: o for o in OCCASIONS}


def by_id(oid: str) -> dict[str, Any] | None:
    return _BY_ID.get(oid)


def categories() -> list[str]:
    seen: list[str] = []
    for o in OCCASIONS:
        if o["category"] not in seen:
            seen.append(o["category"])
    return seen
