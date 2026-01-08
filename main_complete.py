from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import os
from database import engine, Base
from config import settings
from routers import auth, projects, deployments, users, health
from routers import admin as admin_router
from routers.cache import router as cache_router
from routers.analytics import router as analytics_router
from middleware.rate_limiter import rate_limit_middleware
from middleware.request_logger import request_logger_middleware, error_handler_middleware
from utils.logger import logger, setup_logger
from schemas import HealthCheck

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 {settings.APP_NAME} v{settings.VERSION} starting up...")
    logger.info(f"🌍 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    if '@' in settings.DATABASE_URL:
        safe_url = settings.DATABASE_URL.split('@')[-1]
    else:
        safe_url = "sqlite/local"
    logger.info(f"📡 Database: {safe_url}")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created/verified")
    yield
    logger.info("👋 Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="""
    API Gateway for Cloud Deployment Platform
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    contact={
        "name": "Cloud Deploy Support",
        "email": "support@clouddeploy.example.com"
    },
    servers=[
        {"url": "http://localhost:8000", "description": "Development server"},
        {"url": "https://cloud-deploy-api-m77w.onrender.com", "description": "Production server"}
    ]
)

# FIXED CORS CONFIGURATION - Allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Changed from ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.middleware("http")(rate_limit_middleware)
app.middleware("http")(request_logger_middleware)
app.middleware("http")(error_handler_middleware)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(deployments.router)
app.include_router(users.router)
app.include_router(health.router)
app.include_router(admin_router.router)
app.include_router(cache_router)
app.include_router(analytics_router)

@app.get("/", tags=["root"])
def read_root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.VERSION,
        "description": "Cloud Deployment Platform API Gateway",
        "endpoints": {
            "authentication": "/auth",
            "projects": "/projects",
            "deployments": "/deployments",
            "users": "/users",
            "health": "/health",
            "analytics": "/analytics",
            "cache": "/cache (admin only)",
            "admin": "/admin (admin only)",
            "documentation": "/docs"
        },
        "timestamp": datetime.utcnow().isoformat(),
        "status": "operational"
    }

@app.get("/info")
def get_api_info():
    """Get API information"""
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": os.getenv("ENVIRONMENT", "development"),
        "support": {
            "docs": "https://cloud-deploy-api-m77w.onrender.com/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main_complete:app",
        host="0.0.0.0",
        port=port,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False,
        log_config=None
    )
