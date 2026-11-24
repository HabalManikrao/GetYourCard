"""SQLAlchemy ORM models for Shubha Muhurta."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _uuid() -> str:
    return uuid.uuid4().hex


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="user")  # user | admin
    is_active: Mapped[bool] = mapped_column(default=True)
    reset_token: Mapped[str | None] = mapped_column(String(64), nullable=True)
    reset_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    projects: Mapped[list["Project"]] = relationship(back_populates="user")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    project_name: Mapped[str] = mapped_column(String(200), nullable=False, default="Untitled Invitation")
    bride_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    groom_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    wedding_date: Mapped[str | None] = mapped_column(String(32), nullable=True)
    language: Mapped[str] = mapped_column(String(32), default="en")
    template_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    # Universal occasion platform (additive; existing projects default to marriage).
    occasion_id: Mapped[str] = mapped_column(String(64), default="marriage")
    project_type: Mapped[str] = mapped_column(String(32), default="invitation")
    schema_version: Mapped[int] = mapped_column(Integer, default=1)
    # Full editable design document (canvas pages, elements, wizard details)
    project_data: Mapped[dict] = mapped_column(JSON, default=dict)
    thumbnail_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    user: Mapped["User | None"] = relationship(back_populates="projects")
    exports: Mapped[list["Export"]] = relationship(back_populates="project", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_projects_updated_at", "updated_at"),
        Index("ix_projects_language", "language"),
        Index("ix_projects_wedding_date", "wedding_date"),
    )


class Template(Base):
    __tablename__ = "templates"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    template_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    preview_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    configuration: Mapped[dict] = mapped_column(JSON, default=dict)
    supported_languages: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class CustomOccasion(Base):
    __tablename__ = "custom_occasions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(80), default="Custom")
    card_types: Mapped[list] = mapped_column(JSON, default=list)
    field_schema: Mapped[list] = mapped_column(JSON, default=list)
    configuration: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    asset_name: Mapped[str] = mapped_column(String(200), nullable=False)
    asset_type: Mapped[str] = mapped_column(String(40), nullable=False)  # upload | decoration | photo
    asset_path: Mapped[str] = mapped_column(String(500), nullable=False)
    license: Mapped[str | None] = mapped_column(String(200), nullable=True)
    meta: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Export(Base):
    __tablename__ = "exports"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False)
    export_format: Mapped[str] = mapped_column(String(16), nullable=False)  # png | jpg | pdf
    export_path: Mapped[str] = mapped_column(String(500), nullable=False)
    resolution: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    project: Mapped["Project"] = relationship(back_populates="exports")

    __table_args__ = (Index("ix_exports_project_id", "project_id"),)
