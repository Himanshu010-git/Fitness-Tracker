"""
Unit Tests for Algorithm 2: KNN Classification (backend/ml_models/knn_classification.py)
"""

import pytest
import pandas as pd
from backend.ml_models.knn_classification import ActivityKNNClassifier, ACTIVITY_CLASSES

@pytest.fixture
def sample_clf_dataset():
    data = {
        "steps": [1500, 2000, 2500, 3000, 6000, 7000, 8000, 8500, 11000, 13000, 15000, 16000],
        "active_minutes": [12, 15, 20, 25, 35, 45, 50, 55, 70, 85, 95, 110],
        "distance_km": [1.0, 1.5, 2.0, 2.2, 4.5, 5.2, 6.0, 6.5, 8.5, 10.0, 11.5, 12.0],
        "exercise_frequency": [0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 6],
        "target_activity_level": [
            "Low Activity", "Low Activity", "Low Activity", "Low Activity",
            "Moderate Activity", "Moderate Activity", "Moderate Activity", "Moderate Activity",
            "High Activity", "High Activity", "High Activity", "High Activity"
        ]
    }
    return pd.DataFrame(data)

def test_knn_classification_training_and_metrics(sample_clf_dataset):
    model = ActivityKNNClassifier(n_neighbors=3)
    metrics = model.train(sample_clf_dataset, test_size=0.33, random_state=42)

    assert model.is_trained is True
    assert "accuracy" in metrics
    assert "confusion_matrix" in metrics
    assert metrics["accuracy"] >= 0.0

def test_knn_classification_prediction(sample_clf_dataset):
    model = ActivityKNNClassifier(n_neighbors=3)
    model.train(sample_clf_dataset)

    # Test high activity prediction
    res_high = model.predict(steps=12000, active_minutes=80, distance_km=9.0, exercise_frequency=5)
    assert res_high["activity_level"] in ACTIVITY_CLASSES
    assert "tip" in res_high
    assert "confidence" in res_high

    # Test low activity prediction
    res_low = model.predict(steps=1800, active_minutes=15, distance_km=1.2, exercise_frequency=1)
    assert res_low["activity_level"] in ACTIVITY_CLASSES

def test_knn_classification_invalid_input(sample_clf_dataset):
    model = ActivityKNNClassifier(n_neighbors=3)
    model.train(sample_clf_dataset)

    with pytest.raises(ValueError):
        model.predict(steps=-500, active_minutes=30, distance_km=2.0)
