"""Shubha Muhurta API application."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .database import init_db
from .routers import admin, ai, assets, auth, content, exports, occasions, projects, templates
from .seed import run_seed

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("shubha_muhurta")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    run_seed()
    logger.info("Shubha Muhurta API started (ai_enabled=%s)", settings.ai_enabled)
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Universal multilingual marriage invitation design studio API.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.app_name, "ai_enabled": settings.ai_enabled}


for r in (auth.router, admin.router, projects.router, templates.router, assets.router, exports.router, content.router, occasions.router, ai.router):
    app.include_router(r)
