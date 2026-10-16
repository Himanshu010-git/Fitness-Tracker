"""
FitTrack AI - Activity API Routes
File: backend/routes/activity_routes.py
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from backend.database.connection import get_db
from backend.routes.schemas import ActivityCreateSchema, ActivityUpdateSchema, ActivityResponseSchema
from backend.services import activity_service

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.get("", response_model=List[ActivityResponseSchema])
def get_activities(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    activity_type: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db)
):
    """Retrieve list of recorded activities with optional date and type filters."""
    return activity_service.list_activities(
        db=db,
        start_date=start_date,
        end_date=end_date,
        activity_type=activity_type,
        limit=limit
    )

@router.get("/{activity_id}", response_model=ActivityResponseSchema)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    """Retrieve a single activity record by ID."""
    record = activity_service.get_activity_by_id(db, activity_id)
    if not record:
        raise HTTPException(status_code=404, detail="Activity record not found")
    return record

@router.post("", response_model=ActivityResponseSchema, status_code=status.HTTP_201_CREATED)
def create_activity(payload: ActivityCreateSchema, db: Session = Depends(get_db)):
    """Log a new activity record with automated ML calorie estimation and tier classification."""
    try:
        return activity_service.create_activity(
            db=db,
            activity_date=payload.activity_date,
            activity_type=payload.activity_type,
            steps=payload.steps,
            distance_km=payload.distance_km,
            exercise_duration=payload.exercise_duration,
            water_intake=payload.water_intake,
            sleep_duration=payload.sleep_duration,
            body_weight_kg=payload.body_weight_kg,
            notes=payload.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{activity_id}", response_model=ActivityResponseSchema)
def update_activity(activity_id: int, payload: ActivityUpdateSchema, db: Session = Depends(get_db)):
    """Update an existing activity record."""
    try:
        updated = activity_service.update_activity(
            db=db,
            activity_id=activity_id,
            activity_date=payload.activity_date,
            activity_type=payload.activity_type,
            steps=payload.steps,
            distance_km=payload.distance_km,
            exercise_duration=payload.exercise_duration,
            water_intake=payload.water_intake,
            sleep_duration=payload.sleep_duration,
            body_weight_kg=payload.body_weight_kg,
            notes=payload.notes
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Activity record not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    """Delete an activity record."""
    success = activity_service.delete_activity(db, activity_id)
    if not success:
        raise HTTPException(status_code=404, detail="Activity record not found")
    return None
