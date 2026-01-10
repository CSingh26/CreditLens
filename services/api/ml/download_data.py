from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
from ucimlrepo import fetch_ucirepo

from .features import RAW_TARGET_COLUMN, TARGET_COLUMN

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
RAW_FILE = RAW_DIR / "default_of_credit_card_clients.csv"


def download_data(force: bool = False) -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    if RAW_FILE.exists() and not force:
        return RAW_FILE

    dataset = fetch_ucirepo(id=350)
    features = dataset.data.features
    targets = dataset.data.targets

    df = pd.concat([features, targets], axis=1)
    df = df.rename(columns={RAW_TARGET_COLUMN: TARGET_COLUMN})
    df.to_csv(RAW_FILE, index=False)
    return RAW_FILE


def main() -> None:
    force = "--force" in sys.argv
    path = download_data(force=force)
    print(f"Saved dataset to {path}")


if __name__ == "__main__":
    main()
