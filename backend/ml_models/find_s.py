"""
FitTrack AI - Algorithm 3: Find-S Concept Learning
File: backend/ml_models/find_s.py

Purpose:
Implement the classic Find-S algorithm FROM SCRATCH in Python to learn the
most specific categorical hypothesis that satisfies a target fitness concept
(e.g., achieving consistent daily goal completion).

Algorithm Details:
1. Initialize hypothesis h to the most specific hypothesis in H:
   h = [None, None, ..., None] (representing null / empty set Φ)
2. For each positive training instance x:
   - For each attribute constraint a_i in h:
     - If a_i is None:
         h[i] = x[i]
     - Else if a_i != x[i]:
         h[i] = '?' (generalize constraint)
3. Ignore negative training instances (standard Find-S rule).
4. Output hypothesis h.

Note:
This implementation does not use scikit-learn. It operates strictly from first principles.
"""

from typing import List, Dict, Any, Optional, Union
import pandas as pd

class FindSClassifier:
    """Find-S Concept Learning algorithm implemented from scratch."""

    def __init__(self, positive_label: str = "Yes"):
        self.positive_label = positive_label
        self.feature_names: List[str] = []
        self.hypothesis: Optional[List[str]] = None
        self.is_trained: bool = False
        self.num_positive_samples: int = 0
        self.num_total_samples: int = 0

    def fit(self, X: Union[pd.DataFrame, List[List[str]]], y: Union[pd.Series, List[str]], feature_names: Optional[List[str]] = None) -> "FindSClassifier":
        """
        Trains Find-S algorithm on categorical feature matrix X and target labels y.
        """
        if isinstance(X, pd.DataFrame):
            self.feature_names = list(X.columns)
            instances = X.values.tolist()
        else:
            instances = [list(row) for row in X]
            self.feature_names = feature_names or [f"attr_{i}" for i in range(len(instances[0])) if instances]

        labels = [str(val).strip() for val in y]

        if not instances or len(instances) != len(labels):
            raise ValueError("Training data instances and labels must be non-empty and have matching lengths.")

        num_features = len(self.feature_names)
        self.num_total_samples = len(instances)
        self.num_positive_samples = 0

        # Step 1: Initialize most specific hypothesis (None for each attribute)
        h: List[Optional[str]] = [None] * num_features

        # Step 2: Iterate over examples
        for instance, label in zip(instances, labels):
            if label == self.positive_label:
                self.num_positive_samples += 1
                for i in range(num_features):
                    attr_val = str(instance[i]).strip()
                    if h[i] is None:
                        # First positive instance initializes the constraint
                        h[i] = attr_val
                    elif h[i] != attr_val and h[i] != "?":
                        # Generalize constraint
                        h[i] = "?"
            # Negative instances are ignored according to Find-S

        if self.num_positive_samples == 0:
            # If no positive instances, hypothesis remains most specific (or all None)
            self.hypothesis = ["?"] * num_features
        else:
            self.hypothesis = [val if val is not None else "?" for val in h]

        self.is_trained = True
        return self

    def predict_instance(self, instance: Union[Dict[str, str], List[str]]) -> bool:
        """
        Predicts whether a single instance satisfies the learned concept (positive hypothesis).
        Returns True if the instance satisfies the hypothesis, False otherwise.
        """
        if not self.is_trained or self.hypothesis is None:
            raise RuntimeError("FindSClassifier is not trained. Call fit() first.")

        if isinstance(instance, dict):
            vals = [str(instance.get(col, "?")).strip() for col in self.feature_names]
        else:
            vals = [str(v).strip() for v in instance]

        if len(vals) != len(self.hypothesis):
            raise ValueError(f"Instance length {len(vals)} does not match hypothesis length {len(self.hypothesis)}")

        # Check if every attribute constraint matches or is '?'
        for constraint, val in zip(self.hypothesis, vals):
            if constraint != "?" and constraint != val:
                return False
        return True

    def predict(self, X: Union[pd.DataFrame, List[List[str]], List[Dict[str, str]]]) -> List[bool]:
        """Predicts concept satisfaction for multiple instances."""
        if isinstance(X, pd.DataFrame):
            return [self.predict_instance(dict(row)) for _, row in X.iterrows()]
        elif isinstance(X, list):
            return [self.predict_instance(item) for item in X]
        else:
            raise ValueError("Input X must be a DataFrame or list.")

    def get_hypothesis(self) -> Dict[str, str]:
        """Returns the learned hypothesis as a readable dictionary."""
        if not self.is_trained or self.hypothesis is None:
            return {}
        return {feature: val for feature, val in zip(self.feature_names, self.hypothesis)}

    def explain(self) -> Dict[str, Any]:
        """Returns a student-friendly explanation of the learned concept."""
        if not self.is_trained:
            return {"status": "Model not trained"}

        h_dict = self.get_hypothesis()
        specific_criteria = [f"{feat} must be '{val}'" for feat, val in h_dict.items() if val != "?"]
        flexible_criteria = [feat for feat, val in h_dict.items() if val == "?"]

        summary = (
            f"The Find-S algorithm learned the most specific conditions for '{self.positive_label}'. "
            f"Key required constraints: {', '.join(specific_criteria) if specific_criteria else 'None (generalized)'}. "
            f"Flexible attributes: {', '.join(flexible_criteria) if flexible_criteria else 'None'}."
        )

        return {
            "hypothesis": h_dict,
            "total_positive_samples_processed": self.num_positive_samples,
            "summary": summary,
            "specific_constraints": specific_criteria,
            "generalized_attributes": flexible_criteria
        }
