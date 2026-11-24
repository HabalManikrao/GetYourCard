"""Database engine, session, and base declarative class."""
from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings

settings = get_settings()

_connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=_connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables. Import models so they register with Base metadata."""
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _migrate_sqlite()


# Additive, backward-compatible column migrations for SQLite (dev). For
# PostgreSQL/production use Alembic; create_all handles brand-new databases.
_PROJECT_ADDITIONS = {
    "occasion_id": "VARCHAR(64) DEFAULT 'marriage'",
    "project_type": "VARCHAR(32) DEFAULT 'invitation'",
    "schema_version": "INTEGER DEFAULT 1",
}
_USER_ADDITIONS = {
    "role": "VARCHAR(20) DEFAULT 'user'",
    "is_active": "BOOLEAN DEFAULT 1",
    "reset_token": "VARCHAR(64)",
    "reset_expires": "DATETIME",
}


def _migrate_sqlite() -> None:
    if not settings.database_url.startswith("sqlite"):
        return
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    tables = insp.get_table_names()
    with engine.begin() as conn:
        if "projects" in tables:
            existing = {c["name"] for c in insp.get_columns("projects")}
            for col, ddl in _PROJECT_ADDITIONS.items():
                if col not in existing:
                    conn.execute(text(f"ALTER TABLE projects ADD COLUMN {col} {ddl}"))
        if "users" in tables:
            existing = {c["name"] for c in insp.get_columns("users")}
            for col, ddl in _USER_ADDITIONS.items():
                if col not in existing:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {ddl}"))
