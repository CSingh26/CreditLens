from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from .features import FEATURE_COLUMNS

ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "artifacts"
BASELINE_PATH = ARTIFACTS_DIR / "monitoring_baseline.json"


def _psi(current_pct: np.ndarray, baseline_pct: np.ndarray) -> float:
    epsilon = 1e-6
    current_pct = np.clip(current_pct, epsilon, 1)
    baseline_pct = np.clip(baseline_pct, epsilon, 1)
    return float(np.sum((current_pct - baseline_pct) * np.log(current_pct / baseline_pct)))


def build_baseline(df: pd.DataFrame) -> dict[str, Any]:
    features: dict[str, Any] = {}

    for feature in FEATURE_COLUMNS:
        series = df[feature].astype(float)
        _, bin_edges = pd.qcut(series, q=5, retbins=True, duplicates="drop")
        bin_edges = np.unique(bin_edges)
        bins = pd.IntervalIndex.from_breaks(bin_edges, closed="right")
        counts = pd.cut(series, bins=bins, include_lowest=True).value_counts(sort=False)
        baseline_pct = (counts / counts.sum()).fillna(0).to_list()

        features[feature] = {
            "mean": float(series.mean()),
            "std": float(series.std() or 1.0),
            "bins": [float(edge) for edge in bin_edges],
            "baseline_pct": [float(value) for value in baseline_pct],
        }

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "features": features,
    }


def save_baseline(df: pd.DataFrame) -> dict[str, Any]:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    baseline = build_baseline(df)
    BASELINE_PATH.write_text(json.dumps(baseline, indent=2))
    return baseline


def load_baseline() -> dict[str, Any]:
    if not BASELINE_PATH.exists():
        raise FileNotFoundError("Baseline monitoring stats missing")
    return json.loads(BASELINE_PATH.read_text())


def summarize_drift(current_df: pd.DataFrame, baseline: dict[str, Any]) -> dict[str, Any]:
    summary = []

    for feature in FEATURE_COLUMNS:
        base = baseline["features"][feature]
        series = current_df[feature].astype(float)
        current_mean = float(series.mean()) if len(series) else 0.0
        std = float(base.get("std", 1.0)) or 1.0
        mean_shift = (current_mean - base["mean"]) / std

        bins = pd.IntervalIndex.from_breaks(base["bins"], closed="right")
        current_counts = (
            pd.cut(series, bins=bins, include_lowest=True).value_counts(sort=False)
            if len(series)
            else pd.Series([0] * len(bins), index=bins)
        )
        current_pct = (current_counts / max(current_counts.sum(), 1)).fillna(0).to_numpy()
        psi_value = _psi(current_pct, np.array(base["baseline_pct"]))

        if psi_value > 0.2:
            drift_level = "high"
        elif psi_value > 0.1:
            drift_level = "moderate"
        else:
            drift_level = "low"

        summary.append(
            {
                "feature": feature,
                "baseline_mean": base["mean"],
                "current_mean": current_mean,
                "mean_shift": float(mean_shift),
                "psi": float(psi_value),
                "drift_level": drift_level,
            }
        )

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "count": int(len(current_df)),
        "features": summary,
    }
