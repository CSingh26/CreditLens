from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import ConfigDict
from sqlmodel import SQLModel

from .models import ApplicantBase


class ApplicantCreate(ApplicantBase):
    model_config = ConfigDict(extra="forbid")


class ApplicantRead(ApplicantBase):
    model_config = ConfigDict(extra="forbid")

    id: int
    created_at: datetime


class FeatureContribution(SQLModel):
    feature: str
    value: float
    contribution: float


class ScoreResponse(SQLModel):
    model_config = ConfigDict(protected_namespaces=())

    pd: float
    risk_bucket: str
    threshold: float
    model_name: str
    explanations: Optional[list[FeatureContribution]] = None


class ScoreRead(SQLModel):
    model_config = ConfigDict(protected_namespaces=())

    id: int
    applicant_id: int
    pd: float
    risk_bucket: str
    model_name: str
    created_at: datetime
    explanations_json: Optional[str] = None
