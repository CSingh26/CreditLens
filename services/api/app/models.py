from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


class ApplicantBase(SQLModel):
    model_config = ConfigDict(extra="forbid")
    LIMIT_BAL: float = Field(ge=0)
    SEX: int = Field(ge=0, le=3)
    EDUCATION: int = Field(ge=0, le=6)
    MARRIAGE: int = Field(ge=0, le=4)
    AGE: int = Field(ge=18, le=100)
    PAY_0: int = Field(ge=-2, le=9)
    PAY_2: int = Field(ge=-2, le=9)
    PAY_3: int = Field(ge=-2, le=9)
    PAY_4: int = Field(ge=-2, le=9)
    PAY_5: int = Field(ge=-2, le=9)
    PAY_6: int = Field(ge=-2, le=9)
    BILL_AMT1: float
    BILL_AMT2: float
    BILL_AMT3: float
    BILL_AMT4: float
    BILL_AMT5: float
    BILL_AMT6: float
    PAY_AMT1: float = Field(ge=0)
    PAY_AMT2: float = Field(ge=0)
    PAY_AMT3: float = Field(ge=0)
    PAY_AMT4: float = Field(ge=0)
    PAY_AMT5: float = Field(ge=0)
    PAY_AMT6: float = Field(ge=0)


class Applicant(ApplicantBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Score(SQLModel, table=True):
    model_config = ConfigDict(protected_namespaces=())

    id: Optional[int] = Field(default=None, primary_key=True)
    applicant_id: int = Field(foreign_key="applicant.id")
    pd: float
    risk_bucket: str
    model_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    explanations_json: Optional[str] = None
