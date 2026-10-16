"""
FitTrack AI - Goal Service Layer
File: backend/services/goal_service.py

Calculates dynamic, actual goal progress from real recorded activity metrics.
Supports daily and weekly time horizons. Also handles achievement logging.
"""

from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database.models import FitnessGoal, ActivityRecord


def list_goals(db: Session) -> List[Dict[str, Any]]:
    """Retrieves all goals with dynamically calculated actual progress."""
    goals = db.query(FitnessGoal).all()
    today = date.today()
    week_start = today - timedelta(days=6)

    # Fetch today's activities
    today_records = db.query(ActivityRecord).filter(ActivityRecord.activity_date == today).all()
    today_steps = sum(r.steps for r in today_records)
    today_mins = sum(r.exercise_duration for r in today_records)
    today_water = sum(r.water_intake for r in today_records)
    today_sleep = max([r.sleep_duration for r in today_records] + [0.0])

    # Fetch 7-day activities for weekly targets
    week_records = db.query(ActivityRecord).filter(
        ActivityRecord.activity_date >= week_start,
        ActivityRecord.activity_date <= today
    ).all()
    week_distance = sum(r.distance_km for r in week_records)
    week_steps = sum(r.steps for r in week_records)
    week_mins = sum(r.exercise_duration for r in week_records)

    results = []
    for g in goals:
        # If the user manually logged an achievement, use that for display
        if g.achieved_value is not None:
            current_val = float(g.achieved_value)
        else:
            current_val = 0.0
            if g.goal_type == "daily_steps":
                current_val = float(today_steps)
            elif g.goal_type == "daily_active_minutes":
                current_val = float(today_mins)
            elif g.goal_type == "weekly_distance":
                current_val = float(week_distance)
            elif g.goal_type == "weekly_steps":
                current_val = float(week_steps)
            elif g.goal_type == "weekly_active_minutes":
                current_val = float(week_mins)
            elif g.goal_type == "daily_water":
                current_val = float(today_water)
            elif g.goal_type == "daily_sleep":
                current_val = float(today_sleep)
            else:
                current_val = float(today_steps)

        pct = min(100.0, round((current_val / g.target_value) * 100, 1)) if g.target_value > 0 else 0.0
        remaining = max(0.0, round(g.target_value - current_val, 1))
        is_completed = current_val >= g.target_value

        # Status text
        if is_completed:
            status_text = "🎯 Goal achieved! Excellent work."
        elif g.target_date and g.target_date < today:
            status_text = f"⚠️ Deadline passed. {remaining} {g.unit} remaining."
        elif pct >= 75:
            status_text = f"Almost there! {remaining} {g.unit} remaining."
        elif pct >= 40:
            status_text = f"Solid headway. {remaining} {g.unit} to go."
        else:
            status_text = f"In progress. {remaining} {g.unit} to target."

        results.append({
            "id": g.id,
            "title": g.title,
            "goal_type": g.goal_type,
            "target_value": g.target_value,
            "current_value": round(current_val, 1),
            "unit": g.unit,
            "time_horizon": g.time_horizon,
            "target_date": g.target_date,
            "achieved_value": g.achieved_value,
            "achieved_date": g.achieved_date,
            "percentage": pct,
            "remaining": remaining,
            "is_completed": is_completed,
            "is_active": g.is_active,
            "status_text": status_text
        })

    return results


def get_goal_by_id(db: Session, goal_id: int) -> Optional[FitnessGoal]:
    return db.query(FitnessGoal).filter(FitnessGoal.id == goal_id).first()


def create_goal(
    db: Session,
    title: str,
    goal_type: str,
    target_value: float,
    unit: str,
    time_horizon: str = "daily",
    target_date=None
) -> FitnessGoal:
    goal = FitnessGoal(
        title=title,
        goal_type=goal_type,
        target_value=max(0.1, target_value),
        unit=unit,
        time_horizon=time_horizon,
        target_date=target_date,
        is_active=True
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def update_goal(
    db: Session,
    goal_id: int,
    title: str,
    goal_type: str,
    target_value: float,
    unit: str,
    time_horizon: str = "daily",
    target_date=None,
    is_active: bool = True
) -> Optional[FitnessGoal]:
    goal = get_goal_by_id(db, goal_id)
    if not goal:
        return None
    goal.title = title
    goal.goal_type = goal_type
    goal.target_value = max(0.1, target_value)
    goal.unit = unit
    goal.time_horizon = time_horizon
    goal.target_date = target_date
    goal.is_active = is_active
    db.commit()
    db.refresh(goal)
    return goal


def log_achievement(
    db: Session,
    goal_id: int,
    achieved_value: float,
    achieved_date=None
) -> Optional[FitnessGoal]:
    """Log what the user actually achieved for a goal."""
    goal = get_goal_by_id(db, goal_id)
    if not goal:
        return None
    goal.achieved_value = achieved_value
    goal.achieved_date = achieved_date or date.today()
    db.commit()
    db.refresh(goal)
    return goal


def delete_goal(db: Session, goal_id: int) -> bool:
    goal = get_goal_by_id(db, goal_id)
    if not goal:
        return False
    db.delete(goal)
    db.commit()
    return True
