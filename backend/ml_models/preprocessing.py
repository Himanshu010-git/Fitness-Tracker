"""
FitTrack AI - ML Preprocessing & Feature Transformation Utilities
Contains modular helper functions for feature binning, categorical discretization,
scaling, validation, and encoding to keep preprocessing consistent between training and inference.
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np

# Valid activity types supported across models and application
VALID_ACTIVITIES = [
    "Walking",
    "Running",
    "Cycling",
    "Strength Training",
    "Yoga",
    "Swimming",
    "HIIT",
    "Other"
]

def validate_numeric(val: Any, name: str, min_val: float = 0.0, max_val: float = 100000.0) -> float:
    """Validates numeric input within realistic bounds."""
    try:
        f_val = float(val)
    except (ValueError, TypeError):
        raise ValueError(f"Feature '{name}' must be a valid number, got {val}")
    if f_val < min_val or f_val > max_val:
        raise ValueError(f"Feature '{name}' ({f_val}) must be between {min_val} and {max_val}")
    return f_val

def discretize_steps(steps: float) -> str:
    """Discretize step count into categorical bins."""
    val = float(steps)
    if val < 5000:
        return "Low"
    elif val < 10000:
        return "Moderate"
    else:
        return "High"

def discretize_duration(minutes: float) -> str:
    """Discretize duration in minutes into categorical bins."""
    val = float(minutes)
    if val < 30:
        return "Short"
    elif val <= 60:
        return "Moderate"
    else:
        return "Long"

def discretize_sleep(hours: float) -> str:
    """Discretize sleep duration in hours into categorical bins."""
    val = float(hours)
    if val < 6.0:
        return "Poor"
    elif val <= 8.5:
        return "Adequate"
    else:
        return "Optimal"

def discretize_hydration(liters: float) -> str:
    """Discretize water intake in liters into categorical bins."""
    val = float(liters)
    if val < 1.5:
        return "Low"
    elif val <= 3.0:
        return "Adequate"
    else:
        return "Optimal"

def discretize_frequency(weekly_days: int) -> str:
    """Discretize exercise frequency into categorical bins."""
    val = int(weekly_days)
    if val < 2:
        return "Low"
    elif val <= 4:
        return "Medium"
    else:
        return "High"

def normalize_activity_type(activity: str) -> str:
    """Normalize and match activity string to supported list."""
    if not activity:
        return "Walking"
    cleaned = str(activity).strip().title()
    for act in VALID_ACTIVITIES:
        if cleaned.lower() == act.lower():
            return act
    return "Other"

def extract_categorical_features_for_concepts(
    steps: float,
    duration_min: float,
    sleep_hours: float,
    water_liters: float,
    weekly_frequency: int = 3,
    fatigue_level: str = "Low"
) -> Dict[str, str]:
    """
    Transforms continuous user activity stats into structured categorical features
    suitable for Find-S and ID3 Decision Tree concept reasoning.
    """
    valid_fatigues = ["Low", "Moderate", "High"]
    fatigue = fatigue_level.strip().title() if fatigue_level else "Low"
    if fatigue not in valid_fatigues:
        fatigue = "Moderate"

    return {
        "step_cat": discretize_steps(steps),
        "duration_cat": discretize_duration(duration_min),
        "frequency_cat": discretize_frequency(weekly_frequency),
        "sleep_cat": discretize_sleep(sleep_hours),
        "hydration_cat": discretize_hydration(water_liters),
        "fatigue_level": fatigue
    }
