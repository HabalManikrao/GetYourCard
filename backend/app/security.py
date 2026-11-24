"""Security primitives: password hashing (scrypt) and signed tokens (HS256).

Stdlib-only (no new dependencies). Never stores or logs plaintext passwords.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time

# scrypt parameters (OWASP-aligned; memory-hard).
_N = 2**14
_R = 8
_P = 1


def _b64u(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64u_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


# ---------- Password hashing ----------
def hash_password(password: str) -> str:
    if not password or len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    salt = os.urandom(16)
    dk = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=_N, r=_R, p=_P, dklen=32)
    return f"scrypt${_N}${_R}${_P}${_b64u(salt)}${_b64u(dk)}"


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, n, r, p, salt_b64, hash_b64 = stored.split("$")
        if scheme != "scrypt":
            return False
        salt = _b64u_decode(salt_b64)
        expected = _b64u_decode(hash_b64)
        dk = hashlib.scrypt(
            password.encode("utf-8"), salt=salt, n=int(n), r=int(r), p=int(p), dklen=len(expected)
        )
        return hmac.compare_digest(dk, expected)
    except Exception:
        return False


# ---------- Signed tokens (HS256) ----------
def create_token(secret: str, *, sub: str, role: str, ttl_seconds: int, now: int | None = None) -> str:
    iat = int(now if now is not None else time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": sub, "role": role, "iat": iat, "exp": iat + ttl_seconds}
    seg = f"{_b64u(json.dumps(header, separators=(',', ':')).encode())}.{_b64u(json.dumps(payload, separators=(',', ':')).encode())}"
    sig = hmac.new(secret.encode("utf-8"), seg.encode("ascii"), hashlib.sha256).digest()
    return f"{seg}.{_b64u(sig)}"


def decode_token(secret: str, token: str, *, now: int | None = None) -> dict | None:
    """Return the payload if the signature is valid and not expired, else None."""
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        seg = f"{header_b64}.{payload_b64}"
        expected = hmac.new(secret.encode("utf-8"), seg.encode("ascii"), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64u_decode(sig_b64)):
            return None
        payload = json.loads(_b64u_decode(payload_b64))
        ts = int(now if now is not None else time.time())
        if int(payload.get("exp", 0)) < ts:
            return None
        return payload
    except Exception:
        return None
