from __future__ import annotations

import logging
from typing import Iterable

import pandas as pd
from sqlmodel import Session, select

from app.models import Applicant
from ml.download_data import download_data
from ml.features import FEATURE_COLUMNS

logger = logging.getLogger(__name__)


def build_applicants(rows: pd.DataFrame) -> Iterable[Applicant]:
    for _, row in rows.iterrows():
        payload = {column: row[column] for column in FEATURE_COLUMNS}
        yield Applicant(**payload)


def seed_if_empty(session: Session, sample_size: int = 200) -> int:
    existing = session.exec(select(Applicant).limit(1)).first()
    if existing:
        return 0

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
