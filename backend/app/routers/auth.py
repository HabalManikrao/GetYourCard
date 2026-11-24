"""Authentication endpoints. Guest mode needs none of these; shared mode uses them."""
from __future__ import annotations

import logging
import secrets as _secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models, ratelimit, schemas
from ..config import get_settings
from ..database import get_db
from ..deps import Principal, get_principal
from ..security import create_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()
logger = logging.getLogger("shubha_muhurta.auth")


def _norm_email(email: str) -> str:
    return email.strip().lower()


def _issue(user: models.User) -> schemas.TokenOut:
    ttl = settings.access_ttl_min * 60
    token = create_token(settings.secret(), sub=user.id, role=user.role, ttl_seconds=ttl)
    return schemas.TokenOut(access_token=token, expires_in=ttl, user=schemas.UserOut.model_validate(user))


def _rate(request: Request, action: str, identifier: str) -> None:
    ip = request.client.host if request.client else "unknown"
    key = f"{action}:{ip}:{identifier}"
    if not ratelimit.check(key, limit=settings.login_rate_limit, window_seconds=settings.login_rate_window_sec):
        raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")


@router.get("/config", response_model=schemas.AuthConfigOut)
def auth_config():
    return schemas.AuthConfigOut(auth_required=settings.auth_required)


@router.post("/register", response_model=schemas.TokenOut, status_code=201)
def register(payload: schemas.RegisterIn, request: Request, db: Session = Depends(get_db)):
    email = _norm_email(payload.email)
    _rate(request, "register", email)
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=422, detail="Invalid email address")
    if db.scalar(select(models.User).where(func.lower(models.User.email) == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    try:
        pw_hash = hash_password(payload.password)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    # First registered user becomes admin (bootstrap).
    is_first = db.scalar(select(func.count()).select_from(models.User)) == 0
    user = models.User(
        name=payload.name.strip(),
        email=email,
        password_hash=pw_hash,
        role="admin" if is_first else "user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("User registered id=%s role=%s", user.id, user.role)  # no email/password logged
    return _issue(user)


@router.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginIn, request: Request, db: Session = Depends(get_db)):
    email = _norm_email(payload.email)
    _rate(request, "login", email)
    user = db.scalar(select(models.User).where(func.lower(models.User.email) == email))
    # Constant-ish response regardless of which factor failed (avoid user enumeration).
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    return _issue(user)


@router.post("/logout")
def logout(principal: Principal = Depends(get_principal)):
    # Stateless tokens: the client discards the token. (Revocation list = future hardening.)
    return {"status": "ok"}


@router.get("/me", response_model=schemas.UserOut)
def me(principal: Principal = Depends(get_principal), db: Session = Depends(get_db)):
    if principal.is_guest:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.get(models.User, principal.id)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@router.post("/refresh", response_model=schemas.TokenOut)
def refresh(principal: Principal = Depends(get_principal), db: Session = Depends(get_db)):
    # Sliding refresh: valid (non-expired) token → new token. get_principal already validated it.
    if principal.is_guest:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.get(models.User, principal.id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return _issue(user)


@router.post("/password-reset/request")
def password_reset_request(payload: schemas.PasswordResetRequest, request: Request, db: Session = Depends(get_db)):
    email = _norm_email(payload.email)
    _rate(request, "reset", email)
    user = db.scalar(select(models.User).where(func.lower(models.User.email) == email))
    # Always return ok (no account enumeration).
    if user:
        token = _secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        db.commit()
        # No email provider configured locally → return the token so the flow is usable.
        # In production, email this instead of returning it.
        if not settings.auth_required:
            return {"status": "ok", "reset_token": token}
    return {"status": "ok"}


@router.post("/password-reset/confirm", response_model=schemas.TokenOut)
def password_reset_confirm(payload: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.reset_token == payload.token))
    exp = user.reset_expires if user else None
    if exp is not None and exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if not user or not exp or exp < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    try:
        user.password_hash = hash_password(payload.password)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    user.reset_token = None
    user.reset_expires = None
    db.commit()
    db.refresh(user)
    return _issue(user)
