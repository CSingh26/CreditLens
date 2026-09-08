from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

import joblib
import pandas as pd
from sklearn.metrics import confusion_matrix, roc_auc_score

from .download_data import download_data
from .features import FEATURE_COLUMNS, TARGET_COLUMN

from .paths import ARTIFACTS_DIR
MODEL_PATH = ARTIFACTS_DIR / "model.joblib"


def load_artifacts() -> dict[str, Any]:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model artifacts missing")
    return joblib.load(MODEL_PATH)


def age_band(age: float) -> str:
    if age < 30:
        return "<30"
    if age < 40:
        return "30-39"
    if age < 50:
        return "40-49"
    if age < 60:
        return "50-59"
    return "60+"


def safe_auc(y_true: pd.Series, y_prob: pd.Series) -> float | None:
    if y_true.nunique() < 2:
        return None
    return float(roc_auc_score(y_true, y_prob))


def group_metrics(y_true: pd.Series, y_prob: pd.Series, threshold: float) -> dict[str, Any]:
    y_pred = (y_prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    tpr = tp / (tp + fn) if (tp + fn) else None
    fpr = fp / (fp + tn) if (fp + tn) else None
    selection_rate = y_pred.mean()

    return {
        "count": int(len(y_true)),
        "default_rate": float(y_true.mean()),
        "selection_rate": float(selection_rate),
        "tpr": float(tpr) if tpr is not None else None,
        "fpr": float(fpr) if fpr is not None else None,
        "auc": safe_auc(y_true, y_prob),
    }


def build_fairness_report() -> dict[str, Any]:
    artifacts = load_artifacts()
    model = artifacts["model"]
    threshold = float(artifacts["threshold"])

    data_path = download_data()
    df = pd.read_csv(data_path)
    df["AGE_BAND"] = df["AGE"].apply(age_band)

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN].astype(int)

    if 'data_sha256' not in artifacts or 'test_indices' not in artifacts:
        raise FileNotFoundError('Model lacks evaluation provenance; retrain')
    if hashlib.sha256(data_path.read_bytes()).hexdigest() != artifacts['data_sha256']:
        raise FileNotFoundError('Evaluation dataset changed; retrain before reporting fairness')
    X_test = X.loc[artifacts['test_indices']]
    y_test = y.loc[artifacts['test_indices']]

    y_prob = pd.Series(model.predict_proba(X_test)[:, 1], index=X_test.index)

    slices = []
    for feature in ["SEX", "EDUCATION", "AGE_BAND"]:
        group_entries = []
        for group_value, indices in df.loc[X_test.index].groupby(feature).groups.items():
            y_group = y_test.loc[indices]
            y_prob_group = y_prob.loc[indices]
            metrics = group_metrics(y_group, y_prob_group, threshold)
            metrics["group"] = str(group_value)
            group_entries.append(metrics)
        slices.append({"feature": feature, "groups": group_entries})

    overall = group_metrics(y_test, y_prob, threshold)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "threshold": threshold,
        "notes": "Fairness diagnostics only. Results are descriptive and not a compliance guarantee.",
        "overall": overall,
        "slices": slices,
    }


def main() -> None:
    report = build_fairness_report()
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
