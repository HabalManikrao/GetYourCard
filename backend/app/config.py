"""Application configuration, externalized via environment variables."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SM_", env_file=".env", extra="ignore")

    app_name: str = "Shubha Muhurta - Marriage Invitation Studio"
    debug: bool = True

    # Database (SQLite for dev; swap SM_DATABASE_URL for PostgreSQL in prod)
    database_url: str = f"sqlite:///{(BASE_DIR / 'shubha_muhurta.db').as_posix()}"

    # Storage roots
    storage_dir: Path = BASE_DIR / "storage"
    uploads_dirname: str = "uploads"
    exports_dirname: str = "exports"
    thumbs_dirname: str = "thumbnails"

    # Upload limits
    max_upload_bytes: int = 10 * 1024 * 1024  # 10 MB
    allowed_image_types: tuple[str, ...] = (
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/svg+xml",
    )

    # CORS - comma separated origins
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Optional AI provider (feature-flagged; never required)
    ai_provider: str = ""  # "" means disabled
    ai_api_key: str = ""
    ai_model: str = ""
    ai_image_provider: str = ""

    # Authentication / authorization
    auth_required: bool = False  # default: guest/local mode (backward compatible)
    secret_key: str = ""  # token signing secret; auto-generated if empty (see secret())
    access_ttl_min: int = 720  # access-token lifetime in minutes (12h)
    login_rate_limit: int = 10  # attempts per window
    login_rate_window_sec: int = 300  # 5 minutes

    @property
    def uploads_dir(self) -> Path:
        return self.storage_dir / self.uploads_dirname

    @property
    def exports_dir(self) -> Path:
        return self.storage_dir / self.exports_dirname

    @property
    def thumbs_dir(self) -> Path:
        return self.storage_dir / self.thumbs_dirname

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def ai_enabled(self) -> bool:
        return bool(self.ai_provider and self.ai_api_key)

    def ensure_dirs(self) -> None:
        for d in (self.storage_dir, self.uploads_dir, self.exports_dir, self.thumbs_dir):
            d.mkdir(parents=True, exist_ok=True)

    def secret(self) -> str:
        """Token signing secret: env `SM_SECRET_KEY`, else a persisted random key.
        A stable key keeps tokens valid across restarts; set the env var in production."""
        if self.secret_key:
            return self.secret_key
        import os

        key_file = self.storage_dir / ".secret_key"
        if key_file.exists():
            return key_file.read_text(encoding="utf-8").strip()
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        generated = os.urandom(32).hex()
        key_file.write_text(generated, encoding="utf-8")
        return generated


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.ensure_dirs()
    return settings
