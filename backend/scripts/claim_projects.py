"""Assign legacy guest (NULL-owner) projects to a user — the safe ownership-transfer
path when switching an existing install from guest mode to shared (auth) mode.

Usage (from backend/):
    .venv/Scripts/python -m scripts.claim_projects --email you@example.com [--dry-run]

Only touches projects with user_id IS NULL; never reassigns another user's projects.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app import models  # noqa: E402
from app.database import SessionLocal, init_db  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--email", required=True, help="email of the user to receive legacy projects")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    init_db()
    db = SessionLocal()
    try:
        user = db.scalar(select(models.User).where(models.User.email == args.email.strip().lower()))
        if not user:
            print(f"No user found with email {args.email!r}. Register that account first.")
            return 1
        legacy = db.scalars(select(models.Project).where(models.Project.user_id.is_(None))).all()
        print(f"Found {len(legacy)} legacy (NULL-owner) project(s).")
        if args.dry_run:
            for p in legacy:
                print(f"  would assign: {p.id}  {p.project_name!r}")
            return 0
        for p in legacy:
            p.user_id = user.id
        db.commit()
        print(f"Assigned {len(legacy)} project(s) to {user.email} ({user.id}).")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
