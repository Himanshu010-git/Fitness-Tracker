"""
FitTrack AI - Fitness Goals API Routes
File: backend/routes/goal_routes.py
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from backend.database.connection import get_db
from backend.routes.schemas import GoalCreateSchema, GoalUpdateSchema, GoalResponseSchema, LogAchievementSchema
from backend.services import goal_service

router = APIRouter(prefix="/goals", tags=["Fitness Goals"])


@router.get("", response_model=List[GoalResponseSchema])
def get_all_goals(db: Session = Depends(get_db)):
    """Retrieve all fitness goals with dynamic progress percentages."""
    return goal_service.list_goals(db)


@router.post("", response_model=GoalResponseSchema, status_code=status.HTTP_201_CREATED)
def create_new_goal(payload: GoalCreateSchema, db: Session = Depends(get_db)):
    """Create a new daily or weekly fitness goal with optional deadline."""
    goal = goal_service.create_goal(
        db=db,
        title=payload.title,
        goal_type=payload.goal_type,
        target_value=payload.target_value,
        unit=payload.unit,
        time_horizon=payload.time_horizon,
        target_date=payload.target_date
    )
    all_goals = goal_service.list_goals(db)
    for g in all_goals:
        if g["id"] == goal.id:
            return g
    return {
        "id": goal.id,
        "title": goal.title,
        "goal_type": goal.goal_type,
        "target_value": goal.target_value,
        "current_value": 0.0,
        "unit": goal.unit,
        "time_horizon": goal.time_horizon,
        "target_date": goal.target_date,
        "achieved_value": None,
        "achieved_date": None,
        "percentage": 0.0,
        "remaining": goal.target_value,
        "is_completed": False,
        "is_active": goal.is_active,
        "status_text": "New goal initialized."
    }


@router.put("/{goal_id}", response_model=GoalResponseSchema)
def update_existing_goal(goal_id: int, payload: GoalUpdateSchema, db: Session = Depends(get_db)):
    """Update goal targets, deadline, or active status."""
    updated = goal_service.update_goal(
        db=db,
        goal_id=goal_id,
        title=payload.title,
        goal_type=payload.goal_type,
        target_value=payload.target_value,
        unit=payload.unit,
        time_horizon=payload.time_horizon,
        target_date=payload.target_date,
        is_active=payload.is_active
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Goal not found")

    all_goals = goal_service.list_goals(db)
    for g in all_goals:
        if g["id"] == goal_id:
            return g
    raise HTTPException(status_code=500, detail="Failed to reload goal")


@router.post("/{goal_id}/achievement", response_model=GoalResponseSchema)
def log_achievement(goal_id: int, payload: LogAchievementSchema, db: Session = Depends(get_db)):
    """Log what the user actually achieved for a specific goal."""
    updated = goal_service.log_achievement(
        db=db,
        goal_id=goal_id,
        achieved_value=payload.achieved_value,
        achieved_date=payload.achieved_date
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Goal not found")

    all_goals = goal_service.list_goals(db)
    for g in all_goals:
        if g["id"] == goal_id:
            return g
    raise HTTPException(status_code=500, detail="Failed to reload goal after logging achievement")


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    """Permanently delete a fitness goal."""
    success = goal_service.delete_goal(db, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return None
