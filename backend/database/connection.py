"""
FitTrack AI - SQLite Database Connection & Session Management
File: backend/database/connection.py
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Set database path in backend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "fittrack.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI Dependency for database session injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes SQLite database tables and default profile."""
    from backend.database.models import UserProfile, FitnessGoal, ActivityRecord
    Base.metadata.create_all(bind=engine)

    # Seed default user profile and initial fitness goals if empty
    db = SessionLocal()
    try:
        profile = db.query(UserProfile).first()
        if not profile:
            default_profile = UserProfile(
                id=1,
                display_name="Alex Turner",
                age=24,
                height_cm=175.0,
                weight_kg=70.0,
                preferred_exercise_type="Running",
                fitness_objective="Improve endurance",
                available_workout_time=45,
                preferred_exercise_frequency=4
            )
            db.add(default_profile)

        # Seed initial sample goals if none exist
        if db.query(FitnessGoal).count() == 0:
            default_goals = [
                FitnessGoal(
                    title="Daily Steps Target",
                    goal_type="daily_steps",
                    target_value=10000.0,
                    unit="steps",
                    time_horizon="daily",
                    is_active=True
                ),
                FitnessGoal(
                    title="Daily Active Minutes",
                    goal_type="daily_active_minutes",
                    target_value=45.0,
                    unit="mins",
                    time_horizon="daily",
                    is_active=True
                ),
                FitnessGoal(
                    title="Weekly Running Distance",
                    goal_type="weekly_distance",
                    target_value=20.0,
                    unit="km",
                    time_horizon="weekly",
                    is_active=True
                ),
                FitnessGoal(
                    title="Daily Water Intake",
                    goal_type="daily_water",
                    target_value=3.0,
                    unit="L",
                    time_horizon="daily",
                    is_active=True
                ),
                FitnessGoal(
                    title="Nightly Recovery Sleep",
                    goal_type="daily_sleep",
                    target_value=8.0,
                    unit="hours",
                    time_horizon="daily",
                    is_active=True
                )
            ]
            db.add_all(default_goals)

        db.commit()
    finally:
        db.close()
