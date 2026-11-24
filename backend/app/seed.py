"""Idempotent seeding of templates into the database."""
from __future__ import annotations

from sqlalchemy.orm import Session

from . import models
from .database import SessionLocal
from .template_data import build_templates


def seed_templates(db: Session) -> int:
    count = 0
    for t in build_templates():
        existing = db.get(models.Template, t["id"])
        if existing:
            existing.template_name = t["template_name"]
            existing.category = t["category"]
            existing.preview_path = t["preview_path"]
            existing.configuration = t["configuration"]
            existing.supported_languages = t["supported_languages"]
        else:
            db.add(models.Template(**t))
            count += 1
    db.commit()
    return count


def run_seed() -> None:
    db = SessionLocal()
    try:
        n = seed_templates(db)
        print(f"[seed] templates ready ({n} newly inserted)")
    finally:
        db.close()


if __name__ == "__main__":
    from .database import init_db

    init_db()
    run_seed()
