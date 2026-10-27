"""
FitTrack AI - ML Model Service Layer
File: backend/ml_models/model_service.py

Connects all 4 ML algorithms to the FastAPI application:
1. CalorieKNNRegressor (KNN Regression) -> Predicts continuous calories burned
2. ActivityKNNClassifier (KNN Classification) -> Classifies daily activity tier
3. FindSClassifier (Find-S Concept Learning) -> Checks habit consistency against learned optimal pattern
4. ID3DecisionTree (ID3 Decision Tree) -> Recommends next workout type / active recovery

Converts technical algorithm outputs into user-friendly, actionable fitness insights
without exposing raw mathematical computations to normal users.
"""

import os
import pandas as pd
from typing import Dict, Any, List, Optional

from backend.ml_models.knn_regression import CalorieKNNRegressor
from backend.ml_models.knn_classification import ActivityKNNClassifier
from backend.ml_models.find_s import FindSClassifier
from backend.ml_models.id3_decision_tree import ID3DecisionTree
from backend.ml_models.preprocessing import (
    extract_categorical_features_for_concepts,
    discretize_steps,
    discretize_duration,
    discretize_sleep,
    discretize_hydration,
    discretize_frequency
)

class ModelService:
    """Singleton service managing trained machine learning models."""

    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ModelService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, data_dir: Optional[str] = None):
        if getattr(self, "_initialized", False):
            return

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_dir = data_dir or os.path.join(base_dir, "data")

        # Initialize models
        self.knn_regressor = CalorieKNNRegressor(n_neighbors=5)
        self.knn_classifier = ActivityKNNClassifier(n_neighbors=5)
        self.find_s_model = FindSClassifier(positive_label="Yes")
        self.id3_model = ID3DecisionTree(max_depth=5)

        self.models_loaded = False
        self._load_and_train_all()
        self._initialized = True

    def _load_and_train_all(self):
        """Trains or loads all 4 models from the backend/data directory."""
        reg_path = os.path.join(self.data_dir, "fitness_regression.csv")
        clf_path = os.path.join(self.data_dir, "fitness_classification.csv")
        concepts_path = os.path.join(self.data_dir, "fitness_concepts.csv")

        # 1. Train KNN Regressor
        if os.path.exists(reg_path):
            self.knn_regressor.train(reg_path)

        # 2. Train KNN Classifier
        if os.path.exists(clf_path):
            self.knn_classifier.train(clf_path)

        # 3. Train Find-S Concept Learner
        if os.path.exists(concepts_path):
            df_concepts = pd.read_csv(concepts_path)
            find_s_features = ["duration_cat", "frequency_cat", "sleep_cat", "hydration_cat"]
            X_find_s = df_concepts[find_s_features]
            y_find_s = df_concepts["target_goal_met"]
            self.find_s_model.fit(X_find_s, y_find_s)

            # 4. Train ID3 Decision Tree
            id3_features = ["step_cat", "duration_cat", "sleep_cat", "fatigue_level"]
            self.id3_model.fit(
                X_df=df_concepts[id3_features + ["target_recommendation"]],
                target_column="target_recommendation",
                feature_names=id3_features
            )

        self.models_loaded = True

    # --- Prediction Endpoints ---

    def predict_calories(
        self,
        duration_min: float,
        distance_km: float,
        steps: float,
        activity_type: str,
        body_weight_kg: float = 70.0
    ) -> Dict[str, Any]:
        """KNN Regression: Estimate calorie expenditure."""
        return self.knn_regressor.predict(
            duration_min=duration_min,
            distance_km=distance_km,
            steps=steps,
            activity_type=activity_type,
            body_weight_kg=body_weight_kg
        )

    def classify_activity(
        self,
        steps: float,
        active_minutes: float,
        distance_km: float,
        exercise_frequency: int = 3
    ) -> Dict[str, Any]:
        """KNN Classification: Classify activity into Low, Moderate, High."""
        return self.knn_classifier.predict(
            steps=steps,
            active_minutes=active_minutes,
            distance_km=distance_km,
            exercise_frequency=exercise_frequency
        )

    def evaluate_habit_consistency(
        self,
        duration_min: float,
        weekly_frequency: int,
        sleep_hours: float,
        water_liters: float
    ) -> Dict[str, Any]:
        """Find-S: Concept match check for optimal fitness habits."""
        instance = {
            "duration_cat": discretize_duration(duration_min),
            "frequency_cat": discretize_frequency(weekly_frequency),
            "sleep_cat": discretize_sleep(sleep_hours),
            "hydration_cat": discretize_hydration(water_liters)
        }
        matches_optimal = self.find_s_model.predict_instance(instance)
        learned_h = self.find_s_model.get_hypothesis()

        if matches_optimal:
            status_text = "Target Habit Aligned"
            message = "Your workout duration, recovery sleep, and hydration match our optimal habit profile."
        else:
            status_text = "Habit Opportunity"
            # Build a specific message based on which attributes failed the learned hypothesis
            learned_h = self.find_s_model.get_hypothesis()
            issues = []
            if learned_h.get("sleep_cat") != "?" and instance["sleep_cat"] != learned_h.get("sleep_cat"):
                issues.append(f"sleep is {instance['sleep_cat'].lower()} (aim for at least 6 hours)")
            if learned_h.get("hydration_cat") != "?" and instance["hydration_cat"] != learned_h.get("hydration_cat"):
                issues.append(f"hydration is {instance['hydration_cat'].lower()} (drink at least 1.5L of water)")
            if learned_h.get("duration_cat") != "?" and instance["duration_cat"] != learned_h.get("duration_cat"):
                issues.append(f"workout duration is {instance['duration_cat'].lower()} (aim for 30+ minutes)")
            if learned_h.get("frequency_cat") != "?" and instance["frequency_cat"] != learned_h.get("frequency_cat"):
                issues.append(f"exercise frequency is {instance['frequency_cat'].lower()} (try exercising more days)")
            if issues:
                message = "Habit gap detected — your " + " and your ".join(issues) + "."
            else:
                message = "Adjusting sleep or exercise frequency will bring your daily routine into full alignment."

        return {
            "habit_status": status_text,
            "is_aligned": matches_optimal,
            "message": message,
            "current_profile": instance,
            "optimal_target_summary": "Daily workouts > 30m with adequate sleep (>=6h) and healthy hydration (>=1.5L)."
        }

    def recommend_workout(
        self,
        steps: float,
        duration_min: float,
        sleep_hours: float,
        fatigue_level: str = "Low"
    ) -> Dict[str, Any]:
        """ID3 Decision Tree: Workout readiness recommendation."""
        cat_features = {
            "step_cat": discretize_steps(steps),
            "duration_cat": discretize_duration(duration_min),
            "sleep_cat": discretize_sleep(sleep_hours),
            "fatigue_level": fatigue_level.strip().title() if fatigue_level else "Low"
        }
        recommendation = self.id3_model.predict_instance(cat_features)

        guidance_map = {
            "Rest & Recovery": {
                "title": "Rest & Active Recovery",
                "color": "amber",
                "advice": "Your body signals fatigue or lower sleep duration. Focus on mobility, gentle stretching, and restful sleep today."
            },
            "Light Mobility": {
                "title": "Light Mobility & Walking",
                "color": "blue",
                "advice": "A brisk walk, foam rolling, or light yoga will promote blood circulation without placing stress on the nervous system."
            },
            "Standard Workout": {
                "title": "Standard Workout Session",
                "color": "emerald",
                "advice": "You are primed for your regular fitness routine. Keep up the consistent cadence!"
            },
            "High Intensity": {
                "title": "High Intensity Challenge",
                "color": "purple",
                "advice": "Your metrics show optimal readiness! Great day to attempt personal records, tempo intervals, or HIIT."
            }
        }
        meta = guidance_map.get(recommendation, guidance_map["Standard Workout"])

        return {
            "recommended_focus": recommendation,
            "title": meta["title"],
            "guidance": meta["advice"],
            "accent_color": meta["color"],
            "profile_context": cat_features
        }

    def get_system_model_status(self) -> Dict[str, Any]:
        """Returns metadata for all 4 models for academic viva verification."""
        return {
            "knn_regression": {
                "status": "Ready",
                "type": "Scikit-Learn KNeighborsRegressor",
                "metrics": self.knn_regressor.get_metrics()
            },
            "knn_classification": {
                "status": "Ready",
                "type": "Scikit-Learn KNeighborsClassifier",
                "metrics": self.knn_classifier.get_metrics()
            },
            "find_s": {
                "status": "Ready",
                "type": "Pure Python Find-S From Scratch",
                "explanation": self.find_s_model.explain()
            },
            "id3_decision_tree": {
                "status": "Ready",
                "type": "Pure Python ID3 From Scratch",
                "feature_names": self.id3_model.feature_names,
                "tree_trained": self.id3_model.is_trained
            }
        }

# Global singleton accessor
def get_model_service() -> ModelService:
    return ModelService()
