"""
FitTrack AI - Algorithm 4: ID3 Decision Tree
File: backend/ml_models/id3_decision_tree.py

Purpose:
Implement the ID3 (Iterative Dichotomiser 3) algorithm FROM SCRATCH in Python.
ID3 builds a decision tree by calculating Shannon Entropy and Information Gain
to select the best splitting categorical attribute at each node.

Mathematical Foundations:
1. Entropy:
   H(S) = - sum(p_i * log2(p_i)) for all classes i in S.
2. Information Gain:
   Gain(S, A) = H(S) - sum( (|S_v| / |S|) * H(S_v) ) for each value v of attribute A.

Stopping Conditions:
- Pure subset: All examples belong to the same target class.
- Attribute exhaustion: No remaining attributes to split on; assign majority class.
- Empty branch: No samples exist for an attribute branch; assign parent node majority class.
- Unseen attribute values during prediction: Safely fall back to the node's majority label.
"""

import math
from collections import Counter
from typing import Dict, Any, List, Optional, Union, Tuple
import pandas as pd

class TreeNode:
    """Represents a node in the ID3 decision tree."""

    def __init__(
        self,
        attribute: Optional[str] = None,
        is_leaf: bool = False,
        prediction: Optional[str] = None,
        majority_class: Optional[str] = None,
        sample_count: int = 0
    ):
        self.attribute: Optional[str] = attribute
        self.is_leaf: bool = is_leaf
        self.prediction: Optional[str] = prediction
        self.majority_class: Optional[str] = majority_class
        self.sample_count: int = sample_count
        self.children: Dict[str, "TreeNode"] = {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert tree node to serializable nested dictionary."""
        if self.is_leaf:
            return {
                "type": "leaf",
                "prediction": self.prediction,
                "samples": self.sample_count
            }
        return {
            "type": "decision",
            "attribute": self.attribute,
            "majority_class": self.majority_class,
            "samples": self.sample_count,
            "branches": {val: child.to_dict() for val, child in self.children.items()}
        }

class ID3DecisionTree:
    """Pure Python ID3 Decision Tree Classifier."""

    def __init__(self, max_depth: Optional[int] = None):
        self.max_depth = max_depth
        self.root: Optional[TreeNode] = None
        self.is_trained: bool = False
        self.feature_names: List[str] = []
        self.global_majority_class: str = "Standard Workout"
        self.target_name: str = "target_recommendation"

    @staticmethod
    def calculate_entropy(labels: List[str]) -> float:
        """
        Calculate Shannon Entropy: H(S) = - sum(p_i * log2(p_i))
        """
        if not labels:
            return 0.0
        total = len(labels)
        counts = Counter(labels)
        entropy = 0.0
        for count in counts.values():
            if count > 0:
                p = count / total
                entropy -= p * math.log2(p)
        return float(entropy)

    @staticmethod
    def calculate_information_gain(
        data: List[Dict[str, Any]],
        attribute: str,
        target_col: str
    ) -> float:
        """
        Calculate Information Gain:
        Gain(S, A) = H(S) - sum( (|S_v| / |S|) * H(S_v) )
        """
        if not data:
            return 0.0

        total_samples = len(data)
        parent_labels = [row[target_col] for row in data]
        parent_entropy = ID3DecisionTree.calculate_entropy(parent_labels)

        # Partition data by attribute values
        partitions: Dict[Any, List[str]] = {}
        for row in data:
            val = row.get(attribute, "Missing")
            partitions.setdefault(val, []).append(row[target_col])

        weighted_child_entropy = 0.0
        for val, subset_labels in partitions.items():
            weight = len(subset_labels) / total_samples
            weighted_child_entropy += weight * ID3DecisionTree.calculate_entropy(subset_labels)

        gain = parent_entropy - weighted_child_entropy
        return max(0.0, float(gain))

    @staticmethod
    def majority_class(labels: List[str], fallback: str = "Standard Workout") -> str:
        """Determine most frequent label."""
        if not labels:
            return fallback
        counts = Counter(labels)
        return counts.most_common(1)[0][0]

    def _build_tree(
        self,
        data: List[Dict[str, Any]],
        attributes: List[str],
        depth: int = 0
    ) -> TreeNode:
        """Recursively construct the ID3 decision tree."""
        labels = [row[self.target_name] for row in data]
        current_majority = self.majority_class(labels, self.global_majority_class)

        # Condition 1: Pure node
        if len(set(labels)) == 1:
            return TreeNode(
                is_leaf=True,
                prediction=labels[0],
                majority_class=labels[0],
                sample_count=len(data)
            )

        # Condition 2: No remaining attributes to split on or max_depth reached
        if not attributes or (self.max_depth is not None and depth >= self.max_depth):
            return TreeNode(
                is_leaf=True,
                prediction=current_majority,
                majority_class=current_majority,
                sample_count=len(data)
            )

        # Find attribute with the highest information gain
        best_attr = None
        best_gain = -1.0
        for attr in attributes:
            gain = self.calculate_information_gain(data, attr, self.target_name)
            if gain > best_gain:
                best_gain = gain
                best_attr = attr

        # If best gain is 0, splitting provides no further differentiation
        if best_gain <= 0.0 or best_attr is None:
            return TreeNode(
                is_leaf=True,
                prediction=current_majority,
                majority_class=current_majority,
                sample_count=len(data)
            )

        # Create decision node
        node = TreeNode(
            attribute=best_attr,
            is_leaf=False,
            majority_class=current_majority,
            sample_count=len(data)
        )

        # Split on best attribute
        remaining_attributes = [a for a in attributes if a != best_attr]
        grouped_data: Dict[Any, List[Dict[str, Any]]] = {}
        for row in data:
            val = str(row.get(best_attr, "Missing")).strip()
            grouped_data.setdefault(val, []).append(row)

        for val, subset in grouped_data.items():
            if not subset:
                # Empty branch: assign parent's majority class
                node.children[val] = TreeNode(
                    is_leaf=True,
                    prediction=current_majority,
                    majority_class=current_majority,
                    sample_count=0
                )
            else:
                node.children[val] = self._build_tree(subset, remaining_attributes, depth + 1)

        return node

    def fit(
        self,
        X_df: pd.DataFrame,
        target_column: str = "target_recommendation",
        feature_names: Optional[List[str]] = None
    ) -> "ID3DecisionTree":
        """Fit ID3 Decision Tree on DataFrame with categorical features and target."""
        if target_column not in X_df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataframe.")

        df = X_df.copy().dropna(subset=[target_column])
        if len(df) == 0:
            raise ValueError("Training dataset contains no samples.")

        self.target_name = target_column
        all_cols = list(df.columns)
        if feature_names:
            self.feature_names = [f for f in feature_names if f in all_cols and f != target_column]
        else:
            self.feature_names = [c for c in all_cols if c != target_column]

        # Convert records to dictionary for pure python processing
        records = df[self.feature_names + [self.target_name]].to_dict(orient="records")
        all_labels = [row[self.target_name] for row in records]
        self.global_majority_class = self.majority_class(all_labels)

        self.root = self._build_tree(records, self.feature_names, depth=0)
        self.is_trained = True
        return self

    def predict_instance(self, instance: Dict[str, Any]) -> str:
        """
        Traverse the decision tree to predict a class for a single instance.
        If an unseen attribute value is encountered, gracefully falls back to node majority class.
        """
        if not self.is_trained or self.root is None:
            raise RuntimeError("ID3 Decision Tree is not trained. Call fit() first.")

        curr = self.root
        while not curr.is_leaf:
            attr = curr.attribute
            val = str(instance.get(attr, "")).strip()

            if val in curr.children:
                curr = curr.children[val]
            else:
                # Handle unseen attribute value safely
                return curr.majority_class or self.global_majority_class

        return curr.prediction or self.global_majority_class

    def predict(self, df_or_instances: Union[pd.DataFrame, List[Dict[str, Any]]]) -> List[str]:
        """Predict target labels for multiple instances."""
        if isinstance(df_or_instances, pd.DataFrame):
            records = df_or_instances.to_dict(orient="records")
        else:
            records = df_or_instances
        return [self.predict_instance(rec) for rec in records]

    def get_tree_structure(self) -> Dict[str, Any]:
        """Return full JSON-serializable tree structure."""
        if not self.is_trained or self.root is None:
            return {}
        return self.root.to_dict()
