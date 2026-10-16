"""
FitTrack AI - Machine Learning Models Package
Exposes KNN Regression, KNN Classification, Find-S, and ID3 Decision Tree algorithms.
"""

from backend.ml_models.knn_regression import CalorieKNNRegressor
from backend.ml_models.knn_classification import ActivityKNNClassifier
from backend.ml_models.find_s import FindSClassifier
from backend.ml_models.id3_decision_tree import ID3DecisionTree

__all__ = [
    "CalorieKNNRegressor",
    "ActivityKNNClassifier",
    "FindSClassifier",
    "ID3DecisionTree"
]
