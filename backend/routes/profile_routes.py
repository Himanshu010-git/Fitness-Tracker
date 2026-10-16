"""
FitTrack AI - User Profile API Routes
File: backend/routes/profile_routes.py
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.database.models import UserProfile
from backend.routes.schemas import ProfileUpdateSchema, ProfileResponseSchema

router = APIRouter(prefix="/profile", tags=["User Profile"])

def _format_profile_response(profile: UserProfile) -> dict:
    height_m = profile.height_cm / 100.0 if profile.height_cm > 0 else 1.75
    bmi = round(profile.weight_kg / (height_m ** 2), 1)

    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25.0:
        category = "Healthy Weight"
    elif bmi < 30.0:
        category = "Overweight"
    else:
        category = "Obesity"

    return {
        "id": profile.id,
        "display_name": profile.display_name,
        "age": profile.age,
        "height_cm": profile.height_cm,
        "weight_kg": profile.weight_kg,
        "preferred_exercise_type": profile.preferred_exercise_type,
        "fitness_objective": profile.fitness_objective,
        "available_workout_time": profile.available_workout_time,
        "preferred_exercise_frequency": profile.preferred_exercise_frequency,
        "bmi": bmi,
        "bmi_category": category
    }

@router.get("", response_model=ProfileResponseSchema)
def get_user_profile(db: Session = Depends(get_db)):
    """Retrieve user fitness profile with calculated BMI statistics."""
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile(id=1)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return _format_profile_response(profile)

@router.put("", response_model=ProfileResponseSchema)
def update_user_profile(payload: ProfileUpdateSchema, db: Session = Depends(get_db)):
    """Update user personal preferences and physical metrics."""
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile(id=1)
        db.add(profile)

    profile.display_name = payload.display_name
    profile.age = payload.age
    profile.height_cm = payload.height_cm
    profile.weight_kg = payload.weight_kg
    profile.preferred_exercise_type = payload.preferred_exercise_type
    profile.fitness_objective = payload.fitness_objective
    profile.available_workout_time = payload.available_workout_time
    profile.preferred_exercise_frequency = payload.preferred_exercise_frequency

    db.commit()
    db.refresh(profile)
    return _format_profile_response(profile)
