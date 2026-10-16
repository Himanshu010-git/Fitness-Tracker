"""
FitTrack AI - AI Fitness Recommendation Service Layer
File: backend/services/recommendation_service.py

Synthesizes user profile data, recent activity logs, and outputs from all 4 ML models
into cohesive, high-value fitness insights.
"""

from datetime import date, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database.models import ActivityRecord, UserProfile, FitnessGoal
from backend.ml_models.model_service import get_model_service

def generate_user_insights(db: Session) -> Dict[str, Any]:
    """
    Generates personalized fitness insights using ML models based on user's real data.
    Gracefully handles empty states and provides beginner-friendly guidance.
    """
    profile = db.query(UserProfile).first()
    recent_activities = db.query(ActivityRecord).order_by(desc(ActivityRecord.activity_date)).limit(14).all()
    model_service = get_model_service()

    weight = profile.weight_kg if profile else 70.0
    frequency = profile.preferred_exercise_frequency if profile else 3
    objective = profile.fitness_objective if profile else "Improve endurance"

    # Empty State Handling
    if not recent_activities:
        return {
            "has_data": False,
            "summary_title": "Welcome to FitTrack AI!",
            "overview_message": "Log your first workout or daily activity to unlock AI-powered calorie estimations, activity tier classifications, and intelligent workout readiness recommendations.",
            "ml_status": "Waiting for initial activity records",
            "readiness_recommendation": {
                "title": "Getting Started",
                "focus": "Baseline Assessment",
                "guidance": "Start with a comfortable 20-30 minute walk or light exercise session today to establish your activity baseline.",
                "accent_color": "blue"
            },
            "habit_alignment": {
                "status": "Awaiting Data",
                "message": "Aim for 30+ minutes of movement, 7-8 hours of sleep, and 2-3 liters of water daily to establish optimal fitness habits.",
                "is_aligned": False
            },
            "recent_averages": {
                "avg_steps": 0,
                "avg_duration": 0,
                "avg_sleep": 0.0,
                "avg_water": 0.0,
                "total_records": 0
            }
        }

    # Calculate recent aggregate metrics
    count = len(recent_activities)
    avg_steps = sum(a.steps for a in recent_activities) / count
    avg_duration = sum(a.exercise_duration for a in recent_activities) / count
    avg_dist = sum(a.distance_km for a in recent_activities) / count
    avg_sleep = sum(a.sleep_duration for a in recent_activities) / count
    avg_water = sum(a.water_intake for a in recent_activities) / count

    latest = recent_activities[0]

    # 1. KNN Classification: Current Activity Level
    clf_res = model_service.classify_activity(
        steps=latest.steps,
        active_minutes=float(latest.exercise_duration),
        distance_km=latest.distance_km,
        exercise_frequency=frequency
    )

    # 2. Find-S Concept Learning: Habit Consistency
    find_s_res = model_service.evaluate_habit_consistency(
        duration_min=avg_duration,
        weekly_frequency=frequency,
        sleep_hours=avg_sleep,
        water_liters=avg_water
    )

    # 3. ID3 Decision Tree: Daily Readiness & Focus
    # Assess fatigue context based on sleep and consecutive active days
    fatigue = "Low"
    if latest.sleep_duration < 6.0:
        fatigue = "High"
    elif count >= 3 and avg_duration > 60:
        fatigue = "Moderate"

    id3_res = model_service.recommend_workout(
        steps=latest.steps,
        duration_min=float(latest.exercise_duration),
        sleep_hours=latest.sleep_duration,
        fatigue_level=fatigue
    )

    # 4. KNN Regression Context: Typical session burn
    reg_res = model_service.predict_calories(
        duration_min=max(20.0, avg_duration),
        distance_km=max(1.0, avg_dist),
        steps=max(2000.0, avg_steps),
        activity_type=profile.preferred_exercise_type if profile else "Walking",
        body_weight_kg=weight
    )

    return {
        "has_data": True,
        "summary_title": f"Activity Insights for {profile.display_name if profile else 'You'}",
        "overview_message": f"Based on your recent {count} activity log(s), your activity profile shows steady movement aligned with your objective to '{objective}'.",
        "current_activity_tier": clf_res["activity_level"],
        "activity_tier_tip": clf_res["tip"],
        "readiness_recommendation": {
            "title": id3_res["title"],
            "focus": id3_res["recommended_focus"],
            "guidance": id3_res["guidance"],
            "accent_color": id3_res["accent_color"]
        },
        "habit_alignment": {
            "status": find_s_res["habit_status"],
            "message": find_s_res["message"],
            "is_aligned": find_s_res["is_aligned"]
        },
        "estimated_session_calories": reg_res["estimated_calories"],
        "recent_averages": {
            "avg_steps": int(round(avg_steps)),
            "avg_duration": int(round(avg_duration)),
            "avg_sleep": round(avg_sleep, 1),
            "avg_water": round(avg_water, 2),
            "total_records": count
        }
    }
