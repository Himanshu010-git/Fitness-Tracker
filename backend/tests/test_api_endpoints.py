"""
Integration Tests for FitTrack AI FastAPI Backend Endpoints
Tests activity CRUD, goals, profile, analytics, and AI insight sandbox endpoints.
"""

import pytest
from starlette.testclient import TestClient
from backend.main import app
from backend.database.connection import init_db

# Ensure tables and initial profile exist for testing
init_db()
client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "ml_models" in data

def test_profile_endpoints():
    # 1. Get Profile
    res = client.get("/api/profile")
    assert res.status_code == 200
    data = res.json()
    assert "display_name" in data
    assert "bmi" in data
    assert "bmi_category" in data

    # 2. Update Profile
    update_payload = {
        "display_name": "Jordan Fit",
        "age": 26,
        "height_cm": 180.0,
        "weight_kg": 75.0,
        "preferred_exercise_type": "Running",
        "fitness_objective": "Improve endurance",
        "available_workout_time": 50,
        "preferred_exercise_frequency": 5
    }
    res_update = client.put("/api/profile", json=update_payload)
    assert res_update.status_code == 200
    updated_data = res_update.json()
    assert updated_data["display_name"] == "Jordan Fit"
    assert updated_data["height_cm"] == 180.0

def test_activity_crud_lifecycle():
    # 1. Create activity
    payload = {
        "activity_date": "2026-10-15",
        "activity_type": "Running",
        "steps": 7500,
        "distance_km": 6.2,
        "exercise_duration": 40,
        "water_intake": 2.5,
        "sleep_duration": 7.5,
        "body_weight_kg": 72.0,
        "notes": "Morning jog around the park"
    }
    res_create = client.post("/api/activities", json=payload)
    assert res_create.status_code == 201
    act = res_create.json()
    act_id = act["id"]
    assert act["steps"] == 7500
    assert act["estimated_calories"] > 0
    assert act["activity_level"] in ["Low Activity", "Moderate Activity", "High Activity"]

    # 2. Get activity by id
    res_get = client.get(f"/api/activities/{act_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == act_id

    # 3. Update activity
    update_payload = {
        "activity_date": "2026-10-15",
        "activity_type": "Running",
        "steps": 8500,
        "distance_km": 7.0,
        "exercise_duration": 45,
        "water_intake": 3.0,
        "sleep_duration": 8.0,
        "body_weight_kg": 72.0,
        "notes": "Updated jog distance"
    }
    res_put = client.put(f"/api/activities/{act_id}", json=update_payload)
    assert res_put.status_code == 200
    assert res_put.json()["steps"] == 8500

    # 4. Delete activity
    res_del = client.delete(f"/api/activities/{act_id}")
    assert res_del.status_code == 204

    # Verify deleted
    res_verify = client.get(f"/api/activities/{act_id}")
    assert res_verify.status_code == 404

def test_goal_endpoints():
    # 1. Get all goals
    res = client.get("/api/goals")
    assert res.status_code == 200
    goals = res.json()
    assert isinstance(goals, list)
    assert len(goals) > 0

    # 2. Create goal
    new_goal = {
        "title": "Daily Water Target",
        "goal_type": "daily_water",
        "target_value": 3.5,
        "unit": "L",
        "time_horizon": "daily"
    }
    res_create = client.post("/api/goals", json=new_goal)
    assert res_create.status_code == 201
    created_goal = res_create.json()
    goal_id = created_goal["id"]

    # 3. Delete goal
    res_del = client.delete(f"/api/goals/{goal_id}")
    assert res_del.status_code == 204

def test_analytics_endpoint():
    res = client.get("/api/analytics?range=30d")
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "daily_trends" in data
    assert "activity_distribution" in data

def test_insight_endpoints():
    # 1. Overview insights
    res_ins = client.get("/api/insights")
    assert res_ins.status_code == 200
    data = res_ins.json()
    assert "summary_title" in data
    assert "readiness_recommendation" in data

    # 2. KNN Regression Sandbox
    reg_payload = {
        "duration_min": 45.0,
        "distance_km": 5.0,
        "steps": 6000.0,
        "activity_type": "Running",
        "body_weight_kg": 70.0
    }
    res_reg = client.post("/api/insights/predict-calories", json=reg_payload)
    assert res_reg.status_code == 200
    assert res_reg.json()["estimated_calories"] > 0

    # 3. KNN Classification Sandbox
    clf_payload = {
        "steps": 12000.0,
        "active_minutes": 65.0,
        "distance_km": 9.0,
        "exercise_frequency": 4
    }
    res_clf = client.post("/api/insights/classify-activity", json=clf_payload)
    assert res_clf.status_code == 200
    assert "activity_level" in res_clf.json()

    # 4. ID3 Decision Tree Sandbox
    id3_payload = {
        "steps": 8000.0,
        "duration_min": 45.0,
        "sleep_hours": 8.0,
        "fatigue_level": "Low"
    }
    res_id3 = client.post("/api/insights/readiness-recommendation", json=id3_payload)
    assert res_id3.status_code == 200
    assert "recommended_focus" in res_id3.json()

    # 5. Model Status Meta
    res_meta = client.get("/api/insights/models-status")
    assert res_meta.status_code == 200
    assert "knn_regression" in res_meta.json()
    assert "knn_classification" in res_meta.json()
    assert "find_s" in res_meta.json()
    assert "id3_decision_tree" in res_meta.json()
