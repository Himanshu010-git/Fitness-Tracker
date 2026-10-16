"""
Unit Tests for Algorithm 4: ID3 Decision Tree (backend/ml_models/id3_decision_tree.py)
"""

import pytest
import pandas as pd
import math
from backend.ml_models.id3_decision_tree import ID3DecisionTree

def test_entropy_calculation():
    # Pure set -> entropy 0
    assert ID3DecisionTree.calculate_entropy(["Yes", "Yes", "Yes"]) == 0.0

    # 50/50 split -> entropy 1.0
    half_half = ID3DecisionTree.calculate_entropy(["Yes", "No"])
    assert math.isclose(half_half, 1.0, rel_tol=1e-5)

    # Empty list -> entropy 0
    assert ID3DecisionTree.calculate_entropy([]) == 0.0

def test_information_gain_calculation():
    data = [
        {"outlook": "Sunny", "play": "No"},
        {"outlook": "Sunny", "play": "No"},
        {"outlook": "Overcast", "play": "Yes"},
        {"outlook": "Rain", "play": "Yes"},
    ]
    gain = ID3DecisionTree.calculate_information_gain(data, "outlook", "play")
    assert gain > 0.0

def test_id3_fit_and_prediction():
    df = pd.DataFrame({
        "sleep": ["Poor", "Poor", "Adequate", "Optimal"],
        "fatigue": ["High", "High", "Low", "Low"],
        "target_recommendation": ["Rest", "Rest", "Standard", "Intense"]
    })

    tree = ID3DecisionTree()
    tree.fit(df, target_column="target_recommendation")

    assert tree.is_trained is True

    # Known predictions
    pred_rest = tree.predict_instance({"sleep": "Poor", "fatigue": "High"})
    assert pred_rest == "Rest"

    pred_standard = tree.predict_instance({"sleep": "Adequate", "fatigue": "Low"})
    assert pred_standard == "Standard"

def test_id3_unseen_value_fallback():
    df = pd.DataFrame({
        "sleep": ["Poor", "Adequate"],
        "fatigue": ["High", "Low"],
        "target_recommendation": ["Rest", "Standard"]
    })

    tree = ID3DecisionTree()
    tree.fit(df, target_column="target_recommendation")

    # Sample with completely unseen attribute value "UnknownValue"
    # Should not crash and should fall back safely to majority class
    pred = tree.predict_instance({"sleep": "UnknownValue", "fatigue": "UnknownFatigue"})
    assert pred in ["Rest", "Standard"]
