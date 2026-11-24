"""Minimal in-memory sliding-window rate limiter for auth endpoints.

Single-instance only; multi-instance deployments need a shared store (Redis).
"""
from __future__ import annotations

import threading
import time

_lock = threading.Lock()
_hits: dict[str, list[float]] = {}


def check(key: str, *, limit: int, window_seconds: int, now: float | None = None) -> bool:
    """Return True if allowed; records the hit. False when the limit is exceeded."""
    t = now if now is not None else time.time()
    with _lock:
        bucket = _hits.get(key, [])
        bucket = [ts for ts in bucket if ts > t - window_seconds]
        if len(bucket) >= limit:
            _hits[key] = bucket
            return False
        bucket.append(t)
        _hits[key] = bucket
        return True


def reset() -> None:
    with _lock:
        _hits.clear()
