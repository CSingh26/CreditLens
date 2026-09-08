"""Horizon-explicit lending economics; no model fitting or implicit PD conversion."""
from pydantic import BaseModel, ConfigDict, Field, model_validator


class StrictInput(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)


class LendingInput(StrictInput):
    pd: float = Field(ge=0, le=1)
    lgd: float = Field(ge=0, le=1)
    ead: float = Field(gt=0, le=1e12)
    annual_rate: float = Field(ge=0, le=1)
    funding_rate: float = Field(ge=0, le=1)
    operating_cost: float = Field(ge=0, le=1e12)
    pd_multiplier: float = Field(default=1.5, ge=0, le=10)
    lgd_stress: float = Field(default=.1, ge=0, le=1)
    rate_shock: float = Field(default=.02, ge=0, le=1)
    monthly_income: float | None = Field(default=None, gt=0, le=1e12)
    monthly_debt: float | None = Field(default=None, ge=0, le=1e12)
    credit_balance: float | None = Field(default=None, ge=0, le=1e12)
    credit_limit: float | None = Field(default=None, gt=0, le=1e12)

    @model_validator(mode='after')
    def paired_inputs(self):
        for left, right in [('monthly_income', 'monthly_debt'), ('credit_balance', 'credit_limit')]:
            if (getattr(self, left) is None) != (getattr(self, right) is None):
                raise ValueError(f'{left} and {right} must be supplied together')
        return self


def economics(pd: float, lgd: float, ead: float, rate: float, funding: float, cost: float) -> dict:
    loss = pd * lgd * ead
    interest = (1 - pd) * rate * ead
    contribution = interest - funding * ead - cost - loss
    denominator = (1 - pd) * ead
    return dict(pd=pd, lgd=lgd, expected_loss=loss, expected_interest=interest,
                funding_cost=funding * ead, operating_cost=cost,
                expected_contribution=contribution, return_on_exposure=contribution / ead,
                break_even_rate=(loss + funding * ead + cost) / denominator if denominator else None)


def analyze_lending(value: LendingInput) -> dict:
    base = economics(value.pd, value.lgd, value.ead, value.annual_rate,
                     value.funding_rate, value.operating_cost)
    stress = economics(min(1, value.pd * value.pd_multiplier), min(1, value.lgd + value.lgd_stress),
                       value.ead, value.annual_rate + value.rate_shock,
                       value.funding_rate + value.rate_shock, value.operating_cost)
    return {**base, 'stress': stress, 'horizon_months': 12, 'currency': 'user-selected currency units',
            'debt_to_income': value.monthly_debt / value.monthly_income if value.monthly_income else None,
            'credit_utilization': value.credit_balance / value.credit_limit if value.credit_limit else None,
            'monthly_cash_after_debt_and_interest': (
                value.monthly_income - value.monthly_debt - value.ead * value.annual_rate / 12
                if value.monthly_income else None),
            'explanations': [
                'Expected loss is probability × loss severity × exposure over one year.',
                'Interest is earned only in survival; funding and operating costs are incurred in every outcome.',
                'Stress raises PD and LGD (capped at 100%) and shifts both coupon and funding rates.',
                'Affordability ratios describe supplied finances and do not change or explain the supplied PD.',
            ]}
