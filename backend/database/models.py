"""
FitTrack AI - SQLAlchemy Database Models
File: backend/database/models.py
"""

from datetime import datetime, date, timezone

def utc_now():
    return datetime.now(timezone.utc)
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, Text
from backend.database.connection import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    display_name = Column(String(100), default="Fitness Enthusiast")
    age = Column(Integer, default=25)
    height_cm = Column(Float, default=175.0)
    weight_kg = Column(Float, default=70.0)
    preferred_exercise_type = Column(String(50), default="Running")
    fitness_objective = Column(String(100), default="Improve endurance")
    available_workout_time = Column(Integer, default=45)
    preferred_exercise_frequency = Column(Integer, default=4)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class ActivityRecord(Base):
    __tablename__ = "activity_records"

    id = Column(Integer, primary_key=True, index=True)
    activity_date = Column(Date, nullable=False, default=date.today, index=True)
    activity_type = Column(String(50), nullable=False, default="Walking")
    steps = Column(Integer, default=0)
    distance_km = Column(Float, default=0.0)
    exercise_duration = Column(Integer, default=0)  # minutes
    water_intake = Column(Float, default=0.0)       # liters
    sleep_duration = Column(Float, default=0.0)     # hours
    body_weight_kg = Column(Float, nullable=True)   # optional kg
    estimated_calories = Column(Float, default=0.0) # kcal predicted by KNN Regression or logged
    activity_level = Column(String(50), default="Moderate Activity") # predicted by KNN Classification
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class FitnessGoal(Base):
    __tablename__ = "fitness_goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    goal_type = Column(String(50), nullable=False) # daily_steps, daily_active_minutes, weekly_distance, daily_water, daily_sleep
    target_value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    time_horizon = Column(String(20), default="daily") # daily or weekly
    target_date = Column(Date, nullable=True)           # optional deadline
    achieved_value = Column(Float, nullable=True)       # what user actually did
    achieved_date = Column(Date, nullable=True)         # when they logged it
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
