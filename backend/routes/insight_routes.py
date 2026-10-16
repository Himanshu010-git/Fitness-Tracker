"""
FitTrack AI - AI Fitness Insights API Routes
File: backend/routes/insight_routes.py

Provides personalized machine learning-driven health insights and
interactive sandbox endpoints to test and verify all 4 ML algorithms.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.database.connection import get_db
from backend.services.recommendation_service import generate_user_insights
from backend.ml_models.model_service import get_model_service
from backend.routes.schemas import (
    CaloriePredictionRequest,
    ActivityClassificationRequest,
    ReadinessRecommendationRequest
)

router = APIRouter(prefix="/insights", tags=["AI Fitness Insights"])

@router.get("")
def get_insights(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Retrieve synthesized personalized fitness insights from stored records."""
    return generate_user_insights(db)

@router.post("/predict-calories")
def test_calorie_prediction(payload: CaloriePredictionRequest) -> Dict[str, Any]:
    """Algorithm 1: KNN Regression sandbox for calorie expenditure estimation."""
    model_service = get_model_service()
    try:
        return model_service.predict_calories(
            duration_min=payload.duration_min,
            distance_km=payload.distance_km,
            steps=payload.steps,
            activity_type=payload.activity_type,
            body_weight_kg=payload.body_weight_kg or 70.0
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/classify-activity")
def test_activity_classification(payload: ActivityClassificationRequest) -> Dict[str, Any]:
    """Algorithm 2: KNN Classification sandbox for daily activity tier."""
    model_service = get_model_service()
    try:
        return model_service.classify_activity(
            steps=payload.steps,
            active_minutes=payload.active_minutes,
            distance_km=payload.distance_km,
            exercise_frequency=payload.exercise_frequency
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/readiness-recommendation")
def test_readiness_recommendation(payload: ReadinessRecommendationRequest) -> Dict[str, Any]:
    """Algorithm 4: ID3 Decision Tree sandbox for workout readiness & focus."""
    model_service = get_model_service()
    try:
        return model_service.recommend_workout(
            steps=payload.steps,
            duration_min=payload.duration_min,
            sleep_hours=payload.sleep_hours,
            fatigue_level=payload.fatigue_level
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/models-status")
def get_models_status() -> Dict[str, Any]:
    """Metadata and evaluation report for all 4 implemented ML algorithms."""
    model_service = get_model_service()
    return model_service.get_system_model_status()
