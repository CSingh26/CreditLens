from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    precision_recall_curve,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier

from .download_data import download_data
from .features import CATEGORICAL_COLUMNS, FEATURE_COLUMNS, NUMERIC_COLUMNS, TARGET_COLUMN

ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "artifacts"


@dataclass
class ModelCandidate:
    name: str
    estimator: Pipeline


@dataclass
class ThresholdResult:
    threshold: float
    f1: float
    precision: float
    recall: float


def build_preprocessor() -> ColumnTransformer:
    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    numeric_transformer = Pipeline(
        steps=[("imputer", SimpleImputer(strategy="median"))]
    )

    return ColumnTransformer(
        transformers=[
            ("categorical", categorical_transformer, CATEGORICAL_COLUMNS),
            ("numeric", numeric_transformer, NUMERIC_COLUMNS),
        ]
    )


def build_candidates(preprocessor: ColumnTransformer) -> list[ModelCandidate]:
    logistic = Pipeline(
        steps=[
            ("preprocess", preprocessor),
            (
                "clf",
                LogisticRegression(
                    max_iter=800,
                    class_weight="balanced",
                ),
            ),
        ]
    )

    forest = Pipeline(
        steps=[
            ("preprocess", preprocessor),
            (
                "clf",
                RandomForestClassifier(
                    n_estimators=250,
                    max_depth=10,
                    min_samples_leaf=15,
                    n_jobs=-1,
                    class_weight="balanced_subsample",
                    random_state=42,
                ),
            ),
        ]
    )

    return [
        ModelCandidate(name="logistic_regression", estimator=logistic),
        ModelCandidate(name="random_forest", estimator=forest),
    ]


def calibrate_model(model: Pipeline, X_val: pd.DataFrame, y_val: pd.Series) -> CalibratedClassifierCV:
    calibrated = CalibratedClassifierCV(model, method="sigmoid", cv="prefit")
    calibrated.fit(X_val, y_val)
    return calibrated


def find_best_threshold(y_true: np.ndarray, y_prob: np.ndarray) -> ThresholdResult:
    precision, recall, thresholds = precision_recall_curve(y_true, y_prob)
    precision = precision[1:]
    recall = recall[1:]

    f1_scores = (2 * precision * recall) / (precision + recall + 1e-12)
    best_index = int(np.argmax(f1_scores))

    return ThresholdResult(
        threshold=float(thresholds[best_index]),
        f1=float(f1_scores[best_index]),
        precision=float(precision[best_index]),
        recall=float(recall[best_index]),
    )


def calibration_summary(y_true: np.ndarray, y_prob: np.ndarray, bins: int = 10) -> list[dict[str, float]]:
    prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=bins, strategy="uniform")
    summary = []
    for idx, (true_rate, pred_rate) in enumerate(zip(prob_true, prob_pred)):
        summary.append(
            {
                "bin": idx,
                "mean_predicted_prob": float(pred_rate),
                "fraction_positives": float(true_rate),
            }
        )
    return summary


def evaluate_model(y_true: np.ndarray, y_prob: np.ndarray, threshold: float) -> dict[str, Any]:
    y_pred = (y_prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()

    return {
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "pr_auc": float(average_precision_score(y_true, y_prob)),
        "brier_score": float(brier_score_loss(y_true, y_prob)),
        "confusion": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        },
        "default_rate": float(y_true.mean()),
        "predicted_rate": float(y_pred.mean()),
    }


def train() -> dict[str, Any]:
    data_path = download_data()
    df = pd.read_csv(data_path)

    missing = [col for col in FEATURE_COLUMNS + [TARGET_COLUMN] if col not in df.columns]
    if missing:
        raise ValueError(f"Missing columns from dataset: {missing}")

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN].astype(int)

    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=0.3,
        random_state=42,
        stratify=y,
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp,
        y_temp,
        test_size=0.5,
        random_state=42,
        stratify=y_temp,
    )

    preprocessor = build_preprocessor()
    candidates = build_candidates(preprocessor)

    candidate_metrics: dict[str, dict[str, float]] = {}
    calibrated_models: dict[str, CalibratedClassifierCV] = {}

    for candidate in candidates:
        candidate.estimator.fit(X_train, y_train)
        calibrated = calibrate_model(candidate.estimator, X_val, y_val)
        y_val_prob = calibrated.predict_proba(X_val)[:, 1]
        candidate_metrics[candidate.name] = {
            "roc_auc": float(roc_auc_score(y_val, y_val_prob)),
            "pr_auc": float(average_precision_score(y_val, y_val_prob)),
        }
        calibrated_models[candidate.name] = calibrated

    best_name = max(candidate_metrics, key=lambda name: candidate_metrics[name]["roc_auc"])
    best_model = calibrated_models[best_name]

    y_val_prob = best_model.predict_proba(X_val)[:, 1]
    threshold_result = find_best_threshold(y_val.to_numpy(), y_val_prob)

    y_test_prob = best_model.predict_proba(X_test)[:, 1]
    test_metrics = evaluate_model(y_test.to_numpy(), y_test_prob, threshold_result.threshold)

    artifacts = {
        "model": best_model,
        "features": FEATURE_COLUMNS,
        "categorical_features": CATEGORICAL_COLUMNS,
        "numeric_features": NUMERIC_COLUMNS,
        "threshold": threshold_result.threshold,
        "threshold_method": "f1_maximization",
    }

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifacts, ARTIFACTS_DIR / "model.joblib")
    background = X_train.sample(n=min(200, len(X_train)), random_state=42)
    background.to_csv(ARTIFACTS_DIR / "background.csv", index=False)

    metrics_payload = {
        "selected_model": best_name,
        "candidate_metrics": candidate_metrics,
        "threshold": asdict(threshold_result),
        "test_metrics": test_metrics,
        "calibration_curve": calibration_summary(y_test.to_numpy(), y_test_prob),
    }

    metadata_payload = {
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "rows": int(df.shape[0]),
        "features": FEATURE_COLUMNS,
        "target": TARGET_COLUMN,
        "splits": {
            "train": int(X_train.shape[0]),
            "val": int(X_val.shape[0]),
            "test": int(X_test.shape[0]),
        },
    }

    (ARTIFACTS_DIR / "metrics.json").write_text(json.dumps(metrics_payload, indent=2))
    (ARTIFACTS_DIR / "metadata.json").write_text(json.dumps(metadata_payload, indent=2))

    return {
        "metrics": metrics_payload,
        "metadata": metadata_payload,
    }


def main() -> None:
    payload = train()
    print(json.dumps(payload["metrics"], indent=2))


if __name__ == "__main__":
    main()
