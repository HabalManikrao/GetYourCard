"""Pydantic request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


# ---------- Projects ----------
class ProjectBase(BaseModel):
    project_name: str = Field(default="Untitled Invitation", max_length=200)
    bride_name: str | None = Field(default=None, max_length=200)
    groom_name: str | None = Field(default=None, max_length=200)
    wedding_date: str | None = Field(default=None, max_length=32)
    language: str = Field(default="en", max_length=32)
    template_id: str | None = Field(default=None, max_length=64)
    occasion_id: str = Field(default="marriage", max_length=64)
    project_type: str = Field(default="invitation", max_length=32)
    schema_version: int = 1
    project_data: dict[str, Any] = Field(default_factory=dict)
    thumbnail_path: str | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    project_name: str | None = Field(default=None, max_length=200)
    bride_name: str | None = None
    groom_name: str | None = None
    wedding_date: str | None = None
    language: str | None = None
    template_id: str | None = None
    occasion_id: str | None = None
    project_type: str | None = None
    schema_version: int | None = None
    project_data: dict[str, Any] | None = None
    thumbnail_path: str | None = None


class ProjectSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_name: str
    bride_name: str | None
    groom_name: str | None
    wedding_date: str | None
    language: str
    template_id: str | None
    occasion_id: str
    project_type: str
    schema_version: int
    thumbnail_path: str | None
    version: int
    created_at: datetime
    updated_at: datetime


class ProjectDetail(ProjectSummary):
    project_data: dict[str, Any]


# ---------- Templates ----------
class TemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    template_name: str
    category: str
    preview_path: str | None
    configuration: dict[str, Any]
    supported_languages: list[str]


# ---------- Assets ----------
class AssetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    asset_name: str
    asset_type: str
    asset_path: str
    license: str | None
    meta: dict[str, Any] = Field(validation_alias="meta")
    created_at: datetime


# ---------- Exports ----------
class ExportCreate(BaseModel):
    project_id: str
    export_format: str = Field(pattern="^(png|jpg|jpeg|pdf)$")
    resolution: str | None = None
    # base64 data URL or raw base64 of the rendered artwork
    data: str = Field(min_length=16, description="data URL or base64 payload of the rendered file")


class ExportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    export_format: str
    export_path: str
    resolution: str | None
    created_at: datetime


# ---------- Wordings ----------
class WordingOut(BaseModel):
    id: str
    title: str
    language: str
    category: str
    body: str


# ---------- AI ----------
# ---- Auth ----
class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=200)


class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    role: str
    is_active: bool


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class AuthConfigOut(BaseModel):
    auth_required: bool


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=200)


class OccasionField(BaseModel):
    key: str
    label: str
    type: str = "text"
    required: bool = False
    group: str = "Details"
    placeholder: str | None = None
    options: list[str] | None = None


class OccasionOut(BaseModel):
    id: str
    name: str
    category: str
    card_types: list[str]
    fields: list[OccasionField]
    custom: bool = False


class CustomOccasionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(default="Custom", max_length=80)
    card_types: list[str] = Field(default_factory=lambda: ["invitation"])
    field_schema: list[OccasionField] = Field(default_factory=list)
    configuration: dict[str, Any] = Field(default_factory=dict)


class CustomOccasionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    category: str
    card_types: list[str]
    field_schema: list[OccasionField]
    configuration: dict[str, Any]


class AIStatus(BaseModel):
    enabled: bool
    provider: str | None = None
    image_generation: bool = False


class AIWordingRequest(BaseModel):
    style: str = "traditional"
    language: str = "en"
    bride_name: str | None = None
    groom_name: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)
