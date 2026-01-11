from __future__ import annotations

import logging
from typing import Iterable

import pandas as pd
from sqlmodel import Session, delete, select

from app.models import Applicant
from ml.download_data import download_data
from ml.features import FEATURE_COLUMNS

logger = logging.getLogger(__name__)

INT_COLUMNS = {
    "SEX",
    "EDUCATION",
    "MARRIAGE",
    "AGE",
    "PAY_0",
    "PAY_2",
    "PAY_3",
    "PAY_4",
    "PAY_5",
    "PAY_6",
}


def _coerce_value(column: str, value):
    if hasattr(value, "item"):
        value = value.item()
    if column in INT_COLUMNS:
        return int(value)
    return float(value)


def _has_binary_fields(applicant: Applicant) -> bool:
    for column in FEATURE_COLUMNS:
        value = getattr(applicant, column)
        if isinstance(value, (bytes, bytearray, memoryview)):
            return True
    return False


def build_applicants(rows: pd.DataFrame) -> Iterable[Applicant]:
    for _, row in rows.iterrows():
        payload = {column: _coerce_value(column, row[column]) for column in FEATURE_COLUMNS}
        yield Applicant(**payload)


def seed_if_empty(session: Session, sample_size: int = 200) -> int:
    existing = session.exec(select(Applicant).limit(1)).first()
    if existing and not _has_binary_fields(existing):
        return 0
    if existing:
        session.exec(delete(Applicant))
        session.commit()

    try:
        data_path = download_data()
    except Exception as exc:  # pragma: no cover - network issues
        logger.warning("Skipping seed; dataset unavailable: %s", exc)
        return 0

    df = pd.read_csv(data_path)
    sample = df.sample(n=min(sample_size, len(df)), random_state=42)

    applicants = list(build_applicants(sample))
    session.add_all(applicants)
    session.commit()
    return len(applicants)
