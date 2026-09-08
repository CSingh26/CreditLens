from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
from ucimlrepo import fetch_ucirepo

from .features import FEATURE_COLUMNS, RAW_TARGET_COLUMN, TARGET_COLUMN

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
RAW_FILE = RAW_DIR / "default_of_credit_card_clients.csv"


def download_data(force: bool = False) -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    cached = RAW_FILE.exists() and not force
    if cached:
        df = pd.read_csv(RAW_FILE)
    else:
        dataset = fetch_ucirepo(id=350)
        df = pd.concat([dataset.data.features, dataset.data.targets], axis=1)
    # UCI's current API exposes X1..X23/Y, in the source dictionary order.
    source_order = ['LIMIT_BAL', 'SEX', 'EDUCATION', 'MARRIAGE', 'AGE',
                    'PAY_0', 'PAY_2', 'PAY_3', 'PAY_4', 'PAY_5', 'PAY_6'] + [
                    f'BILL_AMT{i}' for i in range(1, 7)] + [f'PAY_AMT{i}' for i in range(1, 7)]
    aliases = {f'X{i}': name for i, name in enumerate(source_order, 1)}
    aliases.update({'Y': TARGET_COLUMN, RAW_TARGET_COLUMN: TARGET_COLUMN})
    needs_normalization = any(column in aliases for column in df.columns)
    df = df.rename(columns=aliases)
    missing = set(FEATURE_COLUMNS + [TARGET_COLUMN]) - set(df.columns)
    if missing:
        raise ValueError(f'Unsupported UCI schema; missing columns: {sorted(missing)}')
    if cached and not needs_normalization:
        return RAW_FILE
    df.to_csv(RAW_FILE, index=False)
    return RAW_FILE


def main() -> None:
    force = "--force" in sys.argv
    path = download_data(force=force)
    print(f"Saved dataset to {path}")


if __name__ == "__main__":
    main()
