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
    monkeypatch.setattr(fairness,'load_artifacts',lambda:dict(model=FixedModel(),threshold=.5))
    monkeypatch.setattr(fairness,'download_data',lambda:path)
    report = fairness.build_fairness_report()
    assert report['overall']['count'] == 12
    assert all(sum(g['count'] for g in s['groups']) == 12 for s in report['slices'])
