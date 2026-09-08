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


def test_preprocessing_scales_money_to_avoid_unconverged_baseline():
    import pandas as pd
    from ml.features import FEATURE_COLUMNS
    from ml.train import build_preprocessor
    frame = pd.DataFrame([{**{key: 1 for key in FEATURE_COLUMNS}, 'LIMIT_BAL': amount}
                          for amount in [1000, 10000, 1000000]])
    transformer = build_preprocessor()
    transformer.fit(frame)
    numeric = transformer.named_transformers_['numeric'].transform(frame[transformer.transformers_[1][2]])
    assert numeric[:, 0].mean() == pytest.approx(0, abs=1e-10)
    assert numeric[:, 0].std() == pytest.approx(1)
