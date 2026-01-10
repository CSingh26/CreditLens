import pytest
from pydantic import ValidationError

from app.schemas import ApplicantCreate


def base_payload() -> dict:
    return {
        "LIMIT_BAL": 50000,
        "SEX": 2,
        "EDUCATION": 2,
        "MARRIAGE": 1,
        "AGE": 35,
        "PAY_0": 0,
        "PAY_2": 0,
        "PAY_3": 0,
        "PAY_4": 0,
        "PAY_5": 0,
        "PAY_6": 0,
        "BILL_AMT1": 1200,
        "BILL_AMT2": 1300,
        "BILL_AMT3": 1400,
        "BILL_AMT4": 1500,
        "BILL_AMT5": 1600,
        "BILL_AMT6": 1700,
        "PAY_AMT1": 100,
        "PAY_AMT2": 100,
        "PAY_AMT3": 100,
        "PAY_AMT4": 100,
        "PAY_AMT5": 100,
        "PAY_AMT6": 100,
    }


def test_rejects_extra_fields() -> None:
    payload = base_payload()
    payload["EXTRA"] = 1
    with pytest.raises(ValidationError):
        ApplicantCreate(**payload)


def test_rejects_invalid_age() -> None:
    payload = base_payload()
    payload["AGE"] = 10
    with pytest.raises(ValidationError):
        ApplicantCreate(**payload)
