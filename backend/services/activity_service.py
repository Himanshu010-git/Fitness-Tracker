"""
FitTrack AI - Activity Service Layer
File: backend/services/activity_service.py

Handles database queries and business logic for activity logging,
including automated ML calorie estimation and daily activity level classification.
"""

from datetime import date, datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database.models import ActivityRecord, UserProfile
from backend.ml_models.model_service import get_model_service

def list_activities(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    activity_type: Optional[str] = None,
    limit: int = 100
) -> List[ActivityRecord]:
    """Retrieve filtered activity records ordered by date descending."""
    query = db.query(ActivityRecord)
    if start_date:
        query = query.filter(ActivityRecord.activity_date >= start_date)
    if end_date:
        query = query.filter(ActivityRecord.activity_date <= end_date)
    if activity_type and activity_type.lower() != "all":
        query = query.filter(ActivityRecord.activity_type.ilike(activity_type))

    return query.order_by(desc(ActivityRecord.activity_date), desc(ActivityRecord.id)).limit(limit).all()

def get_activity_by_id(db: Session, activity_id: int) -> Optional[ActivityRecord]:
    return db.query(ActivityRecord).filter(ActivityRecord.id == activity_id).first()

def create_activity(
    db: Session,
    activity_date: date,
    activity_type: str,
    steps: int,
    distance_km: float,
    exercise_duration: int,
    water_intake: float,
    sleep_duration: float,
    body_weight_kg: Optional[float] = None,
    notes: Optional[str] = None
) -> ActivityRecord:
    """Creates a new activity record with ML-predicted calories and activity tier."""
    model_service = get_model_service()

    # If body_weight_kg not provided in record, retrieve from user profile
    if body_weight_kg is None or body_weight_kg <= 0:
        profile = db.query(UserProfile).first()
        effective_weight = profile.weight_kg if profile else 70.0
    else:
        effective_weight = body_weight_kg

    # 1. KNN Regression prediction for calories
    try:
        cal_res = model_service.predict_calories(
            duration_min=float(exercise_duration),
            distance_km=float(distance_km),
            steps=float(steps),
            activity_type=activity_type,
            body_weight_kg=effective_weight
        )
        estimated_cals = cal_res["estimated_calories"]
    except Exception:
        # Fallback approximation
        estimated_cals = round(exercise_duration * 6.5, 1)

    # 2. KNN Classification for activity level
    profile = db.query(UserProfile).first()
    freq = profile.preferred_exercise_frequency if profile else 3
    try:
        clf_res = model_service.classify_activity(
            steps=float(steps),
            active_minutes=float(exercise_duration),
            distance_km=float(distance_km),
            exercise_frequency=freq
        )
        activity_level = clf_res["activity_level"]
    except Exception:
        activity_level = "Moderate Activity"

    record = ActivityRecord(
        activity_date=activity_date,
        activity_type=activity_type,
        steps=max(0, steps),
        distance_km=max(0.0, round(distance_km, 2)),
        exercise_duration=max(0, exercise_duration),
        water_intake=max(0.0, round(water_intake, 2)),
        sleep_duration=max(0.0, round(sleep_duration, 1)),
        body_weight_kg=body_weight_kg,
        estimated_calories=estimated_cals,
        activity_level=activity_level,
        notes=notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def update_activity(
    db: Session,
    activity_id: int,
    activity_date: date,
    activity_type: str,
    steps: int,
    distance_km: float,
    exercise_duration: int,
    water_intake: float,
    sleep_duration: float,
    body_weight_kg: Optional[float] = None,
    notes: Optional[str] = None
) -> Optional[ActivityRecord]:
    """Updates an existing activity record and recalculates ML insights."""
    record = get_activity_by_id(db, activity_id)
    if not record:
        return None

    model_service = get_model_service()
    if body_weight_kg is None or body_weight_kg <= 0:
        profile = db.query(UserProfile).first()
        effective_weight = profile.weight_kg if profile else 70.0
    else:
        effective_weight = body_weight_kg

    try:
        cal_res = model_service.predict_calories(
            duration_min=float(exercise_duration),
            distance_km=float(distance_km),
            steps=float(steps),
            activity_type=activity_type,
            body_weight_kg=effective_weight
        )
        estimated_cals = cal_res["estimated_calories"]
    except Exception:
        estimated_cals = round(exercise_duration * 6.5, 1)

    profile = db.query(UserProfile).first()
    freq = profile.preferred_exercise_frequency if profile else 3
    try:
        clf_res = model_service.classify_activity(
            steps=float(steps),
            active_minutes=float(exercise_duration),
            distance_km=float(distance_km),
            exercise_frequency=freq
        )
        activity_level = clf_res["activity_level"]
    except Exception:
        activity_level = "Moderate Activity"

    record.activity_date = activity_date
    record.activity_type = activity_type
    record.steps = max(0, steps)
    record.distance_km = max(0.0, round(distance_km, 2))
    record.exercise_duration = max(0, exercise_duration)
    record.water_intake = max(0.0, round(water_intake, 2))
    record.sleep_duration = max(0.0, round(sleep_duration, 1))
    record.body_weight_kg = body_weight_kg
    record.estimated_calories = estimated_cals
    record.activity_level = activity_level
    record.notes = notes

    db.commit()
    db.refresh(record)
    return record

def delete_activity(db: Session, activity_id: int) -> bool:
    """Deletes an activity record."""
    record = get_activity_by_id(db, activity_id)
    if not record:
        return False
    db.delete(record)
    db.commit()
    return True
