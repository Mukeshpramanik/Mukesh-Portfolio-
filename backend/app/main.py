import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.deps import limiter
from app.api.routes import admin, public
from app.core.config import settings
from app.core.database import SessionLocal, init_db
from app.services.seed import seed_all

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("portfolio.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to handle startup initialization and teardown."""
    logger.info("Initializing Mukesh Pramanik Portfolio backend services...")

    # 1. Ensure required upload directories exist
    upload_path = os.path.abspath(settings.UPLOAD_DIR)
    os.makedirs(upload_path, exist_ok=True)
    os.makedirs(os.path.join(upload_path, "resumes"), exist_ok=True)
    os.makedirs(os.path.join(upload_path, "images"), exist_ok=True)
    logger.info(f"Upload directories ensured at: {upload_path}")

    # 2. Initialize database schema
    try:
        init_db()
        logger.info("Database schema initialized.")
    except Exception as exc:
        logger.error(f"Error during database initialization: {exc}")

    # 3. Seed initial admin and profile data
    db = SessionLocal()
    try:
        seed_all(db)
        logger.info("Database seeding checked and completed.")
    except Exception as exc:
        logger.error(f"Error seeding database: {exc}")
    finally:
        db.close()

    yield

    logger.info("Shutting down portfolio backend services...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade RESTful API powering Mukesh Pramanik's developer portfolio website.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Attach SlowAPI rate limiter state and exception handler
try:
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
except ImportError:
    pass

# CORS Middleware Configuration
origins = settings.cors_origins
# Also support wildcard in dev if needed
if "*" not in origins:
    origins.append("http://localhost:3000")
    origins.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists before mounting static files
os.makedirs(os.path.abspath(settings.UPLOAD_DIR), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API Routers under /api
app.include_router(public.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)


# Health Check Endpoints
@app.get("/", tags=["health"])
@app.get("/health", tags=["health"])
@app.get(f"{settings.API_V1_STR}/health", tags=["health"])
def health_check():
    """Verify backend operational status and service metadata."""
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }
