"""
Unit Tests for Algorithm 3: Find-S (backend/ml_models/find_s.py)
"""

import pytest
from backend.ml_models.find_s import FindSClassifier

def test_find_s_generalization():
    features = ["duration", "sleep", "hydration"]
    X = [
        ["Moderate", "Adequate", "Adequate"], # Positive 1
        ["Short",    "Poor",     "Low"],      # Negative (should be ignored)
        ["Long",     "Adequate", "Adequate"], # Positive 2 (duration differs -> ?)
    ]
    y = ["Yes", "No", "Yes"]

    clf = FindSClassifier(positive_label="Yes")
    clf.fit(X, y, feature_names=features)

    assert clf.is_trained is True
    hypothesis = clf.get_hypothesis()

    # duration differs ("Moderate" vs "Long") -> "?"
    # sleep is identical ("Adequate") -> "Adequate"
    # hydration is identical ("Adequate") -> "Adequate"
    assert hypothesis["duration"] == "?"
    assert hypothesis["sleep"] == "Adequate"
    assert hypothesis["hydration"] == "Adequate"

def test_find_s_prediction():
    features = ["duration", "sleep", "hydration"]
    X = [
        ["Moderate", "Adequate", "Adequate"],
        ["Long",     "Adequate", "Adequate"]
    ]
    y = ["Yes", "Yes"]

    clf = FindSClassifier(positive_label="Yes")
    clf.fit(X, y, feature_names=features)

    # Matching instance: any duration, Adequate sleep, Adequate hydration
    match_sample = {"duration": "Short", "sleep": "Adequate", "hydration": "Adequate"}
    assert clf.predict_instance(match_sample) is True

    # Non-matching instance: sleep is Poor
    non_match_sample = {"duration": "Long", "sleep": "Poor", "hydration": "Adequate"}
    assert clf.predict_instance(non_match_sample) is False

def test_find_s_explain():
    clf = FindSClassifier(positive_label="Yes")
    clf.fit([["A", "B"]], ["Yes"], feature_names=["F1", "F2"])
    explanation = clf.explain()

    assert "hypothesis" in explanation
    assert "total_positive_samples_processed" in explanation
    assert explanation["total_positive_samples_processed"] == 1
