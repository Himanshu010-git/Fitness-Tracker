"""
Unit Tests for Algorithm 1: KNN Regression (backend/ml_models/knn_regression.py)
"""

import pytest
import pandas as pd
from backend.ml_models.knn_regression import CalorieKNNRegressor

@pytest.fixture
def sample_dataset():
    data = {
        "duration_min": [20, 30, 45, 60, 90, 30, 45, 60],
        "distance_km": [2.0, 3.5, 5.0, 7.5, 12.0, 3.0, 4.8, 6.0],
        "steps": [2500, 4000, 6000, 9000, 14000, 3800, 5800, 8000],
        "activity_type": ["Walking", "Running", "Running", "Running", "Cycling", "Walking", "Running", "Running"],
        "body_weight_kg": [70.0, 68.0, 72.0, 75.0, 80.0, 65.0, 70.0, 74.0],
        "target_calories": [110.0, 290.0, 440.0, 620.0, 750.0, 160.0, 420.0, 580.0]
    }
    return pd.DataFrame(data)

def test_knn_regression_training_and_metrics(sample_dataset):
    model = CalorieKNNRegressor(n_neighbors=3)
    metrics = model.train(sample_dataset, test_size=0.25, random_state=42)

    assert model.is_trained is True
    assert "mae" in metrics
    assert "rmse" in metrics
    assert "r2" in metrics
    assert metrics["test_samples"] > 0

def test_knn_regression_prediction_valid_input(sample_dataset):
    model = CalorieKNNRegressor(n_neighbors=3)
    model.train(sample_dataset)

    res = model.predict(
        duration_min=45.0,
        distance_km=5.0,
        steps=6000.0,
        activity_type="Running",
        body_weight_kg=70.0
    )

    assert "estimated_calories" in res
    assert isinstance(res["estimated_calories"], float)
    assert res["estimated_calories"] > 0
    assert res["unit"] == "kcal"

def test_knn_regression_zero_duration(sample_dataset):
    model = CalorieKNNRegressor(n_neighbors=3)
    model.train(sample_dataset)

    res = model.predict(
        duration_min=0.0,
        distance_km=0.0,
        steps=0.0,
        activity_type="Walking"
    )

    assert res["estimated_calories"] == 0.0

def test_knn_regression_invalid_input(sample_dataset):
    model = CalorieKNNRegressor(n_neighbors=3)
    model.train(sample_dataset)

    with pytest.raises(ValueError):
        model.predict(
            duration_min=-10.0,
            distance_km=5.0,
            steps=3000.0,
            activity_type="Walking"
        )

def test_knn_regression_untrained_error():
    model = CalorieKNNRegressor(n_neighbors=3)
    with pytest.raises(RuntimeError):
        model.predict(
            duration_min=30.0,
            distance_km=3.0,
            steps=3000.0,
            activity_type="Walking"
        )
