"""
FitTrack AI - Initial Activity Seeding Script
Populates 14 days of realistic user fitness activities in SQLite
to ensure the dashboard, progress analytics, and AI insights display rich live data on first launch.
"""

from datetime import date, timedelta
import random
from backend.database.connection import SessionLocal, init_db
from backend.database.models import ActivityRecord, UserProfile, FitnessGoal
from backend.services.activity_service import create_activity

def seed_demo_activities():
    init_db()
    db = SessionLocal()
    try:
        # Check if already seeded
        count = db.query(ActivityRecord).count()
        if count >= 10:
            print(f"Database already has {count} activity records.")
            return

        print("Seeding realistic 14-day activity logs...")
        today = date.today()

        sample_sessions = [
            # (days_ago, activity_type, duration, distance, steps, water, sleep, weight, notes)
            (13, "Walking", 35, 2.8, 4800, 2.0, 7.0, 70.8, "Neighborhood evening stroll"),
            (12, "Running", 40, 5.5, 6200, 2.5, 7.5, 70.6, "Morning park jog"),
            (11, "Strength Training", 50, 0.5, 2100, 2.2, 8.0, 70.6, "Upper body workout"),
            (10, "Cycling", 45, 12.0, 1100, 2.5, 6.5, 70.5, "Outdoor road cycle"),
            (9, "Yoga", 30, 0.2, 800, 2.0, 8.0, 70.4, "Gentle mobility and stretch"),
            (8, "Walking", 45, 3.8, 6100, 2.2, 7.5, 70.4, "Brisk lunch walk"),
            (7, "Running", 50, 7.0, 8500, 3.0, 7.0, 70.3, "Interval running training"),
            (6, "Cycling", 60, 16.5, 1400, 2.8, 7.5, 70.2, "Weekend long cycle ride"),
            (5, "Strength Training", 45, 0.4, 1900, 2.5, 8.0, 70.2, "Leg day resistance workout"),
            (4, "Walking", 40, 3.2, 5400, 2.2, 7.0, 70.1, "Campus walking"),
            (3, "Running", 45, 6.2, 7400, 2.8, 7.5, 70.0, "Morning tempo run"),
            (2, "Swimming", 40, 1.2, 600, 2.5, 8.0, 70.0, "Laps at the community pool"),
            (1, "Walking", 30, 2.5, 4200, 2.0, 7.5, 69.9, "Active recovery walk"),
            (0, "Running", 45, 6.5, 7800, 2.8, 7.5, 69.9, "Today's morning run session"),
        ]

        for days_ago, act_type, duration, dist, steps, water, sleep, weight, notes in sample_sessions:
            act_date = today - timedelta(days=days_ago)
            create_activity(
                db=db,
                activity_date=act_date,
                activity_type=act_type,
                steps=steps,
                distance_km=dist,
                exercise_duration=duration,
                water_intake=water,
                sleep_duration=sleep,
                body_weight_kg=weight,
                notes=notes
            )

        print(f"Successfully seeded {len(sample_sessions)} activity records into SQLite.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_activities()
