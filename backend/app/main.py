"""
Carbon Footprint Awareness Platform — FastAPI application entry point.

Includes security headers middleware, CORS, rate limiting, and router registration.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import init_db
from app.routes import auth, footprint, actions, goals

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Only enable rate limiting if not in testing mode
limiter_enabled = os.getenv("TESTING", "False").lower() not in ("true", "1", "yes")
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"], enabled=limiter_enabled)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Application lifespan: initialize database on startup."""
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized successfully.")
    yield


app = FastAPI(
    title="Carbon Footprint Awareness Platform",
    description="Track, reduce, and understand your carbon footprint with AI-powered insights.",
    version="1.0.0",
    lifespan=lifespan,
)

# --- Rate Limiting ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# --- Security Headers Middleware ---
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to every HTTP response."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src https://fonts.gstatic.com; img-src 'self' data:"
    )
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    # Remove server header if present
    if "server" in response.headers:
        del response.headers["server"]
    return response


# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)


# --- Routers ---
app.include_router(auth.router)
app.include_router(footprint.router)
app.include_router(actions.router)
app.include_router(goals.router)


@app.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy"}


# --- Static Frontend Serving ---
# In production, the built frontend is copied into ./static
import pathlib
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

_static_dir = pathlib.Path(__file__).resolve().parent.parent / "static"

if _static_dir.is_dir():
    # Serve JS/CSS/image assets
    app.mount("/assets", StaticFiles(directory=_static_dir / "assets"), name="frontend-assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Catch-all: serve index.html for SPA client-side routing."""
        file_path = _static_dir / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(_static_dir / "index.html")
