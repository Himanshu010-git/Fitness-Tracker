"""
FitTrack AI - Progress Analytics API Routes
File: backend/routes/analytics_routes.py

Aggregates real user activity records into chart-ready time-series and distributions.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date, timedelta
from typing import Dict, Any, List

from backend.database.connection import get_db
from backend.database.models import ActivityRecord, FitnessGoal

router = APIRouter(prefix="/analytics", tags=["Progress Analytics"])

@router.get("")
def get_analytics(
    range_param: str = Query(default="30d", alias="range"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns time-series metrics, distributions, and summary statistics
    for the selected date range ('7d', '30d', '90d', 'all').
    """
    today = date.today()
    if range_param == "7d":
        start_date = today - timedelta(days=6)
    elif range_param == "90d":
        start_date = today - timedelta(days=89)
    elif range_param == "all":
        start_date = None
    else:  # default '30d'
        start_date = today - timedelta(days=29)

    query = db.query(ActivityRecord)
    if start_date:
        query = query.filter(ActivityRecord.activity_date >= start_date)

    records = query.order_by(ActivityRecord.activity_date.asc(), ActivityRecord.id.asc()).all()

    if not records:
        return {
            "has_data": False,
            "range": range_param,
            "total_activities": 0,
            "summary": {
                "total_steps": 0,
                "total_calories": 0.0,
                "total_distance_km": 0.0,
                "total_duration_hours": 0.0,
                "avg_daily_steps": 0,
                "avg_daily_sleep": 0.0,
                "avg_water_liters": 0.0
            },
            "daily_trends": [],
            "activity_distribution": [],
            "weight_trends": [],
            "activity_level_breakdown": []
        }

    # Group records by date (since multiple activities can happen on the same date)
    daily_map: Dict[str, Dict[str, Any]] = {}
    activity_type_counts: Dict[str, int] = {}
    activity_type_duration: Dict[str, int] = {}
    activity_level_counts: Dict[str, int] = {}
    weight_points: List[Dict[str, Any]] = []

    total_steps = 0
    total_calories = 0.0
    total_distance = 0.0
    total_duration_mins = 0

    for r in records:
        d_str = r.activity_date.isoformat()
        if d_str not in daily_map:
            daily_map[d_str] = {
                "date": d_str,
                "steps": 0,
                "calories": 0.0,
                "distance_km": 0.0,
                "duration_min": 0,
                "water_liters": 0.0,
                "sleep_hours": 0.0,
                "sessions_count": 0
            }

        daily_map[d_str]["steps"] += r.steps
        daily_map[d_str]["calories"] += r.estimated_calories
        daily_map[d_str]["distance_km"] += r.distance_km
        daily_map[d_str]["duration_min"] += r.exercise_duration
        daily_map[d_str]["water_liters"] = max(daily_map[d_str]["water_liters"], r.water_intake)
        daily_map[d_str]["sleep_hours"] = max(daily_map[d_str]["sleep_hours"], r.sleep_duration)
        daily_map[d_str]["sessions_count"] += 1

        total_steps += r.steps
        total_calories += r.estimated_calories
        total_distance += r.distance_km
        total_duration_mins += r.exercise_duration

        # Distributions
        act_type = r.activity_type
        activity_type_counts[act_type] = activity_type_counts.get(act_type, 0) + 1
        activity_type_duration[act_type] = activity_type_duration.get(act_type, 0) + r.exercise_duration

        tier = r.activity_level or "Moderate Activity"
        activity_level_counts[tier] = activity_level_counts.get(tier, 0) + 1

        if r.body_weight_kg and r.body_weight_kg > 0:
            weight_points.append({
                "date": d_str,
                "weight_kg": r.body_weight_kg
            })

    daily_trends = sorted(list(daily_map.values()), key=lambda x: x["date"])
    for d in daily_trends:
        d["calories"] = round(d["calories"], 1)
        d["distance_km"] = round(d["distance_km"], 2)

    unique_days = len(daily_trends)
    avg_daily_steps = int(round(total_steps / unique_days)) if unique_days > 0 else 0
    avg_sleep = round(sum(d["sleep_hours"] for d in daily_trends) / unique_days, 1) if unique_days > 0 else 0.0
    avg_water = round(sum(d["water_liters"] for d in daily_trends) / unique_days, 2) if unique_days > 0 else 0.0

    distribution = [
        {"name": act, "count": count, "duration_min": activity_type_duration.get(act, 0)}
        for act, count in sorted(activity_type_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    tier_breakdown = [
        {"name": tier, "count": count}
        for tier, count in activity_level_counts.items()
    ]

    return {
        "has_data": True,
        "range": range_param,
        "total_activities": len(records),
        "unique_days_active": unique_days,
        "summary": {
            "total_steps": total_steps,
            "total_calories": round(total_calories, 1),
            "total_distance_km": round(total_distance, 2),
            "total_duration_hours": round(total_duration_mins / 60.0, 1),
            "avg_daily_steps": avg_daily_steps,
            "avg_daily_sleep": avg_sleep,
            "avg_water_liters": avg_water
        },
        "daily_trends": daily_trends,
        "activity_distribution": distribution,
        "weight_trends": weight_points,
        "activity_level_breakdown": tier_breakdown
    }
