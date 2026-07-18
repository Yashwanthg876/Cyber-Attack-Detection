import time
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .core.config import settings
from .core.database import engine, get_db
from .models import Base, SystemLog
from .api.predict import router as predict_router
from .api.auth import router as auth_router
from .api.dashboard import router as dashboard_router
from .api.threat_intel import router as threat_intel_router
from .api.explain import router as explain_router
from .api.alerts import router as alerts_router
from .api.models import router as models_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-time SOC platform incorporating weighted machine learning models and deep learning sequence anomalies.",
    version="1.0.0",
)

# Include routers
app.include_router(predict_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(threat_intel_router, prefix=settings.API_V1_STR)
app.include_router(explain_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(models_router, prefix=settings.API_V1_STR)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development; in production restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request processing time and system log middleware
@app.middleware("http")
async def add_process_time_and_log(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
        "database": "connected"
    }

@app.get("/api/v1/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Simple query to verify DB connection
        db.execute(Base.metadata.tables["users"].select().limit(1))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "active",
        "database": db_status,
        "api_version": "v1.0"
    }
