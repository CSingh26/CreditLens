import pandas as pd
from ml import download_data as ingestion
from ml.features import FEATURE_COLUMNS, TARGET_COLUMN


def test_cached_uci_generic_columns_are_normalized(tmp_path, monkeypatch):
    path = tmp_path/'raw.csv'
    pd.DataFrame([{**{f'X{i}': i for i in range(1,24)}, 'Y': 1}]).to_csv(path,index=False)
    monkeypatch.setattr(ingestion,'RAW_FILE',path)
    monkeypatch.setattr(ingestion,'RAW_DIR',tmp_path)
    data = pd.read_csv(ingestion.download_data())
    assert set(data.columns) == set(FEATURE_COLUMNS+[TARGET_COLUMN])
    assert data['LIMIT_BAL'].iloc[0] == 1
    assert data['SEX'].iloc[0] == 2
    assert data['PAY_AMT6'].iloc[0] == 23
