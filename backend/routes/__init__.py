"""
FitTrack AI - Routes Package
"""
from backend.routes.activity_routes import router as activity_router
from backend.routes.goal_routes import router as goal_router
from backend.routes.profile_routes import router as profile_router
from backend.routes.analytics_routes import router as analytics_router
from backend.routes.insight_routes import router as insight_router

__all__ = [
    "activity_router",
    "goal_router",
    "profile_router",
    "analytics_router",
    "insight_router"
]
