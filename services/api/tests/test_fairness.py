import hashlib
import pytest
import numpy as np
import pandas as pd
from ml import fairness
from ml.features import FEATURE_COLUMNS, TARGET_COLUMN


def test_fairness_groups_existing_feature_columns_without_duplicate_join(tmp_path, monkeypatch):
    frame = pd.DataFrame([{**{key: 1 for key in FEATURE_COLUMNS}, 'AGE': 40,
                           'SEX': i%2+1, TARGET_COLUMN: i%2} for i in range(80)])
    path = tmp_path/'cohort.csv'
    frame.to_csv(path,index=False)
    class FixedModel:
        def predict_proba(self, values):
            return np.tile([.7,.3],(len(values),1))
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    monkeypatch.setattr(fairness,'load_artifacts',lambda:dict(model=FixedModel(),threshold=.5, data_sha256=digest, test_indices=list(range(68,80))))
    monkeypatch.setattr(fairness,'download_data',lambda:path)
    report = fairness.build_fairness_report()
    assert report['overall']['count'] == 12
    assert all(sum(g['count'] for g in s['groups']) == 12 for s in report['slices'])
    path.write_text(path.read_text() + '\n')
    with pytest.raises(FileNotFoundError, match='changed'):
        fairness.build_fairness_report()


def test_missing_class_fairness_rates_are_undefined():
    result = fairness.group_metrics(pd.Series([0, 0]), pd.Series([.1, .2]), .5)
    assert result['tpr'] is None
    result = fairness.group_metrics(pd.Series([1, 1]), pd.Series([.1, .2]), .5)
    assert result['fpr'] is None
