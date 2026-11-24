"""Admin-only endpoints: ownership transfer for legacy/guest projects, user listing."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import Principal, require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), _: Principal = Depends(require_admin)):
    return db.scalars(select(models.User)).all()


@router.post("/projects/{project_id}/transfer", response_model=schemas.ProjectSummary)
def transfer_project(
    project_id: str,
    new_owner_id: str,
    db: Session = Depends(get_db),
    _: Principal = Depends(require_admin),
):
    """Assign a project (e.g. a legacy NULL-owner project) to a specific user."""
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    owner = db.get(models.User, new_owner_id)
    if not owner:
        raise HTTPException(status_code=404, detail="Target user not found")
    project.user_id = new_owner_id
    db.commit()
    db.refresh(project)
    return project
