from app.schemas import ApplicantCreate
from app.scoring import prepare_dataframe, risk_bucket
from ml.features import FEATURE_COLUMNS


def test_risk_bucket_boundaries() -> None:
    assert risk_bucket(0.05) == "low"
    assert risk_bucket(0.25) == "medium"
    assert risk_bucket(0.75) == "high"


def test_prepare_dataframe_preserves_feature_order() -> None:
    payload = ApplicantCreate(
        LIMIT_BAL=50000,
        SEX=1,
        EDUCATION=2,
        MARRIAGE=1,
        AGE=40,
        PAY_0=0,
        PAY_2=0,
        PAY_3=0,
        PAY_4=0,
        PAY_5=0,
        PAY_6=0,
        BILL_AMT1=1000,
        BILL_AMT2=900,
        BILL_AMT3=800,
        BILL_AMT4=700,
        BILL_AMT5=600,
        BILL_AMT6=500,
        PAY_AMT1=100,
        PAY_AMT2=100,
        PAY_AMT3=100,
        PAY_AMT4=100,
        PAY_AMT5=100,
        PAY_AMT6=100,
    )
    frame = prepare_dataframe(payload, FEATURE_COLUMNS)
    assert list(frame.columns) == FEATURE_COLUMNS
