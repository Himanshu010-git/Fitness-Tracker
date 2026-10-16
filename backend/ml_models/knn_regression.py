"""
FitTrack AI - Algorithm 1: KNN Regression
File: backend/ml_models/knn_regression.py

Purpose:
Predict a continuous fitness-related metric (estimated calorie expenditure)
based on physical workout metrics:
- Activity duration (minutes)
- Distance (km)
- Steps taken
- Activity type (categorical)
- Body weight (kg)

Uses Scikit-learn's KNeighborsRegressor with a ColumnTransformer pipeline
combining StandardScaler for numerical features and OneHotEncoder for activity type.
"""

import os
from typing import Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from backend.ml_models.preprocessing import VALID_ACTIVITIES, normalize_activity_type, validate_numeric

class CalorieKNNRegressor:
    """KNN Regression model pipeline for predicting workout calorie expenditure."""

    def __init__(self, n_neighbors: int = 5, weights: str = "distance"):
        self.n_neighbors = n_neighbors
        self.weights = weights
        self.pipeline: Optional[Pipeline] = None
        self.is_trained: bool = False
        self.evaluation_metrics: Dict[str, float] = {}

    def _build_pipeline(self) -> Pipeline:
        numeric_features = ["duration_min", "distance_km", "steps", "body_weight_kg"]
        categorical_features = ["activity_type"]

        preprocessor = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), numeric_features),
                ("cat", OneHotEncoder(categories=[VALID_ACTIVITIES], handle_unknown="ignore"), categorical_features)
            ]
        )

        pipeline = Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("regressor", KNeighborsRegressor(n_neighbors=self.n_neighbors, weights=self.weights))
            ]
        )
        return pipeline

    def train(self, data_path_or_df: Any, test_size: float = 0.2, random_state: int = 42) -> Dict[str, float]:
        """Trains the KNN Regressor on dataset and computes validation metrics."""
        if isinstance(data_path_or_df, str):
            if not os.path.exists(data_path_or_df):
                raise FileNotFoundError(f"Training dataset not found: {data_path_or_df}")
            df = pd.read_csv(data_path_or_df)
        elif isinstance(data_path_or_df, pd.DataFrame):
            df = data_path_or_df.copy()
        else:
            raise ValueError("Input must be a valid file path or pandas DataFrame")

        required_cols = ["duration_min", "distance_km", "steps", "activity_type", "body_weight_kg", "target_calories"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column in dataset: {col}")

        # Drop invalid / null values
        df = df.dropna(subset=required_cols)
        if len(df) < self.n_neighbors:
            raise ValueError(f"Dataset has only {len(df)} samples, which is less than k={self.n_neighbors}")

        # Normalize activity types
        df["activity_type"] = df["activity_type"].apply(normalize_activity_type)

        X = df[["duration_min", "distance_km", "steps", "activity_type", "body_weight_kg"]]
        y = df["target_calories"].astype(float)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)

        self.pipeline = self._build_pipeline()
        self.pipeline.fit(X_train, y_train)
        self.is_trained = True

        # Evaluate model performance
        y_pred = self.pipeline.predict(X_test)
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        self.evaluation_metrics = {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2": round(r2, 4),
            "test_samples": len(y_test)
        }
        return self.evaluation_metrics

    def predict(
        self,
        duration_min: float,
        distance_km: float,
        steps: float,
        activity_type: str,
        body_weight_kg: float = 70.0
    ) -> Dict[str, Any]:
        """
        Predict calorie expenditure for given activity attributes.
        Validates inputs and handles edge cases safely.
        """
        if not self.is_trained or self.pipeline is None:
            raise RuntimeError("CalorieKNNRegressor model is not trained. Call train() first.")

        dur = validate_numeric(duration_min, "duration_min", min_val=0.0, max_val=1440.0)
        dist = validate_numeric(distance_km, "distance_km", min_val=0.0, max_val=300.0)
        stps = validate_numeric(steps, "steps", min_val=0.0, max_val=200000.0)
        weight = validate_numeric(body_weight_kg, "body_weight_kg", min_val=20.0, max_val=300.0)
        act = normalize_activity_type(activity_type)

        # Edge case: If duration is 0, calories burned is 0
        if dur == 0.0:
            return {
                "estimated_calories": 0.0,
                "confidence": "High",
                "activity_type": act,
                "note": "Zero duration activity results in 0 calories."
            }

        input_df = pd.DataFrame([{
            "duration_min": dur,
            "distance_km": dist,
            "steps": stps,
            "activity_type": act,
            "body_weight_kg": weight
        }])

        pred = self.pipeline.predict(input_df)[0]
        estimated = max(1.0, round(float(pred), 1))

        return {
            "estimated_calories": estimated,
            "confidence": "Good" if self.evaluation_metrics.get("r2", 0.0) > 0.7 else "Moderate",
            "activity_type": act,
            "unit": "kcal",
            "note": "Approximate estimation based on activity duration, distance, intensity, and weight."
        }

    def get_metrics(self) -> Dict[str, Any]:
        """Returns the model evaluation metrics."""
        return self.evaluation_metrics
