"""
FitTrack AI - Algorithm 2: KNN Classification
File: backend/ml_models/knn_classification.py

Purpose:
Classify daily activity levels into meaningful lifestyle categories:
- 'Low Activity'
- 'Moderate Activity'
- 'High Activity'

Features:
- Daily steps
- Active workout minutes
- Distance covered (km)
- Weekly exercise frequency (days/week)

Uses Scikit-learn's KNeighborsClassifier with StandardScaler.
"""

import os
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from backend.ml_models.preprocessing import validate_numeric

ACTIVITY_CLASSES = ["Low Activity", "Moderate Activity", "High Activity"]

class ActivityKNNClassifier:
    """KNN Classification model pipeline for classifying daily user activity levels."""

    def __init__(self, n_neighbors: int = 5, weights: str = "distance"):
        self.n_neighbors = n_neighbors
        self.weights = weights
        self.pipeline: Optional[Pipeline] = None
        self.is_trained: bool = False
        self.evaluation_metrics: Dict[str, Any] = {}

    def _build_pipeline(self) -> Pipeline:
        return Pipeline(
            steps=[
                ("scaler", StandardScaler()),
                ("classifier", KNeighborsClassifier(n_neighbors=self.n_neighbors, weights=self.weights))
            ]
        )

    def train(self, data_path_or_df: Any, test_size: float = 0.2, random_state: int = 42) -> Dict[str, Any]:
        """Trains the KNN Classifier on activity dataset and computes accuracy."""
        if isinstance(data_path_or_df, str):
            if not os.path.exists(data_path_or_df):
                raise FileNotFoundError(f"Training dataset not found: {data_path_or_df}")
            df = pd.read_csv(data_path_or_df)
        elif isinstance(data_path_or_df, pd.DataFrame):
            df = data_path_or_df.copy()
        else:
            raise ValueError("Input must be a file path or pandas DataFrame")

        required_cols = ["steps", "active_minutes", "distance_km", "exercise_frequency", "target_activity_level"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column in dataset: {col}")

        df = df.dropna(subset=required_cols)
        if len(df) < self.n_neighbors:
            raise ValueError(f"Insufficient training samples ({len(df)}) for k={self.n_neighbors}")

        X = df[["steps", "active_minutes", "distance_km", "exercise_frequency"]]
        y = df["target_activity_level"].astype(str)

        # Stratify only if every class has sufficient representations
        class_counts = y.value_counts()
        can_stratify = (class_counts.min() >= 2) and ((len(df) * test_size) >= len(class_counts))
        stratify_param = y if can_stratify else None

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=stratify_param
        )

        self.pipeline = self._build_pipeline()
        self.pipeline.fit(X_train, y_train)
        self.is_trained = True

        y_pred = self.pipeline.predict(X_test)
        acc = float(accuracy_score(y_test, y_pred))
        cm = confusion_matrix(y_test, y_pred, labels=ACTIVITY_CLASSES).tolist()

        self.evaluation_metrics = {
            "accuracy": round(acc, 4),
            "classes": ACTIVITY_CLASSES,
            "confusion_matrix": cm,
            "test_samples": len(y_test)
        }
        return self.evaluation_metrics

    def predict(
        self,
        steps: float,
        active_minutes: float,
        distance_km: float,
        exercise_frequency: int = 3
    ) -> Dict[str, Any]:
        """Classify daily activity record and provide non-medical, encouraging fitness feedback."""
        if not self.is_trained or self.pipeline is None:
            raise RuntimeError("ActivityKNNClassifier is not trained. Call train() first.")

        stps = validate_numeric(steps, "steps", min_val=0.0, max_val=200000.0)
        mins = validate_numeric(active_minutes, "active_minutes", min_val=0.0, max_val=1440.0)
        dist = validate_numeric(distance_km, "distance_km", min_val=0.0, max_val=300.0)
        freq = int(validate_numeric(exercise_frequency, "exercise_frequency", min_val=0.0, max_val=14.0))

        input_df = pd.DataFrame([{
            "steps": stps,
            "active_minutes": mins,
            "distance_km": dist,
            "exercise_frequency": freq
        }])

        pred_class = str(self.pipeline.predict(input_df)[0])
        probabilities = self.pipeline.predict_proba(input_df)[0]
        classes = list(self.pipeline.classes_)
        prob_dict = {cls: round(float(prob), 3) for cls, prob in zip(classes, probabilities)}

        # Contextual encouraging advice
        if pred_class == "High Activity":
            description = "Outstanding effort! Your daily movement is at an athletic, peak activity level."
            tip = "Ensure optimal hydration and recovery sleep to support muscle rejuvenation."
        elif pred_class == "Moderate Activity":
            description = "Solid consistency! You achieved a healthy, balanced amount of daily movement."
            tip = "Adding a 15-minute brisk walk could effortlessly elevate you into the high-activity tier."
        else:
            description = "Gentle activity day recorded."
            tip = "Try taking short movement breaks every hour or an evening stroll to accumulate extra steps."

        return {
            "activity_level": pred_class,
            "description": description,
            "tip": tip,
            "class_probabilities": prob_dict,
            "confidence": round(float(np.max(probabilities)), 2)
        }

    def get_metrics(self) -> Dict[str, Any]:
        return self.evaluation_metrics
