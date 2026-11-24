"""Pytest fixtures with an isolated temp database and storage per session."""
from __future__ import annotations

import os
import tempfile
from pathlib import Path

import pytest

# Point the app at throwaway locations BEFORE it is imported.
_TMP = Path(tempfile.mkdtemp(prefix="shubha_test_"))
os.environ["SM_DATABASE_URL"] = f"sqlite:///{(_TMP / 'test.db').as_posix()}"
os.environ["SM_STORAGE_DIR"] = str(_TMP / "storage")


@pytest.fixture(scope="session")
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:  # triggers lifespan: init_db + seed
        yield c
