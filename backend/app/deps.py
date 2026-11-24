"""Auth dependencies: current-user resolution (guest-aware) and ownership scoping.

Guest/local mode (auth_required=false): requests resolve to a synthetic guest whose
scope is the legacy NULL-owner projects — preserving today's behavior.
Shared mode (auth_required=true): a valid bearer token is required; data is scoped
to the authenticated user's id.
"""
from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from . import models
from .config import get_settings
from .database import get_db
from .security import decode_token

settings = get_settings()


@dataclass
class Principal:
    """The actor making a request — a real user or the local guest."""
    id: str | None  # None => guest (legacy NULL-owner scope)
    role: str  # user | admin | guest
    is_guest: bool


GUEST = Principal(id=None, role="guest", is_guest=True)


def _token_from_header(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1].strip()
    return None


def get_principal(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Principal:
    """Resolve the caller. Never raises in guest mode; enforces token in shared mode."""
    token = _token_from_header(authorization)
    if token:
        payload = decode_token(settings.secret(), token)
        if payload:
            user = db.get(models.User, payload.get("sub"))
            if user and user.is_active:
                return Principal(id=user.id, role=user.role, is_guest=False)
        # A token was supplied but is invalid/expired → always reject.
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if settings.auth_required:
        raise HTTPException(status_code=401, detail="Authentication required")
    return GUEST


def require_user(principal: Principal = Depends(get_principal)) -> Principal:
    if principal.is_guest and settings.auth_required:
        raise HTTPException(status_code=401, detail="Authentication required")
    return principal


def require_admin(principal: Principal = Depends(get_principal)) -> Principal:
    if principal.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return principal


def owns(principal: Principal, obj_user_id: str | None) -> bool:
    """Ownership check: guest owns NULL-owner rows; a user owns their own rows; admin owns all."""
    if principal.role == "admin":
        return True
    return obj_user_id == principal.id
