from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from ml.explain import explain_instance

from .models import ApplicantBase

ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"
METADATA_PATH = ARTIFACTS_DIR / "metadata.json"


def risk_bucket(probability: float) -> str:
    if probability < 0.2:
        return "low"
    if probability < 0.5:
        return "medium"
    return "high"


@lru_cache
def load_artifacts() -> dict[str, Any]:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model artifacts not found")
    return joblib.load(MODEL_PATH)


def load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Missing artifact: {path.name}")
    return json.loads(path.read_text())


def prepare_dataframe(payload: ApplicantBase, feature_order: list[str]) -> pd.DataFrame:
    data = payload.model_dump()
    return pd.DataFrame([data], columns=feature_order)


def score_payload(payload: ApplicantBase) -> dict[str, Any]:
    artifacts = load_artifacts()
    model = artifacts["model"]
    features = artifacts["features"]
    threshold = float(artifacts["threshold"])

    frame = prepare_dataframe(payload, features)
    probability = float(model.predict_proba(frame)[:, 1][0])

    return {
        "pd": probability,
        "risk_bucket": risk_bucket(probability),
        "threshold": threshold,
    }


def explain_payload(payload: ApplicantBase, max_evals: int = 256) -> list[dict[str, float]]:
    artifacts = load_artifacts()
    model = artifacts["model"]
    return explain_instance(model, payload.model_dump(), max_evals=max_evals)


def load_metadata() -> dict[str, Any]:
    return load_json(METADATA_PATH)


def load_metrics() -> dict[str, Any]:
    return load_json(METRICS_PATH)
