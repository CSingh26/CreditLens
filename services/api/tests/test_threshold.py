import numpy as np
import pytest
from sklearn.metrics import f1_score
from ml.train import find_best_threshold


def test_threshold_f1_matches_actual_boundary_predictions():
    labels = np.array([0, 1, 0, 1, 1])
    probabilities = np.array([.1, .2, .3, .4, .5])
    result = find_best_threshold(labels, probabilities)
    actual = f1_score(labels, probabilities >= result.threshold)
    assert result.f1 == pytest.approx(actual)
    assert actual == max(f1_score(labels, probabilities >= t) for t in probabilities)
