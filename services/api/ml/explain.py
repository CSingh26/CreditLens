from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from .features import FEATURE_COLUMNS

ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "artifacts"
BACKGROUND_PATH = ARTIFACTS_DIR / "background.csv"


def load_background() -> pd.DataFrame:
    if not BACKGROUND_PATH.exists():
        raise FileNotFoundError("Background data missing; run training first.")
    return pd.read_csv(BACKGROUND_PATH)


def explain_instance(model: Any, payload: dict[str, Any], max_evals: int = 256) -> list[dict[str, float]]:
    import shap

    background = load_background()
    frame = pd.DataFrame([payload], columns=FEATURE_COLUMNS)

    explainer = shap.Explainer(
        lambda data: model.predict_proba(pd.DataFrame(data, columns=FEATURE_COLUMNS))[:, 1],
        background,
        feature_names=FEATURE_COLUMNS,
        algorithm="permutation",
    )
    shap_values = explainer(frame, max_evals=max_evals)
    values = shap_values.values[0]

    contributions = []
    for feature, value, contribution in zip(FEATURE_COLUMNS, frame.iloc[0], values):
        contributions.append(
            {
                "feature": feature,
                "value": float(value),
                "contribution": float(contribution),
            }
        )

    contributions.sort(key=lambda item: abs(item["contribution"]), reverse=True)
    return contributions
