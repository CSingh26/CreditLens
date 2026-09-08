"""Evaluate a labeled one-year cohort without fitting on its outcomes."""
from typing import Literal

from pydantic import Field, model_validator

from .lending import StrictInput


class CohortRow(StrictInput):
    id: str = Field(min_length=1, max_length=100)
    pd: float = Field(ge=0, le=1)
    defaulted: Literal[0, 1]
    ead: float = Field(gt=0, le=1e12)
    lgd: float = Field(ge=0, le=1)


class CohortInput(StrictInput):
    source: str = Field(min_length=1, max_length=300)
    observation_period: str = Field(min_length=1, max_length=200)
    horizon_months: Literal[12]
    threshold: float = Field(ge=0, le=1)
    annual_rate: float = Field(ge=0, le=1)
    funding_rate: float = Field(ge=0, le=1)
    operating_cost: float = Field(ge=0, le=1e12)
    rows: list[CohortRow] = Field(min_length=1, max_length=5000)

    @model_validator(mode='after')
    def unique_ids(self):
        if len({row.id for row in self.rows}) != len(self.rows):
            raise ValueError('Row IDs must be unique')
        if not self.source.strip() or not self.observation_period.strip():
            raise ValueError('Source and observation period must not be blank')
        return self


def threshold_report(value: CohortInput, threshold: float) -> dict:
    confusion = dict(tn=0, fp=0, fn=0, tp=0)
    approved = []
    for row in value.rows:
        flagged = row.pd >= threshold
        key = ('tp' if row.defaulted else 'fp') if flagged else ('fn' if row.defaulted else 'tn')
        confusion[key] += 1
        if not flagged:
            approved.append(row)
    n = len(approved)
    return dict(threshold=threshold, confusion=confusion, approved_count=n,
                approved_default_rate=sum(r.defaulted for r in approved) / n if n else None,
                expected_approved_loss=sum(r.pd * r.lgd * r.ead for r in approved),
                realized_approved_contribution=sum(
                    (1-r.defaulted)*r.ead*value.annual_rate - r.defaulted*r.ead*r.lgd
                    - r.ead*value.funding_rate - value.operating_cost for r in approved),
                expected_approved_contribution=sum(
                    (1-r.pd)*r.ead*value.annual_rate - r.pd*r.ead*r.lgd
                    - r.ead*value.funding_rate - value.operating_cost for r in approved),
                precision=confusion['tp'] / (confusion['tp']+confusion['fp'])
                if confusion['tp']+confusion['fp'] else None,
                recall=confusion['tp'] / (confusion['tp']+confusion['fn'])
                if confusion['tp']+confusion['fn'] else None)


def analyze_cohort(value: CohortInput) -> dict:
    count = len(value.rows)
    default_rate = sum(r.defaulted for r in value.rows) / count
    calibration = []
    for i in range(10):
        rows = [r for r in value.rows if min(int(r.pd * 10), 9) == i]
        calibration.append(dict(lower=i/10, upper=(i+1)/10, count=len(rows),
            mean_pd=sum(r.pd for r in rows)/len(rows) if rows else None,
            default_rate=sum(r.defaulted for r in rows)/len(rows) if rows else None))
    return {**threshold_report(value, value.threshold), 'source': value.source,
            'observation_period': value.observation_period, 'horizon_months': 12, 'count': count,
            'brier_score': sum((r.pd-r.defaulted)**2 for r in value.rows)/count,
            'baseline_brier_score': default_rate*(1-default_rate),
            'observed_default_rate': default_rate, 'calibration': calibration,
            'threshold_sweep': [threshold_report(value, i/10) for i in range(11)],
            'limitations': 'Descriptive labeled cohort. Sweep is retrospective, not a policy selected on untouched data. '
                          'LGD and loan terms are assumptions, so realized contribution is a scenario, not audited profit.'}
