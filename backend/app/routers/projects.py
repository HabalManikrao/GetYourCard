"""Project CRUD + duplicate. Projects persist the full editable design JSON.

Ownership is enforced server-side: guests see legacy NULL-owner projects; authenticated
users see only their own; admins see all. Accessing another user's project returns 404
(does not reveal existence).
"""
from __future__ import annotations

import copy

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import Principal, get_principal, owns

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _scope(stmt, principal: Principal):
    """Restrict a query to rows the principal may see."""
    if principal.role == "admin":
        return stmt
    if principal.is_guest:
        return stmt.where(models.Project.user_id.is_(None))
    return stmt.where(models.Project.user_id == principal.id)


@router.get("", response_model=list[schemas.ProjectSummary])
def list_projects(
    db: Session = Depends(get_db),
    principal: Principal = Depends(get_principal),
    q: str | None = Query(default=None, description="search by name / bride / groom"),
    language: str | None = None,
    wedding_date: str | None = None,
    limit: int = Query(default=100, le=500),
):
    stmt = select(models.Project).order_by(models.Project.updated_at.desc())
    stmt = _scope(stmt, principal)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(
                models.Project.project_name.ilike(like),
                models.Project.bride_name.ilike(like),
                models.Project.groom_name.ilike(like),
            )
        )
    if language:
        stmt = stmt.where(models.Project.language == language)
    if wedding_date:
        stmt = stmt.where(models.Project.wedding_date == wedding_date)
    return db.scalars(stmt.limit(limit)).all()


@router.post("", response_model=schemas.ProjectDetail, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    project = models.Project(**payload.model_dump())
    project.user_id = principal.id  # guest → None; user → their id
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def _get_owned_or_404(db: Session, project_id: str, principal: Principal) -> models.Project:
    project = db.get(models.Project, project_id)
    if not project or not owns(principal, project.user_id):
        # 404 (not 403) so another user's project existence is not revealed.
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/{project_id}", response_model=schemas.ProjectDetail)
def get_project(project_id: str, db: Session = Depends(get_db), principal: Principal = Depends(get_principal)):
    return _get_owned_or_404(db, project_id, principal)


@router.put("/{project_id}", response_model=schemas.ProjectDetail)
def update_project(
    project_id: str,
    payload: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    principal: Principal = Depends(get_principal),
):
    project = _get_owned_or_404(db, project_id, principal)
    data = payload.model_dump(exclude_unset=True)
    data.pop("user_id", None)  # ownership is never changed via update
    for key, value in data.items():
        setattr(project, key, value)
    if "project_data" in data:
        project.version = (project.version or 1) + 1
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db), principal: Principal = Depends(get_principal)):
    project = _get_owned_or_404(db, project_id, principal)
    db.delete(project)
    db.commit()


@router.post("/{project_id}/duplicate", response_model=schemas.ProjectDetail, status_code=status.HTTP_201_CREATED)
def duplicate_project(project_id: str, db: Session = Depends(get_db), principal: Principal = Depends(get_principal)):
    src = _get_owned_or_404(db, project_id, principal)
    clone = models.Project(
        user_id=principal.id,  # the copy belongs to the caller
        project_name=f"{src.project_name} (Copy)",
        bride_name=src.bride_name,
        groom_name=src.groom_name,
        wedding_date=src.wedding_date,
        language=src.language,
        template_id=src.template_id,
        occasion_id=src.occasion_id,
        project_type=src.project_type,
        schema_version=src.schema_version,
        project_data=copy.deepcopy(src.project_data),
        thumbnail_path=src.thumbnail_path,
    )
    db.add(clone)
    db.commit()
    db.refresh(clone)
    return clone
