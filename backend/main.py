"""
FitTrack AI - FastAPI Application Server
File: backend/main.py

Main entry point for the backend REST API server.
Configures CORS, initializes SQLite database tables, and registers API routers.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from backend.database.connection import init_db
from backend.ml_models.model_service import get_model_service
from backend.routes import (
    activity_router,
    goal_router,
    profile_router,
    analytics_router,
    insight_router
)

# Initialize logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("fittrack-api")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes SQLite database tables and trains/loads ML models."""
    logger.info("Initializing FitTrack AI database...")
    init_db()
    logger.info("Loading and verifying machine learning models...")
    _ = get_model_service()
    logger.info("FitTrack AI backend is fully initialized and operational.")
    yield

app = FastAPI(
    title="FitTrack AI API",
    description="Intelligent Fitness Tracking & ML Analytics Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Vite React frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", tags=["Health"])
def health_check():
    """System health verification endpoint."""
    return {
        "status": "healthy",
        "service": "FitTrack AI Backend",
        "version": "1.0.0",
        "ml_models": "Loaded & Ready"
    }

# Register API Routers
app.include_router(activity_router, prefix="/api")
app.include_router(goal_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(insight_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
