"""
FitTrack AI - Pydantic Request & Response Validation Schemas
File: backend/routes/schemas.py
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from typing import Optional, List, Dict, Any

# --- Activity Schemas ---

class ActivityCreateSchema(BaseModel):
    activity_date: date = Field(default_factory=date.today)
    activity_type: str = Field(...)
    steps: int = Field(default=0, ge=0, le=200000)
    distance_km: float = Field(default=0.0, ge=0.0, le=300.0)
    exercise_duration: int = Field(..., ge=0, le=1440, description="Duration in minutes")
    water_intake: float = Field(default=0.0, ge=0.0, le=20.0, description="Water in liters")
    sleep_duration: float = Field(default=0.0, ge=0.0, le=24.0, description="Sleep in hours")
    body_weight_kg: Optional[float] = Field(default=None, ge=20.0, le=350.0)
    notes: Optional[str] = Field(default=None, max_length=1000)

class ActivityUpdateSchema(BaseModel):
    activity_date: date
    activity_type: str
    steps: int = Field(default=0, ge=0)
    distance_km: float = Field(default=0.0, ge=0.0)
    exercise_duration: int = Field(default=0, ge=0)
    water_intake: float = Field(default=0.0, ge=0.0)
    sleep_duration: float = Field(default=0.0, ge=0.0)
    body_weight_kg: Optional[float] = Field(default=None, ge=20.0)
    notes: Optional[str] = None

class ActivityResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activity_date: date
    activity_type: str
    steps: int
    distance_km: float
    exercise_duration: int
    water_intake: float
    sleep_duration: float
    body_weight_kg: Optional[float]
    estimated_calories: float
    activity_level: str
    notes: Optional[str]
    created_at: Optional[datetime]

# --- Goal Schemas ---

class GoalCreateSchema(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    goal_type: str = Field(...)
    target_value: float = Field(..., gt=0.0)
    unit: str = Field(..., min_length=1, max_length=20)
    time_horizon: str = Field(default="daily")
    target_date: Optional[date] = Field(default=None)

class GoalUpdateSchema(BaseModel):
    title: str
    goal_type: str
    target_value: float
    unit: str
    time_horizon: str = "daily"
    target_date: Optional[date] = None
    is_active: bool = True

class LogAchievementSchema(BaseModel):
    achieved_value: float = Field(..., gt=0.0, description="What you actually achieved")
    achieved_date: Optional[date] = Field(default=None, description="Date of achievement (defaults to today)")
    notes: Optional[str] = Field(default=None, max_length=500)

class GoalResponseSchema(BaseModel):
    id: int
    title: str
    goal_type: str
    target_value: float
    current_value: float
    unit: str
    time_horizon: str
    target_date: Optional[date]
    achieved_value: Optional[float]
    achieved_date: Optional[date]
    percentage: float
    remaining: float
    is_completed: bool
    is_active: bool
    status_text: str

# --- Profile Schemas ---

class ProfileUpdateSchema(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=10, le=120)
    height_cm: float = Field(..., ge=50.0, le=280.0)
    weight_kg: float = Field(..., ge=20.0, le=350.0)
    preferred_exercise_type: str = Field(...)
    fitness_objective: str = Field(...)
    available_workout_time: int = Field(..., ge=5, le=300)
    preferred_exercise_frequency: int = Field(..., ge=1, le=7)

class ProfileResponseSchema(BaseModel):
    id: int
    display_name: str
    age: int
    height_cm: float
    weight_kg: float
    preferred_exercise_type: str
    fitness_objective: str
    available_workout_time: int
    preferred_exercise_frequency: int
    bmi: float
    bmi_category: str

# --- Prediction Test / Sandbox Schemas ---

class CaloriePredictionRequest(BaseModel):
    duration_min: float = Field(..., ge=1.0, le=720.0)
    distance_km: float = Field(default=0.0, ge=0.0, le=100.0)
    steps: float = Field(default=0.0, ge=0.0, le=100000.0)
    activity_type: str = Field(...)
    body_weight_kg: Optional[float] = Field(default=70.0, ge=30.0, le=250.0)

class ActivityClassificationRequest(BaseModel):
    steps: float = Field(..., ge=0.0, le=100000.0)
    active_minutes: float = Field(..., ge=0.0, le=720.0)
    distance_km: float = Field(..., ge=0.0, le=100.0)
    exercise_frequency: int = Field(default=3, ge=0, le=7)

class ReadinessRecommendationRequest(BaseModel):
    steps: float = Field(default=5000.0, ge=0.0)
    duration_min: float = Field(default=30.0, ge=0.0)
    sleep_hours: float = Field(default=7.0, ge=0.0, le=24.0)
    fatigue_level: str = Field(default="Low")
